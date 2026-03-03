namespace InfluenceHub.Application.DTOs.Request;

public record ApplyRequest(
    Guid CampaignId,
    string Message
);
