namespace InfluenceHub.Application.DTOs.Response;

public record CampaignMatchResponse(
    Guid Id,
    string Title,
    decimal Budget,
    DateTime Deadline,
    string Platform,
    string Location,
    List<string> Tags,
    int MatchScore
);
