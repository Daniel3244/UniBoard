using System;

namespace Uniboard.Application.Authentication.Exceptions;

public sealed class InvalidCredentialsException()
    : UnauthorizedAccessException("Invalid email or password.")
{
}
