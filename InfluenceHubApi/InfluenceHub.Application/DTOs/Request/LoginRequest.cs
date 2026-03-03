namespace InfluenceHub.Application.DTOs.Request;

public record LoginRequest(
    string Email,
    string Password
);
