using Microsoft.AspNetCore.Mvc;
using DashboardAnalyticsAPI.Infrastructure.Data;
using System.Security.Claims;

namespace Features.Datasets.PreviewDataset;

public static class PreviewDatasetEndpoint
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/datasets/{id}/preview", async (
            Guid id,
            [FromForm] IFormFile file,
            DashboardContext db,
            ClaimsPrincipal user) =>
        {
            return await PreviewDataset.Handler(id, file, db, user);
        })
        .RequireAuthorization()
        .DisableAntiforgery()
        .WithTags("Datasets");
    }
}
