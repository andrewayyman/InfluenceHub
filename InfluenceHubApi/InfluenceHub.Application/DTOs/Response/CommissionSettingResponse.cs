namespace InfluenceHub.Application.DTOs.Response;

public record CommissionSettingResponse(
    Guid Id,
    decimal Percentage,
    string? Description,
    DateTime EffectiveFrom,
    string UpdatedByEmail,
    DateTime UpdatedAt
);
