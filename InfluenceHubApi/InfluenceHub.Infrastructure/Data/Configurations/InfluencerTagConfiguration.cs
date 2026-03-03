using InfluenceHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InfluenceHub.Infrastructure.Data.Configurations;

public class InfluencerTagConfiguration : IEntityTypeConfiguration<InfluencerTag>
{
    public void Configure(EntityTypeBuilder<InfluencerTag> builder)
    {
        builder.HasKey(it => it.Id);
        builder.HasIndex(it => new { it.InfluencerId, it.TagId }).IsUnique();

        builder.HasOne(it => it.Influencer)
            .WithMany(i => i.InfluencerTags)
            .HasForeignKey(it => it.InfluencerId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(it => it.Tag)
            .WithMany(t => t.InfluencerTags)
            .HasForeignKey(it => it.TagId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
