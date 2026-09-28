using System.ComponentModel.DataAnnotations;

using KanniMeat.Domain.Enums;

namespace KanniMeat.Domain.Entities;

public class Company : BaseEntity
{
    [Required, MaxLength(160)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(160)]
    public string City { get; set; } = string.Empty;

    [MaxLength(32)]
    public string? Gstin { get; set; }

    [MaxLength(32)]
    public string? RegisteredPhone { get; set; }

    [MaxLength(256)]
    public string? RegisteredEmail { get; set; }

    public CompanyStatus Status { get; set; } = CompanyStatus.PendingApproval;

    public ICollection<Shop> Shops { get; set; } = new List<Shop>();
    public ICollection<User> Users { get; set; } = new List<User>();
}

public class Shop : BaseEntity
{
    [Required, MaxLength(160)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(160)]
    public string City { get; set; } = string.Empty;

    [Required, MaxLength(160)]
    public string Area { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Pincode { get; set; }

    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }

    public Guid CompanyId { get; set; }
    public Company Company { get; set; } = null!;

    [MaxLength(120)]
    public string? ManagerName { get; set; }

    [MaxLength(20)]
    public string? ManagerPhone { get; set; }

    public ShopStatus Status { get; set; } = ShopStatus.Active;
    public double Rating { get; set; } = 4.7;

    public decimal GstRate { get; set; } = 5m;
    public decimal DeliveryFee { get; set; } = 30m;
    public decimal FreeDeliveryThreshold { get; set; } = 499m;

    public ICollection<Employee> Employees { get; set; } = new List<Employee>();
    public ICollection<Product> Products { get; set; } = new List<Product>();
    public ICollection<InventoryItem> Inventory { get; set; } = new List<InventoryItem>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<DeliveryPartner> DeliveryPartners { get; set; } = new List<DeliveryPartner>();
}

public class Customer : BaseEntity
{
    [Required, MaxLength(120)]
    public string FullName { get; set; } = string.Empty;

    [Required, MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    [MaxLength(256)]
    public string? Email { get; set; }

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public ICollection<Address> Addresses { get; set; } = new List<Address>();
    public ICollection<Cart> Carts { get; set; } = new List<Cart>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}

public class Address : BaseEntity
{
    [MaxLength(60)]
    public string Label { get; set; } = "Home";

    [Required, MaxLength(256)]
    public string Line1 { get; set; } = string.Empty;

    [MaxLength(256)]
    public string? Line2 { get; set; }

    [Required, MaxLength(160)]
    public string Area { get; set; } = string.Empty;

    [Required, MaxLength(160)]
    public string City { get; set; } = string.Empty;

    [Required, MaxLength(16)]
    public string Pincode { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Phone { get; set; }

    public bool IsDefault { get; set; }

    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }
}

public class Employee : BaseEntity
{
    [Required, MaxLength(120)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    public Guid ShopId { get; set; }
    public Shop Shop { get; set; } = null!;

    public Guid UserId { get; set; }
    public User User { get; set; } = null!;

    public UserRole Role { get; set; } = UserRole.SHOP_STAFF;
}