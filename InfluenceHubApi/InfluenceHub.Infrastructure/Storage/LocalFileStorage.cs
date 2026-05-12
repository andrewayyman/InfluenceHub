namespace InfluenceHub.Infrastructure.Storage;

public class LocalFileStorage
{
    private readonly string _reportBasePath;
    private readonly string _paymentProofBasePath;

    public LocalFileStorage(string contentRootPath)
    {
        _reportBasePath = Path.Combine(contentRootPath, "uploads", "reports");
        _paymentProofBasePath = Path.Combine(contentRootPath, "uploads", "payments");
        EnsureDirectoryExists();
    }

    private void EnsureDirectoryExists()
    {
        if (!Directory.Exists(_reportBasePath))
            Directory.CreateDirectory(_reportBasePath);

        if (!Directory.Exists(_paymentProofBasePath))
            Directory.CreateDirectory(_paymentProofBasePath);
    }

    public async Task<string> SaveReportScreenshotAsync(Guid applicationId, Stream fileStream, string extension, CancellationToken ct = default)
    {
        if (fileStream is null)
            throw new InvalidOperationException("Screenshot stream is required.");

        if (string.IsNullOrWhiteSpace(extension))
            extension = ".png";

        try
        {
            var folderPath = Path.Combine(_reportBasePath, applicationId.ToString());
            Directory.CreateDirectory(folderPath);

            var safeExtension = extension.StartsWith('.') ? extension : $".{extension}";
            var fileName = $"screenshot{safeExtension}";
            var fullPath = Path.Combine(folderPath, fileName);

            var normalizedBasePath = Path.GetFullPath(_reportBasePath);
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

    public async Task<string> SavePaymentProofAsync(Guid paymentId, Stream fileStream, string extension, CancellationToken ct = default)
    {
        if (fileStream is null)
            throw new InvalidOperationException("Proof file stream is required.");

        if (string.IsNullOrWhiteSpace(extension))
            extension = ".png";

        try
        {
            var folderPath = Path.Combine(_paymentProofBasePath, paymentId.ToString());
            Directory.CreateDirectory(folderPath);

            var safeExtension = extension.StartsWith('.') ? extension : $".{extension}";
            var fileName = $"proof-{DateTime.UtcNow:yyyyMMddHHmmss}{safeExtension}";
            var fullPath = Path.Combine(folderPath, fileName);

            var normalizedBasePath = Path.GetFullPath(_paymentProofBasePath);
            var normalizedFullPath = Path.GetFullPath(fullPath);
            if (!normalizedFullPath.StartsWith(normalizedBasePath, StringComparison.OrdinalIgnoreCase))
                throw new InvalidOperationException("Invalid payment proof path.");

            await using var fs = File.Create(normalizedFullPath);
            await fileStream.CopyToAsync(fs, ct);

            return Path.Combine(paymentId.ToString(), fileName);
        }
        catch (IOException ex)
        {
            throw new InvalidOperationException("Failed to save payment proof.", ex);
        }
    }

    public string GetFullPath(string relativePath)
    {
        return Path.Combine(_reportBasePath, relativePath);
    }

    public bool FileExists(string relativePath)
    {
        var reportPath = Path.Combine(_reportBasePath, relativePath);
        if (File.Exists(reportPath)) return true;

        var paymentPath = Path.Combine(_paymentProofBasePath, relativePath);
        return File.Exists(paymentPath);
    }
}
