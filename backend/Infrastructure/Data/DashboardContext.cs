using Microsoft.EntityFrameworkCore;
using DashboardAnalyticsAPI.Domain; 

namespace DashboardAnalyticsAPI.Infrastructure.Data
{
    public class DashboardContext : DbContext
    {
        public DashboardContext(DbContextOptions<DashboardContext> options)
            : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Dataset> Datasets { get; set; }
        public DbSet<DatasetRow> DatasetRows { get; set; }
        public DbSet<DatasetColumn> DatasetColumns { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Dataset>()
                .HasOne(d => d.User)
                .WithMany(u => u.Datasets)
                .HasForeignKey(d => d.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DatasetColumn>()
                .HasOne(c => c.Dataset)
                .WithMany(d => d.Columns)
                .HasForeignKey(c => c.DatasetId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<DatasetRow>()
                .HasOne(r => r.Dataset)
                .WithMany(d => d.Rows)
                .HasForeignKey(r => r.DatasetId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}