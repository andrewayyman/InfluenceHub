using InfluenceHub.Domain.Enums;

namespace InfluenceHub.Application.DTOs.Request;

public record UpdateCampaignRequest(
    string? Title,
    string? Description,
    decimal? Budget,
    DateTime? Deadline,
    List<string>? Platforms,
    string? Location,
    CampaignStatus? Status,
    List<string>? Tags,
    int? BudgetType = null
);
