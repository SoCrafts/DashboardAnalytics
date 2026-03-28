using DashboardAnalyticsAPI.Features.Shared;
using DashboardAnalyticsAPI.Infrastructure.Data;
using System.Security.Claims;

namespace Features.Datasets.DeleteDataset;

public static class DeleteDataset
{
    public static async Task<IResult> Handler(
        Guid id,
        DashboardContext db,
        ClaimsPrincipal user)
    {
        var (dataset, error) = await AuthorizationHelpers.GetOwnedDatasetAsync(id, db, user);
        if (error != null) return error;

        // Cascade deletion of rows and columns is now handled by EF Core 
        // via the configuration in DashboardContext.OnModelCreating.
        db.Datasets.Remove(dataset!);
        await db.SaveChangesAsync();

        return Results.NoContent();
    }
}
