namespace InfluenceHub.Domain.Entities;

public class Tag
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public ICollection<CampaignTag> CampaignTags { get; set; } = new List<CampaignTag>();
    public ICollection<InfluencerTag> InfluencerTags { get; set; } = new List<InfluencerTag>();
}
