namespace InfluenceHub.Application.DTOs.Response;

public record RoiResponse(
    long TotalEngagement,
    decimal EngagementRate,
    decimal CostPerView,
    decimal CostPerEngagement
);
