namespace InfluenceHub.Domain.Enums;

public enum PaymentStatus
{
    Pending = 0,
    Completed = 1,
    Failed = 2,
    AwaitingProof = 3,
    ProofUploaded = 4,
    InfluencerConfirmed = 5,
    Disputed = 6
}
