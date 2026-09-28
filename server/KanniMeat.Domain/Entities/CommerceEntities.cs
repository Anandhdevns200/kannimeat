using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

using KanniMeat.Domain.Enums;

namespace KanniMeat.Domain.Entities;

public class Cart : BaseEntity
{
    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public Guid? ShopId { get; set; }
    public Shop? Shop { get; set; }

    public bool IsActive { get; set; } = true;

    public ICollection<CartItem> Items { get; set; } = new List<CartItem>();
}

public class CartItem : BaseEntity
{
    public Guid CartId { get; set; }
    public Cart Cart { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    [Column(TypeName = "decimal(18,3)")]
    public decimal QuantityKg { get; set; }

    [MaxLength(120)]
    public string? CutPreference { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal UnitPrice { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal LineTotal => UnitPrice * QuantityKg;
}

public class Order : BaseEntity
{
    [Required, MaxLength(32)]
    public string OrderNumber { get; set; } = string.Empty;

    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }

    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public Guid ShopId { get; set; }
    public Shop Shop { get; set; } = null!;

    public Guid? AddressId { get; set; }
    public Address? Address { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Subtotal { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal DeliveryFee { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Discount { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Tax { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Total { get; set; }

    public DateTime DeliveryDate { get; set; }

    [MaxLength(128)]
    public string? SlotLabel { get; set; }

    public PaymentMethod PaymentMethod { get; set; }
    public PaymentStatus PaymentStatus { get; set; } = PaymentStatus.Pending;

    public OrderStatus Status { get; set; } = OrderStatus.Placed;
    public OrderFlag Flag { get; set; } = OrderFlag.Normal;

    [Column(TypeName = "decimal(18,3)")]
    public decimal TotalKg { get; set; }

    [MaxLength(512)]
    public string? Notes { get; set; }

    public Guid? InvoiceId { get; set; }
    public Invoice? Invoice { get; set; }

    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    public ICollection<OrderStatusHistory> StatusHistory { get; set; } = new List<OrderStatusHistory>();
    public ICollection<InventoryTransaction> InventoryTransactions { get; set; } = new List<InventoryTransaction>();
    public ICollection<Delivery> Deliveries { get; set; } = new List<Delivery>();
}

public class OrderItem : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    [MaxLength(160)]
    public string ProductName { get; set; } = string.Empty;

    [MaxLength(16)]
    public string? Emoji { get; set; }

    [Column(TypeName = "decimal(18,3)")]
    public decimal WeightKg { get; set; }

    [MaxLength(120)]
    public string? CutPreference { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal PricePerKilogram { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Total => WeightKg * PricePerKilogram;
}

public class OrderStatusHistory : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public OrderStatus Status { get; set; }

    [MaxLength(120)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(512)]
    public string? Note { get; set; }

    [MaxLength(120)]
    public string? ChangedBy { get; set; }
}