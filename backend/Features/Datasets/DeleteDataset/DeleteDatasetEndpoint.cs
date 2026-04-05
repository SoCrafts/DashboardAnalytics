namespace Features.Datasets.DeleteDataset;

public static class DeleteDatasetEndpoint
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapDelete("/api/datasets/{id}", DeleteDataset.Handler)
           .RequireAuthorization()
           .WithTags("Datasets");
    }
}
