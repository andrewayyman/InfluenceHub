using System.Text.Json;
using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.DTOs.Response;
using InfluenceHub.Application.Interfaces;
using InfluenceHub.Domain.Entities;
using InfluenceHub.Domain.Enums;
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

        var normalizedNames = request.Tags
            .Where(name => !string.IsNullOrWhiteSpace(name))
            .Select(name => name.Trim())
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .ToList();

        var tags = await _tagRepository.Query()
            .Where(tag => normalizedNames.Contains(tag.Name))
            .ToListAsync(ct);

        var foundNames = tags.Select(tag => tag.Name).ToHashSet(StringComparer.OrdinalIgnoreCase);
        var missingNames = normalizedNames.Where(name => !foundNames.Contains(name)).ToList();

        if (missingNames.Count > 0)
            throw new InvalidOperationException($"Unknown tags: {string.Join(", ", missingNames)}.");

        foreach (var tag in tags)
        {
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

    public async Task<InfluencerPaymentInfoResponse> UpdatePaymentInfoAsync(Guid userId, UpdatePaymentInfoRequest request, CancellationToken ct = default)
    {
        var influencer = await _influencerRepository.GetByUserIdAsync(userId, ct)
            ?? throw new InvalidOperationException("Influencer profile not found");

        influencer.InstapayPhone = request.InstapayPhone?.Trim();
        influencer.WalletProvider = request.WalletProvider?.Trim();
        influencer.WalletNumber = request.WalletNumber?.Trim();
        influencer.BankName = request.BankName?.Trim();
        influencer.BankAccountNumber = request.BankAccountNumber?.Trim();
        influencer.PreferredPaymentMethod = request.PreferredPaymentMethod?.Trim();
        influencer.UpdatedAt = DateTime.UtcNow;

        _influencerRepo.Update(influencer);
        await _influencerRepo.SaveChangesAsync(ct);

        return new InfluencerPaymentInfoResponse(
            influencer.InstapayPhone,
            influencer.WalletProvider,
            influencer.WalletNumber,
            influencer.BankName,
            influencer.BankAccountNumber,
            influencer.PreferredPaymentMethod);
    }

    public async Task<IReadOnlyList<ApplicationResponse>> GetMyApplicationsAsync(Guid userId, CancellationToken ct = default)
    {
        var influencer = await _influencerRepository.GetByUserIdAsync(userId, ct);
        if (influencer is null) return [];

        var applications = await _applicationRepository.Query()
            .Include(a => a.Campaign)
                .ThenInclude(c => c.Brand)
            .Where(a => a.InfluencerId == influencer.Id)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(ct);

        return applications.Select(a => new ApplicationResponse(
            a.Id, a.CampaignId, a.Campaign.Title, a.InfluencerId, influencer.Name, a.Status, a.Message, a.CreatedAt,
            a.Bio, a.Proposal, a.ProposedBudget, SafeDeserializePlatforms(a.Links), SafeDeserializePlatforms(a.MediaFiles),
            a.Campaign.Status, a.Campaign.Brand?.Name ?? string.Empty, a.Campaign.Deadline)).ToList();
    }

    private static PublicInfluencerProfileResponse MapToPublicResponse(Influencer i)
    {
        var platforms = SafeDeserializePlatforms(i.Platforms);
        var tags = i.InfluencerTags.Select(it => it.Tag.Name).ToList();
        var isEligible = i.FollowersCount >= 10000;
        return new PublicInfluencerProfileResponse(
            i.Id, i.Name, i.Bio, platforms, i.FollowersCount, i.Location, tags,
            i.InstagramUrl, i.FacebookUrl, i.TwitterUrl, i.YouTubeUrl, i.TikTokUrl, i.LinkedInUrl,
            0, 0, i.Applications.Count(a => a.Status == ApplicationStatus.Accepted), isEligible);
    }

    private static InfluencerProfileResponse MapToResponse(Influencer i)
    {
        var platforms = SafeDeserializePlatforms(i.Platforms);
        var tags = i.InfluencerTags.Select(it => it.Tag.Name).ToList();
        var isEligible = i.FollowersCount >= 10000;
        return new InfluencerProfileResponse(
            i.Id, i.UserId, i.Name, i.Bio, platforms, i.FollowersCount, i.Location, tags,
            i.InstagramUrl, i.FacebookUrl, i.TwitterUrl, i.YouTubeUrl, i.TikTokUrl, i.LinkedInUrl,
            i.InstapayPhone, i.WalletProvider, i.WalletNumber, i.BankName, i.BankAccountNumber, i.PreferredPaymentMethod,
            isEligible);
    }

    public async Task<PublicInfluencerProfileResponse?> GetPublicProfileAsync(Guid influencerId, CancellationToken ct = default)
    {
        var influencer = await _influencerRepository.GetByUserIdAsync(influencerId, ct);
        if (influencer is null)
        {
            var byId = await _influencerRepo.Query()
                .Include(i => i.InfluencerTags).ThenInclude(it => it.Tag)
                .Include(i => i.Applications)
                .FirstOrDefaultAsync(i => i.Id == influencerId, ct);
            if (byId is null) return null;
            return MapToPublicResponse(byId);
        }
        return MapToPublicResponse(influencer);
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
