using InfluenceHub.Application.Interfaces;

namespace InfluenceHub.Infrastructure.Storage;

public class FileStorageAdapter : IFileStorage
{
    private readonly LocalFileStorage _storage;

    public FileStorageAdapter(LocalFileStorage storage)
    {
        _storage = storage;
    }

    public Task<string> SaveReportScreenshotAsync(Guid applicationId, Stream fileStream, string extension, CancellationToken ct = default)
        => _storage.SaveReportScreenshotAsync(applicationId, fileStream, extension, ct);

    public bool FileExists(string relativePath)
        => _storage.FileExists(relativePath);
}
