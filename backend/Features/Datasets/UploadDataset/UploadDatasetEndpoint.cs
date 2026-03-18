using DashboardAnalyticsAPI.Infrastructure.Data;
using Microsoft.AspNetCore.Mvc;

namespace Features.Datasets.UploadDataset;

public static class UploadDatasetEndpoint
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        // Fix 415: Use [FromForm] and help with metadata
        app.MapPost("/api/datasets/{id:guid}/upload", async (
            Guid id,
            [FromForm] IFormFile file,
            DashboardContext db,
            HttpContext httpContext) =>
        {
            return await UploadDatasetHandler.Handle(id, file, db, httpContext);
        })
        .RequireAuthorization()
        .DisableAntiforgery()
        .Accepts<IFormFile>("multipart/form-data");
    }
}
