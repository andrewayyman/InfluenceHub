using InfluenceHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InfluenceHub.Infrastructure.Data.Configurations;

public class CampaignReportConfiguration : IEntityTypeConfiguration<CampaignReport>
{
    public void Configure(EntityTypeBuilder<CampaignReport> builder)
    {
        builder.HasKey(r => r.Id);
        builder.HasIndex(r => r.ApplicationId).IsUnique();
        builder.HasIndex(r => r.Status);

        builder.HasOne(r => r.Application)
            .WithOne(a => a.CampaignReport)
            .HasForeignKey<CampaignReport>(r => r.ApplicationId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(r => r.PostUrl).HasMaxLength(2000).IsRequired();
        builder.Property(r => r.ScreenshotPath).HasMaxLength(1000).IsRequired();
        builder.Property(r => r.RejectionReason).HasMaxLength(2000);
    }
}
