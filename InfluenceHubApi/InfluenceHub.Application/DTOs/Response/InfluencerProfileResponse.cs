namespace InfluenceHub.Application.DTOs.Response;

public record InfluencerProfileResponse(
    Guid Id,
    Guid UserId,
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
