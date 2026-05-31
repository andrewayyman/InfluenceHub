using InfluenceHub.Domain.Enums;

namespace InfluenceHub.Domain.Entities;

public class ContactMessage
{
    public Guid Id { get; set; }
    public Guid? SenderUserId { get; set; }
    public UserRole? SenderRole { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public bool IsReplied { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
