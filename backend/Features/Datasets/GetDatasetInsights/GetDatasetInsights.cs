using DashboardAnalyticsAPI.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using DashboardAnalyticsAPI.Features.Shared;
using System.Security.Claims;

namespace Features.Datasets.GetDatasetInsights;

public static class GetDatasetInsights
{
    public record CategoryData(string Name, int Count);
    public record DistributionData(string Range, int Count);
    public record TrendData(string Date, decimal Value);
    public record SummaryData(decimal Min, decimal Max, decimal Avg, decimal Median);

    public record Response(
        Dictionary<string, IEnumerable<CategoryData>> Categorical,
        Dictionary<string, IEnumerable<DistributionData>> Distributions,
        Dictionary<string, IEnumerable<TrendData>> Trends,
        Dictionary<string, SummaryData> Summary
    );

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

        var rows = await db.DatasetRows
            .Where(r => r.DatasetId == id)
            .Select(r => r.JsonData)
            .ToListAsync();

        var categorical = new Dictionary<string, IEnumerable<CategoryData>>();
        var distributions = new Dictionary<string, IEnumerable<DistributionData>>();
        var trends = new Dictionary<string, IEnumerable<TrendData>>();
        var summary = new Dictionary<string, SummaryData>();

        if (!rows.Any())
            return Results.Ok(new Response(categorical, distributions, trends, summary));

        foreach (var col in allColumns)
        {
            if (col.DataType == "string" || col.DataType == "boolean")
            {
                var counts = AnalysisHelpers.ExtractCategoryCounts(rows, col.Name);

                if (counts.Count > 0 && counts.Count <= rows.Count * 0.5)
                {
                    var topCategories = counts
                        .Where(kv => kv.Value > 1)
                        .OrderByDescending(kv => kv.Value)
                        .Take(15)
                        .Select(kv => new CategoryData(kv.Key, kv.Value))
                        .ToList();

                    if (topCategories.Any())
                        categorical[col.Name] = topCategories;
                }
            }
            else if (col.DataType == "number")
            {
                var values = AnalysisHelpers.ExtractNumericValues(rows, col.Name);

                if (values.Any())
                {
                    var min = values.Min();
                    var max = values.Max();
                    var avg = values.Average();
                    var sorted = values.OrderBy(v => v).ToList();
                    var median = sorted.Count % 2 == 0 
                        ? (sorted[sorted.Count / 2 - 1] + sorted[sorted.Count / 2]) / 2 
                        : sorted[sorted.Count / 2];

                    summary[col.Name] = new SummaryData(min, max, avg, median);

                    if (max > min)
                    {
                        int bucketCount = 10;
                        decimal range = max - min;
                        decimal bucketSize = range / bucketCount;
                        if (bucketSize == 0) bucketSize = 1;

                        var histogram = new int[bucketCount];
                        foreach (var v in values)
                        {
                            int bucketIndex = (int)((v - min) / bucketSize);
                            if (bucketIndex >= bucketCount) bucketIndex = bucketCount - 1;
                            histogram[bucketIndex]++;
                        }

                        var distData = new List<DistributionData>();
                        for (int i = 0; i < bucketCount; i++)
                        {
                            decimal bMin = min + (i * bucketSize);
                            decimal bMax = min + ((i + 1) * bucketSize);
                            distData.Add(new DistributionData($"{bMin:0.##}-{bMax:0.##}", histogram[i]));
                        }
                        distributions[col.Name] = distData;
                    }
                }
            }
            else if (col.DataType == "date" || col.DataType == "datetime")
            {
                var numericCol = allColumns.FirstOrDefault(c => c.DataType == "number");
                if (numericCol != null)
                {
                    var dateValues = new Dictionary<string, List<decimal>>();
                    foreach (var r in rows)
                    {
                        using var doc = JsonDocument.Parse(r);
                        var row = doc.RootElement;
                        if (row.TryGetProperty(col.Name, out var dateElem) && 
                            row.TryGetProperty(numericCol.Name, out var numElem) &&
                            numElem.ValueKind == JsonValueKind.Number &&
                            numElem.TryGetDecimal(out var numVal))
                        {
                            var dateStr = GetStringValue(dateElem);
                            if (DateTime.TryParse(dateStr, out var dt))
                            {
                                var key = dt.ToString("yyyy-MM-dd");
                                if (!dateValues.ContainsKey(key)) dateValues[key] = new List<decimal>();
                                dateValues[key].Add(numVal);
                            }
                        }
                    }

                    if (dateValues.Any())
                    {
                        trends[col.Name] = dateValues
                            .Select(kv => new TrendData(kv.Key, kv.Value.Average()))
                            .OrderBy(t => t.Date)
                            .ToList();
                    }
                }
            }
        }

        return Results.Ok(new Response(categorical, distributions, trends, summary));
    }

    private static string? GetStringValue(JsonElement element)
    {
        return element.ValueKind switch
        {
            JsonValueKind.String => element.GetString(),
            JsonValueKind.True => "True",
            JsonValueKind.False => "False",
            JsonValueKind.Null => null,
            JsonValueKind.Number => element.ToString(),
            _ => element.ToString()
        };
    }
}
