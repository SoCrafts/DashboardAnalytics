using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace Features.Datasets.GetDatasetInsights;

public static class GetDatasetInsightsEndpoint
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/datasets/{id}/insights", GetDatasetInsights.Handler)
           .WithName("GetDatasetInsights")
           .WithOpenApi()
           .RequireAuthorization()
           .WithTags("Datasets");
    }
}
