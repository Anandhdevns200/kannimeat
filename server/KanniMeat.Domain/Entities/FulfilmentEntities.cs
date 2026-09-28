using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

using KanniMeat.Domain.Enums;

namespace KanniMeat.Domain.Entities;

public class DeliveryPartner : BaseEntity
{
    [Required, MaxLength(120)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(20)]
    public string Phone { get; set; } = string.Empty;

    [Required, MaxLength(160)]
    public string City { get; set; } = string.Empty;

    [MaxLength(160)]
    public string? Area { get; set; }

    [MaxLength(64)]
    public string VehicleNumber { get; set; } = string.Empty;

    public Guid? ShopId { get; set; }
    public Shop? Shop { get; set; }

    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public bool IsActive { get; set; } = true;
    public int CompletedDeliveries { get; set; }
    public double Rating { get; set; } = 4.5;

    public ICollection<Delivery> Deliveries { get; set; } = new List<Delivery>();
}

public class Delivery : BaseEntity
{
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    public Guid? DeliveryPartnerId { get; set; }
    public DeliveryPartner? DeliveryPartner { get; set; }

    public DeliveryStatus Status { get; set; } = DeliveryStatus.Ready;

    public DateTime? AssignedAt { get; set; }
    public DateTime? PickedUpAt { get; set; }
    public DateTime? DeliveredAt { get; set; }

    [MaxLength(512)]
    public string? Notes { get; set; }

    [MaxLength(8)]
    public string? DeliveryOtp { get; set; }

    public ICollection<DeliveryLocation> LocationHistory { get; set; } = new List<DeliveryLocation>();
}

public class DeliveryLocation : BaseEntity
{
    public Guid DeliveryId { get; set; }
    public Delivery Delivery { get; set; } = null!;

    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }

    public DateTime RecordedAt { get; set; } = DateTime.UtcNow;

    [MaxLength(160)]
    public string? AddressText { get; set; }
}

public class Payment : BaseEntity
{
    public Guid? OrderId { get; set; }
    public Order? Order { get; set; }

    public Guid? InvoiceId { get; set; }
    public Invoice? Invoice { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Amount { get; set; }

    public PaymentMethod Method { get; set; }

    public PaymentStatus Status { get; set; } = PaymentStatus.Pending;

    [MaxLength(128)]
    public string? GatewayReference { get; set; }

    public DateTime? PaidAt { get; set; }

    [MaxLength(512)]
    public string? FailureReason { get; set; }
}

public class Invoice : BaseEntity
{
    [Required, MaxLength(32)]
    public string InvoiceNumber { get; set; } = string.Empty;

    public Guid OrderId { get; set; }
    public Order? Order { get; set; }

    public Guid? CustomerId { get; set; }
    public Customer? Customer { get; set; }

    [MaxLength(256)]
    public string CustomerName { get; set; } = string.Empty;

    [MaxLength(20)]
    public string CustomerPhone { get; set; } = string.Empty;

    [MaxLength(160)]
    public string ShopName { get; set; } = string.Empty;

    [MaxLength(256)]
    public string? AddressText { get; set; }

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

    public PaymentStatus PaymentStatus { get; set; }
    public PaymentMethod PaymentMethod { get; set; }
    public InvoiceStatus Status { get; set; } = InvoiceStatus.Issued;

    public DateTime IssuedAt { get; set; } = DateTime.UtcNow;

    public ICollection<InvoiceItem> InvoiceItems { get; set; } = new List<InvoiceItem>();
}

public class InvoiceItem : BaseEntity
{
    public Guid InvoiceId { get; set; }
    public Invoice Invoice { get; set; } = null!;

    public Guid ProductId { get; set; }

    [MaxLength(160)]
    public string ProductName { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,3)")]
    public decimal WeightKg { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal PricePerKilogram { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal Total { get; set; }
}

public class Notification : BaseEntity
{
    public Guid? UserId { get; set; }
    public User? User { get; set; }

    public Guid? OrderId { get; set; }

    public NotificationSource Source { get; set; }
    public NotificationChannel Channel { get; set; } = NotificationChannel.InApp;

    [Required, MaxLength(160)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(512)]
    public string Body { get; set; } = string.Empty;

    [MaxLength(32)]
    public string Role { get; set; } = string.Empty;

    public bool IsRead { get; set; }

    public DateTime? ReadAt { get; set; }

    [MaxLength(64)]
    public string Icon { get; set; } = "notifications";
}