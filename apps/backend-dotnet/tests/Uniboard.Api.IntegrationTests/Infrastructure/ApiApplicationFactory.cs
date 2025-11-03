using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Uniboard.Api.IntegrationTests.Fixtures;
using Uniboard.Infrastructure.Persistence;

namespace Uniboard.Api.IntegrationTests.Infrastructure;

public sealed class ApiApplicationFactory(PostgresContainerFixture postgres)
    : WebApplicationFactory<Program>
{
    private readonly PostgresContainerFixture _postgres = postgres;

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("IntegrationTest");
        builder.ConfigureAppConfiguration((_, configurationBuilder) =>
        {
            configurationBuilder.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["ConnectionStrings:Database"] = _postgres.ConnectionString,
                ["AdminSeed:Enabled"] = "false"
            });
        });
        builder.ConfigureServices(services =>
        {
            services.RemoveAll(typeof(DbContextOptions<UniboardDbContext>));
            services.AddDbContext<UniboardDbContext>(options =>
                options.UseNpgsql(_postgres.ConnectionString));

            var serviceProvider = services.BuildServiceProvider();
            using var scope = serviceProvider.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<UniboardDbContext>();
            dbContext.Database.EnsureDeleted();
            dbContext.Database.Migrate();
        });
    }

    protected override IHost CreateHost(IHostBuilder builder)
    {
        builder.ConfigureServices(services =>
        {
            services.AddSingleton(_postgres);
        });

        return base.CreateHost(builder);
    }

    public async Task ResetDatabaseAsync()
    {
        using var scope = Services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<UniboardDbContext>();
        await dbContext.Database.EnsureDeletedAsync();
        await dbContext.Database.MigrateAsync();
    }
}
