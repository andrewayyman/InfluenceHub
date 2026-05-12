using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.DTOs.Response;

namespace InfluenceHub.Application.Interfaces;

public interface ICommissionService
{
    Task<CommissionSettingResponse> GetCurrentCommissionAsync(CancellationToken ct = default);
    Task<CommissionSettingResponse> SetCommissionAsync(Guid adminUserId, SetCommissionRequest request, CancellationToken ct = default);
    Task<IReadOnlyList<CommissionSettingResponse>> GetCommissionHistoryAsync(CancellationToken ct = default);
    Task<decimal> GetCurrentPercentageAsync(CancellationToken ct = default);
}
