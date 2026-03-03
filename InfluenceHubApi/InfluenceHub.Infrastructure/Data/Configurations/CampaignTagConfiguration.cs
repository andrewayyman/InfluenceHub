using InfluenceHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InfluenceHub.Infrastructure.Data.Configurations;

public class CampaignTagConfiguration : IEntityTypeConfiguration<CampaignTag>
{
    public void Configure(EntityTypeBuilder<CampaignTag> builder)
    {
        builder.HasKey(ct => ct.Id);
        builder.HasIndex(ct => new { ct.CampaignId, ct.TagId }).IsUnique();

        builder.HasOne(ct => ct.Campaign)
            .WithMany(c => c.CampaignTags)
            .HasForeignKey(ct => ct.CampaignId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ct => ct.Tag)
            .WithMany(t => t.CampaignTags)
            .HasForeignKey(ct => ct.TagId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
