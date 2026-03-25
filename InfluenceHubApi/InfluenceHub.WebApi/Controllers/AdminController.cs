using InfluenceHub.Application.Interfaces;
using InfluenceHub.Application.DTOs.Response;
using InfluenceHub.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InfluenceHub.WebApi.Controllers;

[Authorize(Roles = "Admin")]
public class AdminController : BaseApiController
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetDashboard(CancellationToken ct)
    {
        var stats = await _adminService.GetDashboardStatsAsync(ct);
        return Ok(stats);
    }

    [HttpGet]
    public async Task<IActionResult> GetContactMessages([FromQuery] bool? isReplied, CancellationToken ct)
    {
        var messages = await _adminService.GetContactMessagesAsync(isReplied, ct);
        return Ok(messages);
    }

    [HttpPatch("{messageId:guid}")]
    public async Task<IActionResult> MarkContactReplied(Guid messageId, CancellationToken ct)
    {
        var success = await _adminService.MarkContactRepliedAsync(messageId, ct);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpPatch("{userId:guid}")]
    public async Task<IActionResult> EnableUser(Guid userId, CancellationToken ct)
    {
        var success = await _adminService.EnableDisableUserAsync(userId, true, ct);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpPatch("{userId:guid}")]
    public async Task<IActionResult> DisableUser(Guid userId, CancellationToken ct)
    {
        var success = await _adminService.EnableDisableUserAsync(userId, false, ct);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpPatch("{reportId:guid}")]
    public async Task<IActionResult> ApproveReport(Guid reportId, CancellationToken ct)
    {
        var success = await _adminService.ApproveRejectReportAsync(reportId, true, UserId, ct);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpPatch("{reportId:guid}")]
    public async Task<IActionResult> RejectReport(Guid reportId, CancellationToken ct)
    {
        var success = await _adminService.ApproveRejectReportAsync(reportId, false, UserId, ct);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers(CancellationToken ct)
    {
        var users = await _adminService.GetUsersAsync(ct);
        return Ok(users);
    }

    [HttpDelete("{userId:guid}")]
    public async Task<IActionResult> DeleteUser(Guid userId, CancellationToken ct)
    {
        var success = await _adminService.DeleteUserAsync(userId, ct);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> GetCampaigns([FromQuery] CampaignStatus? status, CancellationToken ct)
    {
        var campaigns = await _adminService.GetCampaignsAsync(status, ct);
        return Ok(campaigns);
    }

    [HttpPatch("{campaignId:guid}")]
    public async Task<IActionResult> CloseCampaign(Guid campaignId, CancellationToken ct)
    {
        var success = await _adminService.CloseCampaignAsync(campaignId, ct);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpDelete("{campaignId:guid}")]
    public async Task<IActionResult> DeleteCampaign(Guid campaignId, CancellationToken ct)
    {
        var success = await _adminService.DeleteCampaignAsync(campaignId, ct);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> GetReports([FromQuery] ReportStatus? status, CancellationToken ct)
    {
        var reports = await _adminService.GetReportsAsync(status, ct);
        return Ok(reports);
    }
}
