using InfluenceHub.Domain.Entities;
using InfluenceHub.Domain.Interfaces;
using InfluenceHub.Infrastructure.Data;
using InfluenceHub.Infrastructure.Repositories;
using InfluenceHub.Infrastructure.Storage;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace InfluenceHub.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(
        this IServiceCollection services,
        IConfiguration configuration,
        string? contentRootPath = null)
    {
        services.AddDbContext<InfluenceHubDbContext>(options =>
        {
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection") ?? "Server=(localdb)\\mssqllocaldb;Database=InfluenceHub;Trusted_Connection=True;",
                b => b.MigrationsAssembly(typeof(InfluenceHubDbContext).Assembly.FullName));
        });

        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<IBrandRepository, BrandRepository>();
        services.AddScoped<IInfluencerRepository, InfluencerRepository>();
        services.AddScoped<ICampaignRepository, CampaignRepository>();
        services.AddScoped<Application.Interfaces.ITokenGenerator, Services.JwtTokenGenerator>();

        var basePath = contentRootPath ?? configuration["FileStorage:BasePath"] ?? Directory.GetCurrentDirectory();
        services.AddSingleton(new LocalFileStorage(basePath));
        services.AddScoped<Application.Interfaces.IFileStorage, FileStorageAdapter>();

        return services;
    }
}
