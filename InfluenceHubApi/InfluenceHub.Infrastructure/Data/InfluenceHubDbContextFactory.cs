using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace InfluenceHub.Infrastructure.Data;

public class InfluenceHubDbContextFactory : IDesignTimeDbContextFactory<InfluenceHubDbContext>
{
    public InfluenceHubDbContext CreateDbContext(string[] args)
    {
        var basePath = Path.Combine(Directory.GetCurrentDirectory(), "..", "InfluenceHub.WebApi");
        var configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: false)
            .AddJsonFile("appsettings.Development.json", optional: true)
            .Build();

        var optionsBuilder = new DbContextOptionsBuilder<InfluenceHubDbContext>();
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? "Server=(localdb)\\mssqllocaldb;Database=InfluenceHub;Trusted_Connection=True;MultipleActiveResultSets=true";
        optionsBuilder.UseSqlServer(connectionString, b =>
            b.MigrationsAssembly(typeof(InfluenceHubDbContext).Assembly.FullName));

        return new InfluenceHubDbContext(optionsBuilder.Options);
    }
}
