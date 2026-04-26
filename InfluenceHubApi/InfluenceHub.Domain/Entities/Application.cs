using InfluenceHub.Domain.Enums;

namespace InfluenceHub.Domain.Entities;

public class Application
{
    public Guid Id { get; set; }
    public Guid CampaignId { get; set; }
    public Guid InfluencerId { get; set; }
    public ApplicationStatus Status { get; set; } = ApplicationStatus.Pending;
    public string Message { get; set; } = string.Empty;
    // Phase2 columns
    public string Bio { get; set; } = string.Empty;
    public string Proposal { get; set; } = string.Empty;
    public decimal ProposedBudget { get; set; } = 0;
    public string Links { get; set; } = "[]";
    public string MediaFiles { get; set; } = "[]";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Campaign Campaign { get; set; } = null!;
    public Influencer Influencer { get; set; } = null!;
    public CampaignReport? CampaignReport { get; set; }
}
