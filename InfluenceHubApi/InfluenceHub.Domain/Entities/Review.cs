using InfluenceHub.Domain.Enums;

namespace InfluenceHub.Domain.Entities;

public class Review
{
    public Guid Id { get; set; }
    public Guid ReviewerUserId { get; set; }
    public UserRole ReviewerRole { get; set; }
    public ReviewTargetType TargetType { get; set; }
    public Guid TargetId { get; set; }
    public Guid CampaignId { get; set; }
    public int Rating { get; set; }
    public string Comment { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public User Reviewer { get; set; } = null!;
    public Campaign Campaign { get; set; } = null!;
}
