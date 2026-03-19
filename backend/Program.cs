using DashboardAnalyticsAPI.Infrastructure.Data;
using DashboardAnalyticsAPI.Infrastructure.Auth;
using DashboardAnalyticsAPI.Infrastructure.Security;
using Features.Auth.Login;
using Features.Auth.Register;
using Features.Datasets.CreateDataset;
using Features.Datasets.GetDatasets;
using Features.Datasets.GetDataset;
using Features.Datasets.DeleteDataset;
using Features.Datasets.GetDatasetRows;
using Features.Datasets.UploadDataset;
using Features.Datasets.PreviewDataset;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;

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
// Enable global CORS to ensure no cross-origin errors manifest when calling the API from the deployed frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("frontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// JWT
JwtSecurityTokenHandler.DefaultInboundClaimTypeMap.Clear();
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
// Automatically apply EF Core migrations on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<DashboardContext>();
    var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

    try
    {
        db.Database.Migrate();
    }
    catch (Exception ex)
    {
        logger.LogError(ex, "Database migration failed.");
        throw;
    }
}

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

app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

// Serve compiled React SPA from wwwroot (place the build output here before publishing).
app.UseDefaultFiles();
app.UseStaticFiles();

app.UseCors("frontend");
app.UseAuthentication();
app.UseAuthorization();

app.Map("/error", (HttpContext context, ILoggerFactory loggerFactory) => 
{
    var exceptionFeature = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerPathFeature>();
    if (exceptionFeature?.Error is not null)
    {
        var logger = loggerFactory.CreateLogger("ExceptionHandler");
        logger.LogError(exceptionFeature.Error, "An unhandled exception occurred while processing the request.");
    }
    return Results.Problem("An unexpected error occurred.");
});

// Map endpoints direttamente dalle feature
Register.MapEndpoint(app);
Login.MapEndpoint(app);
CreateDatasetEndpoint.MapEndpoint(app);
GetDatasetsEndpoint.MapEndpoint(app);
GetDatasetEndpoint.MapEndpoint(app);
DeleteDatasetEndpoint.MapEndpoint(app);
UploadDatasetEndpoint.MapEndpoint(app);
PreviewDatasetEndpoint.MapEndpoint(app);
GetDatasetRowsEndpoint.MapEndpoint(app);

// Diagnostic Ping endpoint
app.MapGet("/api/ping", () => Results.Ok(new { Message = "pong" }));

// SPA fallback (enables React router refresh/deep links)
app.MapFallbackToFile("index.html");

app.Run();