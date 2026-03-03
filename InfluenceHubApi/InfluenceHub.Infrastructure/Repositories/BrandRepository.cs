using InfluenceHub.Domain.Entities;
using InfluenceHub.Domain.Interfaces;
using InfluenceHub.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InfluenceHub.Infrastructure.Repositories;

public class BrandRepository : Repository<Brand>, IBrandRepository
{
    public BrandRepository(InfluenceHubDbContext context) : base(context)
    {
    }

    public async Task<Brand?> GetByUserIdAsync(Guid userId, CancellationToken ct = default)
    {
        return await _context.Brands
            .FirstOrDefaultAsync(b => b.UserId == userId, ct);
    }
}
