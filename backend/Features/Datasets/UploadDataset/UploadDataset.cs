using DashboardAnalyticsAPI.Domain;
using DashboardAnalyticsAPI.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Security.Claims;
using MiniExcelLibs;
using System.IO;


namespace Features.Datasets.UploadDataset;

public class UploadDatasetResponse
{
    public string Message { get; set; } = null!;
    public int RowsInserted { get; set; }
    public int ColumnsDetected { get; set; }
}

public static class UploadDatasetHandler
{
    public static async Task<IResult> Handle(
        Guid datasetId,
        IFormFile file,
        DashboardContext db,
        HttpContext httpContext)
    {
        var userId = GetUserId(httpContext);
        if (userId == null)
        {
            return Results.Unauthorized();
        }

        var dataset = await db.Datasets.FirstOrDefaultAsync(d => d.Id == datasetId);
        if (dataset == null || dataset.UserId != userId)
        {
            return Results.NotFound(new { Message = "Dataset not found or access denied." });
        }

        if (file == null || file.Length == 0)
        {
            return Results.BadRequest(new { Message = "No file uploaded." });
        }

        try
        {
            var rows = ParseFile(file);

            if (rows.Count == 0)
            {
                return Results.BadRequest(new { Message = "File has no data rows." });
            }

            var headers = rows[0].Keys.ToList();
            if (headers.Count == 0)
            {
                return Results.BadRequest(new { Message = "Could not detect headers." });
            }

            var detectedColumns = DetectColumns(datasetId, rows, headers);
            var (insertedRowsCount, detectedColumnsCount) = await SaveDatasetData(db, datasetId, detectedColumns, rows, headers);

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

    private static Guid? GetUserId(HttpContext httpContext)
    {
        var user = httpContext.User;
        var userIdString = user.FindFirst("sub")?.Value
                           ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
        {
            return null;
        }

        return userId;
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
    {
        throw new Exception("Unsupported file format. Please upload .csv or .xlsx");
    }

    var rows = stream.Query(useHeaderRow: true, excelType: excelType)
                     .Cast<IDictionary<string, object>>()
                     .Select(CleanRow)              // 🔥 THIS FIXES EVERYTHING
                     .Where(r => r.Count > 0)
                     .ToList();

    return rows;
}

    internal static List<DatasetColumn> DetectColumns(Guid datasetId, List<IDictionary<string, object>> rows, List<string> headers)
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
        // Transactional clear and save
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
                // Capture raw value
                var rawVal = row.TryGetValue(header, out var val) ? val?.ToString() : null;
                
                // Get detected column type
                var columnType = detectedColumns.First(c => c.Name == header).DataType;
                
                // Normalize and Enforce Type
                var normalized = NormalizeValue(rawVal);
                var typedValue = EnforceType(normalized, columnType);

                rowDict[header] = new { value = typedValue, raw = rawVal };
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

    internal static object? EnforceType(object? value, string columnType)
{
    if (value == null)
        return null;

    return columnType switch
    {
        "number" => value is double ? value : null,
        "date" => value is DateTime ? value : null,
        "boolean" => value is bool ? value : null,
        _ => value.ToString()
    };
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

        if (val is double) numbers++;
        else if (val is DateTime) dates++;
        else if (val is bool) bools++;
    }

    if (total == 0) return "string";

    double threshold = 0.8; // 80% rule

    if ((double)numbers / total > threshold) return "number";
    if ((double)dates / total > threshold) return "date";
    if ((double)bools / total > threshold) return "boolean";

    return "string";
}
internal static object? NormalizeValue(object? value)
{
    if (value == null)
        return null;

    var str = value.ToString()?.Trim();

    if (string.IsNullOrEmpty(str))
        return null;

    var lower = str.ToLowerInvariant();

    // ✅ Boolean (extended support)
    if (lower is "true" or "false")
        return lower == "true";

    if (lower is "yes" or "no")
        return lower == "yes";

    // ✅ Handle NaN
    if (lower == "nan")
        return null;

    // ✅ Number (supports scientific notation like 1e3)
    if (double.TryParse(str,
        System.Globalization.NumberStyles.Any,
        System.Globalization.CultureInfo.InvariantCulture,
        out var num))
        return num;

    // ✅ Date
    if (DateTime.TryParse(str,
        System.Globalization.CultureInfo.InvariantCulture,
        System.Globalization.DateTimeStyles.None,
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
