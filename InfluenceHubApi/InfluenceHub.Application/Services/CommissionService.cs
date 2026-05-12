using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.DTOs.Response;
using InfluenceHub.Application.Interfaces;
using InfluenceHub.Domain.Entities;
using InfluenceHub.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InfluenceHub.Application.Services;

public class CommissionService : ICommissionService
{
    private readonly IRepository<CommissionSetting> _commissionRepository;
    private readonly IRepository<User> _userRepository;

    public CommissionService(
        IRepository<CommissionSetting> commissionRepository,
        IRepository<User> userRepository)
    {
        _commissionRepository = commissionRepository;
        _userRepository = userRepository;
    }

    public async Task<CommissionSettingResponse> GetCurrentCommissionAsync(CancellationToken ct = default)
    {
        var setting = await _commissionRepository.Query()
            .Include(c => c.UpdatedByUser)
            .OrderByDescending(c => c.EffectiveFrom)
            .FirstOrDefaultAsync(ct);

        if (setting is null)
            return new CommissionSettingResponse(Guid.Empty, 10, "Default commission", DateTime.UtcNow, "System", DateTime.UtcNow);

        return MapToResponse(setting);
    }

    public async Task<decimal> GetCurrentPercentageAsync(CancellationToken ct = default)
    {
        var latest = await _commissionRepository.Query()
            .OrderByDescending(c => c.EffectiveFrom)
            .FirstOrDefaultAsync(ct);

        return latest?.Percentage ?? 10m;
    }

    public async Task<CommissionSettingResponse> SetCommissionAsync(Guid adminUserId, SetCommissionRequest request, CancellationToken ct = default)
    {
        var setting = new CommissionSetting
        {
            Id = Guid.NewGuid(),
            Percentage = request.Percentage,
            Description = request.Description,
            EffectiveFrom = DateTime.UtcNow,
            UpdatedBy = adminUserId,
            UpdatedAt = DateTime.UtcNow
        };

        await _commissionRepository.AddAsync(setting, ct);
        await _commissionRepository.SaveChangesAsync(ct);

        var created = await _commissionRepository.Query()
            .Include(c => c.UpdatedByUser)
            .FirstAsync(c => c.Id == setting.Id, ct);

        return MapToResponse(created);
    }

    public async Task<IReadOnlyList<CommissionSettingResponse>> GetCommissionHistoryAsync(CancellationToken ct = default)
    {
        var settings = await _commissionRepository.Query()
            .Include(c => c.UpdatedByUser)
            .OrderByDescending(c => c.EffectiveFrom)
            .ToListAsync(ct);

        return settings.Select(MapToResponse).ToList();
    }

    private static CommissionSettingResponse MapToResponse(CommissionSetting c) => new(
        c.Id,
        c.Percentage,
        c.Description,
        c.EffectiveFrom,
        c.UpdatedByUser?.Email ?? "System",
        c.UpdatedAt);
}
