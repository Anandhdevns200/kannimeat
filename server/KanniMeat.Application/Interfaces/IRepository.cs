using System.Linq.Expressions;

using KanniMeat.Domain.Entities;

namespace KanniMeat.Application.Interfaces;

public interface IRepository<TEntity> where TEntity : BaseEntity
{
    Task<TEntity?> GetByIdAsync(Guid id, CancellationToken ct = default);
    Task<TEntity?> GetByIdAsync(Guid id, Func<IQueryable<TEntity>, IQueryable<TEntity>> include, CancellationToken ct = default);
    Task<IReadOnlyList<TEntity>> ListAsync(CancellationToken ct = default);
    Task<IReadOnlyList<TEntity>> ListAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken ct = default);
    Task<IReadOnlyList<TEntity>> ListAsync(Expression<Func<TEntity, bool>> predicate, Func<IQueryable<TEntity>, IQueryable<TEntity>> include, CancellationToken ct = default);
    Task<IReadOnlyList<TEntity>> ListAsync(Expression<Func<TEntity, bool>> predicate, Func<IQueryable<TEntity>, IQueryable<TEntity>> include, Func<IQueryable<TEntity>, IOrderedQueryable<TEntity>> orderBy, CancellationToken ct = default);
    Task<TEntity?> FirstOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken ct = default);
    Task<TEntity?> FirstOrDefaultAsync(Expression<Func<TEntity, bool>> predicate, Func<IQueryable<TEntity>, IQueryable<TEntity>> include, CancellationToken ct = default);
    Task<bool> AnyAsync(Expression<Func<TEntity, bool>> predicate, CancellationToken ct = default);
    Task<int> CountAsync(Expression<Func<TEntity, bool>>? predicate = null, CancellationToken ct = default);
    Task AddAsync(TEntity entity, CancellationToken ct = default);
    void Update(TEntity entity);
    void Remove(TEntity entity);
    Task SaveChangesAsync(CancellationToken ct = default);
    IQueryable<TEntity> Query(bool tracking = false);
}

public interface IUnitOfWork : IDisposable
{
    IRepository<TEntity> Repository<TEntity>() where TEntity : BaseEntity;
    IRepository<User> Users { get; }
    IRepository<Role> Roles { get; }
    IRepository<RoleAssignment> RoleAssignments { get; }
    IRepository<Company> Companies { get; }
    IRepository<Shop> Shops { get; }
    IRepository<Customer> Customers { get; }
    IRepository<Address> Addresses { get; }
    IRepository<Product> Products { get; }
    IRepository<ProductCategoryEntity> ProductCategories { get; }
    IRepository<InventoryItem> InventoryItems { get; }
    IRepository<InventoryTransaction> InventoryTransactions { get; }
    IRepository<Cart> Carts { get; }
    IRepository<CartItem> CartItems { get; }
    IRepository<Order> Orders { get; }
    IRepository<OrderItem> OrderItems { get; }
    IRepository<OrderStatusHistory> OrderStatusHistory { get; }
    IRepository<DeliveryPartner> DeliveryPartners { get; }
    IRepository<Delivery> Deliveries { get; }
    IRepository<Payment> Payments { get; }
    IRepository<Invoice> Invoices { get; }
    IRepository<InvoiceItem> InvoiceItems { get; }
    IRepository<Notification> Notifications { get; }
    Task<int> SaveAsync(CancellationToken ct = default);
}