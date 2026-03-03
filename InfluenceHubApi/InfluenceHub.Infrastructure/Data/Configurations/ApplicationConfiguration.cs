using InfluenceHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using ApplicationEntity = InfluenceHub.Domain.Entities.Application;

namespace InfluenceHub.Infrastructure.Data.Configurations;

public class ApplicationConfiguration : IEntityTypeConfiguration<ApplicationEntity>
{
    public void Configure(EntityTypeBuilder<ApplicationEntity> builder)
    {
        builder.HasKey(a => a.Id);
        builder.HasIndex(a => new { a.CampaignId, a.InfluencerId }).IsUnique();
        builder.HasIndex(a => a.Status);

        builder.HasOne(a => a.Campaign)
            .WithMany(c => c.Applications)
            .HasForeignKey(a => a.CampaignId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(a => a.Influencer)
            .WithMany(i => i.Applications)
            .HasForeignKey(a => a.InfluencerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(a => a.Message).HasMaxLength(2000);
    }
}
