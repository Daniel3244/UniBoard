using System;

namespace Uniboard.Api.Contracts.Auth;

public sealed record AuthenticationResponse(
    Guid UserId,
    string Email,
    string Role,
    string AccessToken,
    DateTime AccessTokenExpiresAt,
    string RefreshToken,
    DateTime RefreshTokenExpiresAt);
