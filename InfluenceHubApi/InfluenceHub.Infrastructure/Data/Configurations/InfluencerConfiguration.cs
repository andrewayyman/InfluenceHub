using InfluenceHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InfluenceHub.Infrastructure.Data.Configurations;

public class InfluencerConfiguration : IEntityTypeConfiguration<Influencer>
{
    public void Configure(EntityTypeBuilder<Influencer> builder)
    {
        builder.HasKey(i => i.Id);
        builder.HasIndex(i => i.UserId).IsUnique();

        builder.HasOne(i => i.User)
            .WithOne(u => u.Influencer)
            .HasForeignKey<Influencer>(i => i.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(i => i.Bio).HasMaxLength(2000);
        builder.Property(i => i.Platforms).HasMaxLength(2000).IsRequired();
        builder.Property(i => i.Location).HasMaxLength(256);
    }
}
