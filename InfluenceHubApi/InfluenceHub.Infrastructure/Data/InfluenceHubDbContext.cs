using InfluenceHub.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace InfluenceHub.Infrastructure.Data;

public class InfluenceHubDbContext : DbContext
{
    public InfluenceHubDbContext(DbContextOptions<InfluenceHubDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Brand> Brands => Set<Brand>();
    public DbSet<Influencer> Influencers => Set<Influencer>();
    public DbSet<Campaign> Campaigns => Set<Campaign>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<CampaignTag> CampaignTags => Set<CampaignTag>();
    public DbSet<InfluencerTag> InfluencerTags => Set<InfluencerTag>();
    public DbSet<Domain.Entities.Application> Applications => Set<Domain.Entities.Application>();
    public DbSet<CampaignReport> CampaignReports => Set<CampaignReport>();
    public DbSet<ContactMessage> ContactMessages => Set<ContactMessage>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(InfluenceHubDbContext).Assembly);
    }
}
