using KanniMeat.Application.DTOs;
using KanniMeat.Domain.Enums;

namespace KanniMeat.Application.Interfaces;

public interface IAuthService
{
    Task<AuthResponse> RequestOtpAsync(RequestOtpRequest request, CancellationToken ct = default);
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default);
    Task<AuthResponse> RefreshAsync(string refreshToken, CancellationToken ct = default);
    Task LogoutAsync(Guid userId, CancellationToken ct = default);
    Task<UserDto?> GetCurrentUserAsync(Guid userId, CancellationToken ct = default);
    Task<IEnumerable<UserDto>> GetUsersAsync(string? search, CancellationToken ct = default);
    Task<IEnumerable<string>> GetPermissionsAsync(Guid userId, CancellationToken ct = default);
}

public interface ICompanyService
{
    Task<CompanyListResponse> GetCompaniesAsync(string? search, int page, int pageSize, CancellationToken ct = default);
    Task<CompanyDto> GetCompanyAsync(Guid id, CancellationToken ct = default);
    Task<CompanyDto> CreateCompanyAsync(CreateCompanyRequest request, CancellationToken ct = default);
    Task<CompanyDto> UpdateCompanyAsync(Guid id, UpdateCompanyRequest request, CancellationToken ct = default);
    Task<List<ShopDto>> GetCompanyShopsAsync(Guid companyId, CancellationToken ct = default);
}

public interface IShopService
{
    Task<ShopListResponse> GetShopsAsync(string? city, string? search, int page, int pageSize, CancellationToken ct = default);
    Task<ShopDto> GetShopAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<ShopDto>> GetShopsNearAsync(string city, string area, CancellationToken ct = default);
    Task<ShopDto> CreateShopAsync(CreateShopRequest request, CancellationToken ct = default);
    Task<ShopDto> UpdateShopAsync(Guid id, UpdateShopRequest request, CancellationToken ct = default);
    Task<InventoryListResponse> GetShopInventoryAsync(Guid shopId, CancellationToken ct = default);
}

public interface IProductService
{
    Task<ProductListResponse> GetProductsAsync(ProductQuery query, CancellationToken ct = default);
    Task<ProductDto> GetProductAsync(Guid id, CancellationToken ct = default);
    Task<IEnumerable<ProductDto>> GetPopularAsync(int take, CancellationToken ct = default);
    Task<IEnumerable<ProductCategoryDto>> GetCategoriesAsync(CancellationToken ct = default);
    Task<ProductCategoryDto> CreateCategoryAsync(CreateCategoryRequest request, CancellationToken ct = default);
    Task<ProductDto> CreateProductAsync(CreateProductRequest request, CancellationToken ct = default);
    Task<ProductDto> UpdateProductAsync(Guid id, UpdateProductRequest request, CancellationToken ct = default);
}

public interface ICartService
{
    Task<CartDto> GetCartAsync(Guid userId, CancellationToken ct = default);
    Task<CartDto> AddToCartAsync(Guid userId, AddToCartRequest request, CancellationToken ct = default);
    Task<CartDto> UpdateItemAsync(Guid userId, Guid cartItemId, UpdateCartItemRequest request, CancellationToken ct = default);
    Task<CartDto> RemoveItemAsync(Guid userId, Guid cartItemId, CancellationToken ct = default);
    Task<CartDto> ClearCartAsync(Guid userId, CancellationToken ct = default);
}

public interface ICustomerService
{
    Task<CustomerListResponse> GetCustomersAsync(string? search, Guid? shopId, int page, int pageSize, CancellationToken ct = default);
    Task<CustomerDto> GetCustomerAsync(Guid id, CancellationToken ct = default);
    Task<CustomerDto> GetOrCreateCustomerAsync(Guid userId, CancellationToken ct = default);
    Task<AddressDto> AddAddressAsync(Guid userId, CreateAddressRequest request, CancellationToken ct = default);
    Task<AddressDto> UpdateAddressAsync(Guid userId, Guid addressId, UpdateAddressRequest request, CancellationToken ct = default);
    Task<bool> DeleteAddressAsync(Guid userId, Guid addressId, CancellationToken ct = default);
}

public interface IOrderService
{
    Task<OrderListResponse> GetOrdersAsync(OrderQuery query, CancellationToken ct = default);
    Task<OrderDto> GetOrderAsync(Guid id, CancellationToken ct = default);
    Task<OrderDto> GetOrderByNumberAsync(string orderNumber, CancellationToken ct = default);
    Task<OrderDto> PlaceOrderAsync(Guid userId, PlaceOrderRequest request, CancellationToken ct = default);
    Task<OrderDto> UpdateStatusAsync(Guid orderId, UpdateOrderStatusRequest request, Guid changedByUserId, CancellationToken ct = default);
    Task<DashboardDataDto> GetDashboardAsync(string role, Guid? scopeId, CancellationToken ct = default);
}

public interface IInventoryService
{
    Task<InventoryListResponse> GetInventoryAsync(Guid? shopId, CancellationToken ct = default);
    Task<InventoryItemDto> AddInventoryAsync(AddInventoryRequest request, CancellationToken ct = default);
    Task<InventoryItemDto> AdjustAsync(AdjustInventoryRequest request, Guid userId, CancellationToken ct = default);
    Task<IEnumerable<InventoryTransactionDto>> GetTransactionHistoryAsync(Guid inventoryItemId, CancellationToken ct = default);
}

public interface IDeliveryService
{
    Task<DeliveryListResponse> GetDeliveriesAsync(DeliveryStatus? status, Guid? partnerId, CancellationToken ct = default);
    Task<DeliveryDto> GetDeliveryForOrderAsync(Guid orderId, CancellationToken ct = default);
    Task<DeliveryDto> AssignAsync(AssignDeliveryRequest request, CancellationToken ct = default);
    Task<DeliveryDto> StartAsync(Guid deliveryId, CancellationToken ct = default);
    Task<DeliveryDto> CompleteAsync(Guid deliveryId, CompleteDeliveryRequest request, CancellationToken ct = default);
    Task<DeliveryDto> FailAsync(Guid deliveryId, string? reason, CancellationToken ct = default);
    Task<DeliveryListResponse> GetHistoryAsync(Guid partnerId, CancellationToken ct = default);
    Task<DeliveryPartnerListResponse> GetPartnersAsync(string? city, CancellationToken ct = default);
    Task<DeliveryPartnerDto> CreatePartnerAsync(CreateDeliveryPartnerRequest request, CancellationToken ct = default);
}

public interface IPaymentService
{
    Task<PaymentListResponse> GetPaymentsAsync(PaymentStatus? status, CancellationToken ct = default);
    Task<PaymentDto> RecordAsync(RecordPaymentRequest request, CancellationToken ct = default);
    Task<PaymentDto> GetPaymentAsync(Guid id, CancellationToken ct = default);
    Task<List<PaymentDto>> GetPaymentsForOrderAsync(Guid orderId, CancellationToken ct = default);
}

public interface IInvoiceService
{
    Task<InvoiceListResponse> GetInvoicesAsync(CancellationToken ct = default);
    Task<InvoiceDto> GetInvoiceAsync(Guid id, CancellationToken ct = default);
    Task<InvoiceDto> GetInvoiceByOrderAsync(Guid orderId, CancellationToken ct = default);
    Task<InvoiceDto> GenerateFromOrderAsync(Guid orderId, CancellationToken ct = default);
}

public interface INotificationService
{
    Task<NotificationListResponse> GetForAsync(string? role, Guid? userId, CancellationToken ct = default);
    Task MarkReadAsync(Guid notificationId, CancellationToken ct = default);
    Task MarkAllReadAsync(MarkNotificationsReadRequest request, CancellationToken ct = default);
}