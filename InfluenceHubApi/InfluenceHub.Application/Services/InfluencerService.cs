using System.Text.Json;
using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.DTOs.Response;
using InfluenceHub.Application.Interfaces;
using InfluenceHub.Domain.Entities;
using InfluenceHub.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InfluenceHub.Application.Services;

public class InfluencerService : IInfluencerService
{
    private readonly IInfluencerRepository _influencerRepository;
    private readonly IRepository<Influencer> _influencerRepo;
    private readonly IRepository<Tag> _tagRepository;
    private readonly IRepository<InfluencerTag> _influencerTagRepository;
    private readonly IRepository<Domain.Entities.Application> _applicationRepository;

    public InfluencerService(
        IInfluencerRepository influencerRepository,
        IRepository<Influencer> influencerRepo,
        IRepository<Tag> tagRepository,
        IRepository<InfluencerTag> influencerTagRepository,
        IRepository<Domain.Entities.Application> applicationRepository)
    {
        _influencerRepository = influencerRepository;
        _influencerRepo = influencerRepo;
        _tagRepository = tagRepository;
        _influencerTagRepository = influencerTagRepository;
        _applicationRepository = applicationRepository;
    }

    public async Task<InfluencerProfileResponse?> GetProfileAsync(Guid userId, CancellationToken ct = default)
    {
        var influencer = await _influencerRepository.GetByUserIdAsync(userId, ct);
        if (influencer is null) return null;
        return MapToResponse(influencer);
    }

    public async Task<InfluencerProfileResponse> UpdateProfileAsync(Guid userId, UpdateInfluencerProfileRequest request, CancellationToken ct = default)
    {
        var influencer = await _influencerRepository.GetByUserIdAsync(userId, ct)
            ?? throw new InvalidOperationException("Influencer profile not found");

        influencer.Name = request.Name;
        influencer.Bio = request.Bio;
        influencer.Platforms = JsonSerializer.Serialize(request.Platforms);
        influencer.FollowersCount = request.FollowersCount;
        influencer.Location = request.Location;
        influencer.InstagramUrl = request.InstagramUrl;
        influencer.FacebookUrl = request.FacebookUrl;
        influencer.TwitterUrl = request.TwitterUrl;
        influencer.YouTubeUrl = request.YouTubeUrl;
        influencer.TikTokUrl = request.TikTokUrl;
        influencer.LinkedInUrl = request.LinkedInUrl;
        influencer.UpdatedAt = DateTime.UtcNow;

        var existingTags = influencer.InfluencerTags.ToList();
        foreach (var it in existingTags)
            _influencerTagRepository.Delete(it);

        foreach (var name in request.Tags.Distinct(StringComparer.OrdinalIgnoreCase))
        {
            var tag = await _tagRepository.Query().FirstOrDefaultAsync(t => t.Name == name, ct);
            if (tag is null)
            {
                tag = new Tag { Id = Guid.NewGuid(), Name = name };
                await _tagRepository.AddAsync(tag, ct);
            }
            var influencerTag = new InfluencerTag
            {
                Id = Guid.NewGuid(),
                InfluencerId = influencer.Id,
                TagId = tag.Id
            };
            await _influencerTagRepository.AddAsync(influencerTag, ct);
        }

        _influencerRepo.Update(influencer);
        await _influencerRepo.SaveChangesAsync(ct);

        var updated = await _influencerRepository.GetByUserIdAsync(userId, ct)
            ?? throw new InvalidOperationException("Failed to load updated influencer profile.");
        return MapToResponse(updated);
    }

    public async Task<IReadOnlyList<ApplicationResponse>> GetMyApplicationsAsync(Guid userId, CancellationToken ct = default)
    {
        var influencer = await _influencerRepository.GetByUserIdAsync(userId, ct);
        if (influencer is null) return [];

        var applications = await _applicationRepository.Query()
            .Include(a => a.Campaign)
            .Where(a => a.InfluencerId == influencer.Id)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(ct);

        return applications.Select(a => new ApplicationResponse(
            a.Id, a.CampaignId, a.Campaign.Title, a.InfluencerId, influencer.Name, a.Status, a.Message, a.CreatedAt)).ToList();
    }

    private static InfluencerProfileResponse MapToResponse(Influencer i)
    {
        var platforms = SafeDeserializePlatforms(i.Platforms);
        var tags = i.InfluencerTags.Select(it => it.Tag.Name).ToList();
        return new InfluencerProfileResponse(
            i.Id, i.UserId, i.Name, i.Bio, platforms, i.FollowersCount, i.Location, tags,
            i.InstagramUrl, i.FacebookUrl, i.TwitterUrl, i.YouTubeUrl, i.TikTokUrl, i.LinkedInUrl);
    }

    private static List<string> SafeDeserializePlatforms(string? platformsJson)
    {
        if (string.IsNullOrWhiteSpace(platformsJson))
            return [];

        try
        {
            return JsonSerializer.Deserialize<List<string>>(platformsJson) ?? [];
        }
        catch (JsonException)
        {
            return [];
        }
    }
}
