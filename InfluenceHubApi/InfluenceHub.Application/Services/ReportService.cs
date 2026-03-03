using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.DTOs.Response;
using InfluenceHub.Application.Interfaces;
using InfluenceHub.Domain.Entities;
using InfluenceHub.Domain.Enums;
using InfluenceHub.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

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

        var totalEngagement = request.Likes + request.Comments + request.Shares;
        if (totalEngagement > request.Views)
            throw new InvalidOperationException("Total engagement (likes + comments + shares) cannot exceed views");

        if (request.StartDate > request.EndDate)
            throw new InvalidOperationException("Start date must be before or equal to end date");

        var screenshotPath = await _fileStorage.SaveReportScreenshotAsync(request.ApplicationId, screenshotStream, screenshotExtension, ct);

        var report = new CampaignReport
        {
            Id = Guid.NewGuid(),
            ApplicationId = request.ApplicationId,
            PostUrl = request.PostUrl,
            PostingDate = request.PostingDate,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Views = request.Views,
            Likes = request.Likes,
            Comments = request.Comments,
            Shares = request.Shares,
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
            report.Id, report.ApplicationId, report.PostUrl, report.PostingDate, report.StartDate, report.EndDate,
            report.Views, report.Likes, report.Comments, report.Shares, report.ScreenshotPath, report.Status);
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
            .Where(r => applications.Contains(r.ApplicationId))
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(ct);

        return reports.Select(r => new ReportResponse(
            r.Id, r.ApplicationId, r.PostUrl, r.PostingDate, r.StartDate, r.EndDate,
            r.Views, r.Likes, r.Comments, r.Shares, r.ScreenshotPath, r.Status)).ToList();
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
