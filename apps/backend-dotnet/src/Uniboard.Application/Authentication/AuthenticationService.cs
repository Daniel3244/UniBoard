using System;
using System.Security.Cryptography;
using System.Text;
using Uniboard.Application.Authentication.Exceptions;
using Uniboard.Application.Common.Interfaces;
using Uniboard.Application.Users;
using Uniboard.Domain.Entities;

namespace Uniboard.Application.Authentication;

public sealed class AuthenticationService(
    IUserRepository users,
    IPasswordHasher passwordHasher,
    ITokenService tokenService) : IAuthenticationService
{
    public async Task<AuthenticationResult> RegisterAsync(string email, string password, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = NormalizeEmail(email);

        var isFirstUser = !await users.HasAnyAsync(cancellationToken);

        if (await users.EmailExistsAsync(normalizedEmail, cancellationToken))
        {
            throw new EmailAlreadyUsedException(normalizedEmail);
        }

        var user = new User
        {
            Id = Guid.NewGuid(),
            Email = normalizedEmail,
            PasswordHash = passwordHasher.Hash(password),
            Role = isFirstUser ? UserRole.Admin : UserRole.Member,
            CreatedAt = DateTime.UtcNow
        };

        await users.AddAsync(user, cancellationToken);

        return await IssueTokensAsync(user, cancellationToken);
    }

    public async Task<AuthenticationResult> LoginAsync(string email, string password, CancellationToken cancellationToken = default)
    {
        var normalizedEmail = NormalizeEmail(email);
        var user = await users.GetByEmailAsync(normalizedEmail, cancellationToken);

        if (user is null || !passwordHasher.Verify(user.PasswordHash, password))
        {
            throw new InvalidCredentialsException();
        }

        return await IssueTokensAsync(user, cancellationToken);
    }

    public async Task<AuthenticationResult> RefreshAsync(Guid userId, string refreshToken, CancellationToken cancellationToken = default)
    {
        var user = await users.GetByIdAsync(userId, cancellationToken);

        if (user is null)
        {
            throw new InvalidRefreshTokenException();
        }

        var tokenHash = ComputeHash(refreshToken);
        var existingToken = await users.GetRefreshTokenAsync(user.Id, tokenHash, cancellationToken);

        if (existingToken is null || !existingToken.IsActive)
        {
            throw new InvalidRefreshTokenException();
        }

        existingToken.RevokedAt = DateTime.UtcNow;
        await users.UpdateRefreshTokenAsync(existingToken, cancellationToken);

        return await IssueTokensAsync(user, cancellationToken);
    }

    private async Task<AuthenticationResult> IssueTokensAsync(User user, CancellationToken cancellationToken)
    {
        var tokens = tokenService.CreateTokenPair(user);

        var refreshToken = new RefreshToken
        {
            Id = Guid.NewGuid(),
            UserId = user.Id,
            TokenHash = ComputeHash(tokens.RefreshToken),
            CreatedAt = DateTime.UtcNow,
            ExpiresAt = tokens.RefreshTokenExpiresAt
        };

        await users.AddRefreshTokenAsync(refreshToken, cancellationToken);

        return new AuthenticationResult(user, tokens);
    }

    private static string NormalizeEmail(string email) =>
        email.Trim().ToLowerInvariant();

    private static string ComputeHash(string value)
    {
        var bytes = Encoding.UTF8.GetBytes(value);
        var hash = SHA256.HashData(bytes);
        return Convert.ToHexString(hash);
    }
}
