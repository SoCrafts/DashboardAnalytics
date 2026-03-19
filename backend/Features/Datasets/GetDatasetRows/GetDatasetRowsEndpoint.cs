using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;

namespace Features.Datasets.GetDatasetRows;

public static class GetDatasetRowsEndpoint
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/api/datasets/{id:guid}/rows", GetDatasetRows.Handler)
            .RequireAuthorization()
            .WithName("GetDatasetRows");
    }
}
