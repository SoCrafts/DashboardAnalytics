using DashboardAnalyticsAPI.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using DashboardAnalyticsAPI.Features.Shared;
using System.Security.Claims;

namespace Features.Datasets.GetDataset;

public static class GetDataset
{
    public record ColumnDto(string Name, string Type);
    
    public record Response(
        Guid Id, 
        string Name, 
        string Description, 
        DateTime CreatedAt, 
        int RowCount, 
        bool HasData, 
        IEnumerable<ColumnDto> Columns,
        string Status
    );

    public static async Task<IResult> Handler(
        Guid id,
        DashboardContext db,
        ClaimsPrincipal user)
    {
        var (dataset, error) = await AuthorizationHelpers.GetOwnedDatasetAsync(id, db, user);
        if (error != null) return error;

        var rowCount = await db.DatasetRows
            .Where(r => r.DatasetId == id)
            .CountAsync();

        var columns = await db.DatasetColumns
            .Where(c => c.DatasetId == id)
            .Select(c => new ColumnDto(c.Name, c.DataType))
            .ToListAsync();

        var hasData = rowCount > 0;
        var status = hasData ? "Ready" : "Empty";

        var response = new Response(
            dataset!.Id,
            dataset.Name,
            dataset.Description,
            dataset.CreatedAt,
            rowCount,
            hasData,
            columns,
            status
        );

        return Results.Ok(response);
    }
}
