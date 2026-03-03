namespace InfluenceHub.Application.DTOs.Response;

public record InfluencerProfileResponse(
    Guid Id,
    Guid UserId,
    string Bio,
    List<string> Platforms,
    int FollowersCount,
    string Location,
    List<string> Tags
);
