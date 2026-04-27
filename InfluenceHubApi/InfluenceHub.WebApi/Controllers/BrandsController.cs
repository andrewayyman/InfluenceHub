using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using InfluenceHub.Domain.Enums;

namespace InfluenceHub.WebApi.Controllers;

[Authorize(Roles = "Brand")]
public class BrandsController : BaseApiController
{
    private readonly IBrandService _brandService;

    public BrandsController(IBrandService brandService)
    {
        _brandService = brandService;
    }

    [HttpGet]
    public async Task<IActionResult> GetProfile(CancellationToken ct)
    {
        var profile = await _brandService.GetProfileAsync(UserId, ct);
        if (profile is null) return NotFound();
        return Ok(profile);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateBrandProfileRequest request, CancellationToken ct)
    {
        var profile = await _brandService.UpdateProfileAsync(UserId, request, ct);
        return Ok(profile);
    }

    [HttpPost]
    public async Task<IActionResult> CreateCampaign([FromBody] CreateCampaignRequest request, CancellationToken ct)
    {
        var campaign = await _brandService.CreateCampaignAsync(UserId, request, ct);
        return CreatedAtAction(nameof(GetCampaign), new { campaignId = campaign.Id }, campaign);
    }

    [HttpGet]
    public async Task<IActionResult> GetCampaigns(CancellationToken ct)
    {
        var campaigns = await _brandService.GetCampaignsAsync(UserId, ct);
        return Ok(campaigns);
    }

    [HttpGet("{campaignId:guid}")]
    public async Task<IActionResult> GetCampaign(Guid campaignId, CancellationToken ct)
    {
        var campaign = await _brandService.GetCampaignAsync(UserId, campaignId, ct);
        if (campaign is null) return NotFound();
        return Ok(campaign);
    }

    [HttpPut("{campaignId:guid}")]
    public async Task<IActionResult> UpdateCampaign(Guid campaignId, [FromBody] UpdateCampaignRequest request, CancellationToken ct)
    {
        try
        {
            var campaign = await _brandService.UpdateCampaignAsync(UserId, campaignId, request, ct);
            if (campaign is null) return NotFound();
            return Ok(campaign);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpDelete("{campaignId:guid}")]
    public async Task<IActionResult> DeleteCampaign(Guid campaignId, CancellationToken ct)
    {
        try
        {
            var deleted = await _brandService.DeleteCampaignAsync(UserId, campaignId, ct);
            if (!deleted) return NotFound();
            return NoContent();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetReports(CancellationToken ct)
    {
        var reports = await _brandService.GetReportsAsync(UserId, ct);
        return Ok(reports);
    }

    [HttpGet("{reportId:guid}")]
    public async Task<IActionResult> GetReport(Guid reportId, CancellationToken ct)
    {
        var report = await _brandService.GetReportAsync(UserId, reportId, ct);
        if (report is null) return NotFound();
        return Ok(report);
    }

    [HttpPatch("{reportId:guid}")]
    public async Task<IActionResult> UpdateReportStatus(Guid reportId, [FromBody] UpdateReportStatusRequest request, CancellationToken ct)
    {
        var success = await _brandService.UpdateReportStatusAsync(UserId, reportId, request.Status, ct);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpPost("{reportId:guid}")]
    public async Task<IActionResult> AddReportFeedback(Guid reportId, [FromBody] AddReportFeedbackRequest request, CancellationToken ct)
    {
        var success = await _brandService.AddReportFeedbackAsync(UserId, reportId, request.Feedback, ct);
        if (!success) return NotFound();
        return NoContent();
    }
}
