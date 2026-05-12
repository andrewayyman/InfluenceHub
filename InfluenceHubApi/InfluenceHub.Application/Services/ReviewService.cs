using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.DTOs.Response;
using InfluenceHub.Application.Interfaces;
using InfluenceHub.Domain.Entities;
using InfluenceHub.Domain.Enums;
using InfluenceHub.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InfluenceHub.Application.Services;

public class ReviewService : IReviewService
{
    private readonly IRepository<Review> _reviewRepository;
    private readonly IRepository<Domain.Entities.Application> _applicationRepository;
    private readonly IBrandRepository _brandRepository;
    private readonly IInfluencerRepository _influencerRepository;
    private readonly IRepository<User> _userRepository;

    public ReviewService(
        IRepository<Review> reviewRepository,
        IRepository<Domain.Entities.Application> applicationRepository,
        IBrandRepository brandRepository,
        IInfluencerRepository influencerRepository,
        IRepository<User> userRepository)
    {
        _reviewRepository = reviewRepository;
        _applicationRepository = applicationRepository;
        _brandRepository = brandRepository;
        _influencerRepository = influencerRepository;
        _userRepository = userRepository;
    }

    public async Task<ReviewResponse> CreateReviewAsync(Guid reviewerUserId, CreateReviewRequest request, CancellationToken ct = default)
    {
        var brand = await _brandRepository.GetByUserIdAsync(reviewerUserId, ct)
            ?? throw new InvalidOperationException("Brand profile not found.");

        var application = await _applicationRepository.Query()
            .Include(a => a.Campaign)
            .Include(a => a.Influencer)
            .FirstOrDefaultAsync(a => a.Id == request.CampaignId && a.Campaign.BrandId == brand.Id, ct)
            ?? throw new InvalidOperationException("Application not found for this campaign.");

        if (application.Status != ApplicationStatus.Accepted)
            throw new InvalidOperationException("Can only review after a successful collaboration.");

        var existingReview = await _reviewRepository.Query()
            .AnyAsync(r => r.ReviewerUserId == reviewerUserId && r.CampaignId == application.CampaignId, ct);
        if (existingReview)
            throw new InvalidOperationException("You have already reviewed this campaign collaboration.");

        var review = new Review
        {
            Id = Guid.NewGuid(),
            ReviewerUserId = reviewerUserId,
            ReviewerRole = UserRole.Brand,
            TargetType = ReviewTargetType.Influencer,
            TargetId = application.InfluencerId,
            CampaignId = application.CampaignId,
            Rating = request.Rating,
            Comment = request.Comment,
            CreatedAt = DateTime.UtcNow
        };

        await _reviewRepository.AddAsync(review, ct);
        await _reviewRepository.SaveChangesAsync(ct);

        return await MapToResponseAsync(review, ct);
    }

    public async Task<ReviewResponse> CreateInfluencerReviewAsync(Guid reviewerUserId, CreateReviewRequest request, CancellationToken ct = default)
    {
        var influencer = await _influencerRepository.GetByUserIdAsync(reviewerUserId, ct)
            ?? throw new InvalidOperationException("Influencer profile not found.");

        var application = await _applicationRepository.Query()
            .Include(a => a.Campaign)
            .FirstOrDefaultAsync(a => a.CampaignId == request.CampaignId && a.InfluencerId == influencer.Id, ct)
            ?? throw new InvalidOperationException("You did not participate in this campaign.");

        if (application.Status != ApplicationStatus.Accepted)
            throw new InvalidOperationException("Can only review after a successful collaboration.");

        var existingReview = await _reviewRepository.Query()
            .AnyAsync(r => r.ReviewerUserId == reviewerUserId && r.CampaignId == application.CampaignId, ct);
        if (existingReview)
            throw new InvalidOperationException("You have already reviewed this campaign collaboration.");

        var review = new Review
        {
            Id = Guid.NewGuid(),
            ReviewerUserId = reviewerUserId,
            ReviewerRole = UserRole.Influencer,
            TargetType = ReviewTargetType.Brand,
            TargetId = application.Campaign.BrandId,
            CampaignId = application.CampaignId,
            Rating = request.Rating,
            Comment = request.Comment,
            CreatedAt = DateTime.UtcNow
        };

        await _reviewRepository.AddAsync(review, ct);
        await _reviewRepository.SaveChangesAsync(ct);

        return await MapToResponseAsync(review, ct);
    }

    public async Task<IReadOnlyList<ReviewResponse>> GetInfluencerReviewsAsync(Guid influencerId, CancellationToken ct = default)
    {
        var reviews = await _reviewRepository.Query()
            .Include(r => r.Reviewer)
            .Include(r => r.Campaign)
            .Where(r => r.TargetType == ReviewTargetType.Influencer && r.TargetId == influencerId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(ct);

        return reviews.Select(r => MapToResponseSync(r)).ToList();
    }

    public async Task<IReadOnlyList<ReviewResponse>> GetBrandReviewsAsync(Guid brandId, CancellationToken ct = default)
    {
        var reviews = await _reviewRepository.Query()
            .Include(r => r.Reviewer)
            .Include(r => r.Campaign)
            .Where(r => r.TargetType == ReviewTargetType.Brand && r.TargetId == brandId)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(ct);

        return reviews.Select(r => MapToResponseSync(r)).ToList();
    }

    public async Task<ReviewSummaryResponse> GetInfluencerReviewSummaryAsync(Guid influencerId, CancellationToken ct = default)
    {
        var reviews = await _reviewRepository.Query()
            .Where(r => r.TargetType == ReviewTargetType.Influencer && r.TargetId == influencerId)
            .ToListAsync(ct);

        return BuildSummary(reviews);
    }

    public async Task<ReviewSummaryResponse> GetBrandReviewSummaryAsync(Guid brandId, CancellationToken ct = default)
    {
        var reviews = await _reviewRepository.Query()
            .Where(r => r.TargetType == ReviewTargetType.Brand && r.TargetId == brandId)
            .ToListAsync(ct);

        return BuildSummary(reviews);
    }

    private async Task<ReviewResponse> MapToResponseAsync(Review review, CancellationToken ct)
    {
        var reviewer = await _userRepository.GetByIdAsync(review.ReviewerUserId, ct);
        return new ReviewResponse(
            review.Id,
            review.ReviewerUserId,
            reviewer?.Email ?? "Unknown",
            review.ReviewerRole.ToString(),
            review.TargetId,
            review.Rating,
            review.Comment,
            review.CampaignId,
            string.Empty,
            review.CreatedAt
        );
    }

    private static ReviewResponse MapToResponseSync(Review review)
    {
        return new ReviewResponse(
            review.Id,
            review.ReviewerUserId,
            review.Reviewer?.Email ?? "Unknown",
            review.ReviewerRole.ToString(),
            review.TargetId,
            review.Rating,
            review.Comment,
            review.CampaignId,
            review.Campaign?.Title ?? string.Empty,
            review.CreatedAt
        );
    }

    private static ReviewSummaryResponse BuildSummary(List<Review> reviews)
    {
        var distribution = new Dictionary<int, int> { { 1, 0 }, { 2, 0 }, { 3, 0 }, { 4, 0 }, { 5, 0 } };
        foreach (var r in reviews)
        {
            if (distribution.ContainsKey(r.Rating))
                distribution[r.Rating]++;
        }

        var avg = reviews.Count > 0 ? reviews.Average(r => r.Rating) : 0;
        return new ReviewSummaryResponse(Math.Round(avg, 1), reviews.Count, distribution);
    }
}
