using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InfluenceHub.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class Phase2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CampaignReports_ApplicationId",
                table: "CampaignReports");

            migrationBuilder.DropColumn(
                name: "Platform",
                table: "Campaigns");

            migrationBuilder.AddColumn<int>(
                name: "BudgetType",
                table: "Campaigns",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Platforms",
                table: "Campaigns",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "[]");

            migrationBuilder.AddColumn<string>(
                name: "Platform",
                table: "CampaignReports",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Bio",
                table: "Applications",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Links",
                table: "Applications",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "[]");

            migrationBuilder.AddColumn<string>(
                name: "MediaFiles",
                table: "Applications",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "[]");

            migrationBuilder.AddColumn<string>(
                name: "Proposal",
                table: "Applications",
                type: "nvarchar(4000)",
                maxLength: 4000,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "ProposedBudget",
                table: "Applications",
                type: "decimal(18,2)",
                precision: 18,
                scale: 2,
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.CreateIndex(
                name: "IX_CampaignReports_ApplicationId",
                table: "CampaignReports",
                column: "ApplicationId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_CampaignReports_ApplicationId",
                table: "CampaignReports");

            migrationBuilder.DropColumn(
                name: "BudgetType",
                table: "Campaigns");

            migrationBuilder.DropColumn(
                name: "Platforms",
                table: "Campaigns");

            migrationBuilder.DropColumn(
                name: "Platform",
                table: "CampaignReports");

            migrationBuilder.DropColumn(
                name: "Bio",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "Links",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "MediaFiles",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "Proposal",
                table: "Applications");

            migrationBuilder.DropColumn(
                name: "ProposedBudget",
                table: "Applications");

            migrationBuilder.AddColumn<string>(
                name: "Platform",
                table: "Campaigns",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_CampaignReports_ApplicationId",
                table: "CampaignReports",
                column: "ApplicationId",
                unique: true);
        }
    }
}
