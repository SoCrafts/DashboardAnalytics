namespace Features.Auth.Login;

using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using DashboardAnalyticsAPI.Infrastructure.Data;
using DashboardAnalyticsAPI.Infrastructure.Security;
using DashboardAnalyticsAPI.Infrastructure.Auth;

public static class Login
{
    public record Request(string Email, string Password);

    public static async Task<IResult> Handler(
        Request req,
        DashboardContext db,
        IPasswordHasher passwordHasher,
        IJwtTokenService jwtTokenService)
    {
        var user = await db.Users
            .AsNoTracking()
            .FirstOrDefaultAsync(u => u.Email == req.Email);

        if (user == null || !passwordHasher.Verify(req.Password, user.PasswordHash))
            return Results.Unauthorized();

        var token = jwtTokenService.GenerateToken(user);
        return Results.Ok(new { token });
    }
}