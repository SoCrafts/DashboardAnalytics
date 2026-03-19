using System.Security.Claims;
using DashboardAnalyticsAPI.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace Features.Datasets.GetDatasetRows;

public static class GetDatasetRows
{
    public record Request(int Page = 1, int PageSize = 100);
    
    public record Response(
        IEnumerable<DashboardAnalyticsAPI.Domain.DatasetColumn> Columns,
        IEnumerable<Dictionary<string, object?>> Rows,
        int TotalRows,
        int Page,
        int PageSize
    );

    public static async Task<IResult> Handler(
        Guid id,
        [Microsoft.AspNetCore.Http.AsParameters] Request request,
        DashboardContext db,
        ClaimsPrincipal user)
    {
        var userIdString = user.FindFirst("sub")?.Value 
                   ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!Guid.TryParse(userIdString, out var userId))
        {
            return Results.Unauthorized();
        }

        var dataset = await db.Datasets
            .Where(d => d.Id == id)
            .Select(d => new { d.Id, d.UserId })
            .FirstOrDefaultAsync();

        if (dataset == null || dataset.UserId != userId)
        {
            return Results.NotFound(new { Message = "Dataset not found" });
        }

        var columns = await db.DatasetColumns
            .Where(c => c.DatasetId == id)
            .ToListAsync();

        var totalRows = await db.DatasetRows
            .Where(r => r.DatasetId == id)
            .CountAsync();

        var rowsJson = await db.DatasetRows
            .Where(r => r.DatasetId == id)
            .OrderBy(r => r.Id)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(r => r.JsonData)
            .ToListAsync();

        var rows = rowsJson
            .Select(j => JsonSerializer.Deserialize<Dictionary<string, object?>>(j))
            .ToList()!;

        return Results.Ok(new Response(columns, rows!, totalRows, request.Page, request.PageSize));
    }
}
