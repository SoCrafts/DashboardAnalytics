namespace Features.Datasets.GetDataset;

public static class GetDatasetEndpoint
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/datasets/{id}", GetDataset.Handler)
           .RequireAuthorization()
           .WithTags("Datasets");
    }
}
