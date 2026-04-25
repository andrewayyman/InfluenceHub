using InfluenceHub.Application.DTOs.Request;
using FluentValidation;

namespace InfluenceHub.Application.Validators;

public class CreateCampaignRequestValidator : AbstractValidator<CreateCampaignRequest>
{
    public CreateCampaignRequestValidator()
    {
        RuleFor(x => x.Title).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Description).MaximumLength(4000);
        RuleFor(x => x.Budget).GreaterThan(0);
        RuleFor(x => x.Deadline).GreaterThan(DateTime.UtcNow);
        RuleFor(x => x.Platforms).NotNull();
        RuleFor(x => x.Location).MaximumLength(256);
    }
}
