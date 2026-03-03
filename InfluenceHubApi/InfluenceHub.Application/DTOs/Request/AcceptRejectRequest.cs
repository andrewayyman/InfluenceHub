using InfluenceHub.Domain.Enums;

namespace InfluenceHub.Application.DTOs.Request;

public record AcceptRejectRequest(
    Guid ApplicationId,
    ApplicationStatus Status
);
