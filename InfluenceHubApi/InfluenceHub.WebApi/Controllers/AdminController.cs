using InfluenceHub.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InfluenceHub.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AdminController : ControllerBase
{
    private readonly IAdminService _adminService;

    public AdminController(IAdminService adminService)
    {
        _adminService = adminService;
    }

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("dashboard")]
    public async Task<IActionResult> GetDashboard(CancellationToken ct)
    {
        var stats = await _adminService.GetDashboardStatsAsync(ct);
        return Ok(stats);
    }

    [HttpGet("contact-messages")]
    public async Task<IActionResult> GetContactMessages([FromQuery] bool? isReplied, CancellationToken ct)
    {
        var messages = await _adminService.GetContactMessagesAsync(isReplied, ct);
        return Ok(messages);
    }

    [HttpPatch("contact-messages/{messageId:guid}/replied")]
    public async Task<IActionResult> MarkContactReplied(Guid messageId, CancellationToken ct)
    {
        var success = await _adminService.MarkContactRepliedAsync(messageId, ct);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpPatch("users/{userId:guid}/enable")]
    public async Task<IActionResult> EnableUser(Guid userId, CancellationToken ct)
    {
        var success = await _adminService.EnableDisableUserAsync(userId, true, ct);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpPatch("users/{userId:guid}/disable")]
    public async Task<IActionResult> DisableUser(Guid userId, CancellationToken ct)
    {
        var success = await _adminService.EnableDisableUserAsync(userId, false, ct);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpPatch("reports/{reportId:guid}/approve")]
    public async Task<IActionResult> ApproveReport(Guid reportId, CancellationToken ct)
    {
        var success = await _adminService.ApproveRejectReportAsync(reportId, true, UserId, ct);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpPatch("reports/{reportId:guid}/reject")]
    public async Task<IActionResult> RejectReport(Guid reportId, CancellationToken ct)
    {
        var success = await _adminService.ApproveRejectReportAsync(reportId, false, UserId, ct);
        if (!success) return NotFound();
        return NoContent();
    }
}
