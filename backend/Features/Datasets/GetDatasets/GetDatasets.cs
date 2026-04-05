using DashboardAnalyticsAPI.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using DashboardAnalyticsAPI.Features.Shared;
using System.Security.Claims;

namespace Features.Datasets.GetDatasets;

public static class GetDatasets
{
    public record DatasetSummaryDto(
        Guid     Id,
        string   Name,
        string   Description,
        Guid     UserId,
        DateTime CreatedAt,
        int      RowCount,
        bool     HasData,
        string   Status);

    public static async Task<IResult> Handler(
        DashboardContext db,
        ClaimsPrincipal user)
    {
        var userId = user.GetRequiredUserId();

        // Single query: row counts computed in SQL via navigation property projection
        var datasets = await db.Datasets
            .Where(d => d.UserId == userId)
            .OrderByDescending(d => d.CreatedAt)
            .Select(d => new DatasetSummaryDto(
                d.Id,
                d.Name,
                d.Description,
                d.UserId,
                d.CreatedAt,
                d.Rows.Count,
                d.Rows.Any(),
                d.Rows.Any() ? "Ready" : "Empty"))
            .ToListAsync();

        return Results.Ok(datasets);
    }
}
