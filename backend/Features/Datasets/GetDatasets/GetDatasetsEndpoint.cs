namespace Features.Datasets.GetDatasets;

public static class GetDatasetsEndpoint
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/datasets", GetDatasets.Handler)
           .RequireAuthorization()
           .WithTags("Datasets");
    }
}
