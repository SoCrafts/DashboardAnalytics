using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using DashboardAnalyticsAPI.Infrastructure.Data;
using System.Text.Json;

namespace Features.Datasets.GetMetrics;

public static class GetMetrics
{
    public record MetricColumn(string Name, decimal Sum, decimal Avg, int Count);
    public record Response(IEnumerable<MetricColumn> Columns);

    public static async Task<IResult> Handler(
        Guid id,
        DashboardContext db,
        ClaimsPrincipal user)
    {
        var userIdStr = user.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (!Guid.TryParse(userIdStr, out var userId))
            return Results.Unauthorized();

        var dataset = await db.Datasets
            .Where(d => d.Id == id)
            .Select(d => new { d.Id, d.UserId })
            .FirstOrDefaultAsync();

        if (dataset == null)
            return Results.NotFound(new { Message = "Dataset not found" });

        if (dataset.UserId != userId)
            return Results.Forbid();

        var numericColumns = await db.DatasetColumns
            .Where(c => c.DatasetId == id && c.DataType == "number")
            .ToListAsync();

        var metrics = new List<MetricColumn>();

        if (!numericColumns.Any())
            return Results.Ok(new Response(metrics));

        // Fetch all rows for this dataset
        var rows = await db.DatasetRows
            .Where(r => r.DatasetId == id)
            .Select(r => r.JsonData)
            .ToListAsync();

        foreach (var col in numericColumns)
        {
            var numericValues = new List<decimal>();

            foreach (var rowJson in rows)
            {
                try
                {
                    using var doc = JsonDocument.Parse(rowJson);
                    if (doc.RootElement.TryGetProperty(col.Name, out var colElement) &&
                        colElement.TryGetDecimal(out var val))
                    {
                        numericValues.Add(val);
                    }
                }
                catch
                {
                    // skip invalid JSON or missing property
                }
            }

            if (numericValues.Any())
            {
                metrics.Add(new MetricColumn(
                    col.Name,
                    numericValues.Sum(),
                    numericValues.Average(),
                    numericValues.Count
                ));
            }
        }

        return Results.Ok(new Response(metrics));
    }
}