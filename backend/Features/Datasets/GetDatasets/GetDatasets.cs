using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using DashboardAnalyticsAPI.Infrastructure.Data;

namespace Features.Datasets.GetDatasets;

public static class GetDatasets
{
    public record Response(Guid Id, string Name, string Description, DateTime CreatedAt);

    public static async Task<IResult> Handler(
        DashboardContext db,
        ClaimsPrincipal user)
    {
        var userId = Guid.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var datasets = await db.Datasets
            .Where(d => d.UserId == userId)
            .OrderByDescending(d => d.CreatedAt)
            .Select(d => new Response(d.Id, d.Name, d.Description, d.CreatedAt))
            .ToListAsync();

        return Results.Ok(datasets);
    }
}
