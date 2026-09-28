using KanniMeat.Application.DTOs;
using KanniMeat.Application.Interfaces;
using KanniMeat.Domain.Entities;
using KanniMeat.Domain.Enums;

using Microsoft.EntityFrameworkCore;

namespace KanniMeat.Infrastructure.Services;

public sealed class DeliveryService : IDeliveryService
{
    private readonly IUnitOfWork _uow;

    public DeliveryService(IUnitOfWork uow) => _uow = uow;

    public async Task<DeliveryListResponse> GetDeliveriesAsync(DeliveryStatus? status, Guid? partnerId, CancellationToken ct = default)
    {
        var deliveries = await _uow.Deliveries
            .ListAsync(
                d => (!status.HasValue || d.Status == status.Value) && (!partnerId.HasValue || d.DeliveryPartnerId == partnerId.Value),
                q => q.Include(d => d.Order).Include(d => d.DeliveryPartner),
                q => q.OrderByDescending(d => d.CreatedAt),
                ct);
        return new DeliveryListResponse(deliveries.Select(Mapper.ToDto).ToList(), deliveries.Count);
    }

    public async Task<DeliveryDto> GetDeliveryForOrderAsync(Guid orderId, CancellationToken ct = default)
    {
        var delivery = await _uow.Deliveries
            .FirstOrDefaultAsync(d => d.OrderId == orderId, q => q.Include(d => d.Order).Include(d => d.DeliveryPartner), ct)
            ?? throw new KeyNotFoundException("No delivery scheduled for this order.");
        return Mapper.ToDto(delivery);
    }

    public async Task<DeliveryDto> AssignAsync(AssignDeliveryRequest request, CancellationToken ct = default)
    {
        var order = await _uow.Orders.GetByIdAsync(request.OrderId, ct)
            ?? throw new KeyNotFoundException("Order not found.");
        var partner = await _uow.DeliveryPartners.GetByIdAsync(request.DeliveryPartnerId, ct)
            ?? throw new KeyNotFoundException("Delivery partner not found.");

        var delivery = await _uow.Deliveries.FirstOrDefaultAsync(d => d.OrderId == request.OrderId, ct);
        if (delivery is null)
        {
            delivery = new Delivery
            {
                OrderId = request.OrderId,
                DeliveryPartnerId = partner.Id,
                Status = DeliveryStatus.Assigned,
                AssignedAt = DateTime.UtcNow,
                DeliveryOtp = new Random().Next(1000, 9999).ToString("D4"),
            };
            await _uow.Deliveries.AddAsync(delivery, ct);
        }
        else
        {
            delivery.DeliveryPartnerId = partner.Id;
            delivery.Status = DeliveryStatus.Assigned;
            delivery.AssignedAt = DateTime.UtcNow;
            _uow.Deliveries.Update(delivery);
        }

        if (order.Status == OrderStatus.Ready)
        {
            order.Status = OrderStatus.OutForDelivery;
            order.StatusHistory.Add(new OrderStatusHistory
            {
                Status = OrderStatus.OutForDelivery,
                Title = "Assigned to delivery partner",
                ChangedBy = partner.FullName,
            });
            _uow.Orders.Update(order);
        }

        await _uow.SaveAsync(ct);
        return Mapper.ToDto(delivery);
    }

    public async Task<DeliveryDto> StartAsync(Guid deliveryId, CancellationToken ct = default)
    {
        var delivery = await _uow.Deliveries.FirstOrDefaultAsync(d => d.Id == deliveryId, q => q.Include(d => d.Order).Include(d => d.DeliveryPartner), ct)
            ?? throw new KeyNotFoundException("Delivery not found.");

        delivery.Status = DeliveryStatus.PickedUp;
        delivery.PickedUpAt = DateTime.UtcNow;

        if (delivery.Order is not null && delivery.Order.Status == OrderStatus.OutForDelivery)
        {
            delivery.Order.Status = OrderStatus.OutForDelivery;
        }

        _uow.Deliveries.Update(delivery);
        await _uow.SaveAsync(ct);
        return Mapper.ToDto(delivery);
    }

    public async Task<DeliveryDto> CompleteAsync(Guid deliveryId, CompleteDeliveryRequest request, CancellationToken ct = default)
    {
        var delivery = await _uow.Deliveries.FirstOrDefaultAsync(d => d.Id == deliveryId, q => q.Include(d => d.Order).Include(d => d.DeliveryPartner), ct)
            ?? throw new KeyNotFoundException("Delivery not found.");

        if (!string.Equals(delivery.DeliveryOtp, request.DeliveryOtp, StringComparison.Ordinal))
            throw new UnauthorizedAccessException("Invalid OTP.");

        delivery.Status = DeliveryStatus.Delivered;
        delivery.DeliveredAt = DateTime.UtcNow;

        if (delivery.Order is not null)
        {
            delivery.Order.Status = OrderStatus.Delivered;
            delivery.Order.PaymentStatus = PaymentStatus.Paid;
            delivery.Order.StatusHistory.Add(new OrderStatusHistory
            {
                Status = OrderStatus.Delivered,
                Title = "Order Delivered",
                ChangedBy = delivery.DeliveryPartner?.FullName ?? "Delivery Partner",
            });
            _uow.Orders.Update(delivery.Order);
        }

        if (delivery.DeliveryPartner is not null)
        {
            delivery.DeliveryPartner.CompletedDeliveries += 1;
            _uow.DeliveryPartners.Update(delivery.DeliveryPartner);
        }

        _uow.Deliveries.Update(delivery);
        await _uow.SaveAsync(ct);
        return Mapper.ToDto(delivery);
    }

    public async Task<DeliveryDto> FailAsync(Guid deliveryId, string? reason, CancellationToken ct = default)
    {
        var delivery = await _uow.Deliveries.FirstOrDefaultAsync(d => d.Id == deliveryId, q => q.Include(d => d.Order), ct)
            ?? throw new KeyNotFoundException("Delivery not found.");

        delivery.Status = DeliveryStatus.Failed;
        delivery.Notes = reason;

        if (delivery.Order is not null && delivery.Order.Status == OrderStatus.OutForDelivery)
        {
            delivery.Order.Status = OrderStatus.Failed;
            delivery.Order.StatusHistory.Add(new OrderStatusHistory
            {
                Status = OrderStatus.Failed,
                Title = "Delivery failed",
                Note = reason,
            });
            _uow.Orders.Update(delivery.Order);
        }

        _uow.Deliveries.Update(delivery);
        await _uow.SaveAsync(ct);
        return Mapper.ToDto(delivery);
    }

    public async Task<DeliveryListResponse> GetHistoryAsync(Guid partnerId, CancellationToken ct = default)
    {
        var deliveries = await _uow.Deliveries
            .ListAsync(
                d => d.DeliveryPartnerId == partnerId && d.Status == DeliveryStatus.Delivered,
                q => q.Include(d => d.Order),
                q => q.OrderByDescending(d => d.DeliveredAt),
                ct);
        return new DeliveryListResponse(deliveries.Select(Mapper.ToDto).ToList(), deliveries.Count);
    }

    public async Task<DeliveryPartnerListResponse> GetPartnersAsync(string? city, CancellationToken ct = default)
    {
        var partners = await _uow.DeliveryPartners
            .ListAsync(p => (string.IsNullOrEmpty(city) || p.City == city) && p.IsActive, ct);
        return new DeliveryPartnerListResponse(partners.Select(Mapper.ToDto).ToList(), partners.Count);
    }

    public async Task<DeliveryPartnerDto> CreatePartnerAsync(CreateDeliveryPartnerRequest request, CancellationToken ct = default)
    {
        var partner = new DeliveryPartner
        {
            FullName = request.FullName,
            Phone = request.Phone,
            City = request.City,
            Area = request.Area,
            VehicleNumber = request.VehicleNumber,
            ShopId = request.ShopId,
            IsActive = true,
        };
        await _uow.DeliveryPartners.AddAsync(partner, ct);
        await _uow.SaveAsync(ct);
        return Mapper.ToDto(partner);
    }
}