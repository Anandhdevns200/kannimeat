using System.Text;

using KanniMeat.Infrastructure;
using KanniMeat.Infrastructure.Data;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

// Render terminates TLS at its edge proxy and forwards the original scheme and
// client address. Trusting those headers is required so that UseHttpsRedirection
// and the generated request logs reflect the real scheme.
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

// Origins the Angular client is served from. Configured via Cors:AllowedOrigins,
// which can be supplied as "Cors__AllowedOrigins__0", "Cors__AllowedOrigins__1", ...
// on the host. The defaults keep local ng serve working.
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>()
    ?? ["http://localhost:4200", "http://127.0.0.1:4200"];

builder.Services.AddCors(options =>
{
    options.AddPolicy("KanniMeatClient", policy =>
    {
        if (allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins)
                .AllowAnyHeader()
                .AllowAnyMethod()
                .AllowCredentials();
        }
    });
});

builder.Services.AddControllers();

builder.Services.AddInfrastructure(builder.Configuration);

// JWT bearer authentication with RBAC via role claims
var jwtKey = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(jwtKey))
{
    throw new InvalidOperationException(
        "Jwt:Key is not configured. Set the Jwt__Key environment variable.");
}

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidateAudience = true,
            ValidAudience = builder.Configuration["Jwt:Audience"],
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1),
        };
    });

builder.Services.AddAuthorization();

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var app = builder.Build();

app.UseForwardedHeaders();

// The schema is created with EnsureCreated because the project carries no EF Core
// migrations. Opt in with Database__InitializeOnStartup=true so the service can
// still boot (and report its state through /health) when the database is absent.
var initializeOnStartup = app.Configuration.GetValue("Database:InitializeOnStartup", false)
    || app.Environment.IsDevelopment();

if (initializeOnStartup)
{
    using var scope = app.Services.CreateScope();
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    try
    {
        await db.Database.EnsureCreatedAsync();
        await KanniMeat.Infrastructure.Data.DbSeeder.SeedAsync(db);
        app.Logger.LogInformation("Database schema ensured and demo data seeded.");
    }
    catch (Exception ex)
    {
        app.Logger.LogError(ex, "Database initialization failed. The API will start but data endpoints will fail until the database is reachable.");
    }
}

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseCors("KanniMeatClient");

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/health", () => Results.Ok(new { status = "ok" }))
   .AllowAnonymous()
   .ExcludeFromDescription();

app.MapControllers();

app.Run();
