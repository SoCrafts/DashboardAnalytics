namespace Features.Datasets.GetDatasetRows;

public static class GetDatasetRowsEndpoint
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/datasets/{id}/rows", GetDatasetRows.Handler)
           .RequireAuthorization()
           .WithTags("Datasets");
    }
}
