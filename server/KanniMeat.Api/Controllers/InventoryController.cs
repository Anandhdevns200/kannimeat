using KanniMeat.Application.DTOs;
using KanniMeat.Application.Interfaces;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KanniMeat.Api.Controllers;

[ApiController]
[Route("api/inventory")]
[Authorize(Roles = "SUPER_ADMIN,COMPANY_ADMIN,SHOP_ADMIN,SHOP_STAFF")]
public class InventoryController : ApiControllerBase
{
    private readonly IInventoryService _inventory;

    public InventoryController(IInventoryService inventory) => _inventory = inventory;

    [HttpGet]
    public async Task<ActionResult<InventoryListResponse>> List([FromQuery] Guid? shopId, CancellationToken ct = default)
        => Ok(await _inventory.GetInventoryAsync(shopId ?? CurrentShopId(), ct));

    [HttpGet("{itemId:guid}/transactions")]
    public async Task<ActionResult<IEnumerable<InventoryTransactionDto>>> Transactions(Guid itemId, CancellationToken ct)
        => Ok(await _inventory.GetTransactionHistoryAsync(itemId, ct));

    [HttpPost]
    public async Task<ActionResult<InventoryItemDto>> Add([FromBody] AddInventoryRequest request, CancellationToken ct)
        => Ok(await _inventory.AddInventoryAsync(request, ct));

    [HttpPost("adjust")]
    public async Task<ActionResult<InventoryItemDto>> Adjust([FromBody] AdjustInventoryRequest request, CancellationToken ct)
        => Ok(await _inventory.AdjustAsync(request, CurrentUserId(), ct));
}