using System;

namespace Uniboard.Api.Contracts.Auth;

public sealed record RefreshTokenRequest(Guid UserId, string RefreshToken);
