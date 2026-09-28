using KanniMeat.Application.DTOs;
using KanniMeat.Application.Interfaces;
using KanniMeat.Domain.Enums;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KanniMeat.Api.Controllers;

[ApiController]
[Route("api/payments")]
[Authorize]
public class PaymentsController : ApiControllerBase
{
    private readonly IPaymentService _payments;

    public PaymentsController(IPaymentService payments) => _payments = payments;

    [HttpGet]
    [Authorize(Roles = "SUPER_ADMIN,COMPANY_ADMIN,SHOP_ADMIN")]
    public async Task<ActionResult<PaymentListResponse>> List([FromQuery] PaymentStatus? status, CancellationToken ct = default)
        => Ok(await _payments.GetPaymentsAsync(status, ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PaymentDto>> Get(Guid id, CancellationToken ct)
        => Ok(await _payments.GetPaymentAsync(id, ct));

    [HttpGet("by-order/{orderId:guid}")]
    public async Task<ActionResult<List<PaymentDto>>> ForOrder(Guid orderId, CancellationToken ct)
        => Ok(await _payments.GetPaymentsForOrderAsync(orderId, ct));

    [HttpPost]
    [Authorize(Roles = "SUPER_ADMIN,COMPANY_ADMIN,SHOP_ADMIN,DELIVERY_PARTNER")]
    public async Task<ActionResult<PaymentDto>> Record([FromBody] RecordPaymentRequest request, CancellationToken ct)
        => Ok(await _payments.RecordAsync(request, ct));
}

[ApiController]
[Route("api/invoices")]
[Authorize]
public class InvoicesController : ApiControllerBase
{
    private readonly IInvoiceService _invoices;

    public InvoicesController(IInvoiceService invoices) => _invoices = invoices;

    [HttpGet]
    [Authorize(Roles = "SUPER_ADMIN,COMPANY_ADMIN,SHOP_ADMIN,DELIVERY_MANAGER")]
    public async Task<ActionResult<InvoiceListResponse>> List(CancellationToken ct)
        => Ok(await _invoices.GetInvoicesAsync(ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<InvoiceDto>> Get(Guid id, CancellationToken ct)
        => Ok(await _invoices.GetInvoiceAsync(id, ct));

    [HttpGet("by-order/{orderId:guid}")]
    public async Task<ActionResult<InvoiceDto>> ByOrder(Guid orderId, CancellationToken ct)
        => Ok(await _invoices.GetInvoiceByOrderAsync(orderId, ct));

    [HttpPost("from-order/{orderId:guid}")]
    [Authorize(Roles = "SUPER_ADMIN,COMPANY_ADMIN,SHOP_ADMIN")]
    public async Task<ActionResult<InvoiceDto>> Generate(Guid orderId, CancellationToken ct)
        => Ok(await _invoices.GenerateFromOrderAsync(orderId, ct));
}