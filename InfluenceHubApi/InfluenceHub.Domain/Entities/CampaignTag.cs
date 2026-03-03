namespace InfluenceHub.Domain.Entities;

public class CampaignTag
{
    public Guid Id { get; set; }
    public Guid CampaignId { get; set; }
    public Guid TagId { get; set; }

    public Campaign Campaign { get; set; } = null!;
    public Tag Tag { get; set; } = null!;
}
