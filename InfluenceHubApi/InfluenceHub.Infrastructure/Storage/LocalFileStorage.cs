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
        if (fileStream is null)
            throw new InvalidOperationException("Screenshot stream is required.");

        if (string.IsNullOrWhiteSpace(extension))
            extension = ".png";

        try
        {
            var folderPath = Path.Combine(_basePath, applicationId.ToString());
            Directory.CreateDirectory(folderPath);

            var safeExtension = extension.StartsWith('.') ? extension : $".{extension}";
            var fileName = $"screenshot{safeExtension}";
            var fullPath = Path.Combine(folderPath, fileName);

            var normalizedBasePath = Path.GetFullPath(_basePath);
            var normalizedFullPath = Path.GetFullPath(fullPath);
            if (!normalizedFullPath.StartsWith(normalizedBasePath, StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("Invalid screenshot path.");

            await using var fs = File.Create(normalizedFullPath);
            await fileStream.CopyToAsync(fs, ct);

            return Path.Combine(applicationId.ToString(), fileName);
        }
        catch (IOException ex)
        {
            throw new InvalidOperationException("Failed to save report screenshot.", ex);
        }
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
