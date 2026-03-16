using DashboardAnalyticsAPI.Infrastructure.Data;
using DashboardAnalyticsAPI.Infrastructure.Auth;
using DashboardAnalyticsAPI.Infrastructure.Security;
using Features.Auth.Login;
using Features.Auth.Register;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Production hosting note:
// - Secrets (DB connection string, JWT signing key) are NOT stored in appsettings.json.
// - On shared hosting (e.g. IIS/MonsterASP.NET), configure these as environment variables.
var databaseConnectionString =
    Environment.GetEnvironmentVariable("DATABASE_CONNECTION_STRING")
    ?? builder.Configuration.GetConnectionString("DefaultConnection")
    ?? throw new InvalidOperationException(
        "Database connection string is missing. Set DATABASE_CONNECTION_STRING or configure ConnectionStrings:DefaultConnection.");

var jwtKey =
    Environment.GetEnvironmentVariable("JWT_KEY")
    ?? builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException(
        "JWT key is missing. Set JWT_KEY or configure Jwt:Key (Development only).");

var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? "DashboardAnalyticsAPI";

// DbContext
builder.Services.AddDbContext<DashboardContext>(options =>
    options.UseSqlServer(databaseConnectionString)
);

// CORS
// In production, the React app is served from the same origin (wwwroot), so CORS is not required.
// In development, allow the Vite dev server origin.
if (builder.Environment.IsDevelopment())
{
    builder.Services.AddCors(options =>
    {
        options.AddPolicy("frontend", policy =>
        {
            policy.WithOrigins("http://localhost:5173")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
    });
}

// JWT
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new()
        {
            ValidateIssuer = true,
            ValidateAudience = false,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
                System.Text.Encoding.UTF8.GetBytes(jwtKey)
            )
        };
    });

builder.Services.AddAuthorization();

// Infrastructure services
builder.Services.AddScoped<IPasswordHasher, PasswordHasher>();
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.CustomSchemaIds(type => type.FullName?.Replace("+", ".") ?? type.Name);
});


var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    // app.MapOpenApi();
}
else
{
    // Production safety:
    // - Hide detailed exceptions
    // - Enforce HSTS (HTTPS only) when behind a proper TLS endpoint
    app.UseExceptionHandler("/error");
    app.UseHsts();
}

app.UseHttpsRedirection();

// Serve compiled React SPA from wwwroot (place the build output here before publishing).
app.UseDefaultFiles();
app.UseStaticFiles();

if (app.Environment.IsDevelopment())
{
    app.UseCors("frontend");
}
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/error", () => Results.Problem("An unexpected error occurred."));

// Map endpoints direttamente dalle feature
Register.MapEndpoint(app);
Login.MapEndpoint(app);

// SPA fallback (enables React router refresh/deep links)
app.MapFallbackToFile("index.html");

app.Run();