using KanniMeat.Application.DTOs;
using KanniMeat.Application.Interfaces;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KanniMeat.Api.Controllers;

[ApiController]
[Route("api/shops")]
[Authorize]
public class ShopsController : ApiControllerBase
{
    private readonly IShopService _shops;

    public ShopsController(IShopService shops) => _shops = shops;

    [HttpGet]
    public async Task<ActionResult<ShopListResponse>> List([FromQuery] string? city, [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => Ok(await _shops.GetShopsAsync(city, search, page, pageSize, ct));

    [HttpGet("near")]
    public async Task<ActionResult<IEnumerable<ShopDto>>> Near([FromQuery] string city, [FromQuery] string area, CancellationToken ct)
        => Ok(await _shops.GetShopsNearAsync(city, area, ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ShopDto>> Get(Guid id, CancellationToken ct)
        => Ok(await _shops.GetShopAsync(id, ct));

    [HttpGet("{id:guid}/inventory")]
    public async Task<ActionResult<InventoryListResponse>> Inventory(Guid id, CancellationToken ct)
        => Ok(await _shops.GetShopInventoryAsync(id, ct));

    [HttpPost]
    [Authorize(Roles = "SUPER_ADMIN,COMPANY_ADMIN")]
    public async Task<ActionResult<ShopDto>> Create([FromBody] CreateShopRequest request, CancellationToken ct)
        => Ok(await _shops.CreateShopAsync(request, ct));

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "SUPER_ADMIN,COMPANY_ADMIN,SHOP_ADMIN")]
    public async Task<ActionResult<ShopDto>> Update(Guid id, [FromBody] UpdateShopRequest request, CancellationToken ct)
        => Ok(await _shops.UpdateShopAsync(id, request, ct));
}