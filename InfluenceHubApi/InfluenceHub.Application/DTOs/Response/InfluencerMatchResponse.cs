namespace InfluenceHub.Application.DTOs.Response;

public record InfluencerMatchResponse(
    Guid Id,
    string Bio,
    List<string> Platforms,
    int FollowersCount,
    string Location,
    List<string> Tags,
    int MatchScore
);
