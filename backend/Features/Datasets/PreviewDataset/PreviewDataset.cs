using System.Security.Claims;
using DashboardAnalyticsAPI.Domain;
using DashboardAnalyticsAPI.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Features.Datasets.UploadDataset;

namespace Features.Datasets.PreviewDataset;

public static class PreviewDataset
{
    public record ColumnResponse(string Name, string DataType);
    public record RowValue(object? Value, string? Raw);
    public record Response(IEnumerable<ColumnResponse> Columns, IEnumerable<Dictionary<string, RowValue>> Rows);

    public static async Task<IResult> Handle(
        Guid id,
        IFormFile file,
        DashboardContext db,
        ClaimsPrincipal user)
    {
        var userIdString = user.FindFirst("sub")?.Value 
                   ?? user.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!Guid.TryParse(userIdString, out var userId))
        {
            return Results.Unauthorized();
        }

        var dataset = await db.Datasets
            .Where(d => d.Id == id)
            .Select(d => new { d.Id, d.UserId })
            .FirstOrDefaultAsync();

        if (dataset == null || dataset.UserId != userId)
        {
            return Results.NotFound(new { Message = "Dataset not found" });
        }

        if (file == null || file.Length == 0)
        {
            return Results.BadRequest(new { Message = "No file uploaded." });
        }

        try
        {
            var allRows = UploadDatasetHandler.ParseFile(file);
            if (allRows.Count == 0)
            {
                return Results.BadRequest(new { Message = "File has no data rows." });
            }

            var headers = allRows[0].Keys.ToList();
            var detectedColumns = new List<ColumnResponse>();
            foreach (var header in headers)
            {
                var dataType = UploadDatasetHandler.DetectDataType(allRows, header);
                detectedColumns.Add(new ColumnResponse(header, dataType));
            }

            var previewRows = new List<Dictionary<string, RowValue>>();
            foreach (var row in allRows.Take(50))
            {
                var rowDict = new Dictionary<string, RowValue>();
                foreach (var col in detectedColumns)
                {
                    var rawVal = row.TryGetValue(col.Name, out var val) ? val?.ToString() : null;
                    var normalized = UploadDatasetHandler.NormalizeValue(rawVal);
                    var typedValue = UploadDatasetHandler.EnforceType(normalized, col.DataType);
                    
                    rowDict[col.Name] = new RowValue(typedValue, rawVal);
                }
                previewRows.Add(rowDict);
            }

            return Results.Ok(new Response(detectedColumns, previewRows));
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { Message = $"Error parsing file: {ex.Message}" });
        }
    }
}
