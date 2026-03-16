using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using DashboardAnalyticsAPI.Domain;

namespace DashboardAnalyticsAPI.Infrastructure.Auth;

public interface IJwtTokenService
{
    string GenerateToken(User user);
}

public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(User user)
    {
        var key = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException("Jwt:Key is not configured in appsettings.");
        var issuer = _configuration["Jwt:Issuer"] ?? "DashboardAnalyticsAPI";

        var tokenHandler = new JwtSecurityTokenHandler();
        var keyBytes = Encoding.UTF8.GetBytes(key);

        var claims = new List<Claim>
        {
            new Claim("sub", user.Id.ToString()),
            new Claim("email", user.Email),
            new Claim("role", user.Role)
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(1),
            Issuer = issuer,
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(keyBytes),
                SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }
}
