using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.DTOs.Response;
using InfluenceHub.Application.Interfaces;
using InfluenceHub.Domain.Entities;
using InfluenceHub.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InfluenceHub.Application.Services;

public class TagService : ITagService
{
    private readonly IRepository<Tag> _tagRepository;

    public TagService(IRepository<Tag> tagRepository)
    {
        _tagRepository = tagRepository;
    }

    public async Task<IReadOnlyList<TagResponse>> GetTagsAsync(CancellationToken ct = default)
    {
        var tags = await _tagRepository.Query()
            .OrderBy(t => t.Name)
            .ToListAsync(ct);

        return tags.Select(t => new TagResponse(t.Id, t.Name)).ToList();
    }

    public async Task<TagResponse> CreateTagAsync(CreateTagRequest request, CancellationToken ct = default)
    {
        var normalizedName = request.Name.Trim();

        var exists = await _tagRepository.Query()
            .AnyAsync(t => t.Name == normalizedName, ct);

        if (exists)
            throw new InvalidOperationException("A tag with this name already exists.");

        var tag = new Tag
        {
            Id = Guid.NewGuid(),
            Name = normalizedName,
        };

        await _tagRepository.AddAsync(tag, ct);
        await _tagRepository.SaveChangesAsync(ct);

        return new TagResponse(tag.Id, tag.Name);
    }
}
