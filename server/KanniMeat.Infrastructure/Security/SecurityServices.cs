using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

using KanniMeat.Application.Interfaces;

using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace KanniMeat.Infrastructure.Security;

public class JwtOptions
{
    public const string Section = "Jwt";

    public string Issuer { get; set; } = "KanniMeat";
    public string Audience { get; set; } = "KanniMeatClient";
    public string Key { get; set; } = string.Empty;
    public int ExpiryMinutes { get; set; } = 240;
    public int RefreshTokenDays { get; set; } = 14;
}

public sealed class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly JwtOptions _options;

    public JwtTokenGenerator(IOptions<JwtOptions> options) => _options = options.Value;

    public (string Token, DateTime ExpiresAt) GenerateToken(Guid userId, string fullName, IEnumerable<string> roles, Guid? companyId, Guid? shopId)
    {
        var claims = new List<Claim>
        {
            new(JwtRegisteredClaimNames.Sub, userId.ToString()),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
            new(ClaimTypes.Name, fullName),
        };

        foreach (var role in roles)
        {
            claims.Add(new Claim(ClaimTypes.Role, role));
        }

        if (companyId.HasValue) claims.Add(new Claim("companyId", companyId.Value.ToString()));
        if (shopId.HasValue) claims.Add(new Claim("shopId", shopId.Value.ToString()));

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.Key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var expiresAt = DateTime.UtcNow.AddMinutes(_options.ExpiryMinutes);

        var token = new JwtSecurityToken(
            issuer: _options.Issuer,
            audience: _options.Audience,
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: expiresAt,
            signingCredentials: credentials);

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }

    public string GenerateRefreshToken() => Convert.ToBase64String(RandomNumberGenerator.GetBytes(64));
}

public sealed class PasswordHasher : IPasswordHasher
{
    public string Hash(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 100_000, System.Security.Cryptography.HashAlgorithmName.SHA256);
        var hash = pbkdf2.GetBytes(32);
        var combined = new byte[49];
        Array.Copy(salt, 0, combined, 0, 16);
        Array.Copy(hash, 0, combined, 16, 32);
        return Convert.ToBase64String(combined);
    }

    public bool Verify(string password, string storedHash)
    {
        try
        {
            var combined = Convert.FromBase64String(storedHash);
            var salt = new byte[16];
            var hash = new byte[32];
            Array.Copy(combined, 0, salt, 0, 16);
            Array.Copy(combined, 16, hash, 0, 32);

            var pbkdf2 = new Rfc2898DeriveBytes(password, salt, 100_000, System.Security.Cryptography.HashAlgorithmName.SHA256);
            var candidate = pbkdf2.GetBytes(32);

            return CryptographicOperations.FixedTimeEquals(candidate, hash);
        }
        catch
        {
            return false;
        }
    }
}

public sealed class OtpService : IOtpService
{
    public string GenerateOtp() => RandomNumberGenerator.GetInt32(1000, 10000).ToString("D4");
}