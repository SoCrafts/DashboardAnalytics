namespace Features.Datasets.GetDatasets;

public static class GetDatasetsEndpoint
{
    public static void MapEndpoint(WebApplication app)
    {
        app.MapGet("/api/datasets", GetDatasets.Handler)
           .RequireAuthorization();
    }
}
