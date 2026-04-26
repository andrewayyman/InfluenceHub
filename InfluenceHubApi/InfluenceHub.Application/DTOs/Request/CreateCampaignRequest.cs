namespace InfluenceHub.Application.DTOs.Request;

public record CreateCampaignRequest(
    string Title,
    string Description,
    decimal Budget,
    DateTime Deadline,
    List<string> Platforms,
    string Location,
    List<string> Tags,
    int BudgetType = 0
);
