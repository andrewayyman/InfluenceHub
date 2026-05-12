using FluentValidation;
using InfluenceHub.Application.DTOs.Request;

namespace InfluenceHub.Application.Validators;

public class UpdateInfluencerProfileRequestValidator : AbstractValidator<UpdateInfluencerProfileRequest>
{
    public UpdateInfluencerProfileRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(500);
        RuleFor(x => x.FollowersCount).GreaterThanOrEqualTo(10000)
            .WithMessage("A minimum of 10,000 followers is required to participate in campaigns.");
        RuleFor(x => x.Location).MaximumLength(200);
    }
}
