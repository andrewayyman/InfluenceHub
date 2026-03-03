namespace InfluenceHub.Domain.Interfaces;

public interface ICampaignRepository
{
    Task<Entities.Campaign?> GetByIdWithTagsAsync(Guid id, CancellationToken ct = default);
}
