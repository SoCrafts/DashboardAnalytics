using System.Security.Claims;

namespace DashboardAnalyticsAPI.Features.Shared;

public static class ClaimsPrincipalExtensions
{
    public static Guid? GetUserId(this ClaimsPrincipal user)
    {
        var userIdString = user.FindFirst("sub")?.Value 
                   ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        return Guid.TryParse(userIdString, out var userId) ? userId : null;
    }

    public static Guid GetRequiredUserId(this ClaimsPrincipal user)
    {
        return GetUserId(user) ?? throw new UnauthorizedAccessException("User ID claim is missing or invalid.");
    }
}
