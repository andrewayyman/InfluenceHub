namespace InfluenceHub.Application.DTOs.Request;

public record CreateCampaignRequest(
    string Title,
    string Description,
    decimal Budget,
    DateTime Deadline,
    string Platform,
    string Location,
    List<string> Tags
);
