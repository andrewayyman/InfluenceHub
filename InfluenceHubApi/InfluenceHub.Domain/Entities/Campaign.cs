using InfluenceHub.Domain.Enums;

namespace InfluenceHub.Domain.Entities;

public class Campaign
{
    public Guid Id { get; set; }
    public Guid BrandId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Budget { get; set; }
    public int BudgetType { get; set; } = 0;
    public DateTime Deadline { get; set; }
    // Stored as JSON array in DB (column: Platforms)
    public string Platforms { get; set; } = "[]";
    public string Location { get; set; } = string.Empty;
    public CampaignStatus Status { get; set; } = CampaignStatus.Open;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Brand Brand { get; set; } = null!;
    public ICollection<CampaignTag> CampaignTags { get; set; } = new List<CampaignTag>();
    public ICollection<Application> Applications { get; set; } = new List<Application>();
}
