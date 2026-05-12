namespace InfluenceHub.Application.DTOs.Response;

public record InfluencerPaymentInfoResponse(
    string? InstapayPhone,
    string? WalletProvider,
    string? WalletNumber,
    string? BankName,
    string? BankAccountNumber,
    string? PreferredPaymentMethod
);
