using System;
using System.Linq;
using FluentValidation;
using Uniboard.Api.Contracts.Tasks;

namespace Uniboard.Api.Validators;

public class UpdateTaskRequestValidator : AbstractValidator<UpdateTaskRequest>
{
    private static readonly string[] AllowedStatuses = ["todo", "in_progress", "done"];

    public UpdateTaskRequestValidator()
    {
        RuleFor(x => x.Title)
            .NotEmpty()
            .MaximumLength(200);

        RuleFor(x => x.Status)
            .NotEmpty()
            .MaximumLength(50)
            .Must(status => AllowedStatuses.Contains(status, StringComparer.OrdinalIgnoreCase))
            .WithMessage($"Status must be one of: {string.Join(", ", AllowedStatuses)}.");
    }
}
