using System.Security.Claims;
using DashboardAnalyticsAPI.Infrastructure.Data;
using DashboardAnalyticsAPI.Domain;
using Microsoft.EntityFrameworkCore;

namespace DashboardAnalyticsAPI.Features.Shared;

public static class AuthorizationHelpers
{
    public static async Task<(Dataset? Dataset, IResult? Error)> GetOwnedDatasetAsync(
        Guid id, 
        DashboardContext db, 
        ClaimsPrincipal user)
    {
        var userIdString = user.FindFirst("sub")?.Value 
                   ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!Guid.TryParse(userIdString, out var userId))
        {
            return (null, Results.Unauthorized());
        }

        var dataset = await db.Datasets
            .FirstOrDefaultAsync(d => d.Id == id);

        if (dataset == null)
        {
            return (null, Results.NotFound(new { Message = "Dataset not found" }));
        }

        if (dataset.UserId != userId)
        {
            return (null, Results.Forbid());
        }

        return (dataset, null);
    }
}
