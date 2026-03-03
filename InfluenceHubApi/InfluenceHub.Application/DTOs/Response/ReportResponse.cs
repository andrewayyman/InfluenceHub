using InfluenceHub.Domain.Enums;

namespace InfluenceHub.Application.DTOs.Response;

public record ReportResponse(
    Guid Id,
    Guid ApplicationId,
    string PostUrl,
    DateTime PostingDate,
    DateTime StartDate,
    DateTime EndDate,
    long Views,
    long Likes,
    long Comments,
    long Shares,
    string ScreenshotPath,
    ReportStatus Status
);
