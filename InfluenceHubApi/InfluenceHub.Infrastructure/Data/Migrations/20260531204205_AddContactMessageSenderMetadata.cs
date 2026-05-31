using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InfluenceHub.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddContactMessageSenderMetadata : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "SenderRole",
                table: "ContactMessages",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "SenderUserId",
                table: "ContactMessages",
                type: "uniqueidentifier",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SenderRole",
                table: "ContactMessages");

            migrationBuilder.DropColumn(
                name: "SenderUserId",
                table: "ContactMessages");
        }
    }
}
