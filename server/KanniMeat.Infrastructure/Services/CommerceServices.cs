using KanniMeat.Application.DTOs;
using KanniMeat.Application.Interfaces;
using KanniMeat.Domain.Entities;

using Microsoft.EntityFrameworkCore;

namespace KanniMeat.Infrastructure.Services;

public sealed class CartService : ICartService
{
    private readonly IUnitOfWork _uow;

    public CartService(IUnitOfWork uow) => _uow = uow;

    public async Task<CartDto> GetCartAsync(Guid userId, CancellationToken ct = default)
    {
        var cart = await FindCartAsync(userId, ct);
        return Mapper.ToDto(cart);
    }

    public async Task<CartDto> AddToCartAsync(Guid userId, AddToCartRequest request, CancellationToken ct = default)
    {
        var product = await _uow.Products
            .FirstOrDefaultAsync(p => p.Id == request.ProductId, q => q.Include(p => p.Shop), ct)
            ?? throw new KeyNotFoundException("Product not found.");

        var cart = await GetOrCreateCartAsync(userId, product.ShopId, ct);

        var existing = cart.Items.FirstOrDefault(i => i.ProductId == request.ProductId && i.CutPreference == request.CutPreference);
        if (existing is not null)
        {
            existing.QuantityKg += request.QuantityKg;
            _uow.CartItems.Update(existing);
        }
        else
        {
            await _uow.CartItems.AddAsync(new CartItem
            {
                Cart = cart,
                ProductId = product.Id,
                Product = product,
                QuantityKg = request.QuantityKg,
                CutPreference = request.CutPreference,
                UnitPrice = product.PricePerKilogram,
            }, ct);
        }

        await _uow.SaveAsync(ct);
        return await GetCartAsync(userId, ct);
    }

    public async Task<CartDto> UpdateItemAsync(Guid userId, Guid cartItemId, UpdateCartItemRequest request, CancellationToken ct = default)
    {
        var cart = await FindCartAsync(userId, ct) ?? throw new KeyNotFoundException("Cart is empty.");
        var item = cart.Items.FirstOrDefault(i => i.Id == cartItemId)
            ?? throw new KeyNotFoundException("Cart item not found.");

        item.QuantityKg = request.QuantityKg;
        if (!string.IsNullOrEmpty(request.CutPreference)) item.CutPreference = request.CutPreference;
        _uow.CartItems.Update(item);
        await _uow.SaveAsync(ct);
        return await GetCartAsync(userId, ct);
    }

    public async Task<CartDto> RemoveItemAsync(Guid userId, Guid cartItemId, CancellationToken ct = default)
    {
        var cart = await FindCartAsync(userId, ct);
        var item = cart?.Items.FirstOrDefault(i => i.Id == cartItemId);
        if (item is not null)
        {
            _uow.CartItems.Remove(item);
            await _uow.SaveAsync(ct);
        }
        return await GetCartAsync(userId, ct);
    }

    public async Task<CartDto> ClearCartAsync(Guid userId, CancellationToken ct = default)
    {
        var cart = await FindCartAsync(userId, ct);
        if (cart is null) return Mapper.ToDto(default(Cart));
        foreach (var item in cart.Items) _uow.CartItems.Remove(item);
        await _uow.SaveAsync(ct);
        return await GetCartAsync(userId, ct);
    }

    private async Task<Cart?> FindCartAsync(Guid userId, CancellationToken ct)
        => await _uow.Carts.FirstOrDefaultAsync(
            c => c.UserId == userId && c.IsActive,
            q => q.Include(c => c.Items).ThenInclude(i => i.Product),
            ct);

    private async Task<Cart> GetOrCreateCartAsync(Guid userId, Guid shopId, CancellationToken ct)
    {
        var cart = await FindCartAsync(userId, ct);
        if (cart is not null) return cart;

        cart = new Cart { UserId = userId, ShopId = shopId, IsActive = true };
        await _uow.Carts.AddAsync(cart, ct);
        return cart;
    }
}

public sealed class CustomerService : ICustomerService
{
    private readonly IUnitOfWork _uow;

    public CustomerService(IUnitOfWork uow) => _uow = uow;

    public async Task<CustomerListResponse> GetCustomersAsync(string? search, Guid? shopId, int page, int pageSize, CancellationToken ct = default)
    {
        var query = _uow.Customers.Query()
            .Include(c => c.Addresses)
            .Include(c => c.Orders.Where(o => !shopId.HasValue || o.ShopId == shopId.Value))
            .Where(c => string.IsNullOrEmpty(search)
                        || c.FullName.Contains(search)
                        || c.Phone.Contains(search)
                        || (c.User != null && c.User.Phone.Contains(search)));

        var total = await query.CountAsync(ct);
        var items = await query
            .OrderByDescending(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(ct);

        return new CustomerListResponse(items.Select(Mapper.ToDto).ToList(), total);
    }

    public async Task<CustomerDto> GetCustomerAsync(Guid id, CancellationToken ct = default)
    {
        var customer = await _uow.Customers.FirstOrDefaultAsync(c => c.Id == id, q => q.Include(c => c.Addresses), ct)
            ?? throw new KeyNotFoundException("Customer not found.");
        return Mapper.ToDto(customer);
    }

    public async Task<CustomerDto> GetOrCreateCustomerAsync(Guid userId, CancellationToken ct = default)
    {
        var customer = await _uow.Customers.FirstOrDefaultAsync(c => c.UserId == userId, q => q.Include(c => c.Addresses), ct);
        if (customer is not null) return Mapper.ToDto(customer);

        var user = await _uow.Users.GetByIdAsync(userId, ct)
            ?? throw new KeyNotFoundException("User not found.");

        customer = new Customer { FullName = user.FullName, Phone = user.Phone, User = user };
        await _uow.Customers.AddAsync(customer, ct);
        await _uow.SaveAsync(ct);
        return Mapper.ToDto(customer);
    }

    public async Task<AddressDto> AddAddressAsync(Guid userId, CreateAddressRequest request, CancellationToken ct = default)
    {
        var customer = await _uow.Customers.FirstOrDefaultAsync(c => c.UserId == userId, q => q.Include(c => c.Addresses), ct);

        if (request.IsDefault && customer is not null)
        {
            foreach (var addr in customer.Addresses) addr.IsDefault = false;
        }

        var address = new Address
        {
            Label = request.Label, Line1 = request.Line1, Line2 = request.Line2,
            Area = request.Area, City = request.City, Pincode = request.Pincode,
            Phone = request.Phone, IsDefault = request.IsDefault,
            UserId = userId,
        };
        if (customer is not null)
        {
            address.Customer = customer;
            if (customer.Addresses.Count == 0) address.IsDefault = true;
        }

        await _uow.Addresses.AddAsync(address, ct);
        await _uow.SaveAsync(ct);
        return Mapper.ToDto(address);
    }

    public async Task<AddressDto> UpdateAddressAsync(Guid userId, Guid addressId, UpdateAddressRequest request, CancellationToken ct = default)
    {
        var address = await _uow.Addresses.FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId, ct)
            ?? throw new KeyNotFoundException("Address not found.");

        if (!string.IsNullOrEmpty(request.Label)) address.Label = request.Label;
        if (!string.IsNullOrEmpty(request.Line1)) address.Line1 = request.Line1;
        if (request.Line2 is not null) address.Line2 = request.Line2;
        if (!string.IsNullOrEmpty(request.Area)) address.Area = request.Area;
        if (!string.IsNullOrEmpty(request.City)) address.City = request.City;
        if (!string.IsNullOrEmpty(request.Pincode)) address.Pincode = request.Pincode;
        if (request.IsDefault.HasValue) address.IsDefault = request.IsDefault.Value;

        _uow.Addresses.Update(address);
        await _uow.SaveAsync(ct);
        return Mapper.ToDto(address);
    }

    public async Task<bool> DeleteAddressAsync(Guid userId, Guid addressId, CancellationToken ct = default)
    {
        var address = await _uow.Addresses.FirstOrDefaultAsync(a => a.Id == addressId && a.UserId == userId, ct);
        if (address is null) return false;
        _uow.Addresses.Remove(address);
        await _uow.SaveAsync(ct);
        return true;
    }
}