namespace DashboardAnalyticsAPI.Domain;

public class Dataset
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public string Description { get; set; } = null!;

    public Guid UserId { get; set; }

    public DateTime CreatedAt { get; set; }
}
