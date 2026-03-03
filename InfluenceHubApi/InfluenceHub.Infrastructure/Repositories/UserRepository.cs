using InfluenceHub.Domain.Entities;
using InfluenceHub.Domain.Interfaces;
using InfluenceHub.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace InfluenceHub.Infrastructure.Repositories;

public class UserRepository : Repository<User>, IUserRepository
{
    public UserRepository(InfluenceHubDbContext context) : base(context)
    {
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken ct = default)
    {
        return await _context.Users
            .FirstOrDefaultAsync(u => u.Email == email, ct);
    }
}
