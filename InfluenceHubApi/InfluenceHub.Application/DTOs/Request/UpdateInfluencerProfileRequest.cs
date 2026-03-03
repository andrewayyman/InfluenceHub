namespace InfluenceHub.Application.DTOs.Request;

public record UpdateInfluencerProfileRequest(
    string Bio,
    List<string> Platforms,
    int FollowersCount,
    string Location,
    List<string> Tags
);
