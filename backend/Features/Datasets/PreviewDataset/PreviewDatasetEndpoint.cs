namespace Features.Datasets.PreviewDataset;

public static class PreviewDatasetEndpoint
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/api/datasets/{id}/preview", PreviewDataset.Handle)
            .RequireAuthorization()
            .DisableAntiforgery(); // Standard for many Minimal API file uploads if CSRF is handled differently or not needed
    }
}
