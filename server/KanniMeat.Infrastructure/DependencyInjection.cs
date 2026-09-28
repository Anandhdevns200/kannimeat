using KanniMeat.Application.Interfaces;
using KanniMeat.Infrastructure.Data;
using KanniMeat.Infrastructure.Security;
using KanniMeat.Infrastructure.Services;

using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace KanniMeat.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? "Server=(localdb)\\mssqllocaldb;Database=KanniMeatDb;Trusted_Connection=True;MultipleActiveResultSets=true";

        services.AddDbContext<AppDbContext>(options =>
            options.UseSqlServer(connectionString));

        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

        // Security
        services.AddSingleton<IPasswordHasher, PasswordHasher>();
        services.AddSingleton<IOtpService, OtpService>();
        services.AddSingleton<IJwtTokenGenerator, JwtTokenGenerator>();
        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.Section));

        // Services
        services.AddScoped<IAuthService, AuthService>();
        services.AddScoped<ICompanyService, CompanyService>();
        services.AddScoped<IShopService, ShopService>();
        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<ICartService, CartService>();
        services.AddScoped<ICustomerService, CustomerService>();
        services.AddScoped<IInventoryService, InventoryService>();
        services.AddScoped<IOrderService, OrderService>();
        services.AddScoped<IDeliveryService, DeliveryService>();
        services.AddScoped<IPaymentService, PaymentService>();
        services.AddScoped<IInvoiceService, InvoiceService>();
        services.AddScoped<INotificationService, NotificationService>();

        return services;
    }
}