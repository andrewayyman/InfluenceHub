using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.DTOs.Response;

namespace InfluenceHub.Application.Interfaces;

public interface IReviewService
{
    Task<ReviewResponse> CreateReviewAsync(Guid reviewerUserId, CreateReviewRequest request, CancellationToken ct = default);
    Task<ReviewResponse> CreateInfluencerReviewAsync(Guid reviewerUserId, CreateReviewRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<ReviewResponse>> GetInfluencerReviewsAsync(Guid influencerId, CancellationToken ct = default);
    Task<IReadOnlyList<ReviewResponse>> GetBrandReviewsAsync(Guid brandId, CancellationToken ct = default);
    Task<ReviewSummaryResponse> GetInfluencerReviewSummaryAsync(Guid influencerId, CancellationToken ct = default);
    Task<ReviewSummaryResponse> GetBrandReviewSummaryAsync(Guid brandId, CancellationToken ct = default);
}
