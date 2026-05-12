using InfluenceHub.Application.Interfaces;
using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.DTOs.Response;
using InfluenceHub.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace InfluenceHub.WebApi.Controllers;

[Authorize(Roles = "Admin")]
public class AdminController : BaseApiController
{
    private readonly IAdminService _adminService;
    private readonly ICommissionService _commissionService;
    private readonly IPaymentService _paymentService;

    public AdminController(IAdminService adminService, ICommissionService commissionService, IPaymentService paymentService)
    {
        _adminService = adminService;
        _commissionService = commissionService;
        _paymentService = paymentService;
    }

    [HttpGet]
    public async Task<IActionResult> GetDashboard(CancellationToken ct)
    {
        var stats = await _adminService.GetDashboardStatsAsync(ct);
        return Ok(stats);
    }

    [HttpGet]
    public async Task<IActionResult> GetContactMessages([FromQuery] bool? isReplied, [FromQuery] string? search, CancellationToken ct)
    {
        var messages = await _adminService.GetContactMessagesAsync(isReplied, search, ct);
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
        var success = await _adminService.ApproveRejectReportAsync(reportId, true, UserId, ct: ct);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpPatch("{reportId:guid}")]
    public async Task<IActionResult> RejectReport(Guid reportId, [FromBody] RejectReportRequest? request, CancellationToken ct)
    {
        var success = await _adminService.ApproveRejectReportAsync(reportId, false, UserId, request?.RejectionReason, ct);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpGet]
    public async Task<IActionResult> GetUsers([FromQuery] string? search, [FromQuery] UserRole? role, [FromQuery] bool? isActive, CancellationToken ct)
    {
        var users = await _adminService.GetUsersAsync(search, role, isActive, ct);
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
    public async Task<IActionResult> GetCampaigns([FromQuery] CampaignStatus? status, [FromQuery] string? search, CancellationToken ct)
    {
        var campaigns = await _adminService.GetCampaignsAsync(status, search, ct);
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
    public async Task<IActionResult> GetReports([FromQuery] ReportStatus? status, [FromQuery] string? search, CancellationToken ct)
    {
        var reports = await _adminService.GetReportsAsync(status, search, ct);
        return Ok(reports);
    }

    [HttpGet]
    public async Task<IActionResult> GetCommission(CancellationToken ct)
    {
        var commission = await _commissionService.GetCurrentCommissionAsync(ct);
        return Ok(commission);
    }

    [HttpPut]
    public async Task<IActionResult> SetCommission([FromBody] InfluenceHub.Application.DTOs.Request.SetCommissionRequest request, CancellationToken ct)
    {
        var result = await _commissionService.SetCommissionAsync(UserId, request, ct);
        return Ok(result);
    }

    [HttpGet]
    public async Task<IActionResult> GetCommissionHistory(CancellationToken ct)
    {
        var history = await _commissionService.GetCommissionHistoryAsync(ct);
        return Ok(history);
    }

    [HttpGet]
    public async Task<IActionResult> GetPayments([FromQuery] string? status, [FromQuery] string? search, CancellationToken ct)
    {
        var payments = await _paymentService.GetAllPaymentsAsync(status, search, ct);
        return Ok(payments);
    }

    [HttpGet]
    public async Task<IActionResult> GetPaymentSummary(CancellationToken ct)
    {
        var summary = await _paymentService.GetPaymentSummaryAsync(ct);
        return Ok(summary);
    }

    [HttpPost("{paymentId:guid}")]
    public async Task<IActionResult> ConfirmPayment(Guid paymentId, CancellationToken ct)
    {
        var payment = await _paymentService.AdminConfirmPaymentAsync(paymentId, UserId, ct);
        return Ok(payment);
    }

    [HttpPost("{paymentId:guid}")]
    public async Task<IActionResult> ResolveDispute(Guid paymentId, [FromBody] ResolveDisputeRequest? request, CancellationToken ct)
    {
        var payment = await _paymentService.ResolveDisputeAsync(paymentId, UserId, request ?? new ResolveDisputeRequest(), ct);
        return Ok(payment);
    }
}
