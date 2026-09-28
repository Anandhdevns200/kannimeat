using KanniMeat.Application.DTOs;
using KanniMeat.Application.Interfaces;
using KanniMeat.Domain.Entities;
using KanniMeat.Domain.Enums;

using Microsoft.EntityFrameworkCore;

namespace KanniMeat.Infrastructure.Services;

public sealed class AuthService : IAuthService
{
    private readonly IUnitOfWork _uow;
    private readonly IJwtTokenGenerator _jwt;
    private readonly IPasswordHasher _hasher;
    private readonly IOtpService _otp;

    private static readonly Dictionary<string, (UserRole Role, Guid? CompanyId, Guid? ShopId)> DemoLogins = new()
    {
        ["9842500001"] = (UserRole.CUSTOMER, null, null),
        ["9842500002"] = (UserRole.SHOP_ADMIN, null, null),
        ["9842500003"] = (UserRole.COMPANY_ADMIN, null, null),
        ["9842500004"] = (UserRole.SUPER_ADMIN, null, null),
        ["9842500005"] = (UserRole.DELIVERY_MANAGER, null, null),
        ["9842500006"] = (UserRole.DELIVERY_PARTNER, null, null),
    };

    public AuthService(IUnitOfWork uow, IJwtTokenGenerator jwt, IPasswordHasher hasher, IOtpService otp)
    {
        _uow = uow;
        _jwt = jwt;
        _hasher = hasher;
        _otp = otp;
    }

    public async Task<AuthResponse> RequestOtpAsync(RequestOtpRequest request, CancellationToken ct = default)
    {
        // Demo mode: logins are pre-seeded by phone. In production this sends an SMS/WhatsApp.
        if (!DemoLogins.ContainsKey(request.Phone) && !await _uow.Users.AnyAsync(u => u.Phone == request.Phone, ct))
        {
            var user = await SeedUserAsync(request.Phone, request.Purpose, ct);
            return await IssueAsync(user, ct);
        }

        var existing = await _uow.Users
            .FirstOrDefaultAsync(u => u.Phone == request.Phone, q => q.Include(x => x.UserRoles).ThenInclude(r => r.Role), ct);

        if (existing is null)
        {
            var seeded = await SeedUserAsync(request.Phone, request.Purpose, ct);
            return await IssueAsync(seeded, ct);
        }

        // Store a demo OTP (auto-verify path when OTP is "1234").
        existing.OtpCode = _otp.GenerateOtp();
        existing.OtpExpiry = DateTime.UtcNow.AddMinutes(5);
        _uow.Users.Update(existing);
        await _uow.SaveAsync(ct);

        return await IssueAsync(existing, ct);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await _uow.Users
            .FirstOrDefaultAsync(
                u => u.Phone == request.Phone,
                q => q.Include(x => x.UserRoles).ThenInclude(r => r.Role),
                ct)
            ?? throw new KeyNotFoundException("User not found.");

        if (user.Status != UserAccountStatus.Active)
            throw new UnauthorizedAccessException("Account is not active.");

        if (!string.IsNullOrEmpty(request.OtpCode) && request.OtpCode == "1234")
        {
            // Demo otp — production would validate OtpCode + OtpExpiry.
        }
        else if (!string.IsNullOrEmpty(request.Password))
        {
            if (!_hasher.Verify(request.Password, user.PasswordHash))
                throw new UnauthorizedAccessException("Invalid credentials.");
        }
        else
        {
            throw new UnauthorizedAccessException("Provide OTP or password.");
        }

        return await IssueAsync(user, ct);
    }

    public async Task<AuthResponse> RefreshAsync(string refreshToken, CancellationToken ct = default)
    {
        var user = await _uow.Users
            .FirstOrDefaultAsync(
                u => u.RefreshToken == refreshToken && u.RefreshTokenExpiry > DateTime.UtcNow,
                q => q.Include(x => x.UserRoles).ThenInclude(r => r.Role),
                ct)
            ?? throw new UnauthorizedAccessException("Invalid or expired refresh token.");

        return await IssueAsync(user, ct);
    }

    public async Task LogoutAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _uow.Users.GetByIdAsync(userId, ct);
        if (user is not null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiry = null;
            _uow.Users.Update(user);
            await _uow.SaveAsync(ct);
        }
    }

    public async Task<UserDto?> GetCurrentUserAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _uow.Users
            .FirstOrDefaultAsync(u => u.Id == userId, q => q.Include(x => x.UserRoles).ThenInclude(r => r.Role), ct);
        return user is null ? null : Mapper.ToDto(user);
    }

    public async Task<IEnumerable<UserDto>> GetUsersAsync(string? search, CancellationToken ct = default)
    {
        var users = await _uow.Users
            .ListAsync(
                u => string.IsNullOrEmpty(search) || u.FullName.Contains(search) || u.Phone.Contains(search),
                q => q.Include(x => x.UserRoles).ThenInclude(r => r.Role).Include(u => u.Company).Include(u => u.Shop),
                ct);
        return users.Select(Mapper.ToDto);
    }

    public async Task<IEnumerable<string>> GetPermissionsAsync(Guid userId, CancellationToken ct = default)
    {
        var user = await _uow.Users
            .FirstOrDefaultAsync(u => u.Id == userId, q => q.Include(x => x.UserRoles).ThenInclude(r => r.Role).ThenInclude(r => r.Permissions).ThenInclude(rp => rp.Permission), ct);

        if (user is null) return Array.Empty<string>();
        return user.UserRoles
            .SelectMany(r => r.Role.Permissions)
            .Select(rp => rp.Permission.Code)
            .Distinct()
            .ToList();
    }

    private async Task<AuthResponse> IssueAsync(User user, CancellationToken ct)
    {
        var roles = user.UserRoles.Select(r => r.Role.Name).Distinct().ToList();
        if (roles.Count == 0)
        {
            roles.Add("CUSTOMER");
        }

        var (token, expiresAt) = _jwt.GenerateToken(user.Id, user.FullName, roles, user.CompanyId, user.ShopId);
        var refreshToken = _jwt.GenerateRefreshToken();

        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(14);
        _uow.Users.Update(user);
        await _uow.SaveAsync(ct);

        return new AuthResponse(token, refreshToken, expiresAt, Mapper.ToDto(user));
    }

    private async Task<User> SeedUserAsync(string phone, string? purpose, CancellationToken ct)
    {
        var (role, companyId, shopId) = DemoLogins.TryGetValue(phone, out var cfg)
            ? cfg
            : (UserRole.CUSTOMER, (Guid?)null, (Guid?)null);

        var roleEntity = await EnsureRoleAsync(role, ct);

        var user = new User
        {
            FullName = DemoName(phone),
            Phone = phone,
            PasswordHash = _hasher.Hash("KanniMeat@123"),
        };

        if (role is UserRole.COMPANY_ADMIN)
        {
            user.CompanyId = (await _uow.Companies.FirstOrDefaultAsync(c => true, ct))?.Id;
        }
        if (role is UserRole.SHOP_ADMIN or UserRole.SHOP_STAFF)
        {
            user.ShopId = (await _uow.Shops.FirstOrDefaultAsync(s => true, ct))?.Id;
            user.CompanyId = (await _uow.Shops.FirstOrDefaultAsync(s => true, q => q.Include(x => x.Company), ct))?.CompanyId;
        }
        if (role is UserRole.DELIVERY_PARTNER)
        {
            user.ShopId = (await _uow.Shops.FirstOrDefaultAsync(s => true, ct))?.Id;
        }

        await _uow.Users.AddAsync(user, ct);
        await _uow.RoleAssignments.AddAsync(new RoleAssignment { User = user, Role = roleEntity }, ct);

        if (role == UserRole.CUSTOMER)
        {
            await _uow.Customers.AddAsync(new Customer { FullName = user.FullName, Phone = phone, User = user }, ct);
        }

        await _uow.SaveAsync(ct);
        return user;
    }

    private async Task<Role> EnsureRoleAsync(UserRole role, CancellationToken ct)
    {
        var name = role.ToString();
        var existing = await _uow.Roles.FirstOrDefaultAsync(r => r.Name == name, ct);
        if (existing is not null) return existing;

        var entity = new Role { Name = name, Description = name.Replace('_', ' ') };
        await _uow.Roles.AddAsync(entity, ct);
        await _uow.SaveAsync(ct);
        return entity;
    }

    private static string DemoName(string phone) => phone switch
    {
        "9842500001" => "Anand Krishnan",
        "9842500002" => "Murugan Selvam",
        "9842500003" => "Santhosh Kumar",
        "9842500004" => "Rajendran V",
        "9842500005" => "Divya Balaji",
        "9842500006" => "Ravi Shankar",
        _ => "Demo User",
    };
}