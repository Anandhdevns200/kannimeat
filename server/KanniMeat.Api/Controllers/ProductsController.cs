using KanniMeat.Application.DTOs;
using KanniMeat.Application.Interfaces;
using KanniMeat.Domain.Enums;

using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace KanniMeat.Api.Controllers;

[ApiController]
[Route("api/categories")]
[Authorize]
public class CategoriesController : ApiControllerBase
{
    private readonly IProductService _products;

    public CategoriesController(IProductService products) => _products = products;

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProductCategoryDto>>> List(CancellationToken ct)
        => Ok(await _products.GetCategoriesAsync(ct));

    [HttpPost]
    [Authorize(Roles = "SUPER_ADMIN,COMPANY_ADMIN")]
    public async Task<ActionResult<ProductCategoryDto>> Create([FromBody] CreateCategoryRequest request, CancellationToken ct)
        => Ok(await _products.CreateCategoryAsync(request, ct));
}

[ApiController]
[Route("api/products")]
[Authorize]
public class ProductsController : ApiControllerBase
{
    private readonly IProductService _products;

    public ProductsController(IProductService products) => _products = products;

    [HttpGet]
    public async Task<ActionResult<ProductListResponse>> List([FromQuery] Guid? shopId, [FromQuery] ProductCategory? category, [FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken ct = default)
        => Ok(await _products.GetProductsAsync(new ProductQuery(shopId, category, search, page, pageSize), ct));

    [HttpGet("popular")]
    public async Task<ActionResult<IEnumerable<ProductDto>>> Popular([FromQuery] int take = 8, CancellationToken ct = default)
        => Ok(await _products.GetPopularAsync(take, ct));

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProductDto>> Get(Guid id, CancellationToken ct)
        => Ok(await _products.GetProductAsync(id, ct));

    [HttpPost]
    [Authorize(Roles = "SUPER_ADMIN,COMPANY_ADMIN,SHOP_ADMIN")]
    public async Task<ActionResult<ProductDto>> Create([FromBody] CreateProductRequest request, CancellationToken ct)
        => Ok(await _products.CreateProductAsync(request, ct));

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "SUPER_ADMIN,COMPANY_ADMIN,SHOP_ADMIN")]
    public async Task<ActionResult<ProductDto>> Update(Guid id, [FromBody] UpdateProductRequest request, CancellationToken ct)
        => Ok(await _products.UpdateProductAsync(id, request, ct));
}