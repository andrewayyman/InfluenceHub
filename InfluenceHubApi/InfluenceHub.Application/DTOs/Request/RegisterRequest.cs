using InfluenceHub.Domain.Enums;

namespace InfluenceHub.Application.DTOs.Request;

public record RegisterRequest(
    string Name,
    string Email,
    string Password,
    UserRole Role
);
