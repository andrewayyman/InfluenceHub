using InfluenceHub.Domain.Entities;
using InfluenceHub.Domain.Interfaces;
using InfluenceHub.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InfluenceHub.Infrastructure.Repositories;

public class InfluencerRepository : Repository<Influencer>, IInfluencerRepository
{
    public InfluencerRepository(InfluenceHubDbContext context) : base(context)
    {
    }

    public async Task<Influencer?> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
    {
        return await _context.Influencers
            .Include(i => i.InfluencerTags)
            .ThenInclude(it => it.Tag)
            .FirstOrDefaultAsync(i => i.UserId == userId, ct);
    }
}
