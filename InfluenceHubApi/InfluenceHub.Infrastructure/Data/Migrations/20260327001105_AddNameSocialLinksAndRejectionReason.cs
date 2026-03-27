using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InfluenceHub.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddNameSocialLinksAndRejectionReason : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CompanyName",
                table: "Brands",
                newName: "Name");

            migrationBuilder.AddColumn<string>(
                name: "FacebookUrl",
                table: "Influencers",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InstagramUrl",
                table: "Influencers",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "LinkedInUrl",
                table: "Influencers",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Influencers",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "TikTokUrl",
                table: "Influencers",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TwitterUrl",
                table: "Influencers",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "YouTubeUrl",
                table: "Influencers",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RejectionReason",
                table: "CampaignReports",
                type: "nvarchar(2000)",
                maxLength: 2000,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FacebookUrl",
                table: "Influencers");

            migrationBuilder.DropColumn(
                name: "InstagramUrl",
                table: "Influencers");

            migrationBuilder.DropColumn(
                name: "LinkedInUrl",
                table: "Influencers");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Influencers");

            migrationBuilder.DropColumn(
                name: "TikTokUrl",
                table: "Influencers");

            migrationBuilder.DropColumn(
                name: "TwitterUrl",
                table: "Influencers");

            migrationBuilder.DropColumn(
                name: "YouTubeUrl",
                table: "Influencers");

            migrationBuilder.DropColumn(
                name: "RejectionReason",
                table: "CampaignReports");

            migrationBuilder.RenameColumn(
                name: "Name",
                table: "Brands",
                newName: "CompanyName");
        }
    }
}
