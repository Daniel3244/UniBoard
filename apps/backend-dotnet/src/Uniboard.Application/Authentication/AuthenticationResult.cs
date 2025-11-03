using Uniboard.Domain.Entities;

namespace Uniboard.Application.Authentication;

public sealed record AuthenticationResult(User User, TokenPair Tokens);
