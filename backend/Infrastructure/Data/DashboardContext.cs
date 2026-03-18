using Microsoft.EntityFrameworkCore;
using DashboardAnalyticsAPI.Domain; 

namespace DashboardAnalyticsAPI.Infrastructure.Data
{
    public class DashboardContext : DbContext
    {
        public DashboardContext(DbContextOptions<DashboardContext> options)
            : base(options) { }

        public DbSet<User> Users { get; set; }  // Already created table in DB
        // Future: Datasets, Metrics, DatasetRows
        public DbSet<Dataset> Datasets { get; set; }
        // public DbSet<Metric> Metrics { get; set; }
        // public DbSet<DatasetRow> DatasetRows { get; set; }
    }
}