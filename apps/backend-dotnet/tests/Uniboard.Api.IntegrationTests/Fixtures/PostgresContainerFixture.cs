using System.Threading.Tasks;
using DotNet.Testcontainers.Builders;
using DotNet.Testcontainers.Configurations;
using DotNet.Testcontainers.Containers;
using Xunit;

namespace Uniboard.Api.IntegrationTests.Fixtures;

public sealed class PostgresContainerFixture : IAsyncLifetime
{
    private readonly PostgreSqlTestcontainer _container;

    public bool IsDockerAvailable { get; private set; }

    public PostgresContainerFixture()
    {
        _container = new TestcontainersBuilder<PostgreSqlTestcontainer>()
            .WithDatabase(new PostgreSqlTestcontainerConfiguration("postgres:16-alpine")
            {
                Database = "uniboard_test",
                Username = "postgres",
                Password = "postgres"
            })
            .WithCleanUp(true)
            .Build();
    }

    public string ConnectionString => _container.ConnectionString;

    public async Task InitializeAsync()
    {
        try
        {
            await _container.StartAsync();
            IsDockerAvailable = true;
        }
        catch
        {
            IsDockerAvailable = false;
        }
    }

    public Task DisposeAsync() =>
        IsDockerAvailable ? _container.StopAsync() : Task.CompletedTask;
}
