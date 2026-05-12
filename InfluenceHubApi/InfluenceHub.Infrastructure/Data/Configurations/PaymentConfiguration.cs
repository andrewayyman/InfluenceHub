using InfluenceHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InfluenceHub.Infrastructure.Data.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.HasKey(p => p.Id);
        builder.HasIndex(p => p.ApplicationId).IsUnique();
        builder.HasIndex(p => p.CampaignId);
        builder.HasIndex(p => p.InfluencerId);
        builder.HasIndex(p => p.Status);

        builder.HasOne(p => p.Application)
            .WithMany()
            .HasForeignKey(p => p.ApplicationId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Campaign)
            .WithMany()
            .HasForeignKey(p => p.CampaignId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Brand)
            .WithMany()
            .HasForeignKey(p => p.BrandId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(p => p.Influencer)
            .WithMany()
            .HasForeignKey(p => p.InfluencerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(p => p.Amount).HasPrecision(18, 2).IsRequired();
        builder.Property(p => p.CommissionPercentage).HasPrecision(5, 2).IsRequired();
        builder.Property(p => p.PlatformCommission).HasPrecision(18, 2).IsRequired();
        builder.Property(p => p.NetAmount).HasPrecision(18, 2).IsRequired();

        builder.Property(p => p.PaymentMethod).HasMaxLength(50);
        builder.Property(p => p.TransactionReference).HasMaxLength(150);
        builder.Property(p => p.ProofUrl).HasMaxLength(500);
        builder.Property(p => p.BrandNotes).HasMaxLength(1000);
        builder.Property(p => p.DisputeReason).HasMaxLength(1000);
    }
}
