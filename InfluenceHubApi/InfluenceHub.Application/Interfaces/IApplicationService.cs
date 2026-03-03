using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.DTOs.Response;

namespace InfluenceHub.Application.Interfaces;

public interface IApplicationService
{
    Task<ApplicationResponse> ApplyAsync(Guid influencerUserId, ApplyRequest request, CancellationToken ct = default);
    Task<ApplicationResponse?> AcceptOrRejectAsync(Guid brandUserId, AcceptRejectRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<ApplicationResponse>> GetCampaignApplicationsAsync(Guid brandUserId, Guid campaignId, CancellationToken ct = default);
}
