namespace InfluenceHub.Domain.Entities;

public class Influencer
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Bio { get; set; } = string.Empty;
    public string Platforms { get; set; } = "[]"; // JSON array of platforms
    public int FollowersCount { get; set; }
    public string Location { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public ICollection<InfluencerTag> InfluencerTags { get; set; } = new List<InfluencerTag>();
    public ICollection<Application> Applications { get; set; } = new List<Application>();
}
