using Microsoft.Extensions.DependencyInjection;
using Uniboard.Application.Authentication;

namespace Uniboard.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddScoped<IAuthenticationService, AuthenticationService>();

        return services;
    }
}
