using KanniMeat.Application.DTOs;
using KanniMeat.Application.Interfaces;

using KanniMeat.Domain.Enums;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KanniMeat.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ApiControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth) => _auth = auth;

    [HttpPost("request-otp")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> RequestOtp([FromBody] RequestOtpRequest request, CancellationToken ct)
        => Ok(await _auth.RequestOtpAsync(request, ct));

    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request, CancellationToken ct)
        => Ok(await _auth.LoginAsync(request, ct));

    [HttpPost("refresh")]
    [AllowAnonymous]
    public async Task<ActionResult<AuthResponse>> Refresh([FromBody] RefreshTokenRequest request, CancellationToken ct)
        => Ok(await _auth.RefreshAsync(request.RefreshToken, ct));

    [HttpPost("logout")]
    [Authorize]
    public async Task<IActionResult> Logout(CancellationToken ct)
    {
        await _auth.LogoutAsync(CurrentUserId(), ct);
        return NoContent();
    }

    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<UserDto>> Me(CancellationToken ct)
        => Ok(await _auth.GetCurrentUserAsync(CurrentUserId(), ct));

    [HttpGet("permissions")]
    [Authorize]
    public async Task<ActionResult<IEnumerable<string>>> Permissions(CancellationToken ct)
        => Ok(await _auth.GetPermissionsAsync(CurrentUserId(), ct));

    [HttpGet("users")]
    [Authorize(Roles = "SUPER_ADMIN,COMPANY_ADMIN,SHOP_ADMIN")]
    public async Task<ActionResult<IEnumerable<UserDto>>> Users([FromQuery] string? search, CancellationToken ct)
        => Ok(await _auth.GetUsersAsync(search, ct));
}