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
    DateTime CreatedAt,
    string Bio,
    string Proposal,
    decimal ProposedBudget,
    List<string> Links,
    List<string> MediaFiles,
    CampaignStatus CampaignStatus = CampaignStatus.Open,
    string BrandName = "",
    DateTime? CampaignDeadline = null
);
