namespace InfluenceHub.WebApi.Models;

public class SubmitReportFormModel
{
    public Guid ApplicationId { get; set; }
    public string PostUrl { get; set; } = string.Empty;
    public DateTime PostingDate { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public long Views { get; set; }
    public long Likes { get; set; }
    public long Comments { get; set; }
    public long Shares { get; set; }
    public IFormFile Screenshot { get; set; } = null!;
}
