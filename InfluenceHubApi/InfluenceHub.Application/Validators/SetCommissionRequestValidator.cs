using FluentValidation;
using InfluenceHub.Application.DTOs.Request;

namespace InfluenceHub.Application.Validators;

public class SetCommissionRequestValidator : AbstractValidator<SetCommissionRequest>
{
    public SetCommissionRequestValidator()
    {
        RuleFor(x => x.Percentage).InclusiveBetween(0, 100).WithMessage("Commission percentage must be between 0 and 100.");
        RuleFor(x => x.Description).MaximumLength(500);
    }
}
