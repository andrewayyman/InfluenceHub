using FluentValidation;
using InfluenceHub.Application.DTOs.Request;

namespace InfluenceHub.Application.Validators;

public class ContactRequestValidator : AbstractValidator<ContactRequest>
{
    public ContactRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(256);
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(256);
        RuleFor(x => x.Subject).NotEmpty().MaximumLength(500);
        RuleFor(x => x.Message).NotEmpty().MaximumLength(4000);
    }
}
