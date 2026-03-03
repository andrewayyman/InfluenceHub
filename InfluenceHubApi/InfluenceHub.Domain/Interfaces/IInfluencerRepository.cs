namespace InfluenceHub.Domain.Interfaces;

public interface IInfluencerRepository
{
    Task<Entities.Influencer?> GetByUserIdAsync(Guid userId, CancellationToken ct = default);
}
