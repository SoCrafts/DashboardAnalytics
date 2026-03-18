using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using DashboardAnalyticsAPI.Infrastructure.Data;

namespace Features.Datasets.DeleteDataset;

public static class DeleteDataset
{
    public static async Task<IResult> Handler(
        Guid id,
        DashboardContext db,
        ClaimsPrincipal user)
    {
        var userId = Guid.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var dataset = await db.Datasets
            .FirstOrDefaultAsync(d => d.Id == id);

        if (dataset == null)
            return Results.NotFound();

        if (dataset.UserId != userId)
            return Results.Forbid();

        db.Datasets.Remove(dataset);
        await db.SaveChangesAsync();

        return Results.NoContent();
    }
}
