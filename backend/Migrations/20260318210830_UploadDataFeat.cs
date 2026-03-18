using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DashboardAnalyticsAPI.Migrations
{
    /// <inheritdoc />
    public partial class UploadDataFeat : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Type",
                table: "DatasetColumns",
                newName: "DataType");

            migrationBuilder.AddColumn<string>(
                name: "JsonData",
                table: "DatasetRows",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "JsonData",
                table: "DatasetRows");

            migrationBuilder.RenameColumn(
                name: "DataType",
                table: "DatasetColumns",
                newName: "Type");
        }
    }
}
