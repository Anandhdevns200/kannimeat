using KanniMeat.Domain.Enums;

namespace KanniMeat.Application.DTOs;

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------
public record LoginRequest(string Phone, string? Password, string? OtpCode);

public record RequestOtpRequest(string Phone, string? Purpose);

public record AuthResponse(string Token, string RefreshToken, DateTime ExpiresAt, UserDto User);

public record UserDto(
    Guid Id,
    string FullName,
    string Phone,
    string? Email,
    string[] Roles,
    Guid? CompanyId,
    Guid? ShopId,
    UserAccountStatus Status);

public record RefreshTokenRequest(string RefreshToken);

// ---------------------------------------------------------------------------
// Companies / Shops
// ---------------------------------------------------------------------------
public record CompanyDto(
    Guid Id, string Name, string City, string? Gstin, CompanyStatus Status,
    int ShopCount, decimal MonthlyRevenue, int OrdersToday);

public record CompanyListResponse(List<CompanyDto> Items, int Total);

public record CreateCompanyRequest(string Name, string City, string? Gstin, string? RegisteredPhone, string? RegisteredEmail);

public record UpdateCompanyRequest(string? Name, CompanyStatus? Status);

public record ShopDto(
    Guid Id, string Name, string City, string Area, string? Pincode,
    Guid CompanyId, string CompanyName, string? ManagerName, string? ManagerPhone,
    ShopStatus Status, double Rating, int OrdersToday, decimal RevenueThisMonth);

public record ShopListResponse(List<ShopDto> Items, int Total);

public record CreateShopRequest(
    string Name, string City, string Area, string? Pincode,
    decimal Latitude, decimal Longitude, Guid CompanyId,
    string? ManagerName, string? ManagerPhone);

public record UpdateShopRequest(string? Name, ShopStatus? Status, decimal? DeliveryFee, decimal? FreeDeliveryThreshold);

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------
public record ProductDto(
    Guid Id, string Name, Guid CategoryId, string CategoryName, ProductCategory Category,
    string Emoji, decimal PricePerKilogram, string? Freshness, int Quality,
    Guid ShopId, string ShopName, string ShopArea, string? Description, string Unit,
    bool InStock, bool IsActive, List<string> Cuts);

public record ProductListResponse(List<ProductDto> Items, int Total);

public record ProductQuery(Guid? ShopId, ProductCategory? Category, string? Search, int Page = 1, int PageSize = 20);

public record CreateProductRequest(
    string Name, Guid CategoryId, ProductCategory Category, string Emoji,
    decimal PricePerKilogram, string? Freshness, int Quality, Guid ShopId,
    string? Description, string Unit, List<string>? Cuts);

public record UpdateProductRequest(string? Name, decimal? PricePerKilogram, bool? IsActive, int? Quality, string? Freshness);

public record ProductCategoryDto(Guid Id, string Name, ProductCategory Category, string Emoji, string? Description, bool IsActive);

public record CreateCategoryRequest(string Name, ProductCategory Category, string Emoji, string? Description);

// ---------------------------------------------------------------------------
// Cart
// ---------------------------------------------------------------------------
public record CartLineDto(Guid ProductId, string ProductName, string Emoji, decimal QuantityKg, string? CutPreference, decimal UnitPrice, decimal LineTotal);

public record CartDto(Guid Id, Guid? ShopId, List<CartLineDto> Items, int ItemCount, decimal Subtotal);

public record AddToCartRequest(Guid ProductId, decimal QuantityKg, string? CutPreference);

public record UpdateCartItemRequest(decimal QuantityKg, string? CutPreference);

// ---------------------------------------------------------------------------
// Customers / Addresses
// ---------------------------------------------------------------------------
public record CustomerDto(Guid Id, string FullName, string Phone, string? Email, List<AddressDto> Addresses);

public record AddressDto(Guid Id, string Label, string Line1, string? Line2, string Area, string City, string Pincode, string? Phone, bool IsDefault);

public record CreateAddressRequest(string Label, string Line1, string? Line2, string Area, string City, string Pincode, string? Phone, bool IsDefault);

public record UpdateAddressRequest(string? Label, string? Line1, string? Line2, string? Area, string? City, string? Pincode, bool? IsDefault);

public record CustomerListResponse(List<CustomerDto> Items, int Total);

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------
public record OrderItemDto(Guid ProductId, string ProductName, string Emoji, decimal WeightKg, string? CutPreference, decimal PricePerKilogram, decimal Total);

public record OrderStatusEventDto(OrderStatus Status, string Title, string? Note, DateTime At, string? ChangedBy);

public record OrderDto(
    Guid Id, string OrderNumber, Guid? CustomerId, string CustomerName, string CustomerPhone,
    Guid ShopId, string ShopName, string ShopArea, string City,
    List<OrderItemDto> Items, decimal Subtotal, decimal DeliveryFee, decimal Discount,
    decimal Tax, decimal Total, decimal TotalKg,
    DateTime DeliveryDate, string? SlotLabel,
    PaymentMethod PaymentMethod, PaymentStatus PaymentStatus, OrderStatus Status,
    string Address, string Area, string? InvoiceId,
    List<OrderStatusEventDto> Timeline, Guid? DeliveryPartnerId, bool Assigned);

public record OrderListResponse(List<OrderDto> Items, int Total);

public record OrderQuery(Guid? ShopId, Guid? CustomerId, OrderStatus? Status, string? Search, DateTime? From, DateTime? To, int Page = 1, int PageSize = 20);

public record PlaceOrderRequest(
    Guid ShopId, Guid? AddressId, List<OrderItemInput> Items, string? SlotLabel,
    DateTime DeliveryDate, PaymentMethod PaymentMethod, string? Notes);

public record OrderItemInput(Guid ProductId, decimal WeightKg, string? CutPreference);

public record UpdateOrderStatusRequest(OrderStatus Status, string? Note);

public record AssignDeliveryRequest(Guid OrderId, Guid DeliveryPartnerId);

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------
public record InventoryItemDto(Guid Id, Guid ShopId, string ShopName, Guid ProductId, string ProductName, string Emoji, ProductCategory Category, decimal AvailableKg, decimal ReservedKg, decimal ExpectedDemandKg, decimal UnitPricePerKg, decimal OnHandKg, StockLevel StockLevel);

public record InventoryListResponse(List<InventoryItemDto> Items, int Total);

public record AdjustInventoryRequest(Guid InventoryItemId, decimal QuantityKg, TransactionType Type, string? Note);

public record AddInventoryRequest(Guid ShopId, Guid ProductId, decimal QuantityKg, decimal UnitPricePerKg, decimal ExpectedDemandKg);

public record InventoryTransactionDto(Guid Id, Guid InventoryItemId, TransactionType Type, decimal QuantityKg, Guid? OrderId, string? Note, DateTime At, string? CreatedByName);

// ---------------------------------------------------------------------------
// Delivery
// ---------------------------------------------------------------------------
public record DeliveryPartnerDto(Guid Id, string FullName, string Phone, string City, string? Area, string VehicleNumber, bool IsActive, int CompletedDeliveries, double Rating);

public record DeliveryPartnerListResponse(List<DeliveryPartnerDto> Items, int Total);

public record CreateDeliveryPartnerRequest(string FullName, string Phone, string City, string? Area, string VehicleNumber, Guid? ShopId);

public record DeliveryDto(
    Guid Id, Guid OrderId, string OrderNumber, string CustomerAddress,
    Guid? DeliveryPartnerId, string? DeliveryPartnerName,
    DeliveryStatus Status, DateTime? AssignedAt, DateTime? DeliveredAt, string? DeliveryOtp);

public record DeliveryListResponse(List<DeliveryDto> Items, int Total);

public record StartDeliveryRequest(string? DeliveryOtp);

public record CompleteDeliveryRequest(string DeliveryOtp);

public record UpdateDeliveryLocationRequest(decimal Latitude, decimal Longitude, string? AddressText);

public record ScheduleDeliveryRequest(Guid OrderId, DateTime? ReadyAt);

// ---------------------------------------------------------------------------
// Payments / Invoices
// ---------------------------------------------------------------------------
public record PaymentDto(Guid Id, Guid? OrderId, string? OrderNumber, Guid? InvoiceId, decimal Amount, PaymentMethod Method, PaymentStatus Status, string? GatewayReference, DateTime? PaidAt, string? FailureReason);

public record PaymentListResponse(List<PaymentDto> Items, int Total);

public record RecordPaymentRequest(Guid? OrderId, decimal Amount, PaymentMethod Method, string? GatewayReference);

public record InvoiceDto(
    Guid Id, string InvoiceNumber, Guid OrderId, string CustomerName, string CustomerPhone,
    string ShopName, string? AddressText, List<OrderItemDto> Items,
    decimal Subtotal, decimal DeliveryFee, decimal Discount, decimal Tax, decimal Total,
    PaymentStatus PaymentStatus, PaymentMethod PaymentMethod, InvoiceStatus Status, DateTime IssuedAt);

public record InvoiceListResponse(List<InvoiceDto> Items, int Total);

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------
public record NotificationDto(Guid Id, string? Role, string Title, string Body, string Icon, bool IsRead, DateTime CreatedAt, string TimeAgo);

public record NotificationListResponse(List<NotificationDto> Items, int Total);

public record MarkNotificationsReadRequest(List<Guid>? Ids);

// ---------------------------------------------------------------------------
// Dashboard / Analytics
// ---------------------------------------------------------------------------
public record MetricCardDto(string Label, string Value, string Delta, string Trend, string Icon);

public record RevenuePointDto(string Day, decimal Value);

public record CategorySalesDto(string Name, decimal Value);

public record CityDistributionDto(string City, int Orders, decimal Revenue);

public record DashboardDataDto(
    List<MetricCardDto> Metrics,
    List<RevenuePointDto> RevenueTrend,
    List<CategorySalesDto> CategorySales,
    List<CityDistributionDto> CityDistribution,
    List<OrderDto> RecentOrders);

// ---------------------------------------------------------------------------
// Common
// ---------------------------------------------------------------------------
public record PagedResult<T>(List<T> Items, int Total, int Page, int PageSize);