using System.Text;
using InfluenceHub.Application;
using InfluenceHub.Domain.Entities;
using InfluenceHub.Domain.Enums;
using InfluenceHub.Domain.Interfaces;
using InfluenceHub.Infrastructure;
using InfluenceHub.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration, builder.Environment.ContentRootPath);

var key = builder.Configuration["Jwt:Key"] ?? "InfluenceHub-Super-Secret-Key-At-Least-32-Chars!";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "InfluenceHub",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "InfluenceHub",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();

app.UseMiddleware<InfluenceHub.WebApi.Middleware.GlobalExceptionHandler>();

await SeedAdminAsync(app.Services);

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();

static async Task SeedAdminAsync(IServiceProvider services)
{
    using var scope = services.CreateScope();
    var context = scope.ServiceProvider.GetRequiredService<InfluenceHubDbContext>();
    var userRepo = scope.ServiceProvider.GetRequiredService<IUserRepository>();

    await context.Database.MigrateAsync();

    if (await userRepo.GetByEmailAsync("admin@influencehub.com") is not null)
        return;

    var admin = new User
    {
        Id = Guid.NewGuid(),
        Email = "admin@influencehub.com",
        PasswordHash = HashPassword("Admin@123"),
        Role = UserRole.Admin,
        IsEnabled = true,
        CreatedAt = DateTime.UtcNow
    };

    context.Users.Add(admin);
    await context.SaveChangesAsync();
}

static string HashPassword(string password)
{
    var bytes = System.Security.Cryptography.SHA256.HashData(Encoding.UTF8.GetBytes(password));
    return Convert.ToBase64String(bytes);
}
