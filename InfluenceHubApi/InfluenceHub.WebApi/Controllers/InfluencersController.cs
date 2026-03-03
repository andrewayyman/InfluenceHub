using InfluenceHub.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InfluenceHub.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Influencer")]
public class InfluencersController : ControllerBase
{
    private readonly IInfluencerService _influencerService;

    public InfluencersController(IInfluencerService influencerService)
    {
        _influencerService = influencerService;
    }

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile(CancellationToken ct)
    {
        var profile = await _influencerService.GetProfileAsync(UserId, ct);
        if (profile is null) return NotFound();
        return Ok(profile);
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] InfluenceHub.Application.DTOs.Request.UpdateInfluencerProfileRequest request, CancellationToken ct)
    {
        var profile = await _influencerService.UpdateProfileAsync(UserId, request, ct);
        return Ok(profile);
    }

    [HttpGet("applications")]
    public async Task<IActionResult> GetMyApplications(CancellationToken ct)
    {
        var applications = await _influencerService.GetMyApplicationsAsync(UserId, ct);
        return Ok(applications);
    }
}
