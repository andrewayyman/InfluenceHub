namespace InfluenceHub.Application.DTOs.Request;

public record UpdatePaymentInfoRequest(
    string? InstapayPhone,
    string? WalletProvider,
    string? WalletNumber,
    string? BankName,
    string? BankAccountNumber,
    string? PreferredPaymentMethod
);
