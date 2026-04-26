using InfluenceHub.Application.DTOs.Request;
using FluentValidation;

namespace InfluenceHub.Application.Validators;

public class SubmitReportRequestValidator : AbstractValidator<SubmitReportRequest>
{
    public SubmitReportRequestValidator()
    {
        RuleFor(x => x.PlatformInsights)
            .NotNull()
            .Must(x => x is { Count: > 0 })
            .WithMessage("At least one platform insight is required");

        RuleForEach(x => x.PlatformInsights).ChildRules(platform =>
        {
            platform.RuleFor(x => x.Platform).NotEmpty();
            platform.RuleFor(x => x.PostUrl)
                .Must(x => string.IsNullOrWhiteSpace(x) || BeValidUrl(x))
                .WithMessage("Post URL must be a valid URL when provided");
            platform.RuleFor(x => x.Views).GreaterThanOrEqualTo(0);
            platform.RuleFor(x => x.Likes).GreaterThanOrEqualTo(0);
            platform.RuleFor(x => x.Comments).GreaterThanOrEqualTo(0);
            platform.RuleFor(x => x.Shares).GreaterThanOrEqualTo(0);
            platform.RuleFor(x => x)
                .Must(x => x.Likes + x.Comments + x.Shares <= x.Views)
                .WithMessage("Total engagement (likes + comments + shares) cannot exceed views");
        });

        RuleFor(x => x.StartDate).LessThanOrEqualTo(x => x.EndDate)
            .WithMessage("Start date must be before or equal to end date");
    }

    private static bool BeValidUrl(string? url)
    {
        if (string.IsNullOrEmpty(url)) return false;
        return Uri.TryCreate(url, UriKind.Absolute, out var uri) && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);
    }
}
