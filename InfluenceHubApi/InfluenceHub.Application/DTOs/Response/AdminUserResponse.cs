namespace InfluenceHub.Application.DTOs.Response;

public record AdminUserResponse(
    Guid Id,
    string Email,
    int RoleId,
    string RoleName,
    string DisplayName,
    bool IsActive,
    DateTime CreatedAt
);

