using InfluenceHub.Application.DTOs.Response;

namespace InfluenceHub.Application.Interfaces;

public interface IMatchingService
{
    Task<IReadOnlyList<InfluencerMatchResponse>> GetSuggestedInfluencersAsync(Guid brandUserId, Guid campaignId, int limit = 20, CancellationToken ct = default);
    Task<IReadOnlyList<CampaignMatchResponse>> GetSuggestedCampaignsAsync(Guid influencerUserId, int limit = 20, CancellationToken ct = default);
}
