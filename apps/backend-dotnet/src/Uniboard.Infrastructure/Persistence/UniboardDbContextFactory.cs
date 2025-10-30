using System.IO;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Microsoft.Extensions.Configuration;

namespace Uniboard.Infrastructure.Persistence;

internal sealed class UniboardDbContextFactory : IDesignTimeDbContextFactory<UniboardDbContext>
{
    public UniboardDbContext CreateDbContext(string[] args)
    {
        var environmentName = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Development";
        var basePath = Directory.GetCurrentDirectory();

        var configuration = new ConfigurationBuilder()
            .SetBasePath(basePath)
            .AddJsonFile("appsettings.json", optional: true)
            .AddJsonFile(Path.Combine(basePath, "..", "..", "Uniboard.Api", "appsettings.json"), optional: true)
            .AddJsonFile(Path.Combine(basePath, "..", "..", "Uniboard.Api", $"appsettings.{environmentName}.json"), optional: true)
            .AddEnvironmentVariables()
            .Build();

        var connectionString = configuration.GetConnectionString("Database")
            ?? throw new InvalidOperationException("Connection string 'Database' not found for design-time context creation.");

        var optionsBuilder = new DbContextOptionsBuilder<UniboardDbContext>()
            .UseNpgsql(connectionString);

        return new UniboardDbContext(optionsBuilder.Options);
    }
}
