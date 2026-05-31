using InfluenceHub.Domain.Enums;

namespace InfluenceHub.Application.DTOs.Response;

public record ContactResponse(
    Guid Id,
    string Name,
    string Email,
    string Subject,
    string Message,
    bool IsReplied,
    DateTime CreatedAt,
    UserRole? SenderRole
);
