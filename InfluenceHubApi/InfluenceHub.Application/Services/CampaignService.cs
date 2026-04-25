using InfluenceHub.Application.DTOs.Response;
using InfluenceHub.Application.Interfaces;
using InfluenceHub.Domain.Entities;
using InfluenceHub.Domain.Enums;
using InfluenceHub.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InfluenceHub.Application.Services;

public class CampaignService : ICampaignService
{
    private readonly ICampaignRepository _campaignRepo;
    private readonly IRepository<Campaign> _campaignRepository;

    public CampaignService(
        ICampaignRepository campaignRepo,
        IRepository<Campaign> campaignRepository)
    {
        _campaignRepo = campaignRepo;
        _campaignRepository = campaignRepository;
    }

    public async Task<CampaignResponse?> GetByIdAsync(Guid campaignId, CancellationToken ct = default)
    {
        var campaign = await _campaignRepo.GetByIdWithTagsAsync(campaignId, ct);
        if (campaign is null) return null;
        return new CampaignResponse(
            campaign.Id, campaign.BrandId, campaign.Title, campaign.Description, campaign.Budget, campaign.Deadline,
            SafeDeserializePlatforms(campaign.Platforms), campaign.Location, campaign.Status, campaign.CreatedAt,
            campaign.CampaignTags.Select(ct => ct.Tag.Name).ToList(), campaign.BudgetType);
    }

    public async Task<IReadOnlyList<CampaignListResponse>> GetOpenCampaignsAsync(string? platform, string? location, CancellationToken ct = default)
    {
        var query = _campaignRepository.Query()
            .Include(c => c.Brand)
            .Include(c => c.CampaignTags).ThenInclude(ct => ct.Tag)
            .Include(c => c.Applications)
            .Where(c => c.Status == CampaignStatus.Open && c.Deadline > DateTime.UtcNow);

        if (!string.IsNullOrWhiteSpace(platform))
            query = query.Where(c => c.Platforms.Contains(platform));
        if (!string.IsNullOrWhiteSpace(location))
            query = query.Where(c => c.Location == location);

        var campaigns = await query.OrderByDescending(c => c.CreatedAt).ToListAsync(ct);
        return campaigns.Select(c => new CampaignListResponse(
            c.Id, c.Title, c.Brand.Name, c.Budget, c.Deadline, SafeDeserializePlatforms(c.Platforms), c.Location, c.Status,
            c.Applications.Count, c.CampaignTags.Select(ct => ct.Tag.Name).ToList())).ToList();
    }

    private static List<string> SafeDeserializePlatforms(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return [];
        try { return System.Text.Json.JsonSerializer.Deserialize<List<string>>(json) ?? []; }
        catch { return []; }
    }
}
