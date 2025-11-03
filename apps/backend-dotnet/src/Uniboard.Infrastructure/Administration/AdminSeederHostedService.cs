using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Uniboard.Application.Common.Interfaces;
using Uniboard.Application.Users;
using Uniboard.Domain.Entities;

namespace Uniboard.Infrastructure.Administration;

internal sealed class AdminSeederHostedService(
    IServiceProvider serviceProvider,
    IOptions<AdminSeedOptions> options,
    ILogger<AdminSeederHostedService> logger) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        var settings = options.Value;

        if (!settings.Enabled || string.IsNullOrWhiteSpace(settings.Email) || string.IsNullOrWhiteSpace(settings.Password))
        {
            logger.LogInformation("Admin seeding is disabled or incomplete configuration provided.");
            return;
        }

        using var scope = serviceProvider.CreateScope();
        var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

        var normalizedEmail = settings.Email.Trim().ToLowerInvariant();
        var existingUser = await userRepository.GetByEmailAsync(normalizedEmail, cancellationToken);
        if (existingUser is null)
        {
            var admin = new User
            {
                Id = Guid.NewGuid(),
                Email = normalizedEmail,
                PasswordHash = passwordHasher.Hash(settings.Password),
                Role = UserRole.Admin,
                CreatedAt = DateTime.UtcNow
            };

            await userRepository.AddAsync(admin, cancellationToken);
            logger.LogInformation("Seeded admin user {Email}", normalizedEmail);
            return;
        }

        if (existingUser.Role != UserRole.Admin)
        {
            existingUser.Role = UserRole.Admin;
            await userRepository.UpdateAsync(existingUser, cancellationToken);
            logger.LogInformation("Promoted existing user {Email} to admin role.", normalizedEmail);
        }
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
