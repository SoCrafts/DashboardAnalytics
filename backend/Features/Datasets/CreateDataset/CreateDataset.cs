using System.Security.Claims;
using DashboardAnalyticsAPI.Infrastructure.Data;
using DashboardAnalyticsAPI.Domain;

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
        var userId = Guid.Parse(user.FindFirst(ClaimTypes.NameIdentifier)!.Value);

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
