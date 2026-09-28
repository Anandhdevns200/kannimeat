using KanniMeat.Application.DTOs;
using KanniMeat.Application.Interfaces;
using KanniMeat.Domain.Entities;
using KanniMeat.Domain.Enums;

using Microsoft.EntityFrameworkCore;

namespace KanniMeat.Infrastructure.Services;

public sealed class OrderService : IOrderService
{
    private readonly IUnitOfWork _uow;
    private readonly IInventoryService _inventory;

    public OrderService(IUnitOfWork uow, IInventoryService inventory)
    {
        _uow = uow;
        _inventory = inventory;
    }

    public async Task<OrderListResponse> GetOrdersAsync(OrderQuery query, CancellationToken ct = default)
    {
        var q = _uow.Orders.Query()
            .Include(o => o.Customer)
            .Include(o => o.User)
            .Include(o => o.Shop)
            .Include(o => o.Address)
            .Include(o => o.OrderItems)
            .Include(o => o.StatusHistory)
            .Include(o => o.Deliveries)
            .Where(o => !query.ShopId.HasValue || o.ShopId == query.ShopId.Value)
            .Where(o => !query.CustomerId.HasValue || o.CustomerId == query.CustomerId.Value)
            .Where(o => !query.Status.HasValue || o.Status == query.Status.Value)
            .Where(o => string.IsNullOrEmpty(query.Search) || o.OrderNumber.Contains(query.Search) || o.Customer!.FullName.Contains(query.Search))
            .Where(o => !query.From.HasValue || o.DeliveryDate >= query.From.Value)
            .Where(o => !query.To.HasValue || o.DeliveryDate <= query.To.Value);

        var total = await q.CountAsync(ct);
        var items = await q
            .OrderByDescending(o => o.CreatedAt)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);

        return new OrderListResponse(items.Select(Mapper.ToDto).ToList(), total);
    }

    public async Task<OrderDto> GetOrderAsync(Guid id, CancellationToken ct = default)
    {
        var order = await LoadOrderAsync(o => o.Id == id, ct)
            ?? throw new KeyNotFoundException("Order not found.");
        return Mapper.ToDto(order);
    }

    public async Task<OrderDto> GetOrderByNumberAsync(string orderNumber, CancellationToken ct = default)
    {
        var order = await LoadOrderAsync(o => o.OrderNumber == orderNumber, ct)
            ?? throw new KeyNotFoundException("Order not found.");
        return Mapper.ToDto(order);
    }

    public async Task<OrderDto> PlaceOrderAsync(Guid userId, PlaceOrderRequest request, CancellationToken ct = default)
    {
        var shop = await _uow.Shops.GetByIdAsync(request.ShopId, ct)
            ?? throw new KeyNotFoundException("Shop not found.");

        var customer = await _uow.Customers.FirstOrDefaultAsync(c => c.UserId == userId, ct);
        var address = request.AddressId.HasValue
            ? await _uow.Addresses.GetByIdAsync(request.AddressId.Value, ct)
            : null;

        var orderItems = new List<OrderItem>();
        var subtotal = 0m;
        var totalKg = 0m;

        foreach (var input in request.Items)
        {
            var product = await _uow.Products
                .FirstOrDefaultAsync(p => p.Id == input.ProductId, q => q.Include(p => p.Shop), ct)
                ?? throw new KeyNotFoundException($"Product {input.ProductId} not found.");

            var line = new OrderItem
            {
                ProductId = product.Id,
                ProductName = product.Name,
                Emoji = product.Emoji,
                WeightKg = input.WeightKg,
                CutPreference = input.CutPreference,
                PricePerKilogram = product.PricePerKilogram,
            };
            orderItems.Add(line);
            subtotal += line.WeightKg * line.PricePerKilogram;
            totalKg += line.WeightKg;
        }

        var discount = 0m;
        var deliveryFee = subtotal > shop.FreeDeliveryThreshold ? 0m : shop.DeliveryFee;
        var tax = Math.Round((subtotal + deliveryFee) * (shop.GstRate / 100m), 2);
        var total = subtotal + deliveryFee + tax - discount;

        var order = new Order
        {
            OrderNumber = await GenerateOrderNumberAsync(shop, ct),
            CustomerId = customer?.Id,
            UserId = userId,
            ShopId = shop.Id,
            Shop = shop,
            AddressId = address?.Id,
            Address = address,
            OrderItems = orderItems,
            Subtotal = subtotal,
            DeliveryFee = deliveryFee,
            Discount = discount,
            Tax = tax,
            Total = total,
            TotalKg = totalKg,
            DeliveryDate = request.DeliveryDate,
            SlotLabel = request.SlotLabel,
            PaymentMethod = request.PaymentMethod,
            PaymentStatus = request.PaymentMethod == PaymentMethod.Cod ? PaymentStatus.Pending : PaymentStatus.Paid,
            Status = OrderStatus.Placed,
            Notes = request.Notes,
            StatusHistory =
            {
                new OrderStatusHistory { Status = OrderStatus.Placed, Title = "Order Placed", ChangedBy = customer?.FullName ?? "Customer", Note = "Order received" }
            },
        };

        await _uow.Orders.AddAsync(order, ct);
        await _uow.SaveAsync(ct);

        // Reserve inventory for each line
        foreach (var line in orderItems)
        {
            var inventoryItem = await GetOrCreateInventoryAsync(shop.Id, line.ProductId, line.PricePerKilogram, ct);
            await _inventory.AdjustAsync(new AdjustInventoryRequest(
                InventoryItemId: inventoryItem.Id,
                QuantityKg: line.WeightKg,
                Type: TransactionType.Reserved,
                Note: $"Reserved for {order.OrderNumber}"), userId, ct);
        }

        // Clear the user's cart once the order is placed
        var cart = await _uow.Carts.FirstOrDefaultAsync(c => c.UserId == userId && c.IsActive, q => q.Include(c => c.Items), ct);
        if (cart is not null)
        {
            foreach (var ci in cart.Items) _uow.CartItems.Remove(ci);
            cart.IsActive = false;
            _uow.Carts.Update(cart);
            await _uow.SaveAsync(ct);
        }

        var invoiceService = new InvoiceService(_uow);
        var invoice = await invoiceService.GenerateFromOrderAsync(order.Id, ct);
        order.InvoiceId = invoice.Id;
        _uow.Orders.Update(order);
        await _uow.SaveAsync(ct);

        return await GetOrderAsync(order.Id, ct);
    }

    public async Task<OrderDto> UpdateStatusAsync(Guid orderId, UpdateOrderStatusRequest request, Guid changedByUserId, CancellationToken ct = default)
    {
        var order = await LoadOrderAsync(o => o.Id == orderId, q => q.Include(o => o.OrderItems), ct)
            ?? throw new KeyNotFoundException("Order not found.");

        var allowed = AllowedTransitions(order.Status);
        if (!allowed.Contains(request.Status) && request.Status != order.Status)
            throw new InvalidOperationException($"Cannot move order from {order.Status} to {request.Status}.");

        var changedBy = (await _uow.Users.GetByIdAsync(changedByUserId, ct))?.FullName ?? "System";

        order.Status = request.Status;
        order.StatusHistory.Add(new OrderStatusHistory
        {
            Status = request.Status,
            Title = StatusTitle(request.Status),
            Note = request.Note,
            ChangedBy = changedBy,
        });

        switch (request.Status)
        {
            case OrderStatus.Cancelled or OrderStatus.Failed:
                // Release reservations back to available stock
                foreach (var line in order.OrderItems)
                {
                    var item = await _uow.InventoryItems.FirstOrDefaultAsync(
                        i => i.ShopId == order.ShopId && i.ProductId == line.ProductId, ct);
                    if (item is not null)
                    {
                        item.ReservedKg = Math.Max(0, item.ReservedKg - line.WeightKg);
                        _uow.InventoryItems.Update(item);
                        await _uow.InventoryTransactions.AddAsync(new InventoryTransaction
                        {
                            InventoryItem = item, Type = TransactionType.Released,
                            QuantityKg = line.WeightKg, OrderId = order.Id,
                            Note = $"Released due to {request.Status}",
                            CreatedByUserId = changedByUserId,
                        }, ct);
                    }
                }
                break;

            case OrderStatus.Delivered:
                // Release reservation and log outbound consumption
                foreach (var line in order.OrderItems)
                {
                    var item = await _uow.InventoryItems.FirstOrDefaultAsync(
                        i => i.ShopId == order.ShopId && i.ProductId == line.ProductId, ct);
                    if (item is not null)
                    {
                        item.AvailableKg = Math.Max(0, item.AvailableKg - line.WeightKg);
                        item.ReservedKg = Math.Max(0, item.ReservedKg - line.WeightKg);
                        _uow.InventoryItems.Update(item);
                        await _uow.InventoryTransactions.AddAsync(new InventoryTransaction
                        {
                            InventoryItem = item, Type = TransactionType.Outbound,
                            QuantityKg = line.WeightKg, OrderId = order.Id,
                            Note = $"Delivered via {order.OrderNumber}",
                            CreatedByUserId = changedByUserId,
                        }, ct);
                    }
                }
                break;
        }

        _uow.Orders.Update(order);
        await _uow.SaveAsync(ct);
        return await GetOrderAsync(order.Id, ct);
    }

    public async Task<DashboardDataDto> GetDashboardAsync(string role, Guid? scopeId, CancellationToken ct = default)
    {
        IQueryable<Order> orders = _uow.Orders.Query()
            .Include(o => o.Shop)
            .Include(o => o.Customer)
            .Include(o => o.OrderItems);

        if (role is "SHOP_ADMIN" or "SHOP_STAFF" && scopeId.HasValue)
            orders = orders.Where(o => o.ShopId == scopeId.Value);

        if (role is "COMPANY_ADMIN" && scopeId.HasValue)
        {
            var shopIds = await _uow.Shops.Query().Where(s => s.CompanyId == scopeId.Value).Select(s => s.Id).ToListAsync(ct);
            orders = orders.Where(o => shopIds.Contains(o.ShopId));
        }

        var all = await orders.ToListAsync(ct);
        var today = DateTime.Today;

        var todayOrders = all.Where(o => o.DeliveryDate.Date == today).ToList();
        var monthRevenue = all.Where(o => o.DeliveryDate >= today.AddMonths(-1)).Sum(o => o.Total);
        var avgOrder = all.Count > 0 ? all.Average(o => o.Total) : 0m;

        var metrics = new List<MetricCardDto>
        {
            new("Today's Orders", todayOrders.Count.ToString(), "+12%", "up", "receipt_long"),
            new("Month Revenue", $"₹{monthRevenue:n0}", "+8%", "up", "payments"),
            new("Pending Orders", all.Count(o => o.Status is OrderStatus.Placed or OrderStatus.Confirmed or OrderStatus.Processing).ToString(), "-3%", "down", "schedule"),
            new("Avg Order Value", $"₹{avgOrder:n0}", "+2%", "up", "shopping_bag"),
        };

        var revenueTrend = all
            .GroupBy(o => o.DeliveryDate.Date.ToString("ddd"))
            .OrderBy(g => g.Key)
            .Select(g => new RevenuePointDto(g.Key, g.Sum(o => o.Total)))
            .ToList();

        var categorySales = all
            .SelectMany(o => o.OrderItems)
            .GroupBy(i => i.Emoji ?? "#")
            .Select(g => new CategorySalesDto(g.Key, Math.Round(g.Sum(i => i.WeightKg * i.PricePerKilogram), 2)))
            .Take(5)
            .ToList();

        var cityDistribution = all
            .GroupBy(o => o.Shop?.City ?? "Unknown")
            .Select(g => new CityDistributionDto(g.Key, g.Count(), g.Sum(o => o.Total)))
            .ToList();

        var recent = all
            .OrderByDescending(o => o.CreatedAt)
            .Take(8)
            .ToList();

        var recentDtos = recent.Select(Mapper.ToDto).ToList();

        return new DashboardDataDto(metrics, revenueTrend, categorySales, cityDistribution, recentDtos);
    }

    // ------------------------------------------------------------------ helpers

    private async Task<Order?> LoadOrderAsync(System.Linq.Expressions.Expression<Func<Order, bool>> predicate, CancellationToken ct)
        => await _uow.Orders.FirstOrDefaultAsync(
            predicate,
            q => q.Include(o => o.Customer)
                .Include(o => o.User)
                .Include(o => o.Shop)
                .Include(o => o.Address)
                .Include(o => o.OrderItems)
                .Include(o => o.StatusHistory)
                .Include(o => o.Deliveries).ThenInclude(d => d.DeliveryPartner),
            ct);

    private async Task<Order?> LoadOrderAsync(System.Linq.Expressions.Expression<Func<Order, bool>> predicate, Func<IQueryable<Order>, IQueryable<Order>> include, CancellationToken ct)
        => await _uow.Orders.FirstOrDefaultAsync(predicate, include, ct);

    private static HashSet<OrderStatus> AllowedTransitions(OrderStatus current) => current switch
    {
        OrderStatus.Placed => new() { OrderStatus.Confirmed, OrderStatus.Processing, OrderStatus.Cancelled },
        OrderStatus.Confirmed => new() { OrderStatus.Processing, OrderStatus.Cancelled },
        OrderStatus.Processing => new() { OrderStatus.Packed, OrderStatus.Cancelled, OrderStatus.Failed },
        OrderStatus.Packed => new() { OrderStatus.Ready, OrderStatus.Cancelled },
        OrderStatus.Ready => new() { OrderStatus.OutForDelivery, OrderStatus.Cancelled },
        OrderStatus.OutForDelivery => new() { OrderStatus.Delivered, OrderStatus.Failed },
        _ => new() { OrderStatus.Cancelled, OrderStatus.Failed },
    };

    private static string StatusTitle(OrderStatus status) => status switch
    {
        OrderStatus.Placed => "Order Placed",
        OrderStatus.Confirmed => "Order Confirmed",
        OrderStatus.Processing => "Processing",
        OrderStatus.Packed => "Packed",
        OrderStatus.Ready => "Ready for Delivery",
        OrderStatus.OutForDelivery => "Out for Delivery",
        OrderStatus.Delivered => "Delivered",
        OrderStatus.Cancelled => "Cancelled",
        OrderStatus.Failed => "Failed",
        _ => status.ToString(),
    };

    private async Task<string> GenerateOrderNumberAsync(Shop shop, CancellationToken ct)
    {
        var count = await _uow.Orders.CountAsync(o => o.ShopId == shop.Id, ct);
        var datePart = DateTime.UtcNow.ToString("yyMMdd");
        var seq = (count + 1 + DateTime.UtcNow.DayOfYear).ToString("D4");
        return $"ORD-{shop.City.Substring(0, 3).ToUpperInvariant()}-{datePart}-{seq}";
    }

    private async Task<InventoryItem> GetOrCreateInventoryAsync(Guid shopId, Guid productId, decimal unitPrice, CancellationToken ct)
    {
        var item = await _uow.InventoryItems.FirstOrDefaultAsync(i => i.ShopId == shopId && i.ProductId == productId, ct);
        if (item is not null) return item;

        item = new InventoryItem
        {
            ShopId = shopId,
            ProductId = productId,
            AvailableKg = 20m,
            ExpectedDemandKg = 5m,
            UnitPricePerKilogram = unitPrice,
        };
        await _uow.InventoryItems.AddAsync(item, ct);
        await _uow.SaveAsync(ct);
        return item;
    }
}