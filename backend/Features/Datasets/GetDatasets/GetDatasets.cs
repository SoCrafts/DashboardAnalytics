using DashboardAnalyticsAPI.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using DashboardAnalyticsAPI.Features.Shared;
using System.Security.Claims;

namespace Features.Datasets.GetDatasets;

public static class GetDatasets
{
    public static async Task<IResult> Handler(
        DashboardContext db,
        ClaimsPrincipal user)
    {
        var userId = user.GetRequiredUserId();

        var datasets = await db.Datasets
            .Where(d => d.UserId == userId)
            .OrderByDescending(d => d.CreatedAt)
            .ToListAsync();

        return Results.Ok(datasets);
    }
}
