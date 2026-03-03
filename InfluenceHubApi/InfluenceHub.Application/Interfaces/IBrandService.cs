using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.DTOs.Response;

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
}
