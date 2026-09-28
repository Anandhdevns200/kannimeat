using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

using KanniMeat.Domain.Enums;

namespace KanniMeat.Domain.Entities;

public class ProductCategoryEntity : BaseEntity
{
    [Required, MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(256)]
    public string? Description { get; set; }

    public ProductCategory Category { get; set; } = ProductCategory.Chicken;

    [MaxLength(16)]
    public string Emoji { get; set; } = string.Empty;

    public bool IsActive { get; set; } = true;

    public ICollection<Product> Products { get; set; } = new List<Product>();
}

public class Product : BaseEntity
{
    [Required, MaxLength(160)]
    public string Name { get; set; } = string.Empty;

    public Guid CategoryId { get; set; }
    public ProductCategoryEntity CategoryEntity { get; set; } = null!;

    public ProductCategory Category { get; set; } = ProductCategory.Chicken;

    [MaxLength(16)]
    public string Emoji { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal PricePerKilogram { get; set; }

    [MaxLength(120)]
    public string? Freshness { get; set; }

    public int Quality { get; set; } = 4;

    public Guid ShopId { get; set; }
    public Shop Shop { get; set; } = null!;

    [Column(TypeName = "decimal(18,2)")]
    public decimal? CostPricePerKilogram { get; set; }

    [MaxLength(512)]
    public string? Description { get; set; }

    [MaxLength(16)]
    public string Unit { get; set; } = "KG";

    public bool IsActive { get; set; } = true;

    public ProductStatus Status { get; set; } = ProductStatus.Active;

    public ICollection<ProductVariant> Variants { get; set; } = new List<ProductVariant>();
    public ICollection<CuttingPreference> CuttingPreferences { get; set; } = new List<CuttingPreference>();
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    [NotMapped]
    public string ShopName => Shop.Name;
    [NotMapped]
    public string ShopArea => Shop.Area;
}

public class ProductVariant : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    [Required, MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    [Column(TypeName = "decimal(18,2)")]
    public decimal? WeightKg { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? PriceAdjustment { get; set; }

    public bool IsActive { get; set; } = true;
}

public class CuttingPreference : BaseEntity
{
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    [Required, MaxLength(120)]
    public string Name { get; set; } = string.Empty;

    public CutPreferenceType Type { get; set; } = CutPreferenceType.CurryCut;

    public bool IsActive { get; set; } = true;
}

public class InventoryItem : BaseEntity
{
    public Guid ShopId { get; set; }
    public Shop Shop { get; set; } = null!;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    [Column(TypeName = "decimal(18,3)")]
    public decimal AvailableKg { get; set; }

    [Column(TypeName = "decimal(18,3)")]
    public decimal ReservedKg { get; set; }

    [Column(TypeName = "decimal(18,3)")]
    public decimal ExpectedDemandKg { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal UnitPricePerKilogram { get; set; }

    [NotMapped]
    public decimal OnHandKg => AvailableKg - ReservedKg;

    [NotMapped]
    public StockLevel StockLevel => AvailableKg <= 0m ? StockLevel.Out : AvailableKg < ExpectedDemandKg ? StockLevel.Low : StockLevel.InStock;

    public ICollection<InventoryTransaction> Transactions { get; set; } = new List<InventoryTransaction>();
}

public class InventoryTransaction : BaseEntity
{
    public Guid InventoryItemId { get; set; }
    public InventoryItem InventoryItem { get; set; } = null!;

    public TransactionType Type { get; set; }

    [Column(TypeName = "decimal(18,3)")]
    public decimal QuantityKg { get; set; }

    public Guid? OrderId { get; set; }
    public Order? Order { get; set; }

    [MaxLength(512)]
    public string? Note { get; set; }

    public Guid CreatedByUserId { get; set; }
    public User CreatedByUser { get; set; } = null!;
}