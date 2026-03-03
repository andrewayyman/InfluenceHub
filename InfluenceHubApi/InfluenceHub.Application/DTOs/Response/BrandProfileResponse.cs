namespace InfluenceHub.Application.DTOs.Response;

public record BrandProfileResponse(
    Guid Id,
    Guid UserId,
    string CompanyName
);
