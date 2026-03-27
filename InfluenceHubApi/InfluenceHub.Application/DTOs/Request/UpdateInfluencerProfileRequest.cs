namespace InfluenceHub.Application.DTOs.Request;

public record UpdateInfluencerProfileRequest(
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
    string? LinkedInUrl
);
