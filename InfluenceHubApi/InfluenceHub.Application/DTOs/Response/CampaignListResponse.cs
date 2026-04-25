using InfluenceHub.Domain.Enums;

namespace InfluenceHub.Application.DTOs.Response;

public record CampaignListResponse(
    Guid Id,
    string Title,
    string BrandName,
    decimal Budget,
    DateTime Deadline,
    List<string> Platforms,
    string Location,
    CampaignStatus Status,
    int ApplicationCount,
    List<string> Tags
);
