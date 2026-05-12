namespace InfluenceHub.Domain.Entities;

public class CommissionSetting
{
    public Guid Id { get; set; }
    public decimal Percentage { get; set; }
    public string? Description { get; set; }
    public DateTime EffectiveFrom { get; set; } = DateTime.UtcNow;
    public Guid UpdatedBy { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public User UpdatedByUser { get; set; } = null!;
}
