using InfluenceHub.Domain.Entities;
using InfluenceHub.Domain.Interfaces;
using InfluenceHub.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InfluenceHub.Infrastructure.Repositories;

public class CampaignRepository : Repository<Campaign>, ICampaignRepository
{
    public CampaignRepository(InfluenceHubDbContext context) : base(context)
    {
    }

    public async Task<Campaign?> GetByIdWithTagsAsync(Guid id, CancellationToken ct = default)
    {
        return await _context.Campaigns
            .Include(c => c.CampaignTags)
            .ThenInclude(ct => ct.Tag)
            .FirstOrDefaultAsync(c => c.Id == id, ct);
    }
}
