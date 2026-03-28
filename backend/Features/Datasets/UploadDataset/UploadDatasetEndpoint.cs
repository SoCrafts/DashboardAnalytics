using Microsoft.AspNetCore.Mvc;
using DashboardAnalyticsAPI.Infrastructure.Data;
using System.Security.Claims;

namespace Features.Datasets.UploadDataset;

public static class UploadDatasetEndpoint
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/datasets/{id}/upload", async (
            Guid id,
            [FromForm] IFormFile file,
            DashboardContext db,
            ClaimsPrincipal user) =>
        {
            return await UploadDatasetHandler.Handler(id, file, db, user);
        })
        .RequireAuthorization()
        .DisableAntiforgery()
        .WithTags("Datasets");
    }
}
