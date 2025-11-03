using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Uniboard.Api.Contracts.Auth;
using Uniboard.Application.Authentication;
using Uniboard.Application.Authentication.Exceptions;

namespace Uniboard.Api.Controllers;

[ApiController]
[AllowAnonymous]
[Route("api/[controller]")]
public class AuthController(IAuthenticationService authenticationService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<AuthenticationResponse>> Register(
        RegisterRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await authenticationService.RegisterAsync(request.Email, request.Password, cancellationToken);
            return Ok(ToResponse(result));
        }
        catch (EmailAlreadyUsedException ex)
        {
            return Conflict(new ProblemDetails
            {
                Title = "Email already registered",
                Detail = ex.Message,
                Status = StatusCodes.Status409Conflict
            });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthenticationResponse>> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        try
        {
            var result = await authenticationService.LoginAsync(request.Email, request.Password, cancellationToken);
            return Ok(ToResponse(result));
        }
        catch (InvalidCredentialsException ex)
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Invalid credentials",
                Detail = ex.Message,
                Status = StatusCodes.Status401Unauthorized
            });
        }
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthenticationResponse>> Refresh(
        RefreshTokenRequest request,
        CancellationToken cancellationToken)
    {
        try
        {
            var result = await authenticationService.RefreshAsync(request.UserId, request.RefreshToken, cancellationToken);
            return Ok(ToResponse(result));
        }
        catch (InvalidRefreshTokenException ex)
        {
            return Unauthorized(new ProblemDetails
            {
                Title = "Invalid refresh token",
                Detail = ex.Message,
                Status = StatusCodes.Status401Unauthorized
            });
        }
    }

    private static AuthenticationResponse ToResponse(AuthenticationResult result)
    {
        return new AuthenticationResponse(
            result.User.Id,
            result.User.Email,
            result.User.Role.ToString(),
            result.Tokens.AccessToken,
            result.Tokens.AccessTokenExpiresAt,
            result.Tokens.RefreshToken,
            result.Tokens.RefreshTokenExpiresAt);
    }
}
