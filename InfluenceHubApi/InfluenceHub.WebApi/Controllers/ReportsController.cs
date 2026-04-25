using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.Interfaces;
using InfluenceHub.WebApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace InfluenceHub.WebApi.Controllers;

[Authorize(Roles = "Influencer")]
public class ReportsController : BaseApiController
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpPost]
    public async Task<IActionResult> SubmitReport([FromForm] SubmitReportFormModel form, CancellationToken ct = default)
    {
        if (form.Screenshot is null || form.Screenshot.Length == 0)
            return BadRequest(new { message = "Screenshot is required" });

        if (string.IsNullOrWhiteSpace(form.Screenshot.FileName))
            return BadRequest(new { message = "Screenshot file name is required" });

        var ext = Path.GetExtension(form.Screenshot.FileName);
        if (string.IsNullOrEmpty(ext)) ext = ".png";

        List<PlatformReportInsightRequest>? platformInsights;
        try
        {
            platformInsights = JsonSerializer.Deserialize<List<PlatformReportInsightRequest>>(form.PlatformInsightsJson);
        }
        catch (JsonException)
        {
            return BadRequest(new { message = "Platform insights payload is invalid." });
        }

        var request = new SubmitReportRequest(
            form.ApplicationId,
            form.PostingDate,
            form.StartDate,
            form.EndDate,
            platformInsights ?? []);

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
        catch (IOException)
        {
            return StatusCode(StatusCodes.Status503ServiceUnavailable,
                new { message = "Report file storage is temporarily unavailable." });
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
