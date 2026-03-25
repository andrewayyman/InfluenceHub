using InfluenceHub.Application.DTOs.Response;
using InfluenceHub.Application.Interfaces;
using InfluenceHub.Domain.Entities;
using InfluenceHub.Domain.Enums;
using InfluenceHub.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace InfluenceHub.Application.Services;

public class AdminService : IAdminService
{
    private readonly IRepository<User> _userRepository;
    private readonly IRepository<Brand> _brandRepository;
    private readonly IRepository<Influencer> _influencerRepository;
    private readonly IRepository<Campaign> _campaignRepository;
    private readonly IRepository<Domain.Entities.Application> _applicationRepository;
    private readonly IRepository<CampaignReport> _reportRepository;
    private readonly IRepository<ContactMessage> _contactRepository;

    public AdminService(
        IRepository<User> userRepository,
        IRepository<Brand> brandRepository,
        IRepository<Influencer> influencerRepository,
        IRepository<Campaign> campaignRepository,
        IRepository<Domain.Entities.Application> applicationRepository,
        IRepository<CampaignReport> reportRepository,
        IRepository<ContactMessage> contactRepository)
    {
        _userRepository = userRepository;
        _brandRepository = brandRepository;
        _influencerRepository = influencerRepository;
        _campaignRepository = campaignRepository;
        _applicationRepository = applicationRepository;
        _reportRepository = reportRepository;
        _contactRepository = contactRepository;
    }

    public async Task<AdminDashboardResponse> GetDashboardStatsAsync(CancellationToken ct = default)
    {
        var users = await _userRepository.Query().CountAsync(ct);
        var brands = await _brandRepository.Query().CountAsync(ct);
        var influencers = await _influencerRepository.Query().CountAsync(ct);
        var campaigns = await _campaignRepository.Query().CountAsync(ct);
        var applications = await _applicationRepository.Query().CountAsync(ct);
        var pendingReports = await _reportRepository.Query()
            .Where(r => r.Status == ReportStatus.Pending)
            .CountAsync(ct);
        return new AdminDashboardResponse(users, brands, influencers, campaigns, applications, pendingReports);
    }

    public async Task<IReadOnlyList<ContactResponse>> GetContactMessagesAsync(bool? isReplied, CancellationToken ct = default)
    {
        var query = _contactRepository.Query().AsQueryable();
        if (isReplied.HasValue)
            query = query.Where(c => c.IsReplied == isReplied.Value);
        var messages = await query.OrderByDescending(c => c.CreatedAt).ToListAsync(ct);
        return messages.Select(m => new ContactResponse(m.Id, m.Name, m.Email, m.Subject, m.Message, m.IsReplied, m.CreatedAt)).ToList();
    }

    public async Task<bool> MarkContactRepliedAsync(Guid messageId, CancellationToken ct = default)
    {
        var message = await _contactRepository.GetByIdAsync(messageId, ct);
        if (message is null) return false;
        message.IsReplied = true;
        _contactRepository.Update(message);
        await _contactRepository.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> EnableDisableUserAsync(Guid userId, bool enable, CancellationToken ct = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, ct);
        if (user is null) return false;
        if (user.Role == UserRole.Admin)
            throw new InvalidOperationException("Admin users cannot be enabled/disabled via this endpoint.");
        user.IsEnabled = enable;
        _userRepository.Update(user);
        await _userRepository.SaveChangesAsync(ct);
        return true;
    }

    public async Task<IReadOnlyList<AdminUserResponse>> GetUsersAsync(CancellationToken ct = default)
    {
        // Excludes Admin users by contract; FE should manage admin role users separately.
        var users = await _userRepository.Query()
            .Where(u => u.Role != UserRole.Admin)
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new AdminUserResponse(u.Id, u.Email, u.Role, u.IsEnabled, u.CreatedAt))
            .ToListAsync(ct);

        return users;
    }

    public async Task<bool> DeleteUserAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _userRepository.GetByIdAsync(userId, ct);
        if (user is null) return false;

        if (user.Role == UserRole.Admin)
            throw new InvalidOperationException("Admin users cannot be deleted via this endpoint.");

        bool hasDependencies = false;

        if (user.Role == UserRole.Brand)
        {
            var brandId = await _brandRepository.Query()
                .Where(b => b.UserId == userId)
                .Select(b => b.Id)
                .FirstOrDefaultAsync(ct);

            if (brandId == Guid.Empty)
                throw new InvalidOperationException("Brand profile not found for user; cannot safely delete.");

            hasDependencies = await _applicationRepository.Query()
                .AnyAsync(a => a.Campaign.BrandId == brandId, ct);
        }
        else if (user.Role == UserRole.Influencer)
        {
            var influencerId = await _influencerRepository.Query()
                .Where(i => i.UserId == userId)
                .Select(i => i.Id)
                .FirstOrDefaultAsync(ct);

            if (influencerId == Guid.Empty)
                throw new InvalidOperationException("Influencer profile not found for user; cannot safely delete.");

            hasDependencies = await _applicationRepository.Query()
                .AnyAsync(a => a.InfluencerId == influencerId, ct);
        }
        else
        {
            throw new InvalidOperationException("Unsupported user role for admin deletion.");
        }

        if (hasDependencies)
            throw new InvalidOperationException("User cannot be deleted because dependent applications exist.");

        _userRepository.Delete(user);
        await _userRepository.SaveChangesAsync(ct);
        return true;
    }

    public async Task<IReadOnlyList<CampaignListResponse>> GetCampaignsAsync(CampaignStatus? status, CancellationToken ct = default)
    {
        IQueryable<Campaign> query = _campaignRepository.Query()
            .Include(c => c.CampaignTags)
            .ThenInclude(ct => ct.Tag)
            .Include(c => c.Applications);

        if (status.HasValue)
            query = query.Where(c => c.Status == status.Value);

        var campaigns = await query
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(ct);

        return campaigns.Select(c => new CampaignListResponse(
                c.Id,
                c.Title,
                c.Budget,
                c.Deadline,
                c.Platform,
                c.Location,
                c.Status,
                c.Applications.Count,
                c.CampaignTags.Select(ct => ct.Tag.Name).ToList()
            ))
            .ToList();
    }

    public async Task<bool> CloseCampaignAsync(Guid campaignId, CancellationToken ct = default)
    {
        var campaign = await _campaignRepository.GetByIdAsync(campaignId, ct);
        if (campaign is null) return false;

        campaign.Status = CampaignStatus.Closed;
        _campaignRepository.Update(campaign);
        await _campaignRepository.SaveChangesAsync(ct);
        return true;
    }

    public async Task<bool> DeleteCampaignAsync(Guid campaignId, CancellationToken ct = default)
    {
        var campaign = await _campaignRepository.GetByIdAsync(campaignId, ct);
        if (campaign is null) return false;

        var hasApplications = await _applicationRepository.Query()
            .AnyAsync(a => a.CampaignId == campaignId, ct);

        if (hasApplications)
            throw new InvalidOperationException("Campaign cannot be deleted because applications exist.");

        _campaignRepository.Delete(campaign);
        await _campaignRepository.SaveChangesAsync(ct);
        return true;
    }

    public async Task<IReadOnlyList<ReportResponse>> GetReportsAsync(ReportStatus? status, CancellationToken ct = default)
    {
        var targetStatus = status ?? ReportStatus.Pending;

        var reports = await _reportRepository.Query()
            .Where(r => r.Status == targetStatus)
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(ct);

        return reports.Select(r => new ReportResponse(
                r.Id,
                r.ApplicationId,
                r.PostUrl,
                r.PostingDate,
                r.StartDate,
                r.EndDate,
                r.Views,
                r.Likes,
                r.Comments,
                r.Shares,
                r.ScreenshotPath,
                r.Status
            ))
            .ToList();
    }

    public async Task<bool> ApproveRejectReportAsync(Guid reportId, bool approve, Guid adminUserId, CancellationToken ct = default)
    {
        var report = await _reportRepository.Query()
            .Include(r => r.Application)
            .ThenInclude(a => a.Campaign)
            .FirstOrDefaultAsync(r => r.Id == reportId, ct);
        if (report is null) return false;

        report.Status = approve ? ReportStatus.Approved : ReportStatus.Rejected;
        report.ReviewedAt = DateTime.UtcNow;
        report.ReviewedBy = adminUserId;

        if (approve)
        {
            report.Application.Campaign.Status = CampaignStatus.Completed;
        }

        _reportRepository.Update(report);
        await _reportRepository.SaveChangesAsync(ct);
        return true;
    }
}
