namespace Features.Datasets.DeleteDataset;

public static class DeleteDatasetEndpoint
{
    public static void MapEndpoint(WebApplication app)
    {
        app.MapDelete("/api/datasets/{id}", DeleteDataset.Handler)
           .RequireAuthorization();
    }
}
