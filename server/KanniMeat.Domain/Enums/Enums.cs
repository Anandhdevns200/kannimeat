namespace KanniMeat.Domain.Enums;

public enum UserRole
{
    SUPER_ADMIN,
    COMPANY_ADMIN,
    SHOP_ADMIN,
    SHOP_STAFF,
    DELIVERY_MANAGER,
    DELIVERY_PARTNER,
    CUSTOMER
}

public enum AuditAction
{
    Create,
    Update,
    Delete,
    Login,
    Logout,
    StatusChange,
    Assign
}

public enum EntityType
{
    User, Role, Permission, Company, Shop, Customer, Address,
    Product, ProductCategory, ProductVariant, CuttingPreference,
    Inventory, InventoryTransaction, Cart, CartItem, Order, OrderItem,
    OrderStatusHistory, DeliveryPartner, Delivery, Payment, Invoice,
    InvoiceItem, Notification
}

public enum CompanyStatus
{
    Active,
    Suspended,
    PendingApproval
}

public enum ShopStatus
{
    Active,
    Inactive,
    Closed
}

public enum ProductCategory
{
    Chicken,
    Mutton,
    Fish,
    Other
}

public enum ProductStatus
{
    Active,
    Inactive,
    Discontinued
}

public enum StockLevel
{
    InStock,
    Low,
    Out
}

public enum TransactionType
{
    Inbound,
    Outbound,
    Reserved,
    Released,
    Wastage,
    Adjustment
}

public enum OrderStatus
{
    Placed,
    Confirmed,
    Processing,
    Packed,
    Ready,
    OutForDelivery,
    Delivered,
    Cancelled,
    Failed
}

public enum PaymentMethod
{
    Upi,
    Card,
    Netbanking,
    Cod
}

public enum PaymentStatus
{
    Pending,
    Paid,
    Refunded,
    Failed
}

public enum DeliveryStatus
{
    Ready,
    Assigned,
    PickedUp,
    InTransit,
    Delivered,
    Failed,
    Returned
}

public enum InvoiceStatus
{
    Draft,
    Issued,
    Paid,
    Overdue,
    Cancelled
}

public enum NotificationSource
{
    Order,
    Inventory,
    Delivery,
    Payment,
    System,
    Promotional
}

public enum NotificationChannel
{
    InApp,
    Sms,
    Email,
    Push
}

public enum UserAccountStatus
{
    Active,
    Inactive,
    Locked
}

public enum CutPreferenceType
{
    Whole,
    Half,
    Quarter,
    Boneless,
    CurryCut,
    BiryaniCut,
    Minced,
    Sliced
}

public enum OrderFlag
{
    Normal,
    Express,
    PreOrder,
    Bulk
}