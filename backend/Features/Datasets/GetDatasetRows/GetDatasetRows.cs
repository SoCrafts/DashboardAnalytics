using DashboardAnalyticsAPI.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using DashboardAnalyticsAPI.Features.Shared;
using System.Security.Claims;

namespace Features.Datasets.GetDatasetRows;

public static class GetDatasetRows
{
    public record Request(int Page = 1, int PageSize = 100);

    public record ColumnDto(string Name, string DataType);

    public record Response(
        IEnumerable<ColumnDto> Columns,
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
        var (dataset, error) = await AuthorizationHelpers.GetOwnedDatasetAsync(id, db, user);
        if (error != null) return error;

        var columns = await db.DatasetColumns
            .Where(c => c.DatasetId == id)
            .Select(c => new ColumnDto(c.Name, c.DataType))
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
