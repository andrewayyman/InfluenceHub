namespace InfluenceHub.Domain.Entities;

public class InfluencerTag
{
    public Guid Id { get; set; }
    public Guid InfluencerId { get; set; }
    public Guid TagId { get; set; }

    public Influencer Influencer { get; set; } = null!;
    public Tag Tag { get; set; } = null!;
}
