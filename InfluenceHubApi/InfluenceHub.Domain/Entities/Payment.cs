using InfluenceHub.Domain.Enums;

namespace InfluenceHub.Domain.Entities;

public class Payment
{
    public Guid Id { get; set; }
    public Guid ApplicationId { get; set; }
    public Guid CampaignId { get; set; }
    public Guid BrandId { get; set; }
    public Guid InfluencerId { get; set; }
    public decimal Amount { get; set; }
    public decimal CommissionPercentage { get; set; }
    public decimal PlatformCommission { get; set; }
    public decimal NetAmount { get; set; }
    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
    public DateTime? PaidAt { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Transparency fields
    public string? PaymentMethod { get; set; }
    public string? TransactionReference { get; set; }
    public string? ProofUrl { get; set; }
    public DateTime? ProofUploadedAt { get; set; }
    public string? BrandNotes { get; set; }
    public DateTime? InfluencerConfirmedAt { get; set; }
    public DateTime? AdminConfirmedAt { get; set; }
    public string? DisputeReason { get; set; }

    public Domain.Entities.Application Application { get; set; } = null!;
    public Campaign Campaign { get; set; } = null!;
    public Brand Brand { get; set; } = null!;
    public Influencer Influencer { get; set; } = null!;
}
