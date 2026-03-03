using InfluenceHub.Domain.Enums;

namespace InfluenceHub.Application.DTOs.Request;

public record UpdateCampaignRequest(
    string? Title,
    string? Description,
    decimal? Budget,
    DateTime? Deadline,
    string? Platform,
    string? Location,
    CampaignStatus? Status,
    List<string>? Tags
);
