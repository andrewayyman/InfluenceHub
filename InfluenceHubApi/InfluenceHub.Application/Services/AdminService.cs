using InfluenceHub.Application.DTOs.Response;
using InfluenceHub.Application.Interfaces;
using InfluenceHub.Domain.Entities;
using InfluenceHub.Domain.Enums;
using InfluenceHub.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

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

    public async Task<IReadOnlyList<ContactResponse>> GetContactMessagesAsync(bool? isReplied, string? search, CancellationToken ct = default)
    {
        var query = _contactRepository.Query().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = $"%{search.Trim()}%";
            query = query.Where(c =>
                EF.Functions.Like(c.Name, term) ||
                EF.Functions.Like(c.Email, term) ||
                EF.Functions.Like(c.Subject, term) ||
                EF.Functions.Like(c.Message, term));
        }

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

    public async Task<IReadOnlyList<AdminUserResponse>> GetUsersAsync(string? search, UserRole? role, bool? isActive, CancellationToken ct = default)
    {
        IQueryable<User> query = _userRepository.Query()
            .Where(u => u.Role != UserRole.Admin);

        if (role.HasValue)
        {
            if (role.Value == UserRole.Admin)
                throw new InvalidOperationException("Admin users are excluded from admin user management.");

            query = query.Where(u => u.Role == role.Value);
        }

        if (isActive.HasValue)
            query = query.Where(u => u.IsEnabled == isActive.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = $"%{search.Trim()}%";
            query = query.Where(u =>
                EF.Functions.Like(u.Email, term) ||
                (u.Brand != null && EF.Functions.Like(u.Brand.Name, term)) ||
                (u.Influencer != null && EF.Functions.Like(u.Influencer.Name, term)));
        }

        var users = await query
            .OrderByDescending(u => u.CreatedAt)
            .Select(u => new AdminUserResponse(
                u.Id,
                u.Email,
                (int)u.Role,
                u.Role.ToString(),
                u.Role == UserRole.Brand
                    ? (u.Brand != null ? u.Brand.Name : u.Email)
                    : (u.Influencer != null && u.Influencer.Name != string.Empty ? u.Influencer.Name : u.Email),
                u.IsEnabled,
                u.CreatedAt))
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

    public async Task<IReadOnlyList<CampaignListResponse>> GetCampaignsAsync(CampaignStatus? status, string? search, CancellationToken ct = default)
    {
        IQueryable<Campaign> query = _campaignRepository.Query()
            .Include(c => c.Brand)
            .Include(c => c.CampaignTags)
            .ThenInclude(ct => ct.Tag)
            .Include(c => c.Applications);

        if (status.HasValue)
            query = query.Where(c => c.Status == status.Value);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = $"%{search.Trim()}%";
            query = query.Where(c =>
                EF.Functions.Like(c.Title, term) ||
                EF.Functions.Like(c.Brand.Name, term) ||
                EF.Functions.Like(c.Platforms, term) ||
                EF.Functions.Like(c.Location, term) ||
                c.CampaignTags.Any(ct => EF.Functions.Like(ct.Tag.Name, term)));
        }

        var campaigns = await query
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync(ct);

        return campaigns.Select(c => new CampaignListResponse(
                c.Id,
                c.Title,
                c.Brand.Name,
                c.Budget,
                c.Deadline,
                SafeDeserializePlatforms(c.Platforms),
                c.Location,
                c.Status,
                c.Applications.Count,
                c.CampaignTags.Select(ct => ct.Tag.Name).ToList()
            ))
            .ToList();
    }

    private static List<string> SafeDeserializePlatforms(string? json)
    {
        if (string.IsNullOrWhiteSpace(json)) return [];
        try { return System.Text.Json.JsonSerializer.Deserialize<List<string>>(json) ?? []; }
        catch { return []; }
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

    public async Task<IReadOnlyList<ReportResponse>> GetReportsAsync(ReportStatus? status, string? search, CancellationToken ct = default)
    {
        var targetStatus = status ?? ReportStatus.Pending;

        IQueryable<CampaignReport> query = _reportRepository.Query()
            .Include(r => r.Application)
            .ThenInclude(a => a.Influencer)
            .ThenInclude(i => i.User)
            .Include(r => r.Application)
            .ThenInclude(a => a.Campaign)
            .Where(r => r.Status == targetStatus);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = $"%{search.Trim()}%";
            query = query.Where(r =>
                (r.Application != null && r.Application.Influencer != null && EF.Functions.Like(r.Application.Influencer.Name, term)) ||
                (r.Application != null && r.Application.Influencer != null && r.Application.Influencer.User != null && EF.Functions.Like(r.Application.Influencer.User.Email, term)) ||
                (r.Application != null && r.Application.Campaign != null && EF.Functions.Like(r.Application.Campaign.Title, term)) ||
                EF.Functions.Like(r.PostUrl, term));
        }

        var reports = await query
            .OrderByDescending(r => r.CreatedAt)
            .ToListAsync(ct);

        return reports.Select(r => new ReportResponse(
                r.Id,
                r.ApplicationId,
                r.Application?.CampaignId ?? Guid.Empty,
                r.PostUrl,
                r.PostingDate,
                r.StartDate,
                r.EndDate,
                r.Views,
                r.Likes,
                r.Comments,
                r.Shares,
                ToPublicScreenshotPath(r.ScreenshotPath),
                r.Status,
                r.RejectionReason,
                r.ReviewedAt,
                r.Application?.Influencer?.Name ?? string.Empty,
                r.Application?.Influencer?.User?.Email ?? string.Empty,
                r.Application?.Campaign?.Title ?? string.Empty,
                MapPlatformInsights(r)
            ))
            .ToList();
    }

    private static List<PlatformReportInsightResponse> MapPlatformInsights(CampaignReport report)
    {
        if (!string.IsNullOrWhiteSpace(report.Platform))
        {
            try
            {
                var parsed = JsonSerializer.Deserialize<List<PlatformReportInsightResponse>>(report.Platform);
                if (parsed is { Count: > 0 })
                {
                    return parsed;
                }
            }
            catch (JsonException)
            {
            }
        }

        return
        [
            new PlatformReportInsightResponse(
                string.IsNullOrWhiteSpace(report.Platform) ? "Unknown" : report.Platform,
                report.PostUrl,
                report.Views,
                report.Likes,
                report.Comments,
                report.Shares)
        ];
    }

    private static string ToPublicScreenshotPath(string relativePath)
    {
        if (string.IsNullOrWhiteSpace(relativePath))
            return string.Empty;

        return $"/uploads/reports/{relativePath.Replace("\\", "/")}";
    }

    public async Task<bool> ApproveRejectReportAsync(Guid reportId, bool approve, Guid adminUserId, string? rejectionReason = null, CancellationToken ct = default)
    {
        var report = await _reportRepository.Query()
            .Include(r => r.Application)
            .ThenInclude(a => a.Campaign)
            .FirstOrDefaultAsync(r => r.Id == reportId, ct);
        if (report is null) return false;

        report.Status = approve ? ReportStatus.Approved : ReportStatus.Rejected;
        report.ReviewedAt = DateTime.UtcNow;
        report.ReviewedBy = adminUserId;
        report.RejectionReason = approve ? null : rejectionReason;

        if (approve)
        {
            report.Application.Campaign.Status = CampaignStatus.Completed;
        }

        _reportRepository.Update(report);
        await _reportRepository.SaveChangesAsync(ct);
        return true;
    }
}
