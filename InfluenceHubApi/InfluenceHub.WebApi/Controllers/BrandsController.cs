using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InfluenceHub.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Brand")]
public class BrandsController : ControllerBase
{
    private readonly IBrandService _brandService;

    public BrandsController(IBrandService brandService)
    {
        _brandService = brandService;
    }

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile(CancellationToken ct)
    {
        var profile = await _brandService.GetProfileAsync(UserId, ct);
        if (profile is null) return NotFound();
        return Ok(profile);
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateBrandProfileRequest request, CancellationToken ct)
    {
        var profile = await _brandService.UpdateProfileAsync(UserId, request, ct);
        return Ok(profile);
    }

    [HttpPost("campaigns")]
    public async Task<IActionResult> CreateCampaign([FromBody] CreateCampaignRequest request, CancellationToken ct)
    {
        var campaign = await _brandService.CreateCampaignAsync(UserId, request, ct);
        return CreatedAtAction(nameof(GetCampaign), new { campaignId = campaign.Id }, campaign);
    }

    [HttpGet("campaigns")]
    public async Task<IActionResult> GetCampaigns(CancellationToken ct)
    {
        var campaigns = await _brandService.GetCampaignsAsync(UserId, ct);
        return Ok(campaigns);
    }

    [HttpGet("campaigns/{campaignId:guid}")]
    public async Task<IActionResult> GetCampaign(Guid campaignId, CancellationToken ct)
    {
        var campaign = await _brandService.GetCampaignAsync(UserId, campaignId, ct);
        if (campaign is null) return NotFound();
        return Ok(campaign);
    }

    [HttpPut("campaigns/{campaignId:guid}")]
    public async Task<IActionResult> UpdateCampaign(Guid campaignId, [FromBody] UpdateCampaignRequest request, CancellationToken ct)
    {
        var campaign = await _brandService.UpdateCampaignAsync(UserId, campaignId, request, ct);
        if (campaign is null) return NotFound();
        return Ok(campaign);
    }

    [HttpDelete("campaigns/{campaignId:guid}")]
    public async Task<IActionResult> DeleteCampaign(Guid campaignId, CancellationToken ct)
    {
        var deleted = await _brandService.DeleteCampaignAsync(UserId, campaignId, ct);
        if (!deleted) return NotFound();
        return NoContent();
    }
}
