using System.Security.Claims;
using DashboardAnalyticsAPI.Infrastructure.Data;
using DashboardAnalyticsAPI.Domain;
using DashboardAnalyticsAPI.Features.Shared;

namespace Features.Datasets.CreateDataset;

public static class CreateDataset
{
    public record Request(string Name, string Description);

    public record Response(Guid Id, string Name);

    public static async Task<IResult> Handler(
        Request request,
        DashboardContext db,
        ClaimsPrincipal user)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return Results.BadRequest(new { Message = "Dataset name is required." });

        var userId = user.GetRequiredUserId();

        var dataset = new Dataset
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            UserId = userId,
            CreatedAt = DateTime.UtcNow
        };

        db.Datasets.Add(dataset);
        await db.SaveChangesAsync();

        return Results.Ok(new Response(dataset.Id, dataset.Name));
    }
}
