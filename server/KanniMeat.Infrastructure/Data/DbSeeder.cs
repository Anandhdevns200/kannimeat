using KanniMeat.Application.Interfaces;
using KanniMeat.Domain.Entities;
using KanniMeat.Domain.Enums;

using Microsoft.EntityFrameworkCore;

namespace KanniMeat.Infrastructure.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(AppDbContext context)
    {
        if (await context.Roles.AnyAsync()) return;

        var roles = new Dictionary<string, Role>();
        foreach (UserRole role in Enum.GetValues<UserRole>())
        {
            var entity = new Role { Name = role.ToString(), Description = role.ToString().Replace('_', ' ') };
            context.Roles.Add(entity);
            roles[role.ToString()] = entity;
        }

        var permissions = SeedPermissions(context);
        foreach (var perm in permissions)
        {
            context.Permissions.Add(perm);
            if (roles.TryGetValue("SUPER_ADMIN", out var super))
                context.RolePermissions.Add(new RolePermission { Role = super, Permission = perm });
        }

        var hasher = new Security.PasswordHasher();

        // Companies and Shops
        var company = new Company
        {
            Name = "Tindivanam Fresh Foods",
            City = "Tindivanam",
            Gstin = "33AAACT1234F1Z5",
            Status = CompanyStatus.Active,
        };
        context.Companies.Add(company);

        var company2 = new Company
        {
            Name = "Villupuram Meat Traders",
            City = "Villupuram",
            Gstin = "33AABCV5678G1Z2",
            Status = CompanyStatus.Active,
        };
        context.Companies.Add(company2);

        var shop1 = new Shop
        {
            Name = "Fresh Meat Centre",
            City = "Tindivanam",
            Area = "Anna Salai",
            Pincode = "604001",
            Company = company,
            ManagerName = "Murugan Selvam",
            ManagerPhone = "9842500002",
            Rating = 4.8,
        };
        var shop2 = new Shop
        {
            Name = "Kumar Meat Stall",
            City = "Tindivanam",
            Area = "Santhapet",
            Pincode = "604001",
            Company = company,
            ManagerName = "Kumar",
            ManagerPhone = "9876543210",
            Rating = 4.5,
        };
        var shop3 = new Shop
        {
            Name = "Ramesh Fish Market",
            City = "Villupuram",
            Area = "Bus Stand Road",
            Pincode = "605602",
            Company = company2,
            ManagerName = "Ramesh",
            ManagerPhone = "9876500000",
            Rating = 4.6,
        };
        context.Shops.AddRange(shop1, shop2, shop3);

        // Product categories
        var catChicken = new ProductCategoryEntity { Name = "Chicken", Category = ProductCategory.Chicken, Emoji = "🐓" };
        var catMutton = new ProductCategoryEntity { Name = "Mutton", Category = ProductCategory.Mutton, Emoji = "🐐" };
        var catFish = new ProductCategoryEntity { Name = "Fish", Category = ProductCategory.Fish, Emoji = "🐟" };
        context.ProductCategories.AddRange(catChicken, catMutton, catFish);

        // Products
        var p1 = new Product { Name = "Country Chicken", CategoryId = catChicken.Id, Category = ProductCategory.Chicken, Emoji = "🐓", PricePerKilogram = 280m, Freshness = "Freshly cut today", Quality = 5, Shop = shop1, Unit = "KG" };
        var p2 = new Product { Name = "Broiler Chicken", CategoryId = catChicken.Id, Category = ProductCategory.Chicken, Emoji = "🍗", PricePerKilogram = 185m, Freshness = "Chilled & packed", Quality = 4, Shop = shop1, Unit = "KG" };
        var p3 = new Product { Name = "Goat Mutton", CategoryId = catMutton.Id, Category = ProductCategory.Mutton, Emoji = "🐐", PricePerKilogram = 720m, Freshness = "Farm fresh", Quality = 5, Shop = shop1, Unit = "KG" };
        var p4 = new Product { Name = "Seer Fish", CategoryId = catFish.Id, Category = ProductCategory.Fish, Emoji = "🐟", PricePerKilogram = 420m, Freshness = "Catch of the day", Quality = 5, Shop = shop3, Unit = "KG" };
        var p5 = new Product { Name = "Rohu Fish", CategoryId = catFish.Id, Category = ProductCategory.Fish, Emoji = "🐠", PricePerKilogram = 220m, Freshness = "River fresh", Quality = 4, Shop = shop3, Unit = "KG" };
        context.Products.AddRange(p1, p2, p3, p4, p5);

        foreach (var p in new[] { p1, p2, p3, p4, p5 })
        {
            foreach (var cut in new[] { "Curry Cut", "Biryani Cut", "Whole", "Boneless" })
            {
                context.CuttingPreferences.Add(new CuttingPreference { Product = p, Name = cut });
            }
        }

        // Demo users
        var demo = new (string Name, string Phone, UserRole Role, Guid? CompanyId, Guid? ShopId)[]
        {
            ("Anand Krishnan", "9842500001", UserRole.CUSTOMER, null, null),
            ("Murugan Selvam", "9842500002", UserRole.SHOP_ADMIN, company.Id, shop1.Id),
            ("Santhosh Kumar", "9842500003", UserRole.COMPANY_ADMIN, company.Id, null),
            ("Rajendran V", "9842500004", UserRole.SUPER_ADMIN, null, null),
            ("Divya Balaji", "9842500005", UserRole.DELIVERY_MANAGER, null, null),
            ("Ravi Shankar", "9842500006", UserRole.DELIVERY_PARTNER, null, null),
        };

        foreach (var (name, phone, role, companyId, shopId) in demo)
        {
            var user = new User
            {
                FullName = name,
                Phone = phone,
                PasswordHash = hasher.Hash("KanniMeat@123"),
                CompanyId = companyId,
                ShopId = shopId,
                Status = UserAccountStatus.Active,
            };
            context.Users.Add(user);
            context.RoleAssignments.Add(new RoleAssignment { User = user, Role = roles[role.ToString()] });
            if (role == UserRole.CUSTOMER)
                context.Customers.Add(new Customer { FullName = name, Phone = phone, User = user });
        }

        var partner = new DeliveryPartner
        {
            FullName = "Ravi Shankar",
            Phone = "9842500006",
            City = "Tindivanam",
            Area = "Anna Salai",
            VehicleNumber = "TN31 AA 4421",
            Shop = shop1,
            IsActive = true,
            Rating = 4.6,
        };
        context.DeliveryPartners.Add(partner);

        // Demo orders + inventory so dashboards have data
        var today = DateTime.Today;
        var tomorrow = today.AddDays(1);

        var inventories = new List<InventoryItem>();
        foreach (var p in context.Products.ToList())
        {
            foreach (var s in new[] { shop1, shop2, shop3 })
            {
                inventories.Add(new InventoryItem
                {
                    Shop = s, Product = p,
                    AvailableKg = 25m, ReservedKg = 5m, ExpectedDemandKg = 12m,
                    UnitPricePerKilogram = p.PricePerKilogram,
                });
            }
        }
        context.InventoryItems.AddRange(inventories);

        await context.SaveChangesAsync();

        // Seed notifications
        var notifications = new[]
        {
            new Notification { Role = "customer", Title = "Welcome to KanniMeat!", Body = "Order fresh meat for delivery tomorrow.", Icon = "celebration" },
            new Notification { Role = "shop", Title = "3 new orders for tomorrow", Body = "Review and confirm tomorrow's orders.", Icon = "receipt_long" },
            new Notification { Role = "company_admin", Title = "Weekly report ready", Body = "Your sales report for this week is available.", Icon = "bar_chart" },
            new Notification { Role = "super_admin", Title = "New company pending approval", Body = "A new company has requested onboarding.", Icon = "apartment" },
            new Notification { Role = "delivery_manager", Title = "5 orders ready for dispatch", Body = "Assign delivery partners before 9 AM.", Icon = "local_shipping" },
            new Notification { Role = "delivery_partner", Title = "New delivery assigned", Body = "You have a new delivery for today.", Icon = "motorcycle" },
        };
        context.Notifications.AddRange(notifications);

        await context.SaveChangesAsync();
    }

    private static List<Permission> SeedPermissions(AppDbContext context)
    {
        var codes = new[]
        {
            "dashboard.view", "orders.view", "orders.create", "orders.update_status", "orders.assign",
            "products.view", "products.create", "products.update", "products.delete",
            "inventory.view", "inventory.update", "shops.view", "shops.create", "shops.update",
            "companies.view", "companies.create", "companies.update", "customers.view",
            "deliveries.view", "deliveries.assign", "payments.view", "payments.record",
            "invoices.view", "invoices.create", "notifications.view", "users.view", "users.manage", "settings.manage",
        };

        return codes.Select(code => new Permission
        {
            Code = code,
            Description = code.Replace('.', ' '),
        }).ToList();
    }
}