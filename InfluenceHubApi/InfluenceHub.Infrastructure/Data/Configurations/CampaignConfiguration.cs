using InfluenceHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InfluenceHub.Infrastructure.Data.Configurations;

public class CampaignConfiguration : IEntityTypeConfiguration<Campaign>
{
    public void Configure(EntityTypeBuilder<Campaign> builder)
    {
        builder.HasKey(c => c.Id);
        builder.HasIndex(c => c.BrandId);
        builder.HasIndex(c => c.Status);
        builder.HasIndex(c => c.Deadline);

        builder.HasOne(c => c.Brand)
            .WithMany(b => b.Campaigns)
            .HasForeignKey(c => c.BrandId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(c => c.Title).HasMaxLength(500).IsRequired();
        builder.Property(c => c.Description).HasMaxLength(4000);
        builder.Property(c => c.Budget).HasPrecision(18, 2);
        builder.Property(c => c.Platforms).HasColumnType("nvarchar(max)").HasDefaultValue("[]");
        builder.Property(c => c.BudgetType).HasDefaultValue(0);
        builder.Property(c => c.Location).HasMaxLength(256);
    }
}
