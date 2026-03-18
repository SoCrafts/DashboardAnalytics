namespace Features.Auth.Register;

using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using DashboardAnalyticsAPI.Infrastructure.Data;
using DashboardAnalyticsAPI.Domain;
using DashboardAnalyticsAPI.Infrastructure.Security;

public static class Register
{
    public record Request(string Username, string Email, string Password);

    public static void MapEndpoint(WebApplication app)
    {
        app.MapPost("/api/auth/register", async (Request req, DashboardContext db, IPasswordHasher passwordHasher) =>
        {
            try 
            {
                if (await db.Users.AnyAsync(u => u.Email == req.Email))
                    return Results.Conflict(new { Message = "Email already registered" });

                var user = new User
                {
                    Id = Guid.NewGuid(),
                    Username = req.Username,
                    Email = req.Email,
                    PasswordHash = passwordHasher.Hash(req.Password),
                    Role = "User",
                    CreatedAt = DateTime.UtcNow
                };

                db.Users.Add(user);
                await db.SaveChangesAsync();

                return Results.Ok(new { Message = "User registered successfully" });
            }
            catch (Exception ex)
            {
                // Directly return the exception as JSON so it doesn't kill the TCP connection.
                return Results.Problem(
                    title: "Registration Error",
                    detail: ex.ToString(),
                    statusCode: 500
                );
            }
        });
    }
}