using System;
using Npgsql;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Uniboard.Application.Comments;
using Uniboard.Application.Common.Interfaces;
using Uniboard.Application.Projects;
using Uniboard.Application.Tasks;
using Uniboard.Application.Users;
using Uniboard.Infrastructure.Administration;
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
            var databaseUrl = configuration["DATABASE_URL"];
            if (!string.IsNullOrWhiteSpace(databaseUrl))
            {
                connectionString = BuildConnectionStringFromUrl(databaseUrl);
            }
        }

        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException("Connection string 'Database' is not configured.");
        }

        services.AddDbContext<UniboardDbContext>(options =>
            options.UseNpgsql(connectionString));

        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));
        services.Configure<AdminSeedOptions>(configuration.GetSection(AdminSeedOptions.SectionName));

        services.AddScoped<IApplicationDbContext>(provider =>
            provider.GetRequiredService<UniboardDbContext>());
        services.AddScoped<IProjectRepository, ProjectRepository>();
        services.AddScoped<ITaskRepository, TaskRepository>();
        services.AddScoped<ITaskCommentRepository, TaskCommentRepository>();
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ITokenService, TokenService>();
        services.AddScoped<IPasswordHasher, Pbkdf2PasswordHasher>();
        services.AddHostedService<AdminSeederHostedService>();

        return services;
    }

    private static string BuildConnectionStringFromUrl(string databaseUrl)
    {
        var builder = new NpgsqlConnectionStringBuilder(databaseUrl);

        if (builder.SslMode == SslMode.Disable)
        {
            builder.SslMode = SslMode.Require;
        }

        if (builder.Port == 0)
        {
            builder.Port = 5432;
        }

        return builder.ConnectionString;
    }
}
