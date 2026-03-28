using System.Text.Json;

namespace DashboardAnalyticsAPI.Features.Shared;

public static class AnalysisHelpers
{
    public static List<decimal> ExtractNumericValues(IEnumerable<string> rowsJson, string columnName)
    {
        var values = new List<decimal>();
        foreach (var rowJson in rowsJson)
        {
            try
            {
                using var doc = JsonDocument.Parse(rowJson);
                if (doc.RootElement.TryGetProperty(columnName, out var prop) && 
                    prop.ValueKind == JsonValueKind.Number &&
                    prop.TryGetDecimal(out var val))
                {
                    values.Add(val);
                }
            }
            catch { /* Skip malformed */ }
        }
        return values;
    }

    public static Dictionary<string, int> ExtractCategoryCounts(IEnumerable<string> rowsJson, string columnName)
    {
        var counts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        foreach (var rowJson in rowsJson)
        {
            try
            {
                using var doc = JsonDocument.Parse(rowJson);
                if (doc.RootElement.TryGetProperty(columnName, out var prop))
                {
                    var val = GetStringValue(prop) ?? "NULL";
                    if (counts.ContainsKey(val)) counts[val]++;
                    else counts[val] = 1;
                }
            }
            catch { /* Skip malformed */ }
        }
        return counts;
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
