using KanniMeat.Application.DTOs;
using KanniMeat.Application.Interfaces;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KanniMeat.Api.Controllers;

[ApiController]
[Route("api/companies")]
[Authorize]
public class CompaniesController : ApiControllerBase
{
    private readonly ICompanyService _companies;

    public CompaniesController(ICompanyService companies) => _companies = companies;

    [HttpGet]
    [Authorize(Roles = "SUPER_ADMIN,COMPANY_ADMIN")]
    public async Task<ActionResult<CompanyListResponse>> List([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => Ok(await _companies.GetCompaniesAsync(search, page, pageSize, ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<CompanyDto>> Get(Guid id, CancellationToken ct)
        => Ok(await _companies.GetCompanyAsync(id, ct));

    [HttpGet("{id:guid}/shops")]
    public async Task<ActionResult<List<ShopDto>>> Shops(Guid id, CancellationToken ct)
        => Ok(await _companies.GetCompanyShopsAsync(id, ct));

    [HttpPost]
    [Authorize(Roles = "SUPER_ADMIN")]
    public async Task<ActionResult<CompanyDto>> Create([FromBody] CreateCompanyRequest request, CancellationToken ct)
        => Ok(await _companies.CreateCompanyAsync(request, ct));

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "SUPER_ADMIN,COMPANY_ADMIN")]
    public async Task<ActionResult<CompanyDto>> Update(Guid id, [FromBody] UpdateCompanyRequest request, CancellationToken ct)
        => Ok(await _companies.UpdateCompanyAsync(id, request, ct));
}