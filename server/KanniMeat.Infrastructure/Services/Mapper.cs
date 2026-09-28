using KanniMeat.Application.DTOs;
using KanniMeat.Domain.Entities;
using KanniMeat.Domain.Enums;

namespace KanniMeat.Infrastructure.Services;

public static class Mapper
{
    public static UserDto ToDto(User u)
        => new(
            u.Id, u.FullName, u.Phone, u.Email,
            u.UserRoles.Select(r => r.Role.Name).ToArray(),
            u.CompanyId, u.ShopId, u.Status);

    public static CompanyDto ToDto(Company c, int shopCount, decimal monthlyRevenue, int ordersToday)
        => new(c.Id, c.Name, c.City, c.Gstin, c.Status, shopCount, monthlyRevenue, ordersToday);

    public static ShopDto ToDto(Shop s, string companyName)
        => new(
            s.Id, s.Name, s.City, s.Area, s.Pincode, s.CompanyId, companyName,
            s.ManagerName, s.ManagerPhone, s.Status, s.Rating,
            s.Orders.Count(o => o.DeliveryDate.Date == DateTime.Today),
            s.Orders.Where(o => o.DeliveryDate >= DateTime.UtcNow.AddMonths(-1)).Sum(o => o.Total));

    public static ProductDto ToDto(Product p)
        => new(
            p.Id, p.Name, p.CategoryId, p.CategoryEntity?.Name ?? p.Category.ToString(), p.Category,
            p.Emoji, p.PricePerKilogram, p.Freshness, p.Quality,
            p.ShopId, p.Shop?.Name ?? string.Empty, p.Shop?.Area ?? string.Empty,
            p.Description, p.Unit, p.Status != ProductStatus.Discontinued && p.IsActive, p.IsActive,
            p.CuttingPreferences.Select(c => c.Name).ToList());

    public static ProductCategoryDto ToDto(ProductCategoryEntity c)
        => new(c.Id, c.Name, c.Category, c.Emoji, c.Description, c.IsActive);

    public static AddressDto ToDto(Address a)
        => new(a.Id, a.Label, a.Line1, a.Line2, a.Area, a.City, a.Pincode, a.Phone, a.IsDefault);

    public static CustomerDto ToDto(Customer c)
        => new(c.Id, c.FullName, c.Phone, c.Email, c.Addresses.Select(ToDto).ToList());

    public static CartDto ToDto(Cart? cart)
    {
        if (cart is null) return new CartDto(Guid.Empty, null, new List<CartLineDto>(), 0, 0m);
        var lines = cart.Items
            .Select(i => new CartLineDto(
                i.ProductId, i.Product?.Name ?? string.Empty, i.Product?.Emoji ?? string.Empty,
                i.QuantityKg, i.CutPreference, i.UnitPrice,
                Math.Round(i.UnitPrice * i.QuantityKg, 2)))
            .ToList();
        return new CartDto(cart.Id, cart.ShopId, lines, lines.Count, Math.Round(lines.Sum(l => l.LineTotal), 2));
    }

    public static OrderItemDto ToDto(OrderItem i)
        => new(i.ProductId, i.ProductName, i.Emoji ?? string.Empty, i.WeightKg, i.CutPreference, i.PricePerKilogram, Math.Round(i.WeightKg * i.PricePerKilogram, 2));

    public static OrderStatusEventDto ToDto(OrderStatusHistory h)
        => new(h.Status, h.Title, h.Note, h.CreatedAt, h.ChangedBy);

    public static OrderDto ToDto(Order o)
    {
        var history = o.StatusHistory.OrderBy(h => h.CreatedAt).ToList();
        var delivery = o.Deliveries.FirstOrDefault();
        var latest = history.LastOrDefault();

        return new OrderDto(
            o.Id, o.OrderNumber, o.CustomerId, o.Customer?.FullName ?? o.User?.FullName ?? "Guest",
            o.Customer?.Phone ?? o.User?.Phone ?? string.Empty,
            o.ShopId, o.Shop?.Name ?? string.Empty, o.Shop?.Area ?? string.Empty, o.Shop?.City ?? string.Empty,
            o.OrderItems.Select(ToDto).ToList(),
            o.Subtotal, o.DeliveryFee, o.Discount, o.Tax, o.Total, o.TotalKg,
            o.DeliveryDate, o.SlotLabel, o.PaymentMethod, o.PaymentStatus, o.Status,
            BuildAddressText(o), o.Address?.Area ?? string.Empty,
            o.InvoiceId?.ToString(),
            history.Select(ToDto).ToList(),
            delivery?.DeliveryPartnerId, delivery?.DeliveryPartnerId != null);

        static string BuildAddressText(Order o)
        {
            var a = o.Address;
            if (a is null) return o.Shop?.Area ?? string.Empty;
            return $"{a.Line1}{(string.IsNullOrEmpty(a.Line2) ? "" : ", " + a.Line2)}, {a.Area}, {a.City} - {a.Pincode}";
        }
    }

    public static InventoryItemDto ToDto(InventoryItem i)
        => new(
            i.Id, i.ShopId, i.Shop?.Name ?? string.Empty, i.ProductId,
            i.Product?.Name ?? string.Empty, i.Product?.Emoji ?? string.Empty, i.Product?.Category ?? ProductCategory.Other,
            i.AvailableKg, i.ReservedKg, i.ExpectedDemandKg, i.UnitPricePerKilogram,
            Math.Round(i.AvailableKg - i.ReservedKg, 3), i.StockLevel);

    public static InventoryTransactionDto ToDto(InventoryTransaction t)
        => new(
            t.Id, t.InventoryItemId, t.Type, t.QuantityKg, t.OrderId, t.Note,
            t.CreatedAt, t.CreatedByUser?.FullName ?? string.Empty);

    public static DeliveryPartnerDto ToDto(DeliveryPartner p)
        => new(p.Id, p.FullName, p.Phone, p.City, p.Area, p.VehicleNumber, p.IsActive, p.CompletedDeliveries, p.Rating);

    public static DeliveryDto ToDto(Delivery d)
        => new(
            d.Id, d.OrderId, d.Order?.OrderNumber ?? string.Empty,
            BuildOrderAddress(d.Order), d.DeliveryPartnerId, d.DeliveryPartner?.FullName,
            d.Status, d.AssignedAt, d.DeliveredAt, d.DeliveryOtp);

    static string BuildOrderAddress(Order? o)
    {
        if (o is null) return string.Empty;
        if (o.Address is not null)
            return $"{o.Address.Line1}, {o.Address.Area}, {o.Address.City} - {o.Address.Pincode}";
        return $"{o.Shop?.Area}";
    }

    public static PaymentDto ToDto(Payment p)
        => new(p.Id, p.OrderId, p.Order?.OrderNumber, p.InvoiceId, p.Amount, p.Method, p.Status, p.GatewayReference, p.PaidAt, p.FailureReason);

    public static InvoiceDto ToDto(Invoice i)
        => new(
            i.Id, i.InvoiceNumber, i.OrderId, i.CustomerName, i.CustomerPhone,
            i.ShopName, i.AddressText, i.InvoiceItems.Select(oi =>
                new OrderItemDto(Guid.Empty, oi.ProductName, string.Empty, oi.WeightKg, null, oi.PricePerKilogram, Math.Round(oi.WeightKg * oi.PricePerKilogram, 2))).ToList(),
            i.Subtotal, i.DeliveryFee, i.Discount, i.Tax, i.Total,
            i.PaymentStatus, i.PaymentMethod, i.Status, i.IssuedAt);

    public static NotificationDto ToDto(Notification n)
        => new(
            n.Id, n.Role, n.Title, n.Body, n.Icon, n.IsRead, n.CreatedAt,
            TimeAgo(n.CreatedAt));

    static string TimeAgo(DateTime at)
    {
        var diff = DateTime.UtcNow - at;
        if (diff.TotalMinutes < 1) return "Just now";
        if (diff.TotalMinutes < 60) return $"{(int)diff.TotalMinutes}m ago";
        if (diff.TotalHours < 24) return $"{(int)diff.TotalHours}h ago";
        return $"{at:dd MMM}";
    }
}