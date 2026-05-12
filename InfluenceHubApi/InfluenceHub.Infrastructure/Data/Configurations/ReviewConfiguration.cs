using InfluenceHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace InfluenceHub.Infrastructure.Data.Configurations;

public class ReviewConfiguration : IEntityTypeConfiguration<Review>
{
    public void Configure(EntityTypeBuilder<Review> builder)
    {
        builder.HasKey(r => r.Id);
        builder.HasIndex(r => r.TargetId);
        builder.HasIndex(r => r.CampaignId);
        builder.HasIndex(r => new { r.ReviewerUserId, r.CampaignId }).IsUnique();

        builder.HasOne(r => r.Reviewer)
            .WithMany()
            .HasForeignKey(r => r.ReviewerUserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(r => r.Campaign)
            .WithMany()
            .HasForeignKey(r => r.CampaignId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Property(r => r.Comment).HasMaxLength(2000).IsRequired();
        builder.Property(r => r.Rating).IsRequired();
    }
}
