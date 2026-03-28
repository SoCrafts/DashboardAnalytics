namespace DashboardAnalyticsAPI.Domain;

public class Dataset
{
    public Guid Id { get; set; }

    public string Name { get; set; } = null!;

    public string Description { get; set; } = null!;

    public Guid UserId { get; set; }

    public DateTime CreatedAt { get; set; }
    
    public User User { get; set; } = null!;
    public ICollection<DatasetColumn> Columns { get; set; } = new List<DatasetColumn>();
    public ICollection<DatasetRow> Rows { get; set; } = new List<DatasetRow>();
}
