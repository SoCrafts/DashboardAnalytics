using DashboardAnalyticsAPI.Domain;
using DashboardAnalyticsAPI.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using System.Text;
using System.Security.Claims;
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
        var user = httpContext.User; 
        var userIdString = user.FindFirst("sub")?.Value 
                           ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdString) || !Guid.TryParse(userIdString, out var userId))
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

        using var stream = file.OpenReadStream();
        using var reader = new StreamReader(stream);
        
        var headerLine = await reader.ReadLineAsync();
        if (string.IsNullOrWhiteSpace(headerLine))
        {
            return Results.BadRequest(new { Message = "CSV file is empty or missing headers." });
        }

        // Robust Parsing for Headers
        var headers = ParseCsvLine(headerLine);
        if (headers.Count == 0)
        {
            return Results.BadRequest(new { Message = "Could not detect headers." });
        }
        
        var rows = new List<string[]>();
        string? line;
        while ((line = await reader.ReadLineAsync()) != null)
        {
            if (string.IsNullOrWhiteSpace(line)) continue;
            
            // Robust Parsing for Data Rows
            var parts = ParseCsvLine(line).ToArray();
            
            // Normalize column count
            if (parts.Length < headers.Count)
            {
                var newParts = new string[headers.Count];
                Array.Copy(parts, newParts, parts.Length);
                for (int i = parts.Length; i < headers.Count; i++) newParts[i] = "";
                parts = newParts;
            }
            else if (parts.Length > headers.Count)
            {
                parts = parts.Take(headers.Count).ToArray();
            }

            rows.Add(parts);
        }

        if (rows.Count == 0)
        {
            return Results.BadRequest(new { Message = "CSV file has no data rows." });
        }

        // Column Type Detection
        var detectedColumns = new List<DatasetColumn>();
        for (int i = 0; i < headers.Count; i++)
        {
            var headerName = headers[i];
            bool allNumber = true, allDate = true, allBool = true;
            bool hasValue = false;

            foreach (var row in rows)
            {
                var val = row[i];
                if (string.IsNullOrEmpty(val)) continue;

                hasValue = true;
                if (allNumber && !double.TryParse(val, out _)) allNumber = false;
                if (allDate && !DateTime.TryParse(val, out _)) allDate = false;
                if (allBool && !(val.Equals("true", StringComparison.OrdinalIgnoreCase) || val.Equals("false", StringComparison.OrdinalIgnoreCase))) allBool = false;
            }

            string dataType = "string";
            if (hasValue)
            {
                if (allNumber) dataType = "number";
                else if (allDate) dataType = "date";
                else if (allBool) dataType = "boolean";
            }

            detectedColumns.Add(new DatasetColumn
            {
                Id = Guid.NewGuid(),
                DatasetId = datasetId,
                Name = headerName,
                DataType = dataType
            });
        }

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
            for (int i = 0; i < headers.Count; i++)
            {
                var headerName = headers[i];
                var val = row[i];
                var type = detectedColumns[i].DataType;

                if (string.IsNullOrEmpty(val))
                {
                    rowDict[headerName] = null;
                }
                else if (type == "number" && double.TryParse(val, out var num))
                {
                    rowDict[headerName] = num;
                }
                else if (type == "boolean" && bool.TryParse(val, out var b))
                {
                    rowDict[headerName] = b;
                }
                else
                {
                    rowDict[headerName] = val;
                }
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

        return Results.Ok(new UploadDatasetResponse
        {
            Message = "Upload successful",
            RowsInserted = datasetRows.Count,
            ColumnsDetected = detectedColumns.Count
        });
    }

    /// <summary>
    /// Robust CSV line parser handling quotes and commas inside quotes.
    /// </summary>
    private static List<string> ParseCsvLine(string line)
    {
        var result = new List<string>();
        if (string.IsNullOrWhiteSpace(line)) return result;

        var currentField = new StringBuilder();
        bool inQuotes = false;

        for (int i = 0; i < line.Length; i++)
        {
            char c = line[i];

            if (inQuotes)
            {
                if (c == '"')
                {
                    // Check for escaped quote ""
                    if (i + 1 < line.Length && line[i + 1] == '"')
                    {
                        currentField.Append('"');
                        i++; // Skip the next quote
                    }
                    else
                    {
                        inQuotes = false;
                    }
                }
                else
                {
                    currentField.Append(c);
                }
            }
            else
            {
                if (c == '"')
                {
                    inQuotes = true;
                }
                else if (c == ',')
                {
                    result.Add(currentField.ToString().Trim());
                    currentField.Clear();
                }
                else
                {
                    currentField.Append(c);
                }
            }
        }
        
        result.Add(currentField.ToString().Trim());
        return result;
    }
}
