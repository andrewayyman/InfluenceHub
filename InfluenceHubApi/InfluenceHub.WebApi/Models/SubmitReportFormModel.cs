namespace InfluenceHub.WebApi.Models;

public class SubmitReportFormModel
{
    public Guid ApplicationId { get; set; }
    public DateTime PostingDate { get; set; }
    public DateTime StartDate { get; set; }
    public DateTime EndDate { get; set; }
    public string PlatformInsightsJson { get; set; } = "[]";
    public IFormFile Screenshot { get; set; } = null!;
}
