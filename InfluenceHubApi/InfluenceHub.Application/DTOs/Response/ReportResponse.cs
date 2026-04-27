using InfluenceHub.Domain.Enums;

namespace InfluenceHub.Application.DTOs.Response;

public record ReportResponse(
    Guid Id,
    Guid ApplicationId,
    Guid CampaignId,
    string PostUrl,
    DateTime PostingDate,
    DateTime StartDate,
    DateTime EndDate,
    long Views,
    long Likes,
    long Comments,
    long Shares,
    string ScreenshotPath,
    ReportStatus Status,
    string? RejectionReason,
    DateTime? ReviewedAt,
    string InfluencerName,
    string InfluencerEmail,
    string CampaignTitle,
    List<PlatformReportInsightResponse> PlatformInsights
);

public record PlatformReportInsightResponse(
    string Platform,
    string? PostUrl,
    long Views,
    long Likes,
    long Comments,
    long Shares
);
