using InfluenceHub.Domain.Entities;

namespace InfluenceHub.Application.Interfaces;

public interface ITokenGenerator
{
    string GenerateToken(User user);
}
