namespace InfluenceHub.Infrastructure.Storage;

public class LocalFileStorage
{
    private readonly string _basePath;

    public LocalFileStorage(string contentRootPath)
    {
        _basePath = Path.Combine(contentRootPath, "uploads", "reports");
        EnsureDirectoryExists();
    }

    private void EnsureDirectoryExists()
    {
        if (!Directory.Exists(_basePath))
            Directory.CreateDirectory(_basePath);
    }

    public async Task<string> SaveReportScreenshotAsync(Guid applicationId, Stream fileStream, string extension, CancellationToken ct = default)
    {
        var folderPath = Path.Combine(_basePath, applicationId.ToString());
        Directory.CreateDirectory(folderPath);

        var fileName = $"screenshot{extension}";
        var fullPath = Path.Combine(folderPath, fileName);

        await using var fs = File.Create(fullPath);
        await fileStream.CopyToAsync(fs, ct);

        return Path.Combine(applicationId.ToString(), fileName);
    }

    public string GetFullPath(string relativePath)
    {
        return Path.Combine(_basePath, relativePath);
    }

    public bool FileExists(string relativePath)
    {
        var fullPath = Path.Combine(_basePath, relativePath);
        return File.Exists(fullPath);
    }
}
