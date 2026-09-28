using KanniMeat.Application.DTOs;
using KanniMeat.Application.Interfaces;
using KanniMeat.Domain.Entities;
using KanniMeat.Domain.Enums;

using Microsoft.EntityFrameworkCore;

namespace KanniMeat.Infrastructure.Services;

public sealed class InventoryService : IInventoryService
{
    private readonly IUnitOfWork _uow;

    public InventoryService(IUnitOfWork uow) => _uow = uow;

    public async Task<InventoryListResponse> GetInventoryAsync(Guid? shopId, CancellationToken ct = default)
    {
        var items = await _uow.InventoryItems
            .ListAsync(
                i => !shopId.HasValue || i.ShopId == shopId.Value,
                q => q.Include(i => i.Product).Include(i => i.Shop),
                ct);
        return new InventoryListResponse(items.Select(Mapper.ToDto).ToList(), items.Count);
    }

    public async Task<InventoryItemDto> AddInventoryAsync(AddInventoryRequest request, CancellationToken ct = default)
    {
        var product = await _uow.Products.GetByIdAsync(request.ProductId, ct)
            ?? throw new KeyNotFoundException("Product not found.");

        var existing = await _uow.InventoryItems.FirstOrDefaultAsync(i => i.ShopId == request.ShopId && i.ProductId == request.ProductId, ct);
        if (existing is not null)
        {
            existing.AvailableKg += request.QuantityKg;
            existing.UnitPricePerKilogram = request.UnitPricePerKg;
            existing.ExpectedDemandKg = request.ExpectedDemandKg;
            _uow.InventoryItems.Update(existing);
            await _uow.SaveAsync(ct);
            return Mapper.ToDto(existing);
        }

        var item = new InventoryItem
        {
            ShopId = request.ShopId,
            ProductId = request.ProductId,
            AvailableKg = request.QuantityKg,
            ExpectedDemandKg = request.ExpectedDemandKg,
            UnitPricePerKilogram = request.UnitPricePerKg,
        };
        await _uow.InventoryItems.AddAsync(item, ct);
        await _uow.SaveAsync(ct);
        return Mapper.ToDto(item);
    }

    public async Task<InventoryItemDto> AdjustAsync(AdjustInventoryRequest request, Guid userId, CancellationToken ct = default)
    {
        var item = await _uow.InventoryItems
            .FirstOrDefaultAsync(i => i.Id == request.InventoryItemId, q => q.Include(i => i.Product).Include(i => i.Shop), ct)
            ?? throw new KeyNotFoundException("Inventory item not found.");

        switch (request.Type)
        {
            case TransactionType.Inbound:
                item.AvailableKg += request.QuantityKg;
                break;
            case TransactionType.Reserved:
                item.ReservedKg += request.QuantityKg;
                break;
            case TransactionType.Released:
                item.ReservedKg = Math.Max(0, item.ReservedKg - request.QuantityKg);
                break;
            case TransactionType.Outbound:
                item.AvailableKg = Math.Max(0, item.AvailableKg - request.QuantityKg);
                break;
            case TransactionType.Wastage:
            case TransactionType.Adjustment:
                item.AvailableKg = Math.Max(0, item.AvailableKg + request.QuantityKg);
                break;
        }

        await _uow.InventoryTransactions.AddAsync(new InventoryTransaction
        {
            InventoryItem = item,
            Type = request.Type,
            QuantityKg = Math.Abs(request.QuantityKg),
            Note = request.Note,
            CreatedByUserId = userId,
        }, ct);

        _uow.InventoryItems.Update(item);
        await _uow.SaveAsync(ct);
        return Mapper.ToDto(item);
    }

    public async Task<IEnumerable<InventoryTransactionDto>> GetTransactionHistoryAsync(Guid inventoryItemId, CancellationToken ct = default)
    {
        var transactions = await _uow.InventoryTransactions
            .ListAsync(
                t => t.InventoryItemId == inventoryItemId,
                q => q.Include(t => t.CreatedByUser),
                q => q.OrderByDescending(t => t.CreatedAt),
                ct);
        return transactions.Select(Mapper.ToDto);
    }
}

public sealed class InvoiceService : IInvoiceService
{
    private readonly IUnitOfWork _uow;

    public InvoiceService(IUnitOfWork uow) => _uow = uow;

    public async Task<InvoiceListResponse> GetInvoicesAsync(CancellationToken ct = default)
    {
        var invoices = await _uow.Invoices
            .ListAsync(i => true, q => q.Include(i => i.InvoiceItems).Include(i => i.Order), q => q.OrderByDescending(i => i.IssuedAt), ct);
        return new InvoiceListResponse(invoices.Select(Mapper.ToDto).ToList(), invoices.Count);
    }

    public async Task<InvoiceDto> GetInvoiceAsync(Guid id, CancellationToken ct = default)
    {
        var invoice = await _uow.Invoices.FirstOrDefaultAsync(i => i.Id == id, q => q.Include(i => i.InvoiceItems).Include(i => i.Order), ct)
            ?? throw new KeyNotFoundException("Invoice not found.");
        return Mapper.ToDto(invoice);
    }

    public async Task<InvoiceDto> GetInvoiceByOrderAsync(Guid orderId, CancellationToken ct = default)
    {
        var invoice = await _uow.Invoices.FirstOrDefaultAsync(i => i.OrderId == orderId, q => q.Include(i => i.InvoiceItems).Include(i => i.Order), ct)
            ?? throw new KeyNotFoundException("Invoice not found.");
        return Mapper.ToDto(invoice);
    }

    public async Task<InvoiceDto> GenerateFromOrderAsync(Guid orderId, CancellationToken ct = default)
    {
        var existing = await _uow.Invoices.FirstOrDefaultAsync(i => i.OrderId == orderId, ct);
        if (existing is not null) return await GetInvoiceAsync(existing.Id, ct);

        var order = await _uow.Orders.FirstOrDefaultAsync(
            o => o.Id == orderId,
            q => q.Include(o => o.OrderItems).Include(o => o.Shop).Include(o => o.Address).Include(o => o.Customer).Include(o => o.User),
            ct) ?? throw new KeyNotFoundException("Order not found.");

        var count = await _uow.Invoices.CountAsync(null, ct);
        var invoice = new Invoice
        {
            InvoiceNumber = $"INV-2026-{10245 + count + 1}",
            OrderId = order.Id,
            CustomerId = order.CustomerId,
            CustomerName = order.Customer?.FullName ?? order.User?.FullName ?? "Guest",
            CustomerPhone = order.Customer?.Phone ?? order.User?.Phone ?? string.Empty,
            ShopName = order.Shop?.Name ?? string.Empty,
            AddressText = order.Address is not null
                ? $"{order.Address.Line1}, {order.Address.Area}, {order.Address.City} - {order.Address.Pincode}"
                : string.Empty,
            Subtotal = order.Subtotal,
            DeliveryFee = order.DeliveryFee,
            Discount = order.Discount,
            Tax = order.Tax,
            Total = order.Total,
            PaymentStatus = order.PaymentStatus,
            PaymentMethod = order.PaymentMethod,
            Status = InvoiceStatus.Issued,
            IssuedAt = DateTime.UtcNow,
        };

        foreach (var item in order.OrderItems)
        {
            invoice.InvoiceItems.Add(new InvoiceItem
            {
                ProductId = item.ProductId,
                ProductName = item.ProductName,
                WeightKg = item.WeightKg,
                PricePerKilogram = item.PricePerKilogram,
            });
        }

        await _uow.Invoices.AddAsync(invoice, ct);
        await _uow.SaveAsync(ct);
        return await GetInvoiceAsync(invoice.Id, ct);
    }
}

public sealed class PaymentService : IPaymentService
{
    private readonly IUnitOfWork _uow;

    public PaymentService(IUnitOfWork uow) => _uow = uow;

    public async Task<PaymentListResponse> GetPaymentsAsync(PaymentStatus? status, CancellationToken ct = default)
    {
        var payments = await _uow.Payments
            .ListAsync(p => !status.HasValue || p.Status == status.Value, q => q.Include(p => p.Order), q => q.OrderByDescending(p => p.CreatedAt), ct);
        return new PaymentListResponse(payments.Select(Mapper.ToDto).ToList(), payments.Count);
    }

    public async Task<PaymentDto> GetPaymentAsync(Guid id, CancellationToken ct = default)
    {
        var payment = await _uow.Payments.FirstOrDefaultAsync(p => p.Id == id, q => q.Include(p => p.Order), ct)
            ?? throw new KeyNotFoundException("Payment not found.");
        return Mapper.ToDto(payment);
    }

    public async Task<List<PaymentDto>> GetPaymentsForOrderAsync(Guid orderId, CancellationToken ct = default)
    {
        var payments = await _uow.Payments.ListAsync(p => p.OrderId == orderId, q => q.Include(p => p.Order), ct);
        return payments.Select(Mapper.ToDto).ToList();
    }

    public async Task<PaymentDto> RecordAsync(RecordPaymentRequest request, CancellationToken ct = default)
    {
        var order = await _uow.Orders.GetByIdAsync(request.OrderId ?? Guid.Empty, ct);
        var payment = new Payment
        {
            OrderId = request.OrderId,
            Amount = request.Amount,
            Method = request.Method,
            Status = PaymentStatus.Paid,
            GatewayReference = request.GatewayReference,
            PaidAt = DateTime.UtcNow,
        };
        await _uow.Payments.AddAsync(payment, ct);

        if (order is not null)
        {
            order.PaymentStatus = PaymentStatus.Paid;
            _uow.Orders.Update(order);
            await _uow.Invoices.FirstOrDefaultAsync(i => i.OrderId == order.Id, ct).ContinueWith(async t =>
            {
                var invoice = await t;
                if (invoice is not null)
                {
                    invoice.PaymentStatus = PaymentStatus.Paid;
                    invoice.Status = InvoiceStatus.Paid;
                    _uow.Invoices.Update(invoice);
                }
            }, ct);
        }

        await _uow.SaveAsync(ct);
        return Mapper.ToDto(payment);
    }
}

public sealed class NotificationService : INotificationService
{
    private readonly IUnitOfWork _uow;

    public NotificationService(IUnitOfWork uow) => _uow = uow;

    public async Task<NotificationListResponse> GetForAsync(string? role, Guid? userId, CancellationToken ct = default)
    {
        var items = await _uow.Notifications
            .ListAsync(
                n => (string.IsNullOrEmpty(role) || n.Role == role) && (!userId.HasValue || n.UserId == userId.Value),
                q => q.OrderByDescending(n => n.CreatedAt),
                ct);
        return new NotificationListResponse(items.Select(Mapper.ToDto).ToList(), items.Count);
    }

    public async Task MarkReadAsync(Guid notificationId, CancellationToken ct = default)
    {
        var notification = await _uow.Notifications.GetByIdAsync(notificationId, ct);
        if (notification is null) return;
        notification.IsRead = true;
        notification.ReadAt = DateTime.UtcNow;
        _uow.Notifications.Update(notification);
        await _uow.SaveAsync(ct);
    }

    public async Task MarkAllReadAsync(MarkNotificationsReadRequest request, CancellationToken ct = default)
    {
        var notifications = await _uow.Notifications
            .ListAsync(n => request.Ids == null || request.Ids.Contains(n.Id), ct);
        foreach (var n in notifications)
        {
            n.IsRead = true;
            n.ReadAt = DateTime.UtcNow;
            _uow.Notifications.Update(n);
        }
        await _uow.SaveAsync(ct);
    }
}