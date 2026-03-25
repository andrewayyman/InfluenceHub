using InfluenceHub.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InfluenceHub.WebApi.Controllers;

[Authorize(Roles = "Brand,Influencer")]
public class MatchingController : BaseApiController
{
    private readonly IMatchingService _matchingService;

    public MatchingController(IMatchingService matchingService)
    {
        _matchingService = matchingService;
    }

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("{campaignId:guid}")]
    [Authorize(Roles = "Brand")]
    public async Task<IActionResult> GetSuggestedInfluencers(Guid campaignId, [FromQuery] int limit = 20, CancellationToken ct = default)
    {
        var influencers = await _matchingService.GetSuggestedInfluencersAsync(UserId, campaignId, limit, ct);
        return Ok(influencers);
    }

    [HttpGet]
    [Authorize(Roles = "Influencer")]
    public async Task<IActionResult> GetSuggestedCampaigns([FromQuery] int limit = 20, CancellationToken ct = default)
    {
        var campaigns = await _matchingService.GetSuggestedCampaignsAsync(UserId, limit, ct);
        return Ok(campaigns);
    }
}
