using KanniMeat.Application.DTOs;
using KanniMeat.Application.Interfaces;
using KanniMeat.Domain.Entities;
using KanniMeat.Domain.Enums;

using Microsoft.EntityFrameworkCore;

namespace KanniMeat.Infrastructure.Services;

public sealed class CompanyService : ICompanyService
{
    private readonly IUnitOfWork _uow;

    public CompanyService(IUnitOfWork uow) => _uow = uow;

    public async Task<CompanyListResponse> GetCompaniesAsync(string? search, int page, int pageSize, CancellationToken ct = default)
    {
        var query = _uow.Companies.Query()
            .Include(c => c.Shops)
            .Where(c => string.IsNullOrEmpty(search) || c.Name.Contains(search) || (c.Gstin != null && c.Gstin.Contains(search)));

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        var dtos = items.Select(c => Mapper.ToDto(c, c.Shops.Count,
            c.Shops.SelectMany(s => s.Orders).Where(o => o.DeliveryDate >= DateTime.UtcNow.AddMonths(-1)).Sum(o => o.Total),
            c.Shops.SelectMany(s => s.Orders).Count(o => o.DeliveryDate.Date == DateTime.Today)))
            .ToList();

        return new CompanyListResponse(dtos, total);
    }

    public async Task<CompanyDto> GetCompanyAsync(Guid id, CancellationToken ct = default)
    {
        var company = await _uow.Companies.FirstOrDefaultAsync(c => c.Id == id, q => q.Include(c => c.Shops).ThenInclude(s => s.Orders), ct)
            ?? throw new KeyNotFoundException("Company not found.");

        return Mapper.ToDto(company, company.Shops.Count,
            company.Shops.SelectMany(s => s.Orders).Where(o => o.DeliveryDate >= DateTime.UtcNow.AddMonths(-1)).Sum(o => o.Total),
            company.Shops.SelectMany(s => s.Orders).Count(o => o.DeliveryDate.Date == DateTime.Today));
    }

    public async Task<CompanyDto> CreateCompanyAsync(CreateCompanyRequest request, CancellationToken ct = default)
    {
        var company = new Company
        {
            Name = request.Name,
            City = request.City,
            Gstin = request.Gstin,
            RegisteredPhone = request.RegisteredPhone,
            RegisteredEmail = request.RegisteredEmail,
            Status = CompanyStatus.Active,
        };
        await _uow.Companies.AddAsync(company, ct);
        await _uow.SaveAsync(ct);
        return Mapper.ToDto(company, 0, 0m, 0);
    }

    public async Task<CompanyDto> UpdateCompanyAsync(Guid id, UpdateCompanyRequest request, CancellationToken ct = default)
    {
        var company = await _uow.Companies.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException("Company not found.");

        if (!string.IsNullOrEmpty(request.Name)) company.Name = request.Name;
        if (request.Status.HasValue) company.Status = request.Status.Value;

        _uow.Companies.Update(company);
        await _uow.SaveAsync(ct);

        return await GetCompanyAsync(id, ct);
    }

    public async Task<List<ShopDto>> GetCompanyShopsAsync(Guid companyId, CancellationToken ct = default)
    {
        var shops = await _uow.Shops.ListAsync(s => s.CompanyId == companyId, q => q.Include(s => s.Company).Include(s => s.Orders), ct);
        return shops.Select(s => Mapper.ToDto(s, s.Company?.Name ?? string.Empty)).ToList();
    }
}

public sealed class ShopService : IShopService
{
    private readonly IUnitOfWork _uow;

    public ShopService(IUnitOfWork uow) => _uow = uow;

    public async Task<ShopListResponse> GetShopsAsync(string? city, string? search, int page, int pageSize, CancellationToken ct = default)
    {
        var query = _uow.Shops.Query()
            .Include(s => s.Company)
            .Include(s => s.Orders)
            .Where(s => string.IsNullOrEmpty(city) || s.City == city)
            .Where(s => string.IsNullOrEmpty(search) || s.Name.Contains(search) || s.Area.Contains(search));

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderBy(s => s.Name)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new ShopListResponse(
            items.Select(s => Mapper.ToDto(s, s.Company?.Name ?? string.Empty)).ToList(),
            total);
    }

    public async Task<ShopDto> GetShopAsync(Guid id, CancellationToken ct = default)
    {
        var shop = await _uow.Shops.FirstOrDefaultAsync(s => s.Id == id, q => q.Include(s => s.Company).Include(s => s.Orders), ct)
            ?? throw new KeyNotFoundException("Shop not found.");
        return Mapper.ToDto(shop, shop.Company?.Name ?? string.Empty);
    }

    public async Task<IEnumerable<ShopDto>> GetShopsNearAsync(string city, string area, CancellationToken ct = default)
    {
        var shops = await _uow.Shops
            .ListAsync(s => s.City == city && (s.Area == area || true), q => q.Include(s => s.Company).Include(s => s.Orders), ct);
        return shops.Take(12).Select(s => Mapper.ToDto(s, s.Company?.Name ?? string.Empty));
    }

    public async Task<ShopDto> CreateShopAsync(CreateShopRequest request, CancellationToken ct = default)
    {
        var shop = new Shop
        {
            Name = request.Name,
            City = request.City,
            Area = request.Area,
            Pincode = request.Pincode,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            CompanyId = request.CompanyId,
            ManagerName = request.ManagerName,
            ManagerPhone = request.ManagerPhone,
            Status = ShopStatus.Active,
        };
        await _uow.Shops.AddAsync(shop, ct);
        await _uow.SaveAsync(ct);
        return await GetShopAsync(shop.Id, ct);
    }

    public async Task<ShopDto> UpdateShopAsync(Guid id, UpdateShopRequest request, CancellationToken ct = default)
    {
        var shop = await _uow.Shops.GetByIdAsync(id, ct)
            ?? throw new KeyNotFoundException("Shop not found.");

        if (!string.IsNullOrEmpty(request.Name)) shop.Name = request.Name;
        if (request.Status.HasValue) shop.Status = request.Status.Value;
        if (request.DeliveryFee.HasValue) shop.DeliveryFee = request.DeliveryFee.Value;
        if (request.FreeDeliveryThreshold.HasValue) shop.FreeDeliveryThreshold = request.FreeDeliveryThreshold.Value;

        _uow.Shops.Update(shop);
        await _uow.SaveAsync(ct);
        return await GetShopAsync(id, ct);
    }

    public async Task<InventoryListResponse> GetShopInventoryAsync(Guid shopId, CancellationToken ct = default)
    {
        var items = await _uow.InventoryItems
            .ListAsync(i => i.ShopId == shopId, q => q.Include(i => i.Product).Include(i => i.Shop), ct);
        return new InventoryListResponse(items.Select(Mapper.ToDto).ToList(), items.Count);
    }
}