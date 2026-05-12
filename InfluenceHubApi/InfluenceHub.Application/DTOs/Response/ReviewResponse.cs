namespace InfluenceHub.Application.DTOs.Response;

public record ReviewResponse(
    Guid Id,
    Guid ReviewerId,
    string ReviewerName,
    string ReviewerRole,
    Guid TargetId,
    int Rating,
    string Comment,
    Guid CampaignId,
    string CampaignTitle,
    DateTime CreatedAt
);

public record ReviewSummaryResponse(
    double AverageRating,
    int TotalReviews,
    Dictionary<int, int> RatingDistribution
);
