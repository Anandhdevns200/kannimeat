using KanniMeat.Application.DTOs;
using KanniMeat.Application.Interfaces;
using KanniMeat.Domain.Enums;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KanniMeat.Api.Controllers;

[ApiController]
[Route("api/deliveries")]
[Authorize]
public class DeliveriesController : ApiControllerBase
{
    private readonly IDeliveryService _deliveries;

    public DeliveriesController(IDeliveryService deliveries) => _deliveries = deliveries;

    [HttpGet]
    [Authorize(Roles = "SUPER_ADMIN,COMPANY_ADMIN,SHOP_ADMIN,DELIVERY_MANAGER")]
    public async Task<ActionResult<DeliveryListResponse>> List([FromQuery] DeliveryStatus? status, [FromQuery] Guid? partnerId, CancellationToken ct = default)
        => Ok(await _deliveries.GetDeliveriesAsync(status, partnerId, ct));

    [HttpGet("partners")]
    [Authorize(Roles = "SUPER_ADMIN,COMPANY_ADMIN,SHOP_ADMIN,DELIVERY_MANAGER")]
    public async Task<ActionResult<DeliveryPartnerListResponse>> Partners([FromQuery] string? city, CancellationToken ct = default)
        => Ok(await _deliveries.GetPartnersAsync(city, ct));

    [HttpGet("partner-history")]
    [Authorize(Roles = "DELIVERY_PARTNER,DELIVERY_MANAGER")]
    public async Task<ActionResult<DeliveryListResponse>> MyHistory([FromQuery] Guid? partnerId, CancellationToken ct)
        => Ok(await _deliveries.GetHistoryAsync(partnerId ?? Guid.Empty, ct));

    [HttpGet("by-order/{orderId:guid}")]
    public async Task<ActionResult<DeliveryDto>> ForOrder(Guid orderId, CancellationToken ct)
        => Ok(await _deliveries.GetDeliveryForOrderAsync(orderId, ct));

    [HttpPost("assign")]
    [Authorize(Roles = "DELIVERY_MANAGER,SHOP_ADMIN,COMPANY_ADMIN,SUPER_ADMIN")]
    public async Task<ActionResult<DeliveryDto>> Assign([FromBody] AssignDeliveryRequest request, CancellationToken ct)
        => Ok(await _deliveries.AssignAsync(request, ct));

    [HttpPost("partners")]
    [Authorize(Roles = "DELIVERY_MANAGER,COMPANY_ADMIN,SUPER_ADMIN")]
    public async Task<ActionResult<DeliveryPartnerDto>> CreatePartner([FromBody] CreateDeliveryPartnerRequest request, CancellationToken ct)
        => Ok(await _deliveries.CreatePartnerAsync(request, ct));

    [HttpPost("{id:guid}/start")]
    [Authorize(Roles = "DELIVERY_PARTNER,DELIVERY_MANAGER")]
    public async Task<ActionResult<DeliveryDto>> Start(Guid id, CancellationToken ct)
        => Ok(await _deliveries.StartAsync(id, ct));

    [HttpPost("{id:guid}/complete")]
    [Authorize(Roles = "DELIVERY_PARTNER,DELIVERY_MANAGER")]
    public async Task<ActionResult<DeliveryDto>> Complete(Guid id, [FromBody] CompleteDeliveryRequest request, CancellationToken ct)
        => Ok(await _deliveries.CompleteAsync(id, request, ct));

    [HttpPost("{id:guid}/fail")]
    [Authorize(Roles = "DELIVERY_PARTNER,DELIVERY_MANAGER")]
    public async Task<ActionResult<DeliveryDto>> Fail(Guid id, [FromBody] string? reason, CancellationToken ct)
        => Ok(await _deliveries.FailAsync(id, reason, ct));
}