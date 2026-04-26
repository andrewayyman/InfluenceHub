namespace InfluenceHub.Application.DTOs.Request;

public record SubmitReportRequest(
    Guid ApplicationId,
    DateTime PostingDate,
    DateTime StartDate,
    DateTime EndDate,
    List<PlatformReportInsightRequest> PlatformInsights
);

public record PlatformReportInsightRequest(
    string Platform,
    string? PostUrl,
    long Views,
    long Likes,
    long Comments,
    long Shares
);
