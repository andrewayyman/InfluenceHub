using InfluenceHub.Application.DTOs.Response;

namespace InfluenceHub.Application.Interfaces;

public interface IAdminService
{
    Task<AdminDashboardResponse> GetDashboardStatsAsync(CancellationToken ct = default);
    Task<IReadOnlyList<ContactResponse>> GetContactMessagesAsync(bool? isReplied, CancellationToken ct = default);
    Task<bool> MarkContactRepliedAsync(Guid messageId, CancellationToken ct = default);
    Task<bool> EnableDisableUserAsync(Guid userId, bool enable, CancellationToken ct = default);
    Task<bool> ApproveRejectReportAsync(Guid reportId, bool approve, Guid adminUserId, CancellationToken ct = default);
}
