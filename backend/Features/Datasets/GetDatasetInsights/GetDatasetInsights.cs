using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using DashboardAnalyticsAPI.Infrastructure.Data;
using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

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

        var allColumns = await db.DatasetColumns
            .Where(c => c.DatasetId == id)
            .ToListAsync();

        var rows = await db.DatasetRows
            .Where(r => r.DatasetId == id)
            .Select(r => r.JsonData)
            .ToListAsync();

        var parsedRows = new List<JsonElement>();
        var docs = new List<JsonDocument>();
        foreach (var r in rows)
        {
            try
            {
                var doc = JsonDocument.Parse(r);
                docs.Add(doc);
                parsedRows.Add(doc.RootElement);
            }
            catch { /* Skip malformed rows */ }
        }

        try
        {
            var categorical = new Dictionary<string, IEnumerable<CategoryData>>();
            var distributions = new Dictionary<string, IEnumerable<DistributionData>>();
            var trends = new Dictionary<string, IEnumerable<TrendData>>();
            var summary = new Dictionary<string, SummaryData>();

            if (!parsedRows.Any())
                return Results.Ok(new Response(categorical, distributions, trends, summary));

            int totalRows = parsedRows.Count;

            foreach (var col in allColumns)
            {
                if (col.DataType == "string" || col.DataType == "boolean")
                {
                    var counts = new Dictionary<string, int>();
                    foreach (var row in parsedRows)
                    {
                        if (row.TryGetProperty(col.Name, out var element))
                        {
                            var val = GetStringValue(element);
                            var key = val ?? "NULL";
                            if (counts.ContainsKey(key)) counts[key]++;
                            else counts[key] = 1;
                        }
                    }

                    // Categorical columns: <= 50% unique values, values appearing > 1 time, top 15
                    if (counts.Count > 0 && counts.Count <= totalRows * 0.5)
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
                    var values = new List<decimal>();
                    foreach (var row in parsedRows)
                    {
                        if (row.TryGetProperty(col.Name, out var element) && 
                            element.ValueKind == JsonValueKind.Number && 
                            element.TryGetDecimal(out var val))
                        {
                            values.Add(val);
                        }
                    }

                    if (values.Any())
                    {
                        // Summary statistics
                        var min = values.Min();
                        var max = values.Max();
                        var avg = values.Average();
                        var sorted = values.OrderBy(v => v).ToList();
                        var median = sorted.Count % 2 == 0 
                            ? (sorted[sorted.Count / 2 - 1] + sorted[sorted.Count / 2]) / 2 
                            : sorted[sorted.Count / 2];

                        summary[col.Name] = new SummaryData(min, max, avg, median);

                        // Distributions (Histograms)
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
                    // Basic trend detection: find a numeric column to correlate if possible
                    var numericCol = allColumns.FirstOrDefault(c => c.DataType == "number");
                    if (numericCol != null)
                    {
                        var dateValues = new Dictionary<string, List<decimal>>();
                        foreach (var row in parsedRows)
                        {
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
        finally
        {
            foreach (var doc in docs) doc.Dispose();
        }
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

public static class GetDatasetInsightsEndpoint
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/datasets/{id}/insights", GetDatasetInsights.Handler)
           .WithName("GetDatasetInsights")
           .WithOpenApi()
           .RequireAuthorization();
    }
}
