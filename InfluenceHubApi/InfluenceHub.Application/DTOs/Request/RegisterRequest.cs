using InfluenceHub.Domain.Enums;

namespace InfluenceHub.Application.DTOs.Request;

public record RegisterRequest(
    string Email,
    string Password,
    UserRole Role
);
