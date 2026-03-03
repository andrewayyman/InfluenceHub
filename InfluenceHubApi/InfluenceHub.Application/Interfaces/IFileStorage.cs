namespace InfluenceHub.Application.Interfaces;

public interface IFileStorage
{
    Task<string> SaveReportScreenshotAsync(Guid applicationId, Stream fileStream, string extension, CancellationToken ct = default);
    bool FileExists(string relativePath);
}
