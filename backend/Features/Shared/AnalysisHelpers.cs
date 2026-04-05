using System.Text.Json;

namespace DashboardAnalyticsAPI.Features.Shared;

/// <summary>
/// High-performance helpers for extracting typed values from stored row JSON.
///
/// Key design: <see cref="ExtractAllColumns"/> parses each row JSON document
/// exactly once and fans values out to per-column lists. Callers then pass the
/// already-parsed <see cref="JsonElement"/> lists to the typed accessor methods.
/// This reduces parse complexity from O(rows × columns) to O(rows).
/// </summary>
public static class AnalysisHelpers
{
    /// <summary>
    /// Parses every row JSON document once and returns a dictionary mapping
    /// each requested column name to its list of raw <see cref="JsonElement"/>
    /// values (one entry per row; <c>default(JsonElement)</c> — ValueKind ==
    /// Undefined — signals a missing / unparseable cell).
    /// </summary>
    public static Dictionary<string, List<JsonElement>> ExtractAllColumns(
        IReadOnlyList<string> rowsJson,
        IEnumerable<string> columnNames)
    {
        var cols = columnNames.ToList();

        var result = cols.ToDictionary(
            n => n,
            _ => new List<JsonElement>(rowsJson.Count),
            StringComparer.OrdinalIgnoreCase);

        foreach (var rowJson in rowsJson)
        {
            try
            {
                using var doc = JsonDocument.Parse(rowJson);
                foreach (var name in cols)
                {
                    result[name].Add(
                        doc.RootElement.TryGetProperty(name, out var elem)
                            ? elem.Clone()   // clone survives document disposal
                            : default);
                }
            }
            catch
            {
                // Malformed row — fill all columns with "missing" sentinel
                foreach (var name in cols)
                    result[name].Add(default);
            }
        }

        return result;
    }

    /// <summary>Extracts all parseable decimal values from a column's element list.</summary>
    public static List<decimal> GetNumericValues(IReadOnlyList<JsonElement> elements)
    {
        var values = new List<decimal>(elements.Count);
        foreach (var elem in elements)
        {
            if (elem.ValueKind == JsonValueKind.Number && elem.TryGetDecimal(out var v))
                values.Add(v);
        }
        return values;
    }

    /// <summary>Counts distinct string representations in a column's element list.</summary>
    public static Dictionary<string, int> GetCategoryCounts(IReadOnlyList<JsonElement> elements)
    {
        var counts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
        foreach (var elem in elements)
        {
            if (elem.ValueKind == JsonValueKind.Undefined) continue;
            var key = GetStringValue(elem) ?? "NULL";
            counts[key] = counts.GetValueOrDefault(key) + 1;
        }
        return counts;
    }

    /// <summary>Converts a <see cref="JsonElement"/> to its string representation.</summary>
    public static string? GetStringValue(JsonElement element) => element.ValueKind switch
    {
        JsonValueKind.String  => element.GetString(),
        JsonValueKind.True    => "True",
        JsonValueKind.False   => "False",
        JsonValueKind.Null    => null,
        JsonValueKind.Undefined => null,
        JsonValueKind.Number  => element.ToString(),
        _                     => element.ToString()
    };
}
