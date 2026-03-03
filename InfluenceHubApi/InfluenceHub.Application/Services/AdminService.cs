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
        user.IsEnabled = enable;
        _userRepository.Update(user);
        await _userRepository.SaveChangesAsync(ct);
        return true;
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
