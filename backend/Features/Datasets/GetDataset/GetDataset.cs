using System.Security.Claims;
using DashboardAnalyticsAPI.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

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
        var userIdString = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdString, out var userId))
        {
            return Results.Unauthorized();
        }

        var dataset = await db.Datasets
            .Where(d => d.Id == id)
            .Select(d => new { d.Id, d.Name, d.Description, d.CreatedAt, d.UserId })
            .FirstOrDefaultAsync();

        if (dataset == null || dataset.UserId != userId)
        {
            return Results.NotFound(new { Message = "Dataset not found" });
        }

        // Count DatasetRows WHERE DatasetId == id
        var rowCount = await db.DatasetRows
            .Where(r => r.DatasetId == id)
            .CountAsync();

        var hasData = rowCount > 0;
        var status = hasData ? "Ready" : "Empty";
        var columns = new List<ColumnDto>(); // Empty list for now

        var response = new Response(
            dataset.Id,
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
