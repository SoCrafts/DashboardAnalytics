using DashboardAnalyticsAPI.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using Features.Datasets.UploadDataset;
using DashboardAnalyticsAPI.Features.Shared;
using System.Security.Claims;

namespace Features.Datasets.PreviewDataset;

public static class PreviewDataset
{
    public record ColumnResponse(string Name, string DataType);
    public record Response(IEnumerable<ColumnResponse> Columns, IEnumerable<Dictionary<string, object?>> Rows);

    public static async Task<IResult> Handler(
        Guid id,
        IFormFile file,
        DashboardContext db,
        ClaimsPrincipal user)
    {
        var (dataset, error) = await AuthorizationHelpers.GetOwnedDatasetAsync(id, db, user);
        if (error != null) return error;

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

            var previewRows = allRows.Take(50)
                .Select(row => row.ToDictionary(kv => kv.Key, kv => (object?)kv.Value))
                .ToList();

            return Results.Ok(new Response(detectedColumns, previewRows));
        }
        catch (Exception ex)
        {
            return Results.BadRequest(new { Message = $"Error parsing file: {ex.Message}" });
        }
    }
}
