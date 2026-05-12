using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.DTOs.Response;

namespace InfluenceHub.Application.Interfaces;

public interface IInfluencerService
{
    Task<InfluencerProfileResponse?> GetProfileAsync(Guid userId, CancellationToken ct = default);
    Task<InfluencerProfileResponse> UpdateProfileAsync(Guid userId, UpdateInfluencerProfileRequest request, CancellationToken ct = default);
    Task<InfluencerPaymentInfoResponse> UpdatePaymentInfoAsync(Guid userId, UpdatePaymentInfoRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<ApplicationResponse>> GetMyApplicationsAsync(Guid userId, CancellationToken ct = default);
    Task<PublicInfluencerProfileResponse?> GetPublicProfileAsync(Guid influencerId, CancellationToken ct = default);
}
