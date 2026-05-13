using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.DTOs.Response;
using InfluenceHub.Application.Interfaces;
using InfluenceHub.Domain.Entities;
using InfluenceHub.Domain.Enums;
using InfluenceHub.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InfluenceHub.Application.Services;

public class BrandService : IBrandService
{
    private readonly IBrandRepository _brandRepository;
    private readonly IRepository<Brand> _brandRepo;
    private readonly IRepository<Campaign> _campaignRepository;
    private readonly IRepository<Tag> _tagRepository;
    private readonly IRepository<CampaignTag> _campaignTagRepository;
    private readonly ICampaignRepository _campaignRepo;
    private readonly IRepository<CampaignReport> _reportRepository;
    private readonly IRepository<Review> _reviewRepository;
    private readonly IPaymentService _paymentService;

    public BrandService(
        IBrandRepository brandRepository,
        IRepository<Brand> brandRepo,
        IRepository<Campaign> campaignRepository,
        IRepository<Tag> tagRepository,
        IRepository<CampaignTag> campaignTagRepository,
        ICampaignRepository campaignRepo,
        IRepository<CampaignReport> reportRepository,
        IRepository<Review> reviewRepository,
        IPaymentService paymentService)
    {
        _brandRepository = brandRepository;
        _brandRepo = brandRepo;
        _campaignRepository = campaignRepository;
        _tagRepository = tagRepository;
        _campaignTagRepository = campaignTagRepository;
        _campaignRepo = campaignRepo;
        _reportRepository = reportRepository;
        _reviewRepository = reviewRepository;
        _paymentService = paymentService;
    }

    public async Task<BrandProfileResponse?> GetProfileAsync(Guid userId, CancellationToken ct = default)
    {
        var brand = await _brandRepository.GetByUserIdAsync(userId, ct);
        if (brand is null) return null;
        return new BrandProfileResponse(brand.Id, brand.UserId, brand.Name);
    }

    public async Task<BrandProfileResponse> UpdateProfileAsync(Guid userId, UpdateBrandProfileRequest request, CancellationToken ct = default)
    {
        var brand = await _brandRepository.GetByUserIdAsync(userId, ct)
            ?? throw new InvalidOperationException("Brand profile not found");
        brand.Name = request.Name;
        brand.UpdatedAt = DateTime.UtcNow;
        _brandRepo.Update(brand);
        await _brandRepo.SaveChangesAsync(ct);
        return new BrandProfileResponse(brand.Id, brand.UserId, brand.Name);
    }

    public async Task<CampaignResponse> CreateCampaignAsync(Guid userId, CreateCampaignRequest request, CancellationToken ct = default)
    {
        var brand = await _brandRepository.GetByUserIdAsync(userId, ct)
            ?? throw new InvalidOperationException("Brand profile not found");

        var campaign = new Campaign
        {
            Id = Guid.NewGuid(),
            BrandId = brand.Id,
            Title = request.Title,
            Description = request.Description,
            Budget = request.Budget,
            BudgetType = request.BudgetType,
            Deadline = request.Deadline,
            Platforms = System.Text.Json.JsonSerializer.Serialize(request.Platforms ?? new List<string>()),
            Location = request.Location,
            Status = CampaignStatus.Open,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        await _campaignRepository.AddAsync(campaign, ct);
        await SetCampaignTagsAsync(campaign.Id, request.Tags, ct);
        var created = await _campaignRepo.GetByIdWithTagsAsync(campaign.Id, ct)
            ?? throw new InvalidOperationException("Failed to load created campaign.");
        return MapToResponse(created);
    }

    public async Task<CampaignResponse?> UpdateCampaignAsync(Guid userId, Guid campaignId, UpdateCampaignRequest request, CancellationToken ct = default)
    {
        var brand = await _brandRepository.GetByUserIdAsync(userId, ct)
            ?? throw new InvalidOperationException("Brand profile not found");
        var campaign = await _campaignRepo.GetByIdWithTagsAsync(campaignId, ct);
        if (campaign is null || campaign.BrandId != brand.Id) return null;

        if (campaign.Status != CampaignStatus.Open)
            throw new InvalidOperationException("Only open campaigns can be edited.");

        if (request.Title is not null) campaign.Title = request.Title;
        if (request.Description is not null) campaign.Description = request.Description;
        if (request.Budget.HasValue) campaign.Budget = request.Budget.Value;
        if (request.Deadline.HasValue) campaign.Deadline = request.Deadline.Value;
        if (request.Platforms is not null) campaign.Platforms = System.Text.Json.JsonSerializer.Serialize(request.Platforms);
        if (request.BudgetType.HasValue) campaign.BudgetType = request.BudgetType.Value;
        if (request.Location is not null) campaign.Location = request.Location;
        if (request.Status.HasValue) campaign.Status = request.Status.Value;
        campaign.UpdatedAt = DateTime.UtcNow;

        _campaignRepository.Update(campaign);
        if (request.Tags is not null)
        {
            var existing = campaign.CampaignTags.ToList();
            foreach (var ct2 in existing)
                _campaignTagRepository.Delete(ct2);
            await SetCampaignTagsAsync(campaignId, request.Tags, ct);
        }
        await _campaignRepository.SaveChangesAsync(ct);
        var updated = await _campaignRepo.GetByIdWithTagsAsync(campaignId, ct)
            ?? throw new InvalidOperationException("Failed to load updated campaign.");
        return MapToResponse(updated);
    }

    public async Task<bool> DeleteCampaignAsync(Guid userId, Guid campaignId, CancellationToken ct = default)
    {
        var brand = await _brandRepository.GetByUserIdAsync(userId, ct);
        if (brand is null) return false;
        var campaign = await _campaignRepository.GetByIdAsync(campaignId, ct);
        if (campaign is null || campaign.BrandId != brand.Id) return false;

        if (campaign.Status != CampaignStatus.Open)
            throw new InvalidOperationException("Only open campaigns can be deleted.");

        _campaignRepository.Delete(campaign);
        await _campaignRepository.SaveChangesAsync(ct);
        return true;
    }

    public async Task<CampaignResponse?> GetCampaignAsync(Guid userId, Guid campaignId, CancellationToken ct = default)
    {
        var brand = await _brandRepository.GetByUserIdAsync(userId, ct);
        if (brand is null) return null;
        var campaign = await _campaignRepo.GetByIdWithTagsAsync(campaignId, ct);
        if (campaign is null || campaign.BrandId != brand.Id) return null;
        return MapToResponse(campaign);
    }

    public async Task<IReadOnlyList<CampaignListResponse>> GetCampaignsAsync(Guid userId, CancellationToken ct = default)
    {
        var brand = await _brandRepository.GetByUserIdAsync(userId, ct);
        if (brand is null) return [];
        var campaigns = await _campaignRepository.Query()
            .Include(c => c.CampaignTags).ThenInclude(ct => ct.Tag)
            .Include(c => c.Applications)
            .Where(c => c.BrandId == brand.Id)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(ct);
        return campaigns.Select(c => new CampaignListResponse(
            c.Id, c.Title, brand.Name, c.Budget, c.Deadline, SafeDeserializePlatforms(c.Platforms), c.Location, c.Status,
            c.Applications.Count, c.CampaignTags.Select(ct => ct.Tag.Name).ToList())).ToList();
    }

    public async Task<IReadOnlyList<ReportResponse>> GetReportsAsync(Guid userId, CancellationToken ct = default)
    {
        var brand = await _brandRepository.GetByUserIdAsync(userId, ct);
        if (brand is null) return [];

        var reports = await _reportRepository.Query()
            .Include(r => r.Application)
            .ThenInclude(a => a.Campaign)
            .Include(r => r.Application)
            .ThenInclude(a => a.Influencer)
            .ThenInclude(i => i.User)
            .Where(r => r.Application.Campaign.BrandId == brand.Id)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(ct);

        var reportResponses = new List<ReportResponse>();
        foreach (var r in reports)
        {
            var review = await _reviewRepository.Query()
                .Include(rev => rev.Reviewer)
                .Include(rev => rev.Campaign)
                .FirstOrDefaultAsync(rev => rev.CampaignId == r.Application.CampaignId 
                    && rev.TargetId == r.Application.InfluencerId 
                    && rev.TargetType == ReviewTargetType.Influencer, ct);

            reportResponses.Add(new ReportResponse(
                r.Id, r.ApplicationId, r.Application.CampaignId, r.PostUrl, r.PostingDate, r.StartDate, r.EndDate,
                r.Views, r.Likes, r.Comments, r.Shares, ToPublicScreenshotPath(r.ScreenshotPath), r.Status,
                r.RejectionReason, r.ReviewedAt, r.Application.InfluencerId, r.Application.Influencer.Name, r.Application.Influencer.User?.Email ?? string.Empty, r.Application.Campaign.Title,
                MapPlatformInsights(r),
                review != null ? new ReviewResponse(
                    review.Id, review.ReviewerUserId, review.Reviewer?.Email ?? "Brand", 
                    review.ReviewerRole.ToString(), review.TargetId, review.Rating, 
                    review.Comment, review.CampaignId, review.Campaign?.Title ?? "", review.CreatedAt) : null
            ));
        }

        return reportResponses;
    }

    public async Task<ReportResponse?> GetReportAsync(Guid userId, Guid reportId, CancellationToken ct = default)
    {
        var brand = await _brandRepository.GetByUserIdAsync(userId, ct);
        if (brand is null) return null;

        var r = await _reportRepository.Query()
            .Include(r => r.Application)
            .ThenInclude(a => a.Campaign)
            .Include(r => r.Application)
            .ThenInclude(a => a.Influencer)
            .ThenInclude(i => i.User)
            .FirstOrDefaultAsync(r => r.Id == reportId && r.Application.Campaign.BrandId == brand.Id, ct);

        if (r is null) return null;

        var review = await _reviewRepository.Query()
            .Include(rev => rev.Reviewer)
            .Include(rev => rev.Campaign)
            .FirstOrDefaultAsync(rev => rev.CampaignId == r.Application.CampaignId 
                && rev.TargetId == r.Application.InfluencerId 
                && rev.TargetType == ReviewTargetType.Influencer, ct);

        return new ReportResponse(
            r.Id, r.ApplicationId, r.Application.CampaignId, r.PostUrl, r.PostingDate, r.StartDate, r.EndDate,
            r.Views, r.Likes, r.Comments, r.Shares, ToPublicScreenshotPath(r.ScreenshotPath), r.Status,
            r.RejectionReason, r.ReviewedAt, r.Application.InfluencerId, r.Application.Influencer.Name, r.Application.Influencer.User?.Email ?? string.Empty, r.Application.Campaign.Title,
            MapPlatformInsights(r),
            review != null ? new ReviewResponse(
                review.Id, review.ReviewerUserId, review.Reviewer?.Email ?? "Brand", 
                review.ReviewerRole.ToString(), review.TargetId, review.Rating, 
                review.Comment, review.CampaignId, review.Campaign?.Title ?? "", review.CreatedAt) : null
        );
    }

    public async Task<bool> UpdateReportStatusAsync(Guid userId, Guid reportId, ReportStatus status, CancellationToken ct = default)
    {
        var brand = await _brandRepository.GetByUserIdAsync(userId, ct);
        if (brand is null) return false;

        var report = await _reportRepository.Query()
            .Include(r => r.Application)
            .ThenInclude(a => a.Campaign)
            .FirstOrDefaultAsync(r => r.Id == reportId && r.Application.Campaign.BrandId == brand.Id, ct);

        if (report is null) return false;

        report.Status = status;
        if (status == ReportStatus.Approved || status == ReportStatus.Rejected)
        {
            report.ReviewedAt = DateTime.UtcNow;
            if (status == ReportStatus.Approved)
            {
                report.Application.Campaign.Status = CampaignStatus.Completed;
                try
                {
                    await _paymentService.ProcessPaymentAsync(reportId, userId, ct);
                }
                catch (InvalidOperationException)
                {
                }
            }
        }

        _reportRepository.Update(report);
        await _reportRepository.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> AddReportFeedbackAsync(Guid userId, Guid reportId, string feedback, CancellationToken ct = default)
    {
        var brand = await _brandRepository.GetByUserIdAsync(userId, ct);
        if (brand is null) return false;

        var report = await _reportRepository.Query()
            .Include(r => r.Application)
            .ThenInclude(a => a.Campaign)
            .FirstOrDefaultAsync(r => r.Id == reportId && r.Application.Campaign.BrandId == brand.Id, ct);

        if (report is null) return false;

        report.RejectionReason = feedback;
        report.Status = ReportStatus.RevisionRequested;
        report.ReviewedAt = DateTime.UtcNow;

        _reportRepository.Update(report);
        await _reportRepository.SaveChangesAsync(ct);
        return true;
    }

    private async Task SetCampaignTagsAsync(Guid campaignId, List<string> tagNames, CancellationToken ct)
    {
        var normalizedNames = tagNames
            .Where(name => !string.IsNullOrWhiteSpace(name))
            .Select(name => name.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        var tags = await _tagRepository.Query()
            .Where(tag => normalizedNames.Contains(tag.Name))
            .ToListAsync(ct);

        var foundNames = tags.Select(tag => tag.Name).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var missingNames = normalizedNames.Where(name => !foundNames.Contains(name)).ToList();

        if (missingNames.Count > 0)
            throw new InvalidOperationException($"Unknown tags: {string.Join(", ", missingNames)}.");

        foreach (var tag in tags)
        {
            var campaignTag = new CampaignTag
            {
                Id = Guid.NewGuid(),
                CampaignId = campaignId,
                TagId = tag.Id
            };
            await _campaignTagRepository.AddAsync(campaignTag, ct);
        }
    }

    private static CampaignResponse MapToResponse(Campaign c) => new(
        c.Id, c.BrandId, c.Title, c.Description, c.Budget, c.Deadline, SafeDeserializePlatforms(c.Platforms), c.Location,
        c.Status, c.CreatedAt, c.CampaignTags.Select(ct => ct.Tag.Name).ToList(), c.BudgetType);

    private static List<string> SafeDeserializePlatforms(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return [];
        try { return System.Text.Json.JsonSerializer.Deserialize<List<string>>(json) ?? []; }
        catch { return []; }
    }

    private static string ToPublicScreenshotPath(string relativePath)
    {
        if (string.IsNullOrWhiteSpace(relativePath))
            return string.Empty;

        return $"/uploads/reports/{relativePath.Replace("\\", "/")}";
    }

    private static List<PlatformReportInsightResponse> MapPlatformInsights(CampaignReport report)
    {
        if (!string.IsNullOrWhiteSpace(report.Platform))
        {
            try
            {
                var parsed = System.Text.Json.JsonSerializer.Deserialize<List<PlatformReportInsightResponse>>(report.Platform);
                if (parsed is { Count: > 0 })
                {
                    return parsed;
                }
            }
            catch (System.Text.Json.JsonException)
            {
            }
        }

        return
        [
            new PlatformReportInsightResponse(
                string.IsNullOrWhiteSpace(report.Platform) ? "Unknown" : report.Platform,
                report.PostUrl,
                report.Views,
                report.Likes,
                report.Comments,
                report.Shares)
        ];
    }
}
