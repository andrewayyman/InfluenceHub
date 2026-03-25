using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.Interfaces;
using InfluenceHub.WebApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InfluenceHub.WebApi.Controllers;

[Authorize(Roles = "Influencer")]
public class ReportsController : BaseApiController
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    private Guid UserId => Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    public async Task<IActionResult> SubmitReport([FromForm] SubmitReportFormModel form, CancellationToken ct = default)
    {
        if (form.Screenshot is null || form.Screenshot.Length == 0)
            return BadRequest(new { message = "Screenshot is required" });

        var ext = Path.GetExtension(form.Screenshot.FileName);
        if (string.IsNullOrEmpty(ext)) ext = ".png";

        var request = new SubmitReportRequest(
            form.ApplicationId, form.PostUrl, form.PostingDate, form.StartDate, form.EndDate,
            form.Views, form.Likes, form.Comments, form.Shares);

        try
        {
            await using var stream = form.Screenshot.OpenReadStream();
            var report = await _reportService.SubmitReportAsync(UserId, request, stream, ext, ct);
            return CreatedAtAction(nameof(GetReportRoi), new { reportId = report.Id }, report);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetMyReports(CancellationToken ct)
    {
        var reports = await _reportService.GetMyReportsAsync(UserId, ct);
        return Ok(reports);
    }

    [HttpGet("{reportId:guid}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetReportRoi(Guid reportId, CancellationToken ct)
    {
        var roi = await _reportService.GetReportRoiAsync(reportId, ct);
        if (roi is null) return NotFound();
        return Ok(roi);
    }
}
