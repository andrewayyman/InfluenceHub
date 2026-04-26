using InfluenceHub.Domain.Enums;

namespace InfluenceHub.Application.DTOs.Response;

public record CampaignResponse(
    Guid Id,
    Guid BrandId,
    string Title,
    string Description,
    decimal Budget,
    DateTime Deadline,
    List<string> Platforms,
    string Location,
    CampaignStatus Status,
    DateTime CreatedAt,
    List<string> Tags,
    int BudgetType = 0
);
