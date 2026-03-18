namespace DashboardAnalyticsAPI.Domain;

public class DatasetColumn
{
    public Guid Id { get; set; }
    public Guid DatasetId { get; set; }
    public string Name { get; set; } = null!;
    public string Type { get; set; } = null!;
}
