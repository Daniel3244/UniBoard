using FluentValidation;
using Uniboard.Api.Contracts.Comments;

namespace Uniboard.Api.Validators;

public sealed class CreateCommentRequestValidator : AbstractValidator<CreateCommentRequest>
{
    public CreateCommentRequestValidator()
    {
        RuleFor(x => x.Body)
            .NotEmpty()
            .MaximumLength(2000);
    }
}
