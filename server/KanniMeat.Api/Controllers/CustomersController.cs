using KanniMeat.Application.DTOs;
using KanniMeat.Application.Interfaces;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KanniMeat.Api.Controllers;

[ApiController]
[Route("api/customers")]
[Authorize]
public class CustomersController : ApiControllerBase
{
    private readonly ICustomerService _customers;

    public CustomersController(ICustomerService customers) => _customers = customers;

    [HttpGet]
    [Authorize(Roles = "SUPER_ADMIN,COMPANY_ADMIN,SHOP_ADMIN")]
    public async Task<ActionResult<CustomerListResponse>> List([FromQuery] string? search, [FromQuery] Guid? shopId, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => Ok(await _customers.GetCustomersAsync(search, shopId, page, pageSize, ct));

    [HttpGet("me")]
    public async Task<ActionResult<CustomerDto>> Me(CancellationToken ct)
        => Ok(await _customers.GetOrCreateCustomerAsync(CurrentUserId(), ct));

    [HttpGet("{id:guid}")]
    [Authorize(Roles = "SUPER_ADMIN,COMPANY_ADMIN,SHOP_ADMIN")]
    public async Task<ActionResult<CustomerDto>> Get(Guid id, CancellationToken ct)
        => Ok(await _customers.GetCustomerAsync(id, ct));

    [HttpPost("addresses")]
    public async Task<ActionResult<AddressDto>> AddAddress([FromBody] CreateAddressRequest request, CancellationToken ct)
        => Ok(await _customers.AddAddressAsync(CurrentUserId(), request, ct));

    [HttpPut("addresses/{addressId:guid}")]
    public async Task<ActionResult<AddressDto>> UpdateAddress(Guid addressId, [FromBody] UpdateAddressRequest request, CancellationToken ct)
        => Ok(await _customers.UpdateAddressAsync(CurrentUserId(), addressId, request, ct));

    [HttpDelete("addresses/{addressId:guid}")]
    public async Task<IActionResult> DeleteAddress(Guid addressId, CancellationToken ct)
    {
        var deleted = await _customers.DeleteAddressAsync(CurrentUserId(), addressId, ct);
        return deleted ? NoContent() : NotFound();
    }
}