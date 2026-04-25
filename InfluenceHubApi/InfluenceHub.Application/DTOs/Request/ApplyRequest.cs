namespace InfluenceHub.Application.DTOs.Request;

public record ApplyRequest(
    Guid CampaignId,
    string Message,
    string Bio,
    string Proposal,
    decimal ProposedBudget,
    List<string>? Links,
    List<string>? MediaFiles
);
