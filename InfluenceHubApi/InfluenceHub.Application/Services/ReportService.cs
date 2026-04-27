using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.DTOs.Response;
using InfluenceHub.Application.Interfaces;
using InfluenceHub.Domain.Entities;
using InfluenceHub.Domain.Enums;
using InfluenceHub.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace InfluenceHub.Application.Services;

public class ReportService : IReportService
{
    private readonly IInfluencerRepository _influencerRepository;
    private readonly IRepository<Domain.Entities.Application> _applicationRepository;
    private readonly IRepository<CampaignReport> _reportRepository;
    private readonly IFileStorage _fileStorage;

    public ReportService(
        IInfluencerRepository influencerRepository,
        IRepository<Domain.Entities.Application> applicationRepository,
        IRepository<CampaignReport> reportRepository,
        IFileStorage fileStorage)
    {
        _influencerRepository = influencerRepository;
        _applicationRepository = applicationRepository;
        _reportRepository = reportRepository;
        _fileStorage = fileStorage;
    }

    public async Task<ReportResponse> SubmitReportAsync(Guid influencerUserId, SubmitReportRequest request, Stream screenshotStream, string screenshotExtension, CancellationToken ct = default)
    {
        var influencer = await _influencerRepository.GetByUserIdAsync(influencerUserId, ct)
            ?? throw new InvalidOperationException("Influencer profile not found");

        var application = await _applicationRepository.Query()
            .Include(a => a.Campaign)
            .FirstOrDefaultAsync(a => a.Id == request.ApplicationId && a.InfluencerId == influencer.Id, ct)
            ?? throw new InvalidOperationException("Application not found");

        if (application.Status != ApplicationStatus.Accepted)
            throw new InvalidOperationException("Application must be accepted before submitting a report");

        if (application.Campaign.Status != CampaignStatus.InfluencerSelected)
            throw new InvalidOperationException("Campaign is not in the correct status for report submission");

        if (request.PlatformInsights is null || request.PlatformInsights.Count == 0)
            throw new InvalidOperationException("At least one platform insight row is required.");

        foreach (var row in request.PlatformInsights)
        {
            if (string.IsNullOrWhiteSpace(row.Platform))
                throw new InvalidOperationException("Platform is required for each insight row.");

            var rowTotal = row.Likes + row.Comments + row.Shares;
            if (rowTotal > row.Views)
                throw new InvalidOperationException($"Total engagement cannot exceed views for platform '{row.Platform}'.");
        }

        if (request.StartDate > request.EndDate)
            throw new InvalidOperationException("Start date must be before or equal to end date");

        var screenshotPath = await _fileStorage.SaveReportScreenshotAsync(request.ApplicationId, screenshotStream, screenshotExtension, ct);

        var aggregateViews = request.PlatformInsights.Sum(x => x.Views);
        var aggregateLikes = request.PlatformInsights.Sum(x => x.Likes);
        var aggregateComments = request.PlatformInsights.Sum(x => x.Comments);
        var aggregateShares = request.PlatformInsights.Sum(x => x.Shares);
        var primaryLink = request.PlatformInsights.FirstOrDefault(x => !string.IsNullOrWhiteSpace(x.PostUrl))?.PostUrl ?? string.Empty;

        var report = new CampaignReport
        {
            Id = Guid.NewGuid(),
            ApplicationId = request.ApplicationId,
            PostUrl = primaryLink,
            PostingDate = request.PostingDate,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Views = aggregateViews,
            Likes = aggregateLikes,
            Comments = aggregateComments,
            Shares = aggregateShares,
            Platform = JsonSerializer.Serialize(request.PlatformInsights),
            ScreenshotPath = screenshotPath,
            Status = ReportStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        application.Campaign.Status = CampaignStatus.ReportSubmitted;
        application.Campaign.UpdatedAt = DateTime.UtcNow;

        await _reportRepository.AddAsync(report, ct);
        _applicationRepository.Update(application);
        await _applicationRepository.SaveChangesAsync(ct);

        return new ReportResponse(
            report.Id, report.ApplicationId, application.CampaignId, report.PostUrl, report.PostingDate, report.StartDate, report.EndDate,
            report.Views, report.Likes, report.Comments, report.Shares, ToPublicScreenshotPath(report.ScreenshotPath), report.Status,
            report.RejectionReason, report.ReviewedAt, influencer.Name, influencer.User?.Email ?? string.Empty, application.Campaign.Title,
            MapPlatformInsights(report));
    }

    public async Task<IReadOnlyList<ReportResponse>> GetMyReportsAsync(Guid influencerUserId, CancellationToken ct = default)
    {
        var influencer = await _influencerRepository.GetByUserIdAsync(influencerUserId, ct);
        if (influencer is null) return [];

        var applications = await _applicationRepository.Query()
            .Where(a => a.InfluencerId == influencer.Id)
            .Select(a => a.Id)
            .ToListAsync(ct);

        var reports = await _reportRepository.Query()
            .Include(r => r.Application)
            .ThenInclude(a => a.Campaign)
            .Where(r => applications.Contains(r.ApplicationId))
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(ct);

        return reports.Select(r => new ReportResponse(
            r.Id, r.ApplicationId, r.Application.CampaignId, r.PostUrl, r.PostingDate, r.StartDate, r.EndDate,
            r.Views, r.Likes, r.Comments, r.Shares, ToPublicScreenshotPath(r.ScreenshotPath), r.Status,
            r.RejectionReason, r.ReviewedAt, influencer.Name, influencer.User?.Email ?? string.Empty, r.Application.Campaign.Title,
            MapPlatformInsights(r))).ToList();
    }

    private static string ToPublicScreenshotPath(string relativePath)
    {
        if (string.IsNullOrWhiteSpace(relativePath))
            return string.Empty;

        return $"/uploads/reports/{relativePath.Replace("\\", "/")}";
    }

    private static List<PlatformReportInsightResponse> MapPlatformInsights(CampaignReport report)
    {
        if (!string.IsNullOrWhiteSpace(report.Platform))
        {
            try
            {
                var parsed = JsonSerializer.Deserialize<List<PlatformReportInsightRequest>>(report.Platform);
                if (parsed is { Count: > 0 })
                {
                    return parsed.Select(x => new PlatformReportInsightResponse(
                        x.Platform,
                        x.PostUrl,
                        x.Views,
                        x.Likes,
                        x.Comments,
                        x.Shares)).ToList();
                }
            }
            catch (JsonException)
            {
                // Fallback below for legacy data.
            }
        }

        return
        [
            new PlatformReportInsightResponse(
                string.IsNullOrWhiteSpace(report.Platform) ? "Unknown" : report.Platform,
                report.PostUrl,
                report.Views,
                report.Likes,
                report.Comments,
                report.Shares)
        ];
    }

    public async Task<RoiResponse?> GetReportRoiAsync(Guid reportId, CancellationToken ct = default)
    {
        var report = await _reportRepository.Query()
            .Include(r => r.Application)
            .ThenInclude(a => a.Campaign)
            .FirstOrDefaultAsync(r => r.Id == reportId, ct);
        if (report is null || report.Status != ReportStatus.Approved) return null;

        var totalEngagement = report.Likes + report.Comments + report.Shares;
        var engagementRate = report.Views > 0 ? (decimal)totalEngagement / report.Views : 0;
        var cpv = report.Views > 0 ? report.Application.Campaign.Budget / report.Views : 0;
        var cpe = totalEngagement > 0 ? report.Application.Campaign.Budget / totalEngagement : 0;

        return new RoiResponse(totalEngagement, engagementRate, cpv, cpe);
    }
}
