using InfluenceHub.Domain.Enums;

namespace InfluenceHub.Application.DTOs.Response;

public record PaymentResponse(
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
    DateTime? PaidAt,
    DateTime CreatedAt,
    string? PaymentMethod,
    string? TransactionReference,
    string? ProofUrl,
    DateTime? ProofUploadedAt,
    string? BrandNotes,
    DateTime? InfluencerConfirmedAt,
    DateTime? AdminConfirmedAt,
    string? DisputeReason
);

public record PaymentSummaryResponse(
    int TotalPayments,
    decimal TotalCommission,
    decimal TotalNetPaid
);
