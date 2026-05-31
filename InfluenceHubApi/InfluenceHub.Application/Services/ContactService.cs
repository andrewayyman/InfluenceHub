using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.DTOs.Response;
using InfluenceHub.Application.Interfaces;
using InfluenceHub.Domain.Entities;
using InfluenceHub.Domain.Enums;
using InfluenceHub.Domain.Interfaces;
using System.Net.Mail;

namespace InfluenceHub.Application.Services;

public class ContactService : IContactService
{
    private const int NameMaxLength = 256;
    private const int EmailMaxLength = 256;
    private const int SubjectMaxLength = 500;
    private const int MessageMaxLength = 4000;

    private readonly IRepository<ContactMessage> _contactRepository;
    private readonly IRepository<User> _userRepository;
    private readonly IBrandRepository _brandRepository;
    private readonly IInfluencerRepository _influencerRepository;

    public ContactService(
        IRepository<ContactMessage> contactRepository,
        IRepository<User> userRepository,
        IBrandRepository brandRepository,
        IInfluencerRepository influencerRepository)
    {
        _contactRepository = contactRepository;
        _userRepository = userRepository;
        _brandRepository = brandRepository;
        _influencerRepository = influencerRepository;
    }

    public async Task<ContactResponse> CreateMessageAsync(ContactRequest request, Guid? senderUserId = null, CancellationToken ct = default)
    {
        var sender = await BuildSenderAsync(senderUserId, ct);
        var name = NormalizeRequiredText(string.IsNullOrWhiteSpace(request.Name) ? sender.Name : request.Name, "Name", NameMaxLength);
        var email = NormalizeEmail(string.IsNullOrWhiteSpace(request.Email) ? sender.Email : request.Email);
        var subject = NormalizeRequiredText(request.Subject, "Subject", SubjectMaxLength);
        var messageBody = NormalizeRequiredText(request.Message, "Message", MessageMaxLength);

        var message = new ContactMessage
        {
            Id = Guid.NewGuid(),
            SenderUserId = sender.UserId,
            SenderRole = sender.Role,
            Name = name,
            Email = email,
            Subject = subject,
            Message = messageBody,
            IsReplied = false,
            CreatedAt = DateTime.UtcNow
        };

        await _contactRepository.AddAsync(message, ct);
        return new ContactResponse(
            message.Id,
            message.Name,
            message.Email,
            message.Subject,
            message.Message,
            message.IsReplied,
            message.CreatedAt,
            message.SenderRole);
    }

    private async Task<ContactSender> BuildSenderAsync(Guid? senderUserId, CancellationToken ct)
    {
        if (!senderUserId.HasValue)
        {
            return new ContactSender(null, null, string.Empty, string.Empty);
        }

        var user = await _userRepository.GetByIdAsync(senderUserId.Value, ct)
            ?? throw new InvalidOperationException("Authenticated user could not be found.");

        var name = string.Empty;

        if (user.Role == UserRole.Brand)
        {
            name = (await _brandRepository.GetByUserIdAsync(user.Id, ct))?.Name?.Trim() ?? string.Empty;
        }
        else if (user.Role == UserRole.Influencer)
        {
            name = (await _influencerRepository.GetByUserIdAsync(user.Id, ct))?.Name?.Trim() ?? string.Empty;
        }

        return new ContactSender(user.Id, user.Role, name, user.Email?.Trim() ?? string.Empty);
    }

    private static string NormalizeRequiredText(string? value, string fieldName, int maxLength)
    {
        var normalizedValue = value?.Trim() ?? string.Empty;

        if (string.IsNullOrWhiteSpace(normalizedValue))
        {
            throw new InvalidOperationException($"{fieldName} is required.");
        }

        if (normalizedValue.Length > maxLength)
        {
            throw new InvalidOperationException($"{fieldName} must not exceed {maxLength} characters.");
        }

        return normalizedValue;
    }

    private static string NormalizeEmail(string? value)
    {
        var normalizedEmail = NormalizeRequiredText(value, "Email", EmailMaxLength);

        try
        {
            _ = new MailAddress(normalizedEmail);
        }
        catch (FormatException)
        {
            throw new InvalidOperationException("A valid email address is required.");
        }

        return normalizedEmail;
    }

    private sealed record ContactSender(Guid? UserId, UserRole? Role, string Name, string Email);
}
