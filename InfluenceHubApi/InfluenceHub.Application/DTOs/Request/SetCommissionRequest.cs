namespace InfluenceHub.Application.DTOs.Request;

public record SetCommissionRequest(
    decimal Percentage,
    string? Description
);
