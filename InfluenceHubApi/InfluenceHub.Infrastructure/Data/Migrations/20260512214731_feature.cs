using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InfluenceHub.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class feature : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "AdminConfirmedAt",
                table: "Payments",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BrandNotes",
                table: "Payments",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "DisputeReason",
                table: "Payments",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "InfluencerConfirmedAt",
                table: "Payments",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PaymentMethod",
                table: "Payments",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "ProofUploadedAt",
                table: "Payments",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ProofUrl",
                table: "Payments",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TransactionReference",
                table: "Payments",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankAccountNumber",
                table: "Influencers",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "BankName",
                table: "Influencers",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InstapayPhone",
                table: "Influencers",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "PreferredPaymentMethod",
                table: "Influencers",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WalletNumber",
                table: "Influencers",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WalletProvider",
                table: "Influencers",
                type: "nvarchar(120)",
                maxLength: 120,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AdminConfirmedAt",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "BrandNotes",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "DisputeReason",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "InfluencerConfirmedAt",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "PaymentMethod",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "ProofUploadedAt",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "ProofUrl",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "TransactionReference",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "BankAccountNumber",
                table: "Influencers");

            migrationBuilder.DropColumn(
                name: "BankName",
                table: "Influencers");

            migrationBuilder.DropColumn(
                name: "InstapayPhone",
                table: "Influencers");

            migrationBuilder.DropColumn(
                name: "PreferredPaymentMethod",
                table: "Influencers");

            migrationBuilder.DropColumn(
                name: "WalletNumber",
                table: "Influencers");

            migrationBuilder.DropColumn(
                name: "WalletProvider",
                table: "Influencers");
        }
    }
}
