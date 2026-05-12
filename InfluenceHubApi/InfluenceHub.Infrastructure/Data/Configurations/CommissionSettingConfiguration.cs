using InfluenceHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InfluenceHub.Infrastructure.Data.Configurations;

public class CommissionSettingConfiguration : IEntityTypeConfiguration<CommissionSetting>
{
    public void Configure(EntityTypeBuilder<CommissionSetting> builder)
    {
        builder.HasKey(c => c.Id);
        builder.HasIndex(c => c.EffectiveFrom);

        builder.HasOne(c => c.UpdatedByUser)
            .WithMany()
            .HasForeignKey(c => c.UpdatedBy)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(c => c.Percentage).HasPrecision(5, 2).IsRequired();
        builder.Property(c => c.Description).HasMaxLength(500);
    }
}
