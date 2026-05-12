using FluentValidation;
using InfluenceHub.Application.DTOs.Request;

namespace InfluenceHub.Application.Validators;

public class CreateReviewRequestValidator : AbstractValidator<CreateReviewRequest>
{
    public CreateReviewRequestValidator()
    {
        RuleFor(x => x.TargetId).NotEmpty();
        RuleFor(x => x.CampaignId).NotEmpty();
        RuleFor(x => x.Rating).InclusiveBetween(1, 5).WithMessage("Rating must be between 1 and 5.");
        RuleFor(x => x.Comment).NotEmpty().MaximumLength(2000);
    }
}
