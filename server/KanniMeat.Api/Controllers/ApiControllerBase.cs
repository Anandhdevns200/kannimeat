using System.Security.Claims;

using Microsoft.AspNetCore.Mvc;

namespace KanniMeat.Api.Controllers;

[ApiController]
public abstract class ApiControllerBase : ControllerBase
{
    protected Guid CurrentUserId()
    {
        var sub = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Guid.TryParse(sub, out var id) ? id : Guid.Empty;
    }

    protected bool HasRole(string role) => User.IsInRole(role);

    protected Guid? CurrentCompanyId()
    {
        var value = User.FindFirstValue("companyId");
        return Guid.TryParse(value, out var id) ? id : null;
    }

    protected Guid? CurrentShopId()
    {
        var value = User.FindFirstValue("shopId");
        return Guid.TryParse(value, out var id) ? id : null;
    }
}