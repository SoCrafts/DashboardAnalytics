using DashboardAnalyticsAPI.Domain;
using DashboardAnalyticsAPI.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Security.Claims;
using MiniExcelLibs;
using System.Globalization;
using DashboardAnalyticsAPI.Features.Shared;

namespace Features.Datasets.UploadDataset;

public class UploadDatasetResponse
{
    public string Message { get; set; } = null!;
    public int RowsInserted { get; set; }
    public int ColumnsDetected { get; set; }
}

public static class UploadDatasetHandler
{
    public static async Task<IResult> Handler(
        Guid id,
        IFormFile file,
        DashboardContext db,
        ClaimsPrincipal user)
    {
        var (dataset, error) = await AuthorizationHelpers.GetOwnedDatasetAsync(id, db, user);
        if (error != null) return error;

        if (file == null || file.Length == 0)
            return Results.BadRequest(new { Message = "No file uploaded." });

        try
        {
            var rows = ParseFile(file);

            if (rows.Count == 0)
                return Results.BadRequest(new { Message = "File has no data rows." });

            var headers = rows[0].Keys.ToList();
            if (headers.Count == 0)
                return Results.BadRequest(new { Message = "Could not detect headers." });

            var detectedColumns = DetectColumns(id, rows, headers);

            var (insertedRowsCount, detectedColumnsCount) =
                await SaveDatasetData(db, id, detectedColumns, rows, headers);

            return Results.Ok(new UploadDatasetResponse
            {
                Message = "Upload successful",
                RowsInserted = insertedRowsCount,
                ColumnsDetected = detectedColumnsCount
            });
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { Message = $"Error parsing file: {ex.Message}" });
        }
    }

    internal static List<IDictionary<string, object>> ParseFile(IFormFile file)
    {
        using var stream = file.OpenReadStream();
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

        ExcelType excelType = extension switch
        {
            ".csv" => ExcelType.CSV,
            ".xlsx" => ExcelType.XLSX,
            _ => ExcelType.UNKNOWN
        };

        if (excelType == ExcelType.UNKNOWN)
            throw new Exception("Unsupported file format. Please upload .csv or .xlsx");

        return stream.Query(useHeaderRow: true, excelType: excelType)
                     .Cast<IDictionary<string, object>>()
                     .Select(CleanRow)
                     .Where(r => r.Count > 0)
                     .ToList();
    }

    internal static List<DatasetColumn> DetectColumns(
        Guid datasetId,
        List<IDictionary<string, object>> rows,
        List<string> headers)
    {
        var detectedColumns = new List<DatasetColumn>();

        foreach (var header in headers)
        {
            string dataType = DetectDataType(rows, header);

            detectedColumns.Add(new DatasetColumn
            {
                Id = Guid.NewGuid(),
                DatasetId = datasetId,
                Name = header,
                DataType = dataType
            });
        }

        return detectedColumns;
    }

    private static async Task<(int RowsInserted, int ColumnsDetected)> SaveDatasetData(
        DashboardContext db,
        Guid datasetId,
        List<DatasetColumn> detectedColumns,
        List<IDictionary<string, object>> rows,
        List<string> headers)
    {
        var existingColumns = await db.DatasetColumns.Where(c => c.DatasetId == datasetId).ToListAsync();
        var existingRows = await db.DatasetRows.Where(r => r.DatasetId == datasetId).ToListAsync();

        db.DatasetColumns.RemoveRange(existingColumns);
        db.DatasetRows.RemoveRange(existingRows);

        await db.DatasetColumns.AddRangeAsync(detectedColumns);

        var datasetRows = new List<DatasetRow>(rows.Count);

        foreach (var row in rows)
        {
            var rowDict = new Dictionary<string, object?>();

            foreach (var header in headers)
            {
                row.TryGetValue(header, out var val);
                rowDict[header] = val;
            }

            var jsonData = JsonSerializer.Serialize(rowDict);

            datasetRows.Add(new DatasetRow
            {
                Id = Guid.NewGuid(),
                DatasetId = datasetId,
                JsonData = jsonData
            });
        }

        await db.DatasetRows.AddRangeAsync(datasetRows);
        await db.SaveChangesAsync();

        return (datasetRows.Count, detectedColumns.Count);
    }

    internal static string DetectDataType(List<IDictionary<string, object>> rows, string header)
    {
        int total = 0;
        int numbers = 0, dates = 0, bools = 0;

        foreach (var row in rows.Take(100))
        {
            if (!row.TryGetValue(header, out var val) || val == null)
                continue;

            total++;

            if (val is decimal) numbers++;
            else if (val is DateTime) dates++;
            else if (val is bool) bools++;
        }

        if (total == 0) return ColumnDataType.String;

        const double threshold = 0.8;

        if ((double)numbers / total > threshold) return ColumnDataType.Number;
        if ((double)dates  / total > threshold) return ColumnDataType.Date;
        if ((double)bools  / total > threshold) return ColumnDataType.Boolean;

        return ColumnDataType.String;
    }

    internal static object? NormalizeValue(object? value)
    {
        if (value == null)
            return null;

        var str = (value is IFormattable formattable
            ? formattable.ToString(null, CultureInfo.InvariantCulture)
            : value.ToString())?.Trim();

        if (string.IsNullOrEmpty(str))
            return null;

        var lower = str.ToLowerInvariant();

        if (lower is "true" or "false")
            return lower == "true";

        if (lower is "yes" or "no")
            return lower == "yes";

        if (lower == "nan")
            return null;

        var normalized = str;

        if (str.Contains(",") && str.Contains("."))
        {
            normalized = str.Replace(".", "").Replace(",", ".");
        }
        else if (str.Contains(","))
        {
            normalized = str.Replace(",", ".");
        }

        if (decimal.TryParse(normalized,
            NumberStyles.Any,
            CultureInfo.InvariantCulture,
            out var num))
        {
            if (num > 9007199254740991M || num < -9007199254740991M)
                return str;

            return num;
        }

        if (DateTime.TryParse(str,
            CultureInfo.InvariantCulture,
            DateTimeStyles.None,
            out var date))
            return date;

        return str;
    }

    internal static IDictionary<string, object> CleanRow(IDictionary<string, object> row)
    {
        var cleaned = new Dictionary<string, object>(StringComparer.OrdinalIgnoreCase);

        foreach (var kv in row)
        {
            var key = kv.Key?.Trim();
            if (string.IsNullOrEmpty(key))
                continue;

            cleaned[key] = NormalizeValue(kv.Value)!;
        }

        return cleaned;
    }
}