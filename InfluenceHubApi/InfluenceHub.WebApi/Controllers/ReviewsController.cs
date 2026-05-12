using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InfluenceHub.WebApi.Controllers;

[ApiController]
[Route("api/[controller]/[action]")]
public class ReviewsController : BaseApiController
{
    private readonly IReviewService _reviewService;

    public ReviewsController(IReviewService reviewService)
    {
        _reviewService = reviewService;
    }

    [Authorize(Roles = "Brand")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReviewRequest request, CancellationToken ct)
    {
        try
        {
            var review = await _reviewService.CreateReviewAsync(UserId, request, ct);
            return Ok(review);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Influencer")]
    [HttpPost]
    public async Task<IActionResult> CreateInfluencerReview([FromBody] CreateReviewRequest request, CancellationToken ct)
    {
        try
        {
            var review = await _reviewService.CreateInfluencerReviewAsync(UserId, request, ct);
            return Ok(review);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [AllowAnonymous]
    [HttpGet("{influencerId:guid}")]
    public async Task<IActionResult> GetInfluencerReviews(Guid influencerId, CancellationToken ct)
    {
        var reviews = await _reviewService.GetInfluencerReviewsAsync(influencerId, ct);
        return Ok(reviews);
    }

    [AllowAnonymous]
    [HttpGet("{influencerId:guid}")]
    public async Task<IActionResult> GetInfluencerReviewSummary(Guid influencerId, CancellationToken ct)
    {
        var summary = await _reviewService.GetInfluencerReviewSummaryAsync(influencerId, ct);
        return Ok(summary);
    }

    [AllowAnonymous]
    [HttpGet("{brandId:guid}")]
    public async Task<IActionResult> GetBrandReviews(Guid brandId, CancellationToken ct)
    {
        var reviews = await _reviewService.GetBrandReviewsAsync(brandId, ct);
        return Ok(reviews);
    }

    [AllowAnonymous]
    [HttpGet("{brandId:guid}")]
    public async Task<IActionResult> GetBrandReviewSummary(Guid brandId, CancellationToken ct)
    {
        var summary = await _reviewService.GetBrandReviewSummaryAsync(brandId, ct);
        return Ok(summary);
    }
}
