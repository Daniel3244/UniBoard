using System;

namespace Uniboard.Application.Authentication.Exceptions;

public sealed class InvalidRefreshTokenException()
    : UnauthorizedAccessException("Refresh token is invalid or expired.")
{
}
