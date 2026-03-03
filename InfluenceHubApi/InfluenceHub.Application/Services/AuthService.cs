using System.Security.Cryptography;
using System.Text;
using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.DTOs.Response;
using InfluenceHub.Application.Interfaces;
using InfluenceHub.Domain.Entities;
using InfluenceHub.Domain.Enums;
using InfluenceHub.Domain.Interfaces;
using Microsoft.Extensions.Logging;

namespace InfluenceHub.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IRepository<User> _userRepo;
    private readonly IRepository<Brand> _brandRepository;
    private readonly IRepository<Influencer> _influencerRepository;
    private readonly ITokenGenerator _tokenGenerator;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository userRepository,
        IRepository<User> userRepo,
        IRepository<Brand> brandRepository,
        IRepository<Influencer> influencerRepository,
        ITokenGenerator tokenGenerator,
        ILogger<AuthService> logger)
    {
        _userRepository = userRepository;
        _userRepo = userRepo;
        _brandRepository = brandRepository;
        _influencerRepository = influencerRepository;
        _tokenGenerator = tokenGenerator;
        _logger = logger;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request, CancellationToken ct = default)
    {
        if (await _userRepository.GetByEmailAsync(request.Email, ct) is not null)
            throw new InvalidOperationException("User with this email already exists");

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = request.Email.ToLowerInvariant(),
            PasswordHash = HashPassword(request.Password),
            Role = request.Role,
            IsEnabled = true,
            CreatedAt = DateTime.UtcNow
        };

        await _userRepo.AddAsync(user, ct);

        if (request.Role == UserRole.Brand)
        {
            var brand = new Brand
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                CompanyName = request.Email.Split('@')[0],
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _brandRepository.AddAsync(brand, ct);
        }
        else if (request.Role == UserRole.Influencer)
        {
            var influencer = new Influencer
            {
                Id = Guid.NewGuid(),
                UserId = user.Id,
                Bio = string.Empty,
                Platforms = "[]",
                FollowersCount = 0,
                Location = string.Empty,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _influencerRepository.AddAsync(influencer, ct);
        }

        var token = _tokenGenerator.GenerateToken(user);
        return new AuthResponse(token, user.Id, user.Email, user.Role);
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await _userRepository.GetByEmailAsync(request.Email.ToLowerInvariant(), ct);
        if (user is null || !user.IsEnabled)
            return null;

        if (!VerifyPassword(request.Password, user.PasswordHash))
            return null;

        var token = _tokenGenerator.GenerateToken(user);
        return new AuthResponse(token, user.Id, user.Email, user.Role);
    }

    private static string HashPassword(string password)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(password));
        return Convert.ToBase64String(bytes);
    }

    private static bool VerifyPassword(string password, string hash)
    {
        var computed = HashPassword(password);
        return string.Equals(computed, hash, StringComparison.Ordinal);
    }
}
