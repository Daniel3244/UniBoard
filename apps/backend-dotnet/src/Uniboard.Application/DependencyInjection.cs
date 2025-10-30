using Microsoft.Extensions.DependencyInjection;

namespace Uniboard.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        // Application layer registrations will land here once available.
        return services;
    }
}
