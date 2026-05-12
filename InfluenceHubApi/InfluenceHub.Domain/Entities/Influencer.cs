namespace InfluenceHub.Domain.Entities;

public class Influencer
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string Platforms { get; set; } = "[]";
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

    // Payment info
    public string? InstapayPhone { get; set; }
    public string? WalletProvider { get; set; }
    public string? WalletNumber { get; set; }
    public string? BankName { get; set; }
    public string? BankAccountNumber { get; set; }
    public string? PreferredPaymentMethod { get; set; }

    public User User { get; set; } = null!;
    public ICollection<InfluencerTag> InfluencerTags { get; set; } = new List<InfluencerTag>();
    public ICollection<Application> Applications { get; set; } = new List<Application>();
}
