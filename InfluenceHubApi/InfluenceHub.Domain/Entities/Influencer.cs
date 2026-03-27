namespace InfluenceHub.Domain.Entities;

public class Influencer
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string Platforms { get; set; } = "[]"; // JSON array of platforms
    public int FollowersCount { get; set; }
    public string Location { get; set; } = string.Empty;
    public string? InstagramUrl { get; set; }
    public string? FacebookUrl { get; set; }
    public string? TwitterUrl { get; set; }
    public string? YouTubeUrl { get; set; }
    public string? TikTokUrl { get; set; }
    public string? LinkedInUrl { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User User { get; set; } = null!;
    public ICollection<InfluencerTag> InfluencerTags { get; set; } = new List<InfluencerTag>();
    public ICollection<Application> Applications { get; set; } = new List<Application>();
}
