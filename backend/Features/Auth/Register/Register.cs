namespace Features.Auth.Register;

using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using DashboardAnalyticsAPI.Infrastructure.Data;
using DashboardAnalyticsAPI.Domain;
using DashboardAnalyticsAPI.Infrastructure.Security;

public static class Register
{
    public record Request(string Username, string Email, string Password);

    public static async Task<IResult> Handler(
        Request request,
        DashboardContext db,
        IPasswordHasher passwordHasher)
    {
        if (string.IsNullOrWhiteSpace(request.Username))
            return Results.BadRequest(new { Message = "Username is required." });

        if (string.IsNullOrWhiteSpace(request.Email) || !request.Email.Contains('@'))
            return Results.BadRequest(new { Message = "A valid email is required." });

        if (string.IsNullOrEmpty(request.Password) || request.Password.Length < 6)
            return Results.BadRequest(new { Message = "Password must be at least 6 characters long." });

        if (await db.Users.AnyAsync(u => u.Email == request.Email))
            return Results.Conflict(new { Message = "User with this email already exists" });

        try
        {
            var user = new User
            {
                Id           = Guid.NewGuid(),
                Username     = request.Username,
                Email        = request.Email,
                PasswordHash = passwordHasher.Hash(request.Password),
                Role         = "User",
                CreatedAt    = DateTime.UtcNow
            };

            db.Users.Add(user);
            await db.SaveChangesAsync();

            return Results.Ok(new { Message = "User registered successfully" });
        }
        catch (Exception)
        {
            return Results.Problem(
                title:      "Registration Error",
                detail:     "An unexpected error occurred during registration. Please try again.",
                statusCode: 500);
        }
    }
}