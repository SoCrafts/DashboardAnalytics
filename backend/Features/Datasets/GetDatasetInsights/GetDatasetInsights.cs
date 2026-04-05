using DashboardAnalyticsAPI.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using DashboardAnalyticsAPI.Features.Shared;
using DashboardAnalyticsAPI.Domain;
using System.Security.Claims;

namespace Features.Datasets.GetDatasetInsights;

public static class GetDatasetInsights
{
    public record CategoryData(string Name, int Count);
    public record DistributionData(string Range, int Count);
    public record TrendData(string Date, decimal Value);
    public record SummaryData(decimal Min, decimal Max, decimal Avg, decimal Median);

    public record Response(
        Dictionary<string, IEnumerable<CategoryData>>    Categorical,
        Dictionary<string, IEnumerable<DistributionData>> Distributions,
        Dictionary<string, IEnumerable<TrendData>>       Trends,
        Dictionary<string, SummaryData>                  Summary);

    public static async Task<IResult> Handler(
        Guid id,
        DashboardContext db,
        ClaimsPrincipal user)
    {
        var (dataset, error) = await AuthorizationHelpers.GetOwnedDatasetAsync(id, db, user);
        if (error != null) return error;

        var allColumns = await db.DatasetColumns
            .Where(c => c.DatasetId == id)
            .ToListAsync();

        var rowsJson = await db.DatasetRows
            .Where(r => r.DatasetId == id)
            .Select(r => r.JsonData)
            .ToListAsync();

        var categorical   = new Dictionary<string, IEnumerable<CategoryData>>();
        var distributions = new Dictionary<string, IEnumerable<DistributionData>>();
        var trends        = new Dictionary<string, IEnumerable<TrendData>>();
        var summary       = new Dictionary<string, SummaryData>();

        if (rowsJson.Count == 0)
            return Results.Ok(new Response(categorical, distributions, trends, summary));

        // ── Parse every row once, fan out to per-column element lists ──────────
        var columnData = AnalysisHelpers.ExtractAllColumns(
            rowsJson, allColumns.Select(c => c.Name));

        // Cache the first numeric column for date-trend pairing
        var firstNumericCol = allColumns.FirstOrDefault(c => c.DataType == ColumnDataType.Number);

        foreach (var col in allColumns)
        {
            var elems = columnData[col.Name];

            // ── Categorical (string / boolean) ─────────────────────────────────
            if (col.DataType == ColumnDataType.String || col.DataType == ColumnDataType.Boolean)
            {
                var counts = AnalysisHelpers.GetCategoryCounts(elems);

                if (counts.Count > 0 && counts.Count <= rowsJson.Count * 0.5)
                {
                    var topCategories = counts
                        .Where(kv => kv.Value > 1)
                        .OrderByDescending(kv => kv.Value)
                        .Take(15)
                        .Select(kv => new CategoryData(kv.Key, kv.Value))
                        .ToList();

                    if (topCategories.Count > 0)
                        categorical[col.Name] = topCategories;
                }
            }

            // ── Numeric: summary stats + histogram ─────────────────────────────
            else if (col.DataType == ColumnDataType.Number)
            {
                var values = AnalysisHelpers.GetNumericValues(elems);
                if (values.Count == 0) continue;

                var min    = values.Min();
                var max    = values.Max();
                var avg    = values.Average();
                var sorted = values.Order().ToList();
                var median = sorted.Count % 2 == 0
                    ? (sorted[sorted.Count / 2 - 1] + sorted[sorted.Count / 2]) / 2
                    : sorted[sorted.Count / 2];

                summary[col.Name] = new SummaryData(min, max, avg, median);

                if (max > min)
                {
                    const int bucketCount = 10;
                    var bucketSize = (max - min) / bucketCount;
                    if (bucketSize == 0) bucketSize = 1;

                    var histogram = new int[bucketCount];
                    foreach (var v in values)
                    {
                        int idx = (int)((v - min) / bucketSize);
                        if (idx >= bucketCount) idx = bucketCount - 1;
                        histogram[idx]++;
                    }

                    var distData = Enumerable.Range(0, bucketCount).Select(i =>
                    {
                        decimal lo = min + i * bucketSize;
                        decimal hi = min + (i + 1) * bucketSize;
                        return new DistributionData($"{lo:0.##}-{hi:0.##}", histogram[i]);
                    }).ToList();

                    distributions[col.Name] = distData;
                }
            }

            // ── Date: trend line paired with first numeric column ──────────────
            else if (col.DataType == ColumnDataType.Date || col.DataType == ColumnDataType.DateTime)
            {
                if (firstNumericCol == null) continue;

                var dateElems = elems;
                var numElems  = columnData[firstNumericCol.Name];

                var dateValues = new Dictionary<string, List<decimal>>();

                for (int i = 0; i < dateElems.Count; i++)
                {
                    var dateElem = dateElems[i];
                    var numElem  = numElems[i];

                    if (dateElem.ValueKind == JsonValueKind.Undefined) continue;
                    if (numElem.ValueKind != JsonValueKind.Number)     continue;
                    if (!numElem.TryGetDecimal(out var numVal))        continue;

                    var dateStr = AnalysisHelpers.GetStringValue(dateElem);
                    if (!DateTime.TryParse(dateStr, out var dt))       continue;

                    var key = dt.ToString("yyyy-MM-dd");
                    if (!dateValues.TryGetValue(key, out var list))
                        dateValues[key] = list = [];
                    list.Add(numVal);
                }

                if (dateValues.Count > 0)
                {
                    trends[col.Name] = dateValues
                        .Select(kv => new TrendData(kv.Key, kv.Value.Average()))
                        .OrderBy(t => t.Date)
                        .ToList();
                }
            }
        }

        return Results.Ok(new Response(categorical, distributions, trends, summary));
    }
}
