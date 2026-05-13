using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.DTOs.Response;

namespace InfluenceHub.Application.Interfaces;

public interface IPaymentService
{
    Task<PaymentResponse> ProcessPaymentAsync(Guid reportId, Guid brandUserId, CancellationToken ct = default);
    Task<PaymentResponse?> GetCampaignPaymentAsync(Guid campaignId, CancellationToken ct = default);
    Task<PaymentDetailResponse?> GetPaymentDetailsAsync(Guid paymentId, Guid userId, string role, CancellationToken ct = default);
    Task<PaymentDetailResponse> UploadProofAsync(Guid paymentId, Guid brandUserId, UploadPaymentProofRequest request, Stream? proofStream, string? extension, CancellationToken ct = default);
    Task<PaymentDetailResponse> ConfirmReceiptAsync(Guid paymentId, Guid influencerUserId, CancellationToken ct = default);
    Task<PaymentDetailResponse> DisputeAsync(Guid paymentId, Guid userId, string role, DisputeRequest request, CancellationToken ct = default);
    Task<PaymentDetailResponse> AdminConfirmPaymentAsync(Guid paymentId, Guid adminUserId, CancellationToken ct = default);
    Task<PaymentDetailResponse> ResolveDisputeAsync(Guid paymentId, Guid adminUserId, ResolveDisputeRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<PaymentResponse>> GetBrandPaymentsAsync(Guid brandUserId, CancellationToken ct = default);
    Task<IReadOnlyList<PaymentResponse>> GetInfluencerPaymentsAsync(Guid influencerUserId, CancellationToken ct = default);
    Task<IReadOnlyList<PaymentResponse>> GetAllPaymentsAsync(string? status, string? search, CancellationToken ct = default);
    Task<PaymentSummaryResponse> GetPaymentSummaryAsync(CancellationToken ct = default);
}
