using FluentValidation;
using InfluenceHub.Application.Interfaces;
using InfluenceHub.Application.Validators;
using InfluenceHub.Application.Services;
using Microsoft.Extensions.DependencyInjection;

namespace InfluenceHub.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<IBrandService, BrandService>();
        services.AddScoped<IInfluencerService, InfluencerService>();
        services.AddScoped<ICampaignService, CampaignService>();
        services.AddScoped<IApplicationService, ApplicationService>();
        services.AddScoped<IMatchingService, MatchingService>();
        services.AddScoped<IReportService, ReportService>();
        services.AddScoped<IContactService, ContactService>();
        services.AddScoped<IAdminService, AdminService>();
        services.AddScoped<ITagService, TagService>();
        services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();
        return services;
    }
}
