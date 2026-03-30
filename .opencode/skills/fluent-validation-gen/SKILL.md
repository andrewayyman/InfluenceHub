---
name: fluent-validation-gen
description: Generates FluentValidation AbstractValidator classes for MediatR commands and domain entities in a Clean Architecture .NET project. Trigger this skill whenever the user asks to create, generate, add, or write a validator — or when they say "validate this command", "add validation", "write rules for", or "FluentValidation for". Also trigger when a new command is created and no validator file exists yet.
---

# FluentValidation Validator Generator

You are a FluentValidation expert. Generate a production-ready `AbstractValidator<T>` that matches the project's existing patterns.

## Step 1 — Gather context

Before writing anything, read:
1. The **command or entity** the user wants to validate (ask for the file path if not given)
2. An existing validator for reference — e.g. `src/AZM.Zimmer.Application/Features/Roles/Commands/CreateRole/CreateRoleCommandValidator.cs`
3. The **IApplicationDbContext** interface to know which DbSets are available for uniqueness checks: `src/AZM.Zimmer.Application/Common/Interfaces/IApplicationDbContext.cs`

## Step 2 — Analyse the command properties

For each property in the command record, determine:
- Is it required? → `NotEmpty()`
- Does it have a length constraint? → `Length(min, max)` or `MaximumLength(max)`
- Must it be unique in the database? → `MustAsync(...)` checking the DbContext
- Is it an enum? → `IsInEnum()`
- Is it a foreign key / reference? → `MustAsync(...)` checking that the referenced entity exists
- Is it an email? → `EmailAddress()`
- Is it conditional? → `.When(...)` clause

## Step 3 — Generate the validator file

Output a complete C# file. Follow this structure exactly:

```csharp
using AZM.Zimmer.Application.Common.Interfaces;
using FluentValidation;

namespace AZM.Zimmer.Application.Features.{Feature}.Commands.{CommandFolder};

public class {Command}Validator : AbstractValidator<{Command}>
{
    private readonly IApplicationDbContext _context;

    public {Command}Validator(IApplicationDbContext context)
    {
        _context = context;

        RuleFor(c => c.{Property})
            .NotEmpty().WithMessage("{Property} is required.")
            .Length(3, 100).WithMessage("{Property} must be between 3 and 100 characters.");

        // Uniqueness check example
        RuleFor(c => c.Name)
            .MustAsync(BeUniqueName).WithMessage("A {entity} with this name already exists.");
    }

    private async Task<bool> BeUniqueName(
        {Command} command,
        string name,
        CancellationToken cancellationToken)
    {
        return !await _context.{Entities}
            .AnyAsync(e => e.Name == name && e.Id != command.Id, cancellationToken);
    }
}
```

## Rules to follow

- **Constructor injection**: always inject `IApplicationDbContext` if any async rule is needed; omit it otherwise to keep things lean.
- **MustAsync for uniqueness**: exclude the current record's own ID (`e.Id != command.Id`) so update validators don't false-positive on the existing name.
- **Meaningful messages**: write English-readable messages. Don't leave default FluentValidation messages.
- **No business logic**: validators only check *format* and *referential integrity*. Status transitions, permission checks, workflow rules belong in the handler.
- **Order matters**: put `NotEmpty()` first so subsequent rules don't fire on empty values.
- **Async rule method naming**: use `Be{Thing}` (e.g., `BeUniqueName`, `BeValidCategory`).

## Step 4 — Output the file path

Tell the user exactly where to save the file:
```
src/AZM.Zimmer.Application/Features/{Feature}/Commands/{CommandFolder}/{Command}Validator.cs
```

And remind them to register it if they haven't already — validators are auto-registered by FluentValidation's assembly scan in `src/AZM.Zimmer.Application/DependencyInjection.cs`.

## Common patterns

**Required string with length:**
```csharp
RuleFor(c => c.Name)
    .NotEmpty().WithMessage("Name is required.")
    .Length(3, 100).WithMessage("Name must be between 3 and 100 characters.");
```

**Foreign key existence check:**
```csharp
RuleFor(c => c.CategoryId)
    .NotEmpty().WithMessage("Category is required.")
    .MustAsync(CategoryExists).WithMessage("The specified category does not exist.");

private async Task<bool> CategoryExists(Guid categoryId, CancellationToken ct) =>
    await _context.Categories.AnyAsync(c => c.Id == categoryId, ct);
```

**Enum validation:**
```csharp
RuleFor(c => c.Status)
    .IsInEnum().WithMessage("Invalid status value.");
```

**Conditional rule:**
```csharp
RuleFor(c => c.Description)
    .MaximumLength(500).WithMessage("Description cannot exceed 500 characters.")
    .When(c => !string.IsNullOrEmpty(c.Description));
```
