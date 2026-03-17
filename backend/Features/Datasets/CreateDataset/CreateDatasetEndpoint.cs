namespace Features.Datasets.CreateDataset;

public static class CreateDatasetEndpoint
{
    public static void MapEndpoint(WebApplication app)
    {
        app.MapPost("/api/datasets", CreateDataset.Handler)
           .RequireAuthorization();
    }
}
