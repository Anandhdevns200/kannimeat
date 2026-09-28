using KanniMeat.Application.DTOs;
using KanniMeat.Application.Interfaces;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KanniMeat.Api.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ApiControllerBase
{
    private readonly INotificationService _notifications;

    public NotificationsController(INotificationService notifications) => _notifications = notifications;

    [HttpGet]
    public async Task<ActionResult<NotificationListResponse>> List([FromQuery] string? role, CancellationToken ct = default)
    {
        var userRole = User.IsInRole("CUSTOMER") ? "customer"
            : User.IsInRole("SHOP_ADMIN") || User.IsInRole("SHOP_STAFF") ? "shop"
            : User.IsInRole("COMPANY_ADMIN") ? "company_admin"
            : User.IsInRole("SUPER_ADMIN") ? "super_admin"
            : User.IsInRole("DELIVERY_MANAGER") ? "delivery_manager"
            : User.IsInRole("DELIVERY_PARTNER") ? "delivery_partner"
            : role;
        return Ok(await _notifications.GetForAsync(userRole, CurrentUserId(), ct));
    }

    [HttpPost("{id:guid}/read")]
    public async Task<IActionResult> MarkRead(Guid id, CancellationToken ct)
    {
        await _notifications.MarkReadAsync(id, ct);
        return NoContent();
    }

    [HttpPost("read-all")]
    public async Task<IActionResult> MarkAllRead([FromBody] MarkNotificationsReadRequest request, CancellationToken ct)
    {
        await _notifications.MarkAllReadAsync(request, ct);
        return NoContent();
    }
}