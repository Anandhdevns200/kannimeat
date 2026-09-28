using KanniMeat.Application.DTOs;
using KanniMeat.Application.Interfaces;
using KanniMeat.Domain.Enums;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KanniMeat.Api.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrdersController : ApiControllerBase
{
    private readonly IOrderService _orders;

    public OrdersController(IOrderService orders) => _orders = orders;

    [HttpGet]
    public async Task<ActionResult<OrderListResponse>> List(
        [FromQuery] Guid? shopId,
        [FromQuery] Guid? customerId,
        [FromQuery] OrderStatus? status,
        [FromQuery] string? search,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var effectiveShopId = shopId ?? CurrentShopId();
        return Ok(await _orders.GetOrdersAsync(new OrderQuery(effectiveShopId, customerId, status, search, from, to, page, pageSize), ct));
    }

    [HttpGet("dashboard")]
    public async Task<ActionResult<DashboardDataDto>> Dashboard(CancellationToken ct)
    {
        var role = User.IsInRole("SUPER_ADMIN") ? "SUPER_ADMIN"
            : User.IsInRole("COMPANY_ADMIN") ? "COMPANY_ADMIN"
            : User.IsInRole("DELIVERY_MANAGER") ? "DELIVERY_MANAGER"
            : User.IsInRole("SHOP_ADMIN") || User.IsInRole("SHOP_STAFF") ? "SHOP_ADMIN"
            : "CUSTOMER";
        var scopeId = role switch
        {
            "COMPANY_ADMIN" => CurrentCompanyId(),
            "SHOP_ADMIN" => CurrentShopId(),
            _ => null,
        };
        return Ok(await _orders.GetDashboardAsync(role, scopeId, ct));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<OrderDto>> Get(Guid id, CancellationToken ct)
        => Ok(await _orders.GetOrderAsync(id, ct));

    [HttpGet("by-number/{orderNumber}")]
    public async Task<ActionResult<OrderDto>> ByNumber(string orderNumber, CancellationToken ct)
        => Ok(await _orders.GetOrderByNumberAsync(orderNumber, ct));

    [HttpPost]
    [Authorize(Roles = "CUSTOMER")]
    public async Task<ActionResult<OrderDto>> Place([FromBody] PlaceOrderRequest request, CancellationToken ct)
        => Ok(await _orders.PlaceOrderAsync(CurrentUserId(), request, ct));

    [HttpPut("{id:guid}/status")]
    [Authorize(Roles = "SUPER_ADMIN,COMPANY_ADMIN,SHOP_ADMIN,SHOP_STAFF,DELIVERY_MANAGER")]
    public async Task<ActionResult<OrderDto>> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusRequest request, CancellationToken ct)
        => Ok(await _orders.UpdateStatusAsync(id, request, CurrentUserId(), ct));
}