namespace InfluenceHub.Application.DTOs.Response;

public record PublicInfluencerProfileResponse(
    Guid Id,
    string Name,
    string Bio,
    List<string> Platforms,
    int FollowersCount,
    string Location,
    List<string> Tags,
    string? InstagramUrl,
    string? FacebookUrl,
    string? TwitterUrl,
    string? YouTubeUrl,
    string? TikTokUrl,
    string? LinkedInUrl,
    double AverageRating,
    int TotalReviews,
    int CompletedCampaigns,
    bool IsEligible
);
