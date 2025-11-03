namespace Uniboard.Application.Authentication;

public interface IAuthenticationService
{
    Task<AuthenticationResult> RegisterAsync(string email, string password, CancellationToken cancellationToken = default);
    Task<AuthenticationResult> LoginAsync(string email, string password, CancellationToken cancellationToken = default);
    Task<AuthenticationResult> RefreshAsync(Guid userId, string refreshToken, CancellationToken cancellationToken = default);
}
