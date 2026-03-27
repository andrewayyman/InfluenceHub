using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.DTOs.Response;
using InfluenceHub.Application.Interfaces;
using InfluenceHub.Domain.Entities;
using InfluenceHub.Domain.Enums;
using InfluenceHub.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InfluenceHub.Application.Services;

public class BrandService : IBrandService
{
    private readonly IBrandRepository _brandRepository;
    private readonly IRepository<Brand> _brandRepo;
    private readonly IRepository<Campaign> _campaignRepository;
    private readonly IRepository<Tag> _tagRepository;
    private readonly IRepository<CampaignTag> _campaignTagRepository;
    private readonly ICampaignRepository _campaignRepo;

    public BrandService(
        IBrandRepository brandRepository,
        IRepository<Brand> brandRepo,
        IRepository<Campaign> campaignRepository,
        IRepository<Tag> tagRepository,
        IRepository<CampaignTag> campaignTagRepository,
        ICampaignRepository campaignRepo)
    {
        _brandRepository = brandRepository;
        _brandRepo = brandRepo;
        _campaignRepository = campaignRepository;
        _tagRepository = tagRepository;
        _campaignTagRepository = campaignTagRepository;
        _campaignRepo = campaignRepo;
    }

    public async Task<BrandProfileResponse?> GetProfileAsync(Guid userId, CancellationToken ct = default)
    {
        var brand = await _brandRepository.GetByUserIdAsync(userId, ct);
        if (brand is null) return null;
        return new BrandProfileResponse(brand.Id, brand.UserId, brand.Name);
    }

    public async Task<BrandProfileResponse> UpdateProfileAsync(Guid userId, UpdateBrandProfileRequest request, CancellationToken ct = default)
    {
        var brand = await _brandRepository.GetByUserIdAsync(userId, ct)
            ?? throw new InvalidOperationException("Brand profile not found");
        brand.Name = request.Name;
        brand.UpdatedAt = DateTime.UtcNow;
        _brandRepo.Update(brand);
        await _brandRepo.SaveChangesAsync(ct);
        return new BrandProfileResponse(brand.Id, brand.UserId, brand.Name);
    }

    public async Task<CampaignResponse> CreateCampaignAsync(Guid userId, CreateCampaignRequest request, CancellationToken ct = default)
    {
        var brand = await _brandRepository.GetByUserIdAsync(userId, ct)
            ?? throw new InvalidOperationException("Brand profile not found");

        var campaign = new Campaign
        {
            Id = Guid.NewGuid(),
            BrandId = brand.Id,
            Title = request.Title,
            Description = request.Description,
            Budget = request.Budget,
            Deadline = request.Deadline,
            Platform = request.Platform,
            Location = request.Location,
            Status = CampaignStatus.Open,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        await _campaignRepository.AddAsync(campaign, ct);
        await SetCampaignTagsAsync(campaign.Id, request.Tags, ct);
        var created = await _campaignRepo.GetByIdWithTagsAsync(campaign.Id, ct)!;
        return MapToResponse(created);
    }

    public async Task<CampaignResponse?> UpdateCampaignAsync(Guid userId, Guid campaignId, UpdateCampaignRequest request, CancellationToken ct = default)
    {
        var brand = await _brandRepository.GetByUserIdAsync(userId, ct)
            ?? throw new InvalidOperationException("Brand profile not found");
        var campaign = await _campaignRepo.GetByIdWithTagsAsync(campaignId, ct);
        if (campaign is null || campaign.BrandId != brand.Id) return null;

        if (request.Title is not null) campaign.Title = request.Title;
        if (request.Description is not null) campaign.Description = request.Description;
        if (request.Budget.HasValue) campaign.Budget = request.Budget.Value;
        if (request.Deadline.HasValue) campaign.Deadline = request.Deadline.Value;
        if (request.Platform is not null) campaign.Platform = request.Platform;
        if (request.Location is not null) campaign.Location = request.Location;
        if (request.Status.HasValue) campaign.Status = request.Status.Value;
        campaign.UpdatedAt = DateTime.UtcNow;

        _campaignRepository.Update(campaign);
        if (request.Tags is not null)
        {
            var existing = campaign.CampaignTags.ToList();
            foreach (var ct2 in existing)
                _campaignTagRepository.Delete(ct2);
            await SetCampaignTagsAsync(campaignId, request.Tags, ct);
        }
        await _campaignRepository.SaveChangesAsync(ct);
        var updated = await _campaignRepo.GetByIdWithTagsAsync(campaignId, ct)!;
        return MapToResponse(updated);
    }

    public async Task<bool> DeleteCampaignAsync(Guid userId, Guid campaignId, CancellationToken ct = default)
    {
        var brand = await _brandRepository.GetByUserIdAsync(userId, ct);
        if (brand is null) return false;
        var campaign = await _campaignRepository.GetByIdAsync(campaignId, ct);
        if (campaign is null || campaign.BrandId != brand.Id) return false;
        _campaignRepository.Delete(campaign);
        await _campaignRepository.SaveChangesAsync(ct);
        return true;
    }

    public async Task<CampaignResponse?> GetCampaignAsync(Guid userId, Guid campaignId, CancellationToken ct = default)
    {
        var brand = await _brandRepository.GetByUserIdAsync(userId, ct);
        if (brand is null) return null;
        var campaign = await _campaignRepo.GetByIdWithTagsAsync(campaignId, ct);
        if (campaign is null || campaign.BrandId != brand.Id) return null;
        return MapToResponse(campaign);
    }

    public async Task<IReadOnlyList<CampaignListResponse>> GetCampaignsAsync(Guid userId, CancellationToken ct = default)
    {
        var brand = await _brandRepository.GetByUserIdAsync(userId, ct);
        if (brand is null) return [];
        var campaigns = await _campaignRepository.Query()
            .Include(c => c.CampaignTags).ThenInclude(ct => ct.Tag)
            .Include(c => c.Applications)
            .Where(c => c.BrandId == brand.Id)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(ct);
        return campaigns.Select(c => new CampaignListResponse(
            c.Id, c.Title, c.Budget, c.Deadline, c.Platform, c.Location, c.Status,
            c.Applications.Count, c.CampaignTags.Select(ct => ct.Tag.Name).ToList())).ToList();
    }

    private async Task SetCampaignTagsAsync(Guid campaignId, List<string> tagNames, CancellationToken ct)
    {
        foreach (var name in tagNames.Distinct(StringComparer.OrdinalIgnoreCase))
        {
            var tag = await _tagRepository.Query().FirstOrDefaultAsync(t => t.Name == name, ct);
            if (tag is null)
            {
                tag = new Tag { Id = Guid.NewGuid(), Name = name };
                await _tagRepository.AddAsync(tag, ct);
            }
            var campaignTag = new CampaignTag
            {
                Id = Guid.NewGuid(),
                CampaignId = campaignId,
                TagId = tag.Id
            };
            await _campaignTagRepository.AddAsync(campaignTag, ct);
        }
    }

    private static CampaignResponse MapToResponse(Campaign c) => new(
        c.Id, c.BrandId, c.Title, c.Description, c.Budget, c.Deadline, c.Platform, c.Location,
        c.Status, c.CreatedAt, c.CampaignTags.Select(ct => ct.Tag.Name).ToList());
}
