using InfluenceHub.Application.DTOs.Response;
using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.Interfaces;
using InfluenceHub.Domain.Entities;
using InfluenceHub.Domain.Enums;
using InfluenceHub.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InfluenceHub.Application.Services;

public class PaymentService : IPaymentService
{
    private readonly IRepository<Payment> _paymentRepository;
    private readonly IRepository<CampaignReport> _reportRepository;
    private readonly IBrandRepository _brandRepository;
    private readonly IInfluencerRepository _influencerRepository;
    private readonly ICommissionService _commissionService;
    private readonly IFileStorage _fileStorage;

    public PaymentService(
        IRepository<Payment> paymentRepository,
        IRepository<CampaignReport> reportRepository,
        IBrandRepository brandRepository,
        IInfluencerRepository influencerRepository,
        ICommissionService commissionService,
        IFileStorage fileStorage)
    {
        _paymentRepository = paymentRepository;
        _reportRepository = reportRepository;
        _brandRepository = brandRepository;
        _influencerRepository = influencerRepository;
        _commissionService = commissionService;
        _fileStorage = fileStorage;
    }

    public async Task<PaymentResponse> ProcessPaymentAsync(Guid reportId, Guid brandUserId, CancellationToken ct = default)
    {
        var brand = await _brandRepository.GetByUserIdAsync(brandUserId, ct)
            ?? throw new InvalidOperationException("Brand profile not found.");

        var report = await _reportRepository.Query()
            .Include(r => r.Application)
                .ThenInclude(a => a.Campaign)
            .Include(r => r.Application)
                .ThenInclude(a => a.Influencer)
            .FirstOrDefaultAsync(r => r.Id == reportId && r.Application.Campaign.BrandId == brand.Id, ct)
            ?? throw new InvalidOperationException("Report not found or does not belong to this brand.");

        if (report.Status != ReportStatus.Approved)
            throw new InvalidOperationException("Payment can only be processed for approved reports.");

        var existingPayment = await _paymentRepository.Query()
            .AnyAsync(p => p.ApplicationId == report.ApplicationId, ct);
        if (existingPayment)
            throw new InvalidOperationException("Payment has already been processed for this report.");

        var commissionPercentage = await _commissionService.GetCurrentPercentageAsync(ct);
        var amount = report.Application.Campaign.Budget;
        var platformCommission = Math.Round(amount * commissionPercentage / 100, 2);
        var netAmount = amount - platformCommission;

        var payment = new Payment
        {
            Id = Guid.NewGuid(),
            ApplicationId = report.ApplicationId,
            CampaignId = report.Application.CampaignId,
            BrandId = brand.Id,
            InfluencerId = report.Application.InfluencerId,
            Amount = amount,
            CommissionPercentage = commissionPercentage,
            PlatformCommission = platformCommission,
            NetAmount = netAmount,
            Status = PaymentStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        await _paymentRepository.AddAsync(payment, ct);
        await _paymentRepository.SaveChangesAsync(ct);

        return await MapToResponseAsync(payment, ct);
    }

    public async Task<PaymentResponse?> GetCampaignPaymentAsync(Guid campaignId, CancellationToken ct = default)
    {
        var payment = await _paymentRepository.Query()
            .Include(p => p.Campaign)
                .ThenInclude(c => c.Brand)
            .Include(p => p.Influencer)
                .ThenInclude(i => i.User)
            .FirstOrDefaultAsync(p => p.CampaignId == campaignId, ct);

        if (payment is null) return null;
        return MapToResponseSync(payment);
    }

    public async Task<PaymentDetailResponse?> GetPaymentDetailsAsync(Guid paymentId, Guid userId, string role, CancellationToken ct = default)
    {
        var payment = await _paymentRepository.Query()
            .Include(p => p.Campaign)
                .ThenInclude(c => c.Brand)
            .Include(p => p.Brand)
            .Include(p => p.Influencer)
                .ThenInclude(i => i.User)
            .FirstOrDefaultAsync(p => p.Id == paymentId, ct);

        if (payment is null)
            return null;

        if (!IsAuthorizedForPayment(payment, userId, role))
            throw new UnauthorizedAccessException("You are not authorized to view this payment.");

        return MapToDetailResponse(payment);
    }

    public async Task<PaymentDetailResponse> UploadProofAsync(Guid paymentId, Guid brandUserId, UploadPaymentProofRequest request, Stream? proofStream, string? extension, CancellationToken ct = default)
    {
        var brand = await _brandRepository.GetByUserIdAsync(brandUserId, ct)
            ?? throw new InvalidOperationException("Brand profile not found.");

        var payment = await _paymentRepository.Query()
            .Include(p => p.Campaign)
                .ThenInclude(c => c.Brand)
            .Include(p => p.Brand)
            .Include(p => p.Influencer)
                .ThenInclude(i => i.User)
            .FirstOrDefaultAsync(p => p.Id == paymentId && p.BrandId == brand.Id, ct)
            ?? throw new InvalidOperationException("Payment not found.");

        if (payment.Status is PaymentStatus.Completed or PaymentStatus.Failed)
            throw new InvalidOperationException("Payment cannot be modified in its current state.");

        if (string.IsNullOrWhiteSpace(request.PaymentMethod))
            throw new InvalidOperationException("Payment method is required.");

        payment.PaymentMethod = request.PaymentMethod.Trim();
        payment.TransactionReference = request.TransactionReference?.Trim();
        payment.BrandNotes = request.BrandNotes?.Trim();
        payment.Status = PaymentStatus.Completed;
        payment.PaidAt = DateTime.UtcNow;

        if (proofStream is not null)
        {
            var relativePath = await _fileStorage.SavePaymentProofAsync(payment.Id, proofStream, extension ?? ".png", ct);
            payment.ProofUrl = ToPublicPaymentProofPath(relativePath);
            payment.ProofUploadedAt = DateTime.UtcNow;
        }

        _paymentRepository.Update(payment);
        await _paymentRepository.SaveChangesAsync(ct);

        return MapToDetailResponse(payment);
    }

    public async Task<PaymentDetailResponse> ConfirmReceiptAsync(Guid paymentId, Guid influencerUserId, CancellationToken ct = default)
    {
        var influencer = await _influencerRepository.GetByUserIdAsync(influencerUserId, ct)
            ?? throw new InvalidOperationException("Influencer profile not found.");

        var payment = await _paymentRepository.Query()
            .Include(p => p.Campaign)
                .ThenInclude(c => c.Brand)
            .Include(p => p.Brand)
            .Include(p => p.Influencer)
                .ThenInclude(i => i.User)
            .FirstOrDefaultAsync(p => p.Id == paymentId && p.InfluencerId == influencer.Id, ct)
            ?? throw new InvalidOperationException("Payment not found.");

        if (payment.Status != PaymentStatus.ProofUploaded)
            throw new InvalidOperationException("Receipt can only be confirmed after payment proof is uploaded.");

        payment.Status = PaymentStatus.InfluencerConfirmed;
        payment.InfluencerConfirmedAt = DateTime.UtcNow;

        _paymentRepository.Update(payment);
        await _paymentRepository.SaveChangesAsync(ct);

        return MapToDetailResponse(payment);
    }

    public async Task<PaymentDetailResponse> DisputeAsync(Guid paymentId, Guid userId, string role, DisputeRequest request, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(request.Reason))
            throw new InvalidOperationException("Dispute reason is required.");

        var payment = await _paymentRepository.Query()
            .Include(p => p.Campaign)
                .ThenInclude(c => c.Brand)
            .Include(p => p.Brand)
            .Include(p => p.Influencer)
                .ThenInclude(i => i.User)
            .FirstOrDefaultAsync(p => p.Id == paymentId, ct)
            ?? throw new InvalidOperationException("Payment not found.");

        if (!IsAuthorizedForPaymentDispute(payment, userId, role))
            throw new UnauthorizedAccessException("You are not authorized to dispute this payment.");

        if (payment.Status == PaymentStatus.Completed)
            throw new InvalidOperationException("Completed payments cannot be disputed.");

        payment.Status = PaymentStatus.Disputed;
        payment.DisputeReason = request.Reason.Trim();

        _paymentRepository.Update(payment);
        await _paymentRepository.SaveChangesAsync(ct);

        return MapToDetailResponse(payment);
    }

    public async Task<PaymentDetailResponse> AdminConfirmPaymentAsync(Guid paymentId, Guid adminUserId, CancellationToken ct = default)
    {
        var payment = await _paymentRepository.Query()
            .Include(p => p.Campaign)
                .ThenInclude(c => c.Brand)
            .Include(p => p.Brand)
            .Include(p => p.Influencer)
                .ThenInclude(i => i.User)
            .FirstOrDefaultAsync(p => p.Id == paymentId, ct)
            ?? throw new InvalidOperationException("Payment not found.");

        if (payment.Status != PaymentStatus.InfluencerConfirmed)
            throw new InvalidOperationException("Admin can only complete payments after influencer confirmation.");

        payment.Status = PaymentStatus.Completed;
        payment.AdminConfirmedAt = DateTime.UtcNow;
        payment.PaidAt = DateTime.UtcNow;

        _paymentRepository.Update(payment);
        await _paymentRepository.SaveChangesAsync(ct);

        return MapToDetailResponse(payment);
    }

    public async Task<PaymentDetailResponse> ResolveDisputeAsync(Guid paymentId, Guid adminUserId, ResolveDisputeRequest request, CancellationToken ct = default)
    {
        var payment = await _paymentRepository.Query()
            .Include(p => p.Campaign)
                .ThenInclude(c => c.Brand)
            .Include(p => p.Brand)
            .Include(p => p.Influencer)
                .ThenInclude(i => i.User)
            .FirstOrDefaultAsync(p => p.Id == paymentId, ct)
            ?? throw new InvalidOperationException("Payment not found.");

        if (payment.Status != PaymentStatus.Disputed)
            throw new InvalidOperationException("Only disputed payments can be resolved.");

        if (request.CompleteNow)
        {
            payment.Status = PaymentStatus.Completed;
            payment.AdminConfirmedAt = DateTime.UtcNow;
            payment.PaidAt = DateTime.UtcNow;
        }
        else
        {
            payment.Status = payment.ProofUrl is null ? PaymentStatus.AwaitingProof : PaymentStatus.ProofUploaded;
        }

        _paymentRepository.Update(payment);
        await _paymentRepository.SaveChangesAsync(ct);

        return MapToDetailResponse(payment);
    }

    public async Task<IReadOnlyList<PaymentResponse>> GetBrandPaymentsAsync(Guid brandUserId, CancellationToken ct = default)
    {
        var brand = await _brandRepository.GetByUserIdAsync(brandUserId, ct);
        if (brand is null) return [];

        var payments = await _paymentRepository.Query()
            .Include(p => p.Campaign)
                .ThenInclude(c => c.Brand)
            .Include(p => p.Influencer)
                .ThenInclude(i => i.User)
            .Where(p => p.BrandId == brand.Id)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);

        return payments.Select(MapToResponseSync).ToList();
    }

    public async Task<IReadOnlyList<PaymentResponse>> GetInfluencerPaymentsAsync(Guid influencerUserId, CancellationToken ct = default)
    {
        var influencer = await _influencerRepository.GetByUserIdAsync(influencerUserId, ct);
        if (influencer is null) return [];

        var payments = await _paymentRepository.Query()
            .Include(p => p.Campaign)
                .ThenInclude(c => c.Brand)
            .Include(p => p.Influencer)
                .ThenInclude(i => i.User)
            .Where(p => p.InfluencerId == influencer.Id)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(ct);

        return payments.Select(MapToResponseSync).ToList();
    }

    public async Task<IReadOnlyList<PaymentResponse>> GetAllPaymentsAsync(string? status, string? search, CancellationToken ct = default)
    {
        IQueryable<Payment> query = _paymentRepository.Query()
            .Include(p => p.Campaign)
                .ThenInclude(c => c.Brand)
            .Include(p => p.Influencer)
                .ThenInclude(i => i.User);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<PaymentStatus>(status, out var paymentStatus))
            query = query.Where(p => p.Status == paymentStatus);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = $"%{search.Trim()}%";
            query = query.Where(p =>
                EF.Functions.Like(p.Campaign.Title, term) ||
                EF.Functions.Like(p.Brand.Name, term) ||
                EF.Functions.Like(p.Influencer.Name, term));
        }

        var payments = await query.OrderByDescending(p => p.CreatedAt).ToListAsync(ct);
        return payments.Select(MapToResponseSync).ToList();
    }

    public async Task<PaymentSummaryResponse> GetPaymentSummaryAsync(CancellationToken ct = default)
    {
        var payments = await _paymentRepository.Query()
            .Where(p => p.Status == PaymentStatus.Completed)
            .ToListAsync(ct);

        return new PaymentSummaryResponse(
            payments.Count,
            payments.Sum(p => p.PlatformCommission),
            payments.Sum(p => p.NetAmount));
    }

    private async Task<PaymentResponse> MapToResponseAsync(Payment payment, CancellationToken ct)
    {
        var refreshed = await _paymentRepository.Query()
            .Include(p => p.Campaign).ThenInclude(c => c.Brand)
            .Include(p => p.Influencer).ThenInclude(i => i.User)
            .FirstAsync(p => p.Id == payment.Id, ct);

        return MapToResponseSync(refreshed);
    }

    private static PaymentResponse MapToResponseSync(Payment p) => new(
        p.Id,
        p.ApplicationId,
        p.CampaignId,
        p.Campaign?.Title ?? string.Empty,
        p.Campaign?.Brand?.Name ?? string.Empty,
        p.Influencer?.Name ?? p.Influencer?.User?.Email ?? string.Empty,
        p.Amount,
        p.CommissionPercentage,
        p.PlatformCommission,
        p.NetAmount,
        p.Status,
        p.PaidAt,
        p.CreatedAt,
        p.PaymentMethod,
        p.TransactionReference,
        p.ProofUrl,
        p.ProofUploadedAt,
        p.BrandNotes,
        p.InfluencerConfirmedAt,
        p.AdminConfirmedAt,
        p.DisputeReason);

    private static PaymentDetailResponse MapToDetailResponse(Payment p) => new(
        p.Id,
        p.ApplicationId,
        p.CampaignId,
        p.Campaign?.Title ?? string.Empty,
        p.Campaign?.Brand?.Name ?? p.Brand?.Name ?? string.Empty,
        p.Influencer?.Name ?? p.Influencer?.User?.Email ?? string.Empty,
        p.Amount,
        p.CommissionPercentage,
        p.PlatformCommission,
        p.NetAmount,
        p.Status,
        p.CreatedAt,
        p.PaidAt,
        p.PaymentMethod,
        p.TransactionReference,
        p.ProofUrl,
        p.ProofUploadedAt,
        p.BrandNotes,
        p.InfluencerConfirmedAt,
        p.AdminConfirmedAt,
        p.DisputeReason,
        new InfluencerPaymentInfoResponse(
            p.Influencer?.InstapayPhone,
            p.Influencer?.WalletProvider,
            p.Influencer?.WalletNumber,
            p.Influencer?.BankName,
            p.Influencer?.BankAccountNumber,
            p.Influencer?.PreferredPaymentMethod));

    private static bool IsAuthorizedForPayment(Payment payment, Guid userId, string role)
    {
        var normalizedRole = role?.ToLowerInvariant() ?? "";
        return normalizedRole switch
        {
            "admin" => true,
            "brand" => (payment.Brand?.UserId == userId) || (payment.Campaign?.Brand?.UserId == userId) || (payment.Campaign?.BrandId == userId), // check multiple ways just in case
            "influencer" => payment.Influencer?.UserId == userId,
            _ => false,
        };
    }

    private static bool IsAuthorizedForPaymentDispute(Payment payment, Guid userId, string role)
    {
        var normalizedRole = role?.ToLowerInvariant() ?? "";
        return normalizedRole switch
        {
            "brand" => (payment.Brand?.UserId == userId) || (payment.Campaign?.Brand?.UserId == userId),
            "influencer" => payment.Influencer?.UserId == userId,
            _ => false,
        };
    }

    private static string ToPublicPaymentProofPath(string relativePath)
    {
        if (string.IsNullOrWhiteSpace(relativePath))
            return string.Empty;

        return $"/uploads/payments/{relativePath.Replace("\\", "/")}";
    }
}
