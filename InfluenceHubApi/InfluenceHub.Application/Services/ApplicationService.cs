using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.DTOs.Response;
using InfluenceHub.Application.Interfaces;
using InfluenceHub.Domain.Entities;
using InfluenceHub.Domain.Enums;
using InfluenceHub.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InfluenceHub.Application.Services;

public class ApplicationService : IApplicationService
{
    private readonly IBrandRepository _brandRepository;
    private readonly IInfluencerRepository _influencerRepository;
    private readonly IRepository<Domain.Entities.Application> _applicationRepository;
    private readonly IRepository<Campaign> _campaignRepository;

    public ApplicationService(
        IBrandRepository brandRepository,
        IInfluencerRepository influencerRepository,
        IRepository<Domain.Entities.Application> applicationRepository,
        IRepository<Campaign> campaignRepository)
    {
        _brandRepository = brandRepository;
        _influencerRepository = influencerRepository;
        _applicationRepository = applicationRepository;
        _campaignRepository = campaignRepository;
    }

    public async Task<ApplicationResponse> ApplyAsync(Guid influencerUserId, ApplyRequest request, CancellationToken ct = default)
    {
        var influencer = await _influencerRepository.GetByUserIdAsync(influencerUserId, ct)
            ?? throw new InvalidOperationException("Influencer profile not found");

        var campaign = await _campaignRepository.GetByIdAsync(request.CampaignId, ct)
            ?? throw new InvalidOperationException("Campaign not found");

        if (campaign.Status != CampaignStatus.Open)
            throw new InvalidOperationException("Campaign is not open for applications");

        var existing = await _applicationRepository.Query()
            .FirstOrDefaultAsync(a => a.CampaignId == request.CampaignId && a.InfluencerId == influencer.Id, ct);
        if (existing is not null)
            throw new InvalidOperationException("You have already applied to this campaign");

        var application = new Domain.Entities.Application
        {
            Id = Guid.NewGuid(),
            CampaignId = request.CampaignId,
            InfluencerId = influencer.Id,
            Status = ApplicationStatus.Pending,
            Message = request.Message,
            CreatedAt = DateTime.UtcNow
        };
        await _applicationRepository.AddAsync(application, ct);

        var app = await _applicationRepository.Query()
            .Include(a => a.Campaign)
            .FirstAsync(a => a.Id == application.Id, ct);
        return new ApplicationResponse(app.Id, app.CampaignId, app.Campaign.Title, app.InfluencerId, influencer.Name, app.Status, app.Message, app.CreatedAt);
    }

    public async Task<ApplicationResponse?> AcceptOrRejectAsync(Guid brandUserId, AcceptRejectRequest request, CancellationToken ct = default)
    {
        var brand = await _brandRepository.GetByUserIdAsync(brandUserId, ct);
        if (brand is null) return null;

        var application = await _applicationRepository.Query()
            .Include(a => a.Campaign)
            .Include(a => a.Influencer)
            .FirstOrDefaultAsync(a => a.Id == request.ApplicationId, ct);
        if (application is null || application.Campaign.BrandId != brand.Id) return null;

        application.Status = request.Status;

        if (request.Status == ApplicationStatus.Accepted)
        {
            application.Campaign.Status = CampaignStatus.InfluencerSelected;
            application.Campaign.UpdatedAt = DateTime.UtcNow;
        }

        _applicationRepository.Update(application);
        _campaignRepository.Update(application.Campaign);
        await _applicationRepository.SaveChangesAsync(ct);

        return new ApplicationResponse(
            application.Id, application.CampaignId, application.Campaign.Title,
            application.InfluencerId, application.Influencer.Name, application.Status,
            application.Message, application.CreatedAt);
    }

    public async Task<IReadOnlyList<ApplicationResponse>> GetCampaignApplicationsAsync(Guid brandUserId, Guid campaignId, CancellationToken ct = default)
    {
        var brand = await _brandRepository.GetByUserIdAsync(brandUserId, ct);
        if (brand is null) return [];

        var applications = await _applicationRepository.Query()
            .Include(a => a.Campaign)
            .Include(a => a.Influencer)
            .Where(a => a.CampaignId == campaignId && a.Campaign.BrandId == brand.Id)
            .OrderByDescending(a => a.CreatedAt)
            .ToListAsync(ct);

        return applications.Select(a => new ApplicationResponse(
            a.Id, a.CampaignId, a.Campaign.Title, a.InfluencerId, a.Influencer.Name, a.Status, a.Message, a.CreatedAt)).ToList();
    }
}
