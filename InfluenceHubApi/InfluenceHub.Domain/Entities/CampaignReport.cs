using InfluenceHub.Domain.Enums;

namespace InfluenceHub.Domain.Entities;

public class CampaignReport
{
    public Guid Id { get; set; }
    public Guid ApplicationId { get; set; }
    public string PostUrl { get; set; } = string.Empty;
    public DateTime PostingDate { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public long Views { get; set; }
    public long Likes { get; set; }
    public long Comments { get; set; }
    public long Shares { get; set; }
    public string ScreenshotPath { get; set; } = string.Empty;
    public ReportStatus Status { get; set; } = ReportStatus.Pending;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReviewedAt { get; set; }
    public Guid? ReviewedBy { get; set; }
    public string? RejectionReason { get; set; }

    public Application Application { get; set; } = null!;
}
