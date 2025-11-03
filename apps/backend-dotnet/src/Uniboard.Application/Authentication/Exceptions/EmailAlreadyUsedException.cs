using System;

namespace Uniboard.Application.Authentication.Exceptions;

public sealed class EmailAlreadyUsedException(string email)
    : InvalidOperationException($"Email '{email}' is already registered.")
{
    public string Email { get; } = email;
}
