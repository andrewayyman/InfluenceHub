namespace InfluenceHub.Application.DTOs.Request;

public record UploadPaymentProofRequest(
    string PaymentMethod,
    string? TransactionReference,
    string? BrandNotes
);
