using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.DTOs.Response;
using InfluenceHub.Application.Interfaces;
using InfluenceHub.Domain.Entities;
using InfluenceHub.Domain.Interfaces;

namespace InfluenceHub.Application.Services;

public class ContactService : IContactService
{
    private readonly IRepository<ContactMessage> _contactRepository;

    public ContactService(IRepository<ContactMessage> contactRepository)
    {
        _contactRepository = contactRepository;
    }

    public async Task<ContactResponse> CreateMessageAsync(ContactRequest request, CancellationToken ct = default)
    {
        var message = new ContactMessage
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Email = request.Email,
            Subject = request.Subject,
            Message = request.Message,
            IsReplied = false,
            CreatedAt = DateTime.UtcNow
        };
        await _contactRepository.AddAsync(message, ct);
        return new ContactResponse(message.Id, message.Name, message.Email, message.Subject, message.Message, message.IsReplied, message.CreatedAt);
    }
}
