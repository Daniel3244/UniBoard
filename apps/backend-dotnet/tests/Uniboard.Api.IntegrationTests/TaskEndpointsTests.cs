using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Uniboard.Api.Contracts.Auth;
using Uniboard.Api.Contracts.Projects;
using Uniboard.Api.Contracts.Tasks;
using Uniboard.Api.IntegrationTests.Fixtures;
using Uniboard.Api.IntegrationTests.Infrastructure;
using Xunit;

namespace Uniboard.Api.IntegrationTests;

public sealed class TaskEndpointsTests : IClassFixture<PostgresContainerFixture>, IAsyncLifetime
{
    private readonly PostgresContainerFixture _postgres;
    private ApiApplicationFactory? _factory;
    private HttpClient? _client;

    public TaskEndpointsTests(PostgresContainerFixture postgres)
    {
        _postgres = postgres;
    }

    public async Task InitializeAsync()
    {
        if (!_postgres.IsDockerAvailable)
        {
            return;
        }

        _factory = new ApiApplicationFactory(_postgres);
        await _factory.ResetDatabaseAsync();
        _client = _factory.CreateClient();
    }

    public async Task DisposeAsync()
    {
        _client?.Dispose();
        if (_factory is not null)
        {
            await _factory.DisposeAsync();
        }
    }

    [Fact]
    public async Task TaskCrudFlow_ReturnsExpectedData()
    {
        if (!_postgres.IsDockerAvailable)
        {
            return;
        }

        var email = $"integration-{Guid.NewGuid():N}@example.com";
        var password = "Admin!12345";

        var client = _client ?? throw new InvalidOperationException("HTTP client not initialized.");

        var registerResponse = await client.PostAsJsonAsync("/api/auth/register", new
        {
            Email = email,
            Password = password,
            ConfirmPassword = password
        });

        registerResponse.EnsureSuccessStatusCode();
        var auth = await registerResponse.Content.ReadFromJsonAsync<AuthenticationResponse>();
        auth.Should().NotBeNull();

        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth!.AccessToken);

        var createProjectResponse = await client.PostAsJsonAsync("/api/projects", new
        {
            name = "Integration Project",
            description = "Created from integration test"
        });

        createProjectResponse.EnsureSuccessStatusCode();
        var project = await createProjectResponse.Content.ReadFromJsonAsync<ProjectResponse>();
        project.Should().NotBeNull();

        var createTaskResponse = await client.PostAsJsonAsync($"/api/projects/{project!.Id}/tasks", new
        {
            title = "Verify API",
            status = "todo"
        });

        createTaskResponse.EnsureSuccessStatusCode();
        var task = await createTaskResponse.Content.ReadFromJsonAsync<TaskResponse>();
        task.Should().NotBeNull();
        task!.Title.Should().Be("Verify API");
        task.Status.Should().Be("todo");

        var tasks = await client.GetFromJsonAsync<TaskResponse[]>($"/api/projects/{project.Id}/tasks");
        tasks.Should().NotBeNull();
        tasks!.Should().ContainSingle(t => t.Id == task.Id);
    }
}
