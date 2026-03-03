using InfluenceHub.Domain.Enums;

namespace InfluenceHub.Domain.Entities;

public class User
{
    public Guid Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public UserRole Role { get; set; }
    public bool IsEnabled { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Brand? Brand { get; set; }
    public Influencer? Influencer { get; set; }
}
