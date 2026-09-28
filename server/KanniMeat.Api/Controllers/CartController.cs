using KanniMeat.Application.DTOs;
using KanniMeat.Application.Interfaces;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KanniMeat.Api.Controllers;

[ApiController]
[Route("api/cart")]
[Authorize(Roles = "CUSTOMER")]
public class CartController : ApiControllerBase
{
    private readonly ICartService _cart;

    public CartController(ICartService cart) => _cart = cart;

    [HttpGet]
    public async Task<ActionResult<CartDto>> Get(CancellationToken ct)
        => Ok(await _cart.GetCartAsync(CurrentUserId(), ct));

    [HttpPost("items")]
    public async Task<ActionResult<CartDto>> Add([FromBody] AddToCartRequest request, CancellationToken ct)
        => Ok(await _cart.AddToCartAsync(CurrentUserId(), request, ct));

    [HttpPut("items/{itemId:guid}")]
    public async Task<ActionResult<CartDto>> Update(Guid itemId, [FromBody] UpdateCartItemRequest request, CancellationToken ct)
        => Ok(await _cart.UpdateItemAsync(CurrentUserId(), itemId, request, ct));

    [HttpDelete("items/{itemId:guid}")]
    public async Task<ActionResult<CartDto>> Remove(Guid itemId, CancellationToken ct)
        => Ok(await _cart.RemoveItemAsync(CurrentUserId(), itemId, ct));

    [HttpDelete]
    public async Task<ActionResult<CartDto>> Clear(CancellationToken ct)
        => Ok(await _cart.ClearCartAsync(CurrentUserId(), ct));
}