namespace InfluenceHub.Domain.Interfaces;

public interface IUserRepository
{
    Task<Entities.User?> GetByEmailAsync(string email, CancellationToken ct = default);
}
