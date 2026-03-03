using InfluenceHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InfluenceHub.Infrastructure.Data.Configurations;

public class BrandConfiguration : IEntityTypeConfiguration<Brand>
{
    public void Configure(EntityTypeBuilder<Brand> builder)
    {
        builder.HasKey(b => b.Id);
        builder.HasIndex(b => b.UserId).IsUnique();

        builder.HasOne(b => b.User)
            .WithOne(u => u.Brand)
            .HasForeignKey<Brand>(b => b.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(b => b.CompanyName).HasMaxLength(500).IsRequired();
    }
}
