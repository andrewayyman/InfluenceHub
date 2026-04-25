using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.DTOs.Response;

namespace InfluenceHub.Application.Interfaces;

public interface ITagService
{
    Task<IReadOnlyList<TagResponse>> GetTagsAsync(CancellationToken ct = default);
    Task<TagResponse> CreateTagAsync(CreateTagRequest request, CancellationToken ct = default);
}
