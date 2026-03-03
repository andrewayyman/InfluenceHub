namespace InfluenceHub.Application.DTOs.Response;

public record AdminDashboardResponse(
    int TotalUsers,
    int TotalBrands,
    int TotalInfluencers,
    int TotalCampaigns,
    int TotalApplications,
    int PendingReports
);
