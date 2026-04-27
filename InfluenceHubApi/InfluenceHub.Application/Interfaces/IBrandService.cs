using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.DTOs.Response;
using InfluenceHub.Domain.Enums;

namespace InfluenceHub.Application.Interfaces;

public interface IBrandService
{
    Task<BrandProfileResponse?> GetProfileAsync(Guid userId, CancellationToken ct = default);
    Task<BrandProfileResponse> UpdateProfileAsync(Guid userId, UpdateBrandProfileRequest request, CancellationToken ct = default);
    Task<CampaignResponse> CreateCampaignAsync(Guid userId, CreateCampaignRequest request, CancellationToken ct = default);
    Task<CampaignResponse?> UpdateCampaignAsync(Guid userId, Guid campaignId, UpdateCampaignRequest request, CancellationToken ct = default);
    Task<bool> DeleteCampaignAsync(Guid userId, Guid campaignId, CancellationToken ct = default);
    Task<CampaignResponse?> GetCampaignAsync(Guid userId, Guid campaignId, CancellationToken ct = default);
    Task<IReadOnlyList<CampaignListResponse>> GetCampaignsAsync(Guid userId, CancellationToken ct = default);
    Task<IReadOnlyList<ReportResponse>> GetReportsAsync(Guid userId, CancellationToken ct = default);
    Task<ReportResponse?> GetReportAsync(Guid userId, Guid reportId, CancellationToken ct = default);
    Task<bool> UpdateReportStatusAsync(Guid userId, Guid reportId, ReportStatus status, CancellationToken ct = default);
    Task<bool> AddReportFeedbackAsync(Guid userId, Guid reportId, string feedback, CancellationToken ct = default);
}
