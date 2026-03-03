namespace InfluenceHub.Application.DTOs.Request;

public record SubmitReportRequest(
    Guid ApplicationId,
    string PostUrl,
    DateTime PostingDate,
    DateTime StartDate,
    DateTime EndDate,
    long Views,
    long Likes,
    long Comments,
    long Shares
);
