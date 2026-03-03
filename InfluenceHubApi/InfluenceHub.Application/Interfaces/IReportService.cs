using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.DTOs.Response;

namespace InfluenceHub.Application.Interfaces;

public interface IReportService
{
    Task<ReportResponse> SubmitReportAsync(Guid influencerUserId, SubmitReportRequest request, Stream screenshotStream, string screenshotExtension, CancellationToken ct = default);
    Task<IReadOnlyList<ReportResponse>> GetMyReportsAsync(Guid influencerUserId, CancellationToken ct = default);
    Task<RoiResponse?> GetReportRoiAsync(Guid reportId, CancellationToken ct = default);
}
