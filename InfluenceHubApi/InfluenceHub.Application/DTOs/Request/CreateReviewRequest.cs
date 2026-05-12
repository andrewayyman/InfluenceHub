namespace InfluenceHub.Application.DTOs.Request;

public record CreateReviewRequest(
    Guid TargetId,
    Guid CampaignId,
    int Rating,
    string Comment
);
