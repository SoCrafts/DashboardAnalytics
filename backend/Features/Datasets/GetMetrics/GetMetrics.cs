using DashboardAnalyticsAPI.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using DashboardAnalyticsAPI.Features.Shared;
using System.Security.Claims;

namespace Features.Datasets.GetMetrics;

public static class GetMetrics
{
    public record MetricResponse(string Column, decimal Sum, decimal Avg, int Count);

    public static async Task<IResult> Handler(
        Guid id,
        DashboardContext db,
        ClaimsPrincipal user)
    {
        var (dataset, error) = await AuthorizationHelpers.GetOwnedDatasetAsync(id, db, user);
        if (error != null) return error;

        var columns = await db.DatasetColumns
            .Where(c => c.DatasetId == id && c.DataType == "number")
            .ToListAsync();

        var rows = await db.DatasetRows
            .Where(r => r.DatasetId == id)
            .Select(r => r.JsonData)
            .ToListAsync();

        var metrics = new List<MetricResponse>();

        foreach (var col in columns)
        {
            var values = AnalysisHelpers.ExtractNumericValues(rows, col.Name);

            if (values.Any())
            {
                var sum = values.Sum();
                var count = values.Count();
                metrics.Add(new MetricResponse(col.Name, sum, sum / count, count));
            }
        }

        return Results.Ok(metrics);
    }
}