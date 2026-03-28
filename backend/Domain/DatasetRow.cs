namespace DashboardAnalyticsAPI.Domain;

public class DatasetRow
{
    public Guid Id { get; set; }
    public Guid DatasetId { get; set; }
    public string JsonData { get; set; } = null!;

    public Dataset Dataset { get; set; } = null!;
}
