namespace Uniboard.Api.Contracts.Auth;

public sealed record RegisterRequest(string Email, string Password, string ConfirmPassword);
