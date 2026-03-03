namespace InfluenceHub.Domain.Interfaces;

public interface IBrandRepository
{
    Task<Entities.Brand?> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
}
