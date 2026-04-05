using DashboardAnalyticsAPI.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using DashboardAnalyticsAPI.Features.Shared;
using DashboardAnalyticsAPI.Domain;
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
            .Where(c => c.DatasetId == id && c.DataType == ColumnDataType.Number)
            .ToListAsync();

        if (columns.Count == 0)
            return Results.Ok(Array.Empty<MetricResponse>());

        var rowsJson = await db.DatasetRows
            .Where(r => r.DatasetId == id)
            .Select(r => r.JsonData)
            .ToListAsync();

        // Parse all rows once; extract each numeric column from the pre-parsed elements
        var columnData = AnalysisHelpers.ExtractAllColumns(rowsJson, columns.Select(c => c.Name));

        var metrics = new List<MetricResponse>(columns.Count);

        foreach (var col in columns)
        {
            var values = AnalysisHelpers.GetNumericValues(columnData[col.Name]);
            if (values.Count == 0) continue;

            metrics.Add(new MetricResponse(
                col.Name,
                Sum:   values.Sum(),
                Avg:   values.Average(),
                Count: values.Count));
        }

        return Results.Ok(metrics);
    }
}