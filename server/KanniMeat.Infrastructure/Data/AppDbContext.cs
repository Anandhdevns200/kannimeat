using System.Linq.Expressions;

using KanniMeat.Domain.Entities;
using KanniMeat.Domain.Enums;

using Microsoft.EntityFrameworkCore;

namespace KanniMeat.Infrastructure.Data;

public sealed class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<RoleAssignment> RoleAssignments => Set<RoleAssignment>();

    public DbSet<Company> Companies => Set<Company>();
    public DbSet<Shop> Shops => Set<Shop>();
    public DbSet<Customer> Customers => Set<Customer>();
    public DbSet<Address> Addresses => Set<Address>();
    public DbSet<Employee> Employees => Set<Employee>();

    public DbSet<ProductCategoryEntity> ProductCategories => Set<ProductCategoryEntity>();
    public DbSet<Product> Products => Set<Product>();
    public DbSet<ProductVariant> ProductVariants => Set<ProductVariant>();
    public DbSet<CuttingPreference> CuttingPreferences => Set<CuttingPreference>();

    public DbSet<InventoryItem> InventoryItems => Set<InventoryItem>();
    public DbSet<InventoryTransaction> InventoryTransactions => Set<InventoryTransaction>();

    public DbSet<Cart> Carts => Set<Cart>();
    public DbSet<CartItem> CartItems => Set<CartItem>();

    public DbSet<Order> Orders => Set<Order>();
    public DbSet<OrderItem> OrderItems => Set<OrderItem>();
    public DbSet<OrderStatusHistory> OrderStatusHistories => Set<OrderStatusHistory>();

    public DbSet<DeliveryPartner> DeliveryPartners => Set<DeliveryPartner>();
    public DbSet<Delivery> Deliveries => Set<Delivery>();
    public DbSet<DeliveryLocation> DeliveryLocations => Set<DeliveryLocation>();

    public DbSet<Payment> Payments => Set<Payment>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceItem> InvoiceItems => Set<InvoiceItem>();

    public DbSet<Notification> Notifications => Set<Notification>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<User>(e =>
        {
            e.HasIndex(u => u.Phone).IsUnique();
            e.HasIndex(u => u.Email).IsUnique().HasFilter("[Email] IS NOT NULL");
            e.HasOne(u => u.Company).WithMany(c => c.Users).HasForeignKey(u => u.CompanyId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(u => u.Shop).WithMany().HasForeignKey(u => u.ShopId).OnDelete(DeleteBehavior.Restrict);
            e.HasMany(u => u.Addresses).WithOne(a => a.User).HasForeignKey(a => a.UserId).OnDelete(DeleteBehavior.Restrict);
            e.HasMany(u => u.Orders).WithOne(o => o.User).HasForeignKey(o => o.UserId).OnDelete(DeleteBehavior.SetNull);
            e.HasMany(u => u.UserRoles).WithOne(ur => ur.User).HasForeignKey(ur => ur.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Role>(e =>
        {
            e.HasIndex(r => r.Name).IsUnique();
            e.HasMany(r => r.Permissions).WithOne(rp => rp.Role).HasForeignKey(rp => rp.RoleId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(r => r.UserRoles).WithOne(ur => ur.Role).HasForeignKey(ur => ur.RoleId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Permission>(e =>
        {
            e.HasIndex(p => p.Code).IsUnique();
            e.HasMany(p => p.RolePermissions).WithOne(rp => rp.Permission).HasForeignKey(rp => rp.PermissionId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Company>(e =>
        {
            e.HasIndex(c => c.Gstin).IsUnique().HasFilter("[Gstin] IS NOT NULL");
            e.HasMany(c => c.Shops).WithOne(s => s.Company).HasForeignKey(s => s.CompanyId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Shop>(e =>
        {
            e.HasIndex(s => new { s.City, s.Area });
            e.HasMany(s => s.Employees).WithOne(emp => emp.Shop).HasForeignKey(emp => emp.ShopId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(s => s.Products).WithOne(p => p.Shop).HasForeignKey(p => p.ShopId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(s => s.Inventory).WithOne(i => i.Shop).HasForeignKey(i => i.ShopId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(s => s.Orders).WithOne(o => o.Shop).HasForeignKey(o => o.ShopId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Customer>(e =>
        {
            e.HasOne(c => c.User).WithOne().HasForeignKey<Customer>(c => c.UserId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(c => c.Addresses).WithOne(a => a.Customer).HasForeignKey(a => a.CustomerId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(c => c.Orders).WithOne(o => o.Customer).HasForeignKey(o => o.CustomerId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Address>(e =>
        {
            e.HasIndex(a => new { a.City, a.Area });
            e.Property(a => a.Label).HasDefaultValue("Home");
        });

        modelBuilder.Entity<Product>(e =>
        {
            e.HasIndex(p => p.Name);
            e.HasMany(p => p.Variants).WithOne(v => v.Product).HasForeignKey(v => v.ProductId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(p => p.CuttingPreferences).WithOne(c => c.Product).HasForeignKey(c => c.ProductId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(p => p.OrderItems).WithOne(oi => oi.Product).HasForeignKey(oi => oi.ProductId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(p => p.CategoryEntity).WithMany(c => c.Products).HasForeignKey(p => p.CategoryId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<InventoryItem>(e =>
        {
            e.HasIndex(i => new { i.ShopId, i.ProductId }).IsUnique();
            e.HasOne(i => i.Product).WithMany().HasForeignKey(i => i.ProductId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(i => i.Shop).WithMany(s => s.Inventory).HasForeignKey(i => i.ShopId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(i => i.Transactions).WithOne(t => t.InventoryItem).HasForeignKey(t => t.InventoryItemId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<InventoryTransaction>(e =>
        {
            e.HasOne(t => t.CreatedByUser).WithMany().HasForeignKey(t => t.CreatedByUserId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(t => t.Order).WithMany(o => o.InventoryTransactions).HasForeignKey(t => t.OrderId).OnDelete(DeleteBehavior.SetNull);
            e.HasIndex(t => new { t.InventoryItemId, t.CreatedAt });
        });

        modelBuilder.Entity<Cart>(e =>
        {
            e.HasOne(c => c.Customer).WithMany(cu => cu.Carts).HasForeignKey(c => c.CustomerId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(c => c.User).WithMany().HasForeignKey(c => c.UserId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(c => c.Shop).WithMany().HasForeignKey(c => c.ShopId).OnDelete(DeleteBehavior.Restrict);
            e.HasMany(c => c.Items).WithOne(i => i.Cart).HasForeignKey(i => i.CartId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<CartItem>(e =>
        {
            e.HasOne(i => i.Product).WithMany().HasForeignKey(i => i.ProductId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Order>(e =>
        {
            e.HasIndex(o => o.OrderNumber).IsUnique();
            e.HasIndex(o => o.Status);
            e.HasIndex(o => o.DeliveryDate);
            e.HasOne(o => o.Shop).WithMany(s => s.Orders).HasForeignKey(o => o.ShopId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(o => o.Customer).WithMany(c => c.Orders).HasForeignKey(o => o.CustomerId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(o => o.User).WithMany(u => u.Orders).HasForeignKey(o => o.UserId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(o => o.Address).WithMany().HasForeignKey(o => o.AddressId).OnDelete(DeleteBehavior.Restrict);
            e.HasMany(o => o.OrderItems).WithOne(i => i.Order).HasForeignKey(i => i.OrderId).OnDelete(DeleteBehavior.Cascade);
            e.HasMany(o => o.StatusHistory).WithOne(h => h.Order).HasForeignKey(h => h.OrderId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<OrderItem>(e =>
        {
            e.Property(i => i.ProductName).HasMaxLength(160);
            e.HasOne(i => i.Product).WithMany(p => p.OrderItems).HasForeignKey(i => i.ProductId).OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<DeliveryPartner>(e =>
        {
            e.HasIndex(d => d.Phone).IsUnique();
            e.HasOne(d => d.Shop).WithMany(s => s.DeliveryPartners).HasForeignKey(d => d.ShopId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(d => d.User).WithMany().HasForeignKey(d => d.UserId).OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<Delivery>(e =>
        {
            e.HasIndex(d => d.OrderId).IsUnique();
            e.HasOne(d => d.Order).WithMany(o => o.Deliveries).HasForeignKey(d => d.OrderId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(d => d.DeliveryPartner).WithMany(p => p.Deliveries).HasForeignKey(d => d.DeliveryPartnerId).OnDelete(DeleteBehavior.Restrict);
            e.HasMany(d => d.LocationHistory).WithOne(l => l.Delivery).HasForeignKey(l => l.DeliveryId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Payment>(e =>
        {
            e.HasOne(p => p.Order).WithMany().HasForeignKey(p => p.OrderId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(p => p.Invoice).WithMany().HasForeignKey(p => p.InvoiceId).OnDelete(DeleteBehavior.SetNull);
            e.HasIndex(p => p.GatewayReference).IsUnique().HasFilter("[GatewayReference] IS NOT NULL");
        });

        modelBuilder.Entity<Invoice>(e =>
        {
            e.HasIndex(i => i.InvoiceNumber).IsUnique();
            e.HasOne(i => i.Order).WithOne(o => o.Invoice!).HasForeignKey<Invoice>(i => i.OrderId).OnDelete(DeleteBehavior.Restrict);
            e.HasOne(i => i.Customer).WithMany().HasForeignKey(i => i.CustomerId).OnDelete(DeleteBehavior.SetNull);
            e.HasMany(i => i.InvoiceItems).WithOne(i => i.Invoice).HasForeignKey(i => i.InvoiceId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Notification>(e =>
        {
            e.HasIndex(n => new { n.Role, n.IsRead });
            e.HasOne(n => n.User).WithMany().HasForeignKey(n => n.UserId).OnDelete(DeleteBehavior.Cascade);
        });

        // Enum stored as strings for readability across reporting
        modelBuilder.Entity<Company>().Property(c => c.Status).HasConversion<string>();
        modelBuilder.Entity<Shop>().Property(s => s.Status).HasConversion<string>();
        modelBuilder.Entity<Product>().Property(p => p.Category).HasConversion<string>();
        modelBuilder.Entity<Product>().Property(p => p.Status).HasConversion<string>();
        modelBuilder.Entity<CuttingPreference>().Property(c => c.Type).HasConversion<string>();
        modelBuilder.Entity<InventoryTransaction>().Property(t => t.Type).HasConversion<string>();
        modelBuilder.Entity<Order>().Property(o => o.Status).HasConversion<string>();
        modelBuilder.Entity<Order>().Property(o => o.PaymentMethod).HasConversion<string>();
        modelBuilder.Entity<Order>().Property(o => o.PaymentStatus).HasConversion<string>();
        modelBuilder.Entity<Order>().Property(o => o.Flag).HasConversion<string>();
        modelBuilder.Entity<OrderStatusHistory>().Property(h => h.Status).HasConversion<string>();
        modelBuilder.Entity<Delivery>().Property(d => d.Status).HasConversion<string>();
        modelBuilder.Entity<Payment>().Property(p => p.Method).HasConversion<string>();
        modelBuilder.Entity<Payment>().Property(p => p.Status).HasConversion<string>();
        modelBuilder.Entity<Invoice>().Property(i => i.PaymentStatus).HasConversion<string>();
        modelBuilder.Entity<Invoice>().Property(i => i.PaymentMethod).HasConversion<string>();
        modelBuilder.Entity<Invoice>().Property(i => i.Status).HasConversion<string>();
        modelBuilder.Entity<Notification>().Property(n => n.Source).HasConversion<string>();
        modelBuilder.Entity<Notification>().Property(n => n.Channel).HasConversion<string>();
        modelBuilder.Entity<User>().Property(u => u.Status).HasConversion<string>();
        modelBuilder.Entity<Employee>().Property(e => e.Role).HasConversion<string>();

        // Global query filter: soft-deleted rows are hidden (runs after all
        // entity types have been discovered by convention/configuration)
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            if (typeof(BaseEntity).IsAssignableFrom(entityType.ClrType))
            {
                modelBuilder.Entity(entityType.ClrType)
                    .HasQueryFilter(BuildSoftDeleteFilter(entityType.ClrType));
            }
        }
    }

    private static LambdaExpression BuildSoftDeleteFilter(Type entityType)
    {
        var parameter = Expression.Parameter(entityType, "e");
        var isDeleted = Expression.Property(parameter, nameof(BaseEntity.IsDeleted));
        return Expression.Lambda(Expression.Not(isDeleted), parameter);
    }
}