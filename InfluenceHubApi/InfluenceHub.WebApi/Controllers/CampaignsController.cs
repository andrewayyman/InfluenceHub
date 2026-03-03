using InfluenceHub.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InfluenceHub.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Brand,Influencer")]
public class CampaignsController : ControllerBase
{
    private readonly ICampaignService _campaignService;

    public CampaignsController(ICampaignService campaignService)
    {
        _campaignService = campaignService;
    }

    [HttpGet("{campaignId:guid}")]
    public async Task<IActionResult> GetById(Guid campaignId, CancellationToken ct)
    {
        var campaign = await _campaignService.GetByIdAsync(campaignId, ct);
        if (campaign is null) return NotFound();
        return Ok(campaign);
    }

    [HttpGet("open")]
    public async Task<IActionResult> GetOpenCampaigns([FromQuery] string? platform, [FromQuery] string? location, CancellationToken ct)
    {
        var campaigns = await _campaignService.GetOpenCampaignsAsync(platform, location, ct);
        return Ok(campaigns);
    }
}
