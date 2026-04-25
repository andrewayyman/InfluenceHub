using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InfluenceHub.WebApi.Controllers;

public class ApplicationsController : BaseApiController
{
    private readonly IApplicationService _applicationService;

    public ApplicationsController(IApplicationService applicationService)
    {
        _applicationService = applicationService;
    }

    [HttpPost]
    [Authorize(Roles = "Influencer")]
    public async Task<IActionResult> Apply([FromBody] ApplyRequest request, CancellationToken ct)
    {
        try
        {
            var application = await _applicationService.ApplyAsync(UserId, request, ct);
            return CreatedAtAction(nameof(GetCampaignApplications), new { campaignId = request.CampaignId }, application);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPatch]
    [Authorize(Roles = "Brand")]
    public async Task<IActionResult> AcceptOrReject([FromBody] AcceptRejectRequest request, CancellationToken ct)
    {
        var application = await _applicationService.AcceptOrRejectAsync(UserId, request, ct);
        if (application is null) return NotFound();
        return Ok(application);
    }

    [HttpGet("{campaignId:guid}")]
    [Authorize(Roles = "Brand")]
    public async Task<IActionResult> GetCampaignApplications(Guid campaignId, CancellationToken ct)
    {
        var applications = await _applicationService.GetCampaignApplicationsAsync(UserId, campaignId, ct);
        return Ok(applications);
    }
}
