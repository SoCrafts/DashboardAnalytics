namespace Features.Datasets.GetMetrics;

public static class GetMetricsEndpoint
{
    public static void MapEndpoint(WebApplication app)
    {
        app.MapGet("/api/datasets/{id}/metrics", GetMetrics.Handler)
           .RequireAuthorization();
    }
}