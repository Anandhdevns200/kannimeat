using KanniMeat.Application.DTOs;
using KanniMeat.Application.Interfaces;
using KanniMeat.Domain.Entities;
using KanniMeat.Domain.Enums;

using Microsoft.EntityFrameworkCore;

namespace KanniMeat.Infrastructure.Services;

public sealed class ProductService : IProductService
{
    private readonly IUnitOfWork _uow;

    public ProductService(IUnitOfWork uow) => _uow = uow;

    public async Task<ProductListResponse> GetProductsAsync(ProductQuery query, CancellationToken ct = default)
    {
        var q = _uow.Products.Query()
            .Include(p => p.Shop)
            .Include(p => p.CategoryEntity)
            .Include(p => p.CuttingPreferences)
            .Where(p => !query.ShopId.HasValue || p.ShopId == query.ShopId.Value)
            .Where(p => !query.Category.HasValue || p.Category == query.Category.Value)
            .Where(p => string.IsNullOrEmpty(query.Search) || p.Name.Contains(query.Search));

        var total = await q.CountAsync(ct);
        var items = await q
            .OrderByDescending(p => p.Quality)
            .Skip((query.Page - 1) * query.PageSize)
            .Take(query.PageSize)
            .ToListAsync(ct);

        return new ProductListResponse(items.Select(Mapper.ToDto).ToList(), total);
    }

    public async Task<ProductDto> GetProductAsync(Guid id, CancellationToken ct = default)
    {
        var product = await _uow.Products.FirstOrDefaultAsync(
            p => p.Id == id,
            q => q.Include(p => p.Shop).Include(p => p.CategoryEntity).Include(p => p.CuttingPreferences),
            ct) ?? throw new KeyNotFoundException("Product not found.");
        return Mapper.ToDto(product);
    }

    public async Task<IEnumerable<ProductDto>> GetPopularAsync(int take, CancellationToken ct = default)
    {
        var items = await _uow.Products
            .ListAsync(
                p => p.IsActive && p.Status == ProductStatus.Active,
                q => q.Include(p => p.Shop).Include(p => p.CategoryEntity).Include(p => p.CuttingPreferences),
                q => q.OrderByDescending(p => p.Quality),
                ct);
        return items.Take(take).Select(Mapper.ToDto);
    }

    public async Task<IEnumerable<ProductCategoryDto>> GetCategoriesAsync(CancellationToken ct = default)
    {
        var categories = await _uow.ProductCategories.ListAsync(c => c.IsActive, ct);
        return categories.Select(Mapper.ToDto);
    }

    public async Task<ProductCategoryDto> CreateCategoryAsync(CreateCategoryRequest request, CancellationToken ct = default)
    {
        var category = new ProductCategoryEntity
        {
            Name = request.Name,
            Category = request.Category,
            Emoji = request.Emoji,
            Description = request.Description,
            IsActive = true,
        };
        await _uow.ProductCategories.AddAsync(category, ct);
        await _uow.SaveAsync(ct);
        return Mapper.ToDto(category);
    }

    public async Task<ProductDto> CreateProductAsync(CreateProductRequest request, CancellationToken ct = default)
    {
        var shop = await _uow.Shops.GetByIdAsync(request.ShopId, ct)
            ?? throw new KeyNotFoundException("Shop not found.");

        var categoryEntity = await _uow.ProductCategories
            .FirstOrDefaultAsync(c => c.Category == request.Category, ct)
            ?? await EnsureCategoryAsync(request.Category, ct);

        var product = new Product
        {
            Name = request.Name,
            CategoryId = categoryEntity.Id,
            Category = request.Category,
            Emoji = request.Emoji,
            PricePerKilogram = request.PricePerKilogram,
            Freshness = request.Freshness,
            Quality = request.Quality,
            ShopId = request.ShopId,
            Shop = shop,
            Description = request.Description,
            Unit = string.IsNullOrEmpty(request.Unit) ? "KG" : request.Unit,
            Status = ProductStatus.Active,
        };

        if (request.Cuts is { Count: > 0 })
        {
            foreach (var cut in request.Cuts)
            {
                product.CuttingPreferences.Add(new CuttingPreference { Product = product, Name = cut });
            }
        }

        await _uow.Products.AddAsync(product, ct);
        await _uow.SaveAsync(ct);

        return await GetProductAsync(product.Id, ct);
    }

    public async Task<ProductDto> UpdateProductAsync(Guid id, UpdateProductRequest request, CancellationToken ct = default)
    {
        var product = await _uow.Products.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException("Product not found.");

        if (!string.IsNullOrEmpty(request.Name)) product.Name = request.Name;
        if (request.PricePerKilogram.HasValue) product.PricePerKilogram = request.PricePerKilogram.Value;
        if (request.IsActive.HasValue) product.IsActive = request.IsActive.Value;
        if (request.Quality.HasValue) product.Quality = request.Quality.Value;
        if (!string.IsNullOrEmpty(request.Freshness)) product.Freshness = request.Freshness;

        _uow.Products.Update(product);
        await _uow.SaveAsync(ct);
        return await GetProductAsync(id, ct);
    }

    private async Task<ProductCategoryEntity> EnsureCategoryAsync(ProductCategory category, CancellationToken ct)
    {
        var entity = new ProductCategoryEntity
        {
            Name = category.ToString(),
            Category = category,
            Emoji = category switch
            {
                ProductCategory.Chicken => "🐓",
                ProductCategory.Mutton => "🐐",
                ProductCategory.Fish => "🐟",
                _ => "🥩",
            },
        };
        await _uow.ProductCategories.AddAsync(entity, ct);
        await _uow.SaveAsync(ct);
        return entity;
    }
}