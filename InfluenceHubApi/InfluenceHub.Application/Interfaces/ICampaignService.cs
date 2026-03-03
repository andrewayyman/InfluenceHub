using InfluenceHub.Application.DTOs.Response;

namespace InfluenceHub.Application.Interfaces;

public interface ICampaignService
{
    Task<CampaignResponse?> GetByIdAsync(Guid campaignId, CancellationToken ct = default);
    Task<IReadOnlyList<CampaignListResponse>> GetOpenCampaignsAsync(string? platform, string? location, CancellationToken ct = default);
}
