using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

using KanniMeat.Domain.Enums;

namespace KanniMeat.Domain.Entities;

public abstract class BaseEntity<TKey>
{
    [Key]
    public TKey Id { get; set; } = default!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public bool IsDeleted { get; set; } = false;
}

public abstract class BaseEntity : BaseEntity<Guid>
{
    public BaseEntity()
    {
        Id = Guid.NewGuid();
    }
}

public class Role : BaseEntity
{
    [Required, MaxLength(64)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(256)]
    public string? Description { get; set; }

    public ICollection<RolePermission> Permissions { get; set; } = new List<RolePermission>();
    public ICollection<RoleAssignment> UserRoles { get; set; } = new List<RoleAssignment>();
}

public class Permission : BaseEntity
{
    [Required, MaxLength(100)]
    public string Code { get; set; } = string.Empty;

    [MaxLength(256)]
    public string? Description { get; set; }

    public ICollection<RolePermission> RolePermissions { get; set; } = new List<RolePermission>();
}

public class RolePermission : BaseEntity
{
    public Guid RoleId { get; set; }
    public Role Role { get; set; } = null!;

    public Guid PermissionId { get; set; }
    public Permission Permission { get; set; } = null!;
}

public class User : BaseEntity
{
    [Required, MaxLength(120)]
    public string FullName { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(256)]
    public string? Email { get; set; }

    [Required, MaxLength(256)]
    public string PasswordHash { get; set; } = string.Empty;

    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiry { get; set; }

    /// <summary>Phone + password hash, kept for OTP hashing.</summary>
    [MaxLength(20)]
    public string? OtpCode { get; set; }
    public DateTime? OtpExpiry { get; set; }

    public UserAccountStatus Status { get; set; } = UserAccountStatus.Active;

    public Guid? CompanyId { get; set; }
    public Company? Company { get; set; }

    public Guid? ShopId { get; set; }
    public Shop? Shop { get; set; }

    public bool EmailConfirmed { get; set; }
    public bool PhoneConfirmed { get; set; }

    public ICollection<RoleAssignment> UserRoles { get; set; } = new List<RoleAssignment>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<Address> Addresses { get; set; } = new List<Address>();
}

public class RoleAssignment : BaseEntity
{
    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public Guid RoleId { get; set; }
    public Role Role { get; set; } = null!;
}
