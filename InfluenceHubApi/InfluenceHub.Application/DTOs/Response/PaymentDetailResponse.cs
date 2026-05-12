using InfluenceHub.Domain.Enums;

namespace InfluenceHub.Application.DTOs.Response;

public record PaymentDetailResponse(
    Guid Id,
    Guid ApplicationId,
    Guid CampaignId,
    string CampaignTitle,
    string BrandName,
    string InfluencerName,
    decimal Amount,
    decimal CommissionPercentage,
    decimal PlatformCommission,
    decimal NetAmount,
    PaymentStatus Status,
    DateTime CreatedAt,
    DateTime? PaidAt,
    string? PaymentMethod,
    string? TransactionReference,
    string? ProofUrl,
    DateTime? ProofUploadedAt,
    string? BrandNotes,
    DateTime? InfluencerConfirmedAt,
    DateTime? AdminConfirmedAt,
    string? DisputeReason,
    InfluencerPaymentInfoResponse InfluencerPaymentInfo
);
