using System;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Uniboard.Application.Common.Interfaces;
using Uniboard.Application.Projects;
using Uniboard.Application.Tasks;
using Uniboard.Application.Users;
using Uniboard.Infrastructure.Authentication;
using Uniboard.Infrastructure.Persistence;
using Uniboard.Infrastructure.Repositories;
using Uniboard.Infrastructure.Security;

namespace Uniboard.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("Database");

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("Connection string 'Database' is not configured.");
        }

        services.AddDbContext<UniboardDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));

        services.AddScoped<IApplicationDbContext>(provider =>
            provider.GetRequiredService<UniboardDbContext>());
        services.AddScoped<IProjectRepository, ProjectRepository>();
        services.AddScoped<ITaskRepository, TaskRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IPasswordHasher, Pbkdf2PasswordHasher>();

        return services;
    }
}
