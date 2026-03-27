using InfluenceHub.Application.DTOs.Response;
using InfluenceHub.Domain.Enums;

namespace InfluenceHub.Application.Interfaces;

public interface IAdminService
{
    Task<AdminDashboardResponse> GetDashboardStatsAsync(CancellationToken ct = default);
    Task<IReadOnlyList<ContactResponse>> GetContactMessagesAsync(bool? isReplied, CancellationToken ct = default);
    Task<bool> MarkContactRepliedAsync(Guid messageId, CancellationToken ct = default);
    Task<bool> EnableDisableUserAsync(Guid userId, bool enable, CancellationToken ct = default);

    Task<IReadOnlyList<AdminUserResponse>> GetUsersAsync(CancellationToken ct = default);
    Task<bool> DeleteUserAsync(Guid userId, CancellationToken ct = default);

    Task<IReadOnlyList<CampaignListResponse>> GetCampaignsAsync(CampaignStatus? status, CancellationToken ct = default);
    Task<bool> CloseCampaignAsync(Guid campaignId, CancellationToken ct = default);
    Task<bool> DeleteCampaignAsync(Guid campaignId, CancellationToken ct = default);

    Task<IReadOnlyList<ReportResponse>> GetReportsAsync(ReportStatus? status, CancellationToken ct = default);

    Task<bool> ApproveRejectReportAsync(Guid reportId, bool approve, Guid adminUserId, string? rejectionReason = null, CancellationToken ct = default);
}
