namespace KanniMeat.Application.Interfaces;

public interface IJwtTokenGenerator
{
    (string Token, DateTime ExpiresAt) GenerateToken(Guid userId, string fullName, IEnumerable<string> roles, Guid? companyId, Guid? shopId);
    string GenerateRefreshToken();
}

public interface IPasswordHasher
{
    string Hash(string password);
    bool Verify(string password, string hash);
}

public interface IOtpService
{
    string GenerateOtp();
}