using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.DTOs.Response;

namespace InfluenceHub.Application.Interfaces;

public interface IContactService
{
    Task<ContactResponse> CreateMessageAsync(ContactRequest request, CancellationToken ct = default);
}
