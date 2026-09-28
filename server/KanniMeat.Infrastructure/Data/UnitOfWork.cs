using KanniMeat.Application.Interfaces;
using KanniMeat.Domain.Entities;

namespace KanniMeat.Infrastructure.Data;

public sealed class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;

    public UnitOfWork(AppDbContext context)
    {
        _context = context;
    }

    private bool _disposed;

    public IRepository<TEntity> Repository<TEntity>() where TEntity : BaseEntity
        => new Repository<TEntity>(_context);

    public IRepository<User> Users => Repository<User>();
    public IRepository<Role> Roles => Repository<Role>();
    public IRepository<RoleAssignment> RoleAssignments => Repository<RoleAssignment>();
    public IRepository<Company> Companies => Repository<Company>();
    public IRepository<Shop> Shops => Repository<Shop>();
    public IRepository<Customer> Customers => Repository<Customer>();
    public IRepository<Address> Addresses => Repository<Address>();
    public IRepository<Product> Products => Repository<Product>();
    public IRepository<ProductCategoryEntity> ProductCategories => Repository<ProductCategoryEntity>();
    public IRepository<InventoryItem> InventoryItems => Repository<InventoryItem>();
    public IRepository<InventoryTransaction> InventoryTransactions => Repository<InventoryTransaction>();
    public IRepository<Cart> Carts => Repository<Cart>();
    public IRepository<CartItem> CartItems => Repository<CartItem>();
    public IRepository<Order> Orders => Repository<Order>();
    public IRepository<OrderItem> OrderItems => Repository<OrderItem>();
    public IRepository<OrderStatusHistory> OrderStatusHistory => Repository<OrderStatusHistory>();
    public IRepository<DeliveryPartner> DeliveryPartners => Repository<DeliveryPartner>();
    public IRepository<Delivery> Deliveries => Repository<Delivery>();
    public IRepository<Payment> Payments => Repository<Payment>();
    public IRepository<Invoice> Invoices => Repository<Invoice>();
    public IRepository<InvoiceItem> InvoiceItems => Repository<InvoiceItem>();
    public IRepository<Notification> Notifications => Repository<Notification>();

    public Task<int> SaveAsync(CancellationToken ct = default) => _context.SaveChangesAsync(ct);

    public void Dispose()
    {
        if (!_disposed)
        {
            _context.Dispose();
            _disposed = true;
        }
        GC.SuppressFinalize(this);
    }
}