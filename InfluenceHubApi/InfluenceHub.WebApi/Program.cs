using System.Text;
using System.Text.Json.Serialization;
using InfluenceHub.Application;
using InfluenceHub.Domain.Entities;
using InfluenceHub.Domain.Enums;
using InfluenceHub.Domain.Interfaces;
using InfluenceHub.Infrastructure;
using InfluenceHub.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy
            .WithOrigins(
                "http://localhost:5173",
                "https://localhost:5173",
                "http://localhost:4173",
                "https://localhost:4173")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration, builder.Environment.ContentRootPath);

var key = builder.Configuration["Jwt:Key"] ?? "InfluenceHub-Super-Secret-Key-At-Least-32-Chars!";
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.RequireHttpsMetadata = false;
        options.SaveToken = true;
 options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"] ?? "InfluenceHub",
            ValidAudience = builder.Configuration["Jwt:Audience"] ?? "InfluenceHub",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key)),
            NameClaimType = ClaimTypes.NameIdentifier,
            RoleClaimType = ClaimTypes.Role,
            ClockSkew = TimeSpan.Zero,
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();
var uploadsPath = Path.Combine(builder.Environment.ContentRootPath, "uploads");

Directory.CreateDirectory(uploadsPath);

app.UseMiddleware<InfluenceHub.WebApi.Middleware.GlobalExceptionHandler>();

await SeedAdminAsync(app.Services);

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});
app.UseCors("Frontend");
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
