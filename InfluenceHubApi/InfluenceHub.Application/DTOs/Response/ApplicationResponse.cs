using InfluenceHub.Domain.Enums;

namespace InfluenceHub.Application.DTOs.Response;

public record ApplicationResponse(
    Guid Id,
    Guid CampaignId,
    string CampaignTitle,
    Guid InfluencerId,
    string InfluencerName,
    ApplicationStatus Status,
    string Message,
    DateTime CreatedAt
);
