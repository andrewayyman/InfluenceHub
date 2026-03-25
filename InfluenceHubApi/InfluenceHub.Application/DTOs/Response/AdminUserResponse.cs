using InfluenceHub.Domain.Enums;

namespace InfluenceHub.Application.DTOs.Response;

public record AdminUserResponse(
    Guid Id,
    string Email,
    UserRole Role,
    bool IsEnabled,
    DateTime CreatedAt
);

