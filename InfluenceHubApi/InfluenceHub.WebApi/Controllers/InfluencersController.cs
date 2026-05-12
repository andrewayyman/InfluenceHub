using InfluenceHub.Application.Interfaces;
using InfluenceHub.Application.DTOs.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InfluenceHub.WebApi.Controllers;

[Authorize(Roles = "Influencer")]
public class InfluencersController : BaseApiController
{
    private readonly IInfluencerService _influencerService;

    public InfluencersController(IInfluencerService influencerService)
    {
        _influencerService = influencerService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProfile(CancellationToken ct)
    {
        var profile = await _influencerService.GetProfileAsync(UserId, ct);
        if (profile is null) return NotFound();
        return Ok(profile);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] InfluenceHub.Application.DTOs.Request.UpdateInfluencerProfileRequest request, CancellationToken ct)
    {
        var profile = await _influencerService.UpdateProfileAsync(UserId, request, ct);
        return Ok(profile);
    }

    [HttpPut]
    public async Task<IActionResult> UpdatePaymentInfo([FromBody] UpdatePaymentInfoRequest request, CancellationToken ct)
    {
        var paymentInfo = await _influencerService.UpdatePaymentInfoAsync(UserId, request, ct);
        return Ok(paymentInfo);
    }

    [HttpGet]
    public async Task<IActionResult> GetMyApplications(CancellationToken ct)
    {
        var applications = await _influencerService.GetMyApplicationsAsync(UserId, ct);
        return Ok(applications);
    }

    [AllowAnonymous]
    [HttpGet("{influencerId:guid}")]
    public async Task<IActionResult> GetPublicProfile(Guid influencerId, CancellationToken ct)
    {
        var profile = await _influencerService.GetPublicProfileAsync(influencerId, ct);
        if (profile is null) return NotFound();
        return Ok(profile);
    }
}
