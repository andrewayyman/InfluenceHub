using System.Text.Json;
using InfluenceHub.Application.DTOs.Response;
using InfluenceHub.Application.Interfaces;
using InfluenceHub.Domain.Entities;
using InfluenceHub.Domain.Enums;
using InfluenceHub.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InfluenceHub.Application.Services;

public class MatchingService : IMatchingService
{
    private readonly IBrandRepository _brandRepository;
    private readonly IInfluencerRepository _influencerRepository;
    private readonly ICampaignRepository _campaignRepo;
    private readonly IRepository<CampaignTag> _campaignTagRepository;
    private readonly IRepository<InfluencerTag> _influencerTagRepository;

    public MatchingService(
        IBrandRepository brandRepository,
        IInfluencerRepository influencerRepository,
        ICampaignRepository campaignRepo,
        IRepository<CampaignTag> campaignTagRepository,
        IRepository<InfluencerTag> influencerTagRepository)
    {
        _brandRepository = brandRepository;
        _influencerRepository = influencerRepository;
        _campaignRepo = campaignRepo;
        _campaignTagRepository = campaignTagRepository;
        _influencerTagRepository = influencerTagRepository;
    }

    public async Task<IReadOnlyList<InfluencerMatchResponse>> GetSuggestedInfluencersAsync(Guid brandUserId, Guid campaignId, int limit = 20, CancellationToken ct = default)
    {
        var brand = await _brandRepository.GetByUserIdAsync(brandUserId, ct);
        if (brand is null) return [];

        var campaign = await _campaignRepo.GetByIdWithTagsAsync(campaignId, ct);
        if (campaign is null || campaign.BrandId != brand.Id) return [];

        var campaignTagIds = campaign.CampaignTags.Select(ct => ct.TagId).ToHashSet();
        if (campaignTagIds.Count == 0) return [];

        var influencerTags = await _influencerTagRepository.Query()
            .Include(it => it.Influencer).ThenInclude(i => i.User)
            .Include(it => it.Tag)
            .Where(it => campaignTagIds.Contains(it.TagId))
            .ToListAsync(ct);

        var scores = influencerTags
            .GroupBy(it => it.InfluencerId)
            .Select(g => new { InfluencerId = g.Key, Score = g.Count() })
            .OrderByDescending(x => x.Score)
            .Take(limit)
            .ToDictionary(x => x.InfluencerId, x => x.Score);

        var influencerIds = scores.Keys.ToList();
        var influencers = await _influencerTagRepository.Query()
            .Include(it => it.Influencer)
            .Include(it => it.Tag)
            .Where(it => influencerIds.Contains(it.InfluencerId))
            .ToListAsync(ct);

        var result = new List<InfluencerMatchResponse>();
        foreach (var g in influencers.GroupBy(it => it.Influencer).OrderByDescending(g => scores.GetValueOrDefault(g.Key!.Id, 0)))
        {
            var i = g.Key!;
            var platforms = SafeDeserializePlatforms(i.Platforms);
            result.Add(new InfluencerMatchResponse(
                i.Id, i.Name, i.Bio, platforms, i.FollowersCount, i.Location,
                g.Select(it => it.Tag.Name).ToList(),
                scores.GetValueOrDefault(i.Id, 0)));
        }
        return result;
    }

    public async Task<IReadOnlyList<CampaignMatchResponse>> GetSuggestedCampaignsAsync(Guid influencerUserId, int limit = 20, CancellationToken ct = default)
    {
        var influencer = await _influencerRepository.GetByUserIdAsync(influencerUserId, ct);
        if (influencer is null) return [];

        var influencerTagIds = influencer.InfluencerTags.Select(it => it.TagId).ToHashSet();
        if (influencerTagIds.Count == 0) return [];

        var campaignTags = await _campaignTagRepository.Query()
            .Include(ct => ct.Campaign)
            .Include(ct => ct.Tag)
            .Where(ct => influencerTagIds.Contains(ct.TagId) && ct.Campaign.Status == CampaignStatus.Open && ct.Campaign.Deadline > DateTime.UtcNow)
            .ToListAsync(ct);

        var scores = campaignTags
            .GroupBy(ct => ct.CampaignId)
            .Select(g => new { CampaignId = g.Key, Score = g.Count() })
            .OrderByDescending(x => x.Score)
            .Take(limit)
            .ToDictionary(x => x.CampaignId, x => x.Score);

        var campaignIds = scores.Keys.ToList();
        var campaigns = await _campaignTagRepository.Query()
            .Include(ct => ct.Campaign)
            .Include(ct => ct.Tag)
            .Where(ct => campaignIds.Contains(ct.CampaignId))
            .ToListAsync(ct);

        var result2 = new List<CampaignMatchResponse>();
        foreach (var g in campaigns.GroupBy(campaignTag => campaignTag.Campaign).OrderByDescending(grp => scores.GetValueOrDefault(grp.Key!.Id, 0)))
        {
            var c = g.Key!;
            result2.Add(new CampaignMatchResponse(
                c.Id, c.Title, c.Budget, c.Deadline, SafeDeserializePlatforms(c.Platforms), c.Location,
                g.Select(campaignTag => campaignTag.Tag.Name).ToList(),
                scores.GetValueOrDefault(c.Id, 0)));
        }
        return result2;
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
