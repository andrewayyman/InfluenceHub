using InfluenceHub.Domain.Enums;

namespace InfluenceHub.Application.DTOs.Response;

public record AuthResponse(
    string Token,
    Guid UserId,
    string Email,
    UserRole Role
);
