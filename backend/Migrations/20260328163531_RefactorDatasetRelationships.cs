using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DashboardAnalyticsAPI.Migrations
{
    /// <inheritdoc />
    public partial class RefactorDatasetRelationships : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Clean up orphaned data before enforcing relationships
            migrationBuilder.Sql("DELETE FROM DatasetColumns WHERE DatasetId NOT IN (SELECT Id FROM Datasets)");
            migrationBuilder.Sql("DELETE FROM DatasetRows WHERE DatasetId NOT IN (SELECT Id FROM Datasets)");
            migrationBuilder.Sql("DELETE FROM Datasets WHERE UserId NOT IN (SELECT Id FROM Users)");

            migrationBuilder.CreateIndex(
                name: "IX_Datasets_UserId",
                table: "Datasets",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_DatasetRows_DatasetId",
                table: "DatasetRows",
                column: "DatasetId");

            migrationBuilder.CreateIndex(
                name: "IX_DatasetColumns_DatasetId",
                table: "DatasetColumns",
                column: "DatasetId");

            migrationBuilder.AddForeignKey(
                name: "FK_DatasetColumns_Datasets_DatasetId",
                table: "DatasetColumns",
                column: "DatasetId",
                principalTable: "Datasets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_DatasetRows_Datasets_DatasetId",
                table: "DatasetRows",
                column: "DatasetId",
                principalTable: "Datasets",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Datasets_Users_UserId",
                table: "Datasets",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DatasetColumns_Datasets_DatasetId",
                table: "DatasetColumns");

            migrationBuilder.DropForeignKey(
                name: "FK_DatasetRows_Datasets_DatasetId",
                table: "DatasetRows");

            migrationBuilder.DropForeignKey(
                name: "FK_Datasets_Users_UserId",
                table: "Datasets");

            migrationBuilder.DropIndex(
                name: "IX_Datasets_UserId",
                table: "Datasets");

            migrationBuilder.DropIndex(
                name: "IX_DatasetRows_DatasetId",
                table: "DatasetRows");

            migrationBuilder.DropIndex(
                name: "IX_DatasetColumns_DatasetId",
                table: "DatasetColumns");
        }
    }
}
