#nullable enable

using System;
using System.Threading;
using System.Threading.Tasks;
using AutoMapper;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Moq;
using Xunit;
using Uniboard.Api.Contracts.Activity;
using Uniboard.Api.Contracts.Tasks;
using Uniboard.Api.Controllers;
using Uniboard.Api.Mapping;
using Uniboard.Api.Realtime;
using Uniboard.Application.Projects;
using Uniboard.Application.Tasks;
using Uniboard.Domain.Entities;

namespace Uniboard.Api.Tests.Controllers;

public sealed class TasksControllerTests
{
    private readonly IMapper _mapper;
    private readonly Mock<IProjectRepository> _projectRepository = new();
    private readonly Mock<ITaskRepository> _taskRepository = new();
    private readonly Mock<IHubContext<TaskHub>> _hubContext = new();
    private readonly Mock<IHubClients> _hubClients = new();
    private readonly Mock<IClientProxy> _clientProxy = new();
    private readonly Mock<IActivityEmitter> _activityEmitter = new();

    public TasksControllerTests()
    {
        var config = new MapperConfiguration(cfg => cfg.AddProfile<TaskMappingProfile>());
        _mapper = config.CreateMapper();

        _hubContext.Setup(x => x.Clients).Returns(_hubClients.Object);
        _hubClients.Setup(x => x.Group(It.IsAny<string>())).Returns(_clientProxy.Object);
        _clientProxy
            .Setup(x => x.SendCoreAsync(It.IsAny<string>(), It.IsAny<object?[]>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        _activityEmitter
            .Setup(x => x.PublishAsync(It.IsAny<ActivityEvent>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
    }

    [Fact]
    public async Task CreateTask_PublishesRealtimeEvent()
    {
        var projectId = Guid.NewGuid();
        var request = new CreateTaskRequest("Write docs", "todo");
        var project = new Project { Id = projectId, Name = "Demo", CreatedAt = DateTime.UtcNow };

        _projectRepository
            .Setup(x => x.GetByIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(project);

        _taskRepository
            .Setup(x => x.AddAsync(It.IsAny<TaskItem>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((TaskItem task, CancellationToken _) => task);

        var controller = CreateController();

        var result = await controller.CreateTask(projectId, request, CancellationToken.None);

        result.Result.Should().BeOfType<CreatedAtActionResult>();

        _clientProxy.Verify(x =>
                x.SendCoreAsync(
                    "TaskCreated",
                    It.Is<object?[]>(args => MatchesTaskPayload(args, request.Title, request.Status)),
                    It.IsAny<CancellationToken>()),
            Times.Once);

        _activityEmitter.Verify(x =>
                x.PublishAsync(
                    It.Is<ActivityEvent>(evt => evt.Type == "task_created" && evt.ProjectId == projectId),
                    It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task UpdateTask_PublishesRealtimeEvent()
    {
        var projectId = Guid.NewGuid();
        var taskId = Guid.NewGuid();
        var existingTask = new TaskItem
        {
            Id = taskId,
            Title = "Old title",
            Status = "todo",
            ProjectId = projectId,
            CreatedAt = DateTime.UtcNow
        };

        _projectRepository
            .Setup(x => x.GetByIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Project { Id = projectId, Name = "Demo", CreatedAt = DateTime.UtcNow });

        _taskRepository
            .Setup(x => x.GetByIdAsync(projectId, taskId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingTask);

        _taskRepository
            .Setup(x => x.UpdateAsync(existingTask, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var controller = CreateController();

        var request = new UpdateTaskRequest("New title", "in_progress");
        var result = await controller.UpdateTask(projectId, taskId, request, CancellationToken.None);

        result.Should().BeOfType<NoContentResult>();
        _clientProxy.Verify(x =>
                x.SendCoreAsync(
                    "TaskUpdated",
                    It.Is<object?[]>(args => MatchesTaskPayload(args, request.Title, request.Status, taskId)),
                    It.IsAny<CancellationToken>()),
            Times.Once);

        _activityEmitter.Verify(x =>
                x.PublishAsync(
                    It.Is<ActivityEvent>(evt => evt.Type == "task_updated" && evt.TaskId == taskId),
                    It.IsAny<CancellationToken>()),
            Times.Once);
    }

    [Fact]
    public async Task DeleteTask_PublishesRealtimeEvent()
    {
        var projectId = Guid.NewGuid();
        var taskId = Guid.NewGuid();
        var task = new TaskItem
        {
            Id = taskId,
            ProjectId = projectId,
            Title = "Task to remove",
            Status = "done",
            CreatedAt = DateTime.UtcNow
        };

        _projectRepository
            .Setup(x => x.GetByIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Project { Id = projectId, Name = "Demo", CreatedAt = DateTime.UtcNow });

        _taskRepository
            .Setup(x => x.GetByIdAsync(projectId, taskId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(task);

        _taskRepository
            .Setup(x => x.DeleteAsync(task, It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);

        var controller = CreateController();

        var result = await controller.DeleteTask(projectId, taskId, CancellationToken.None);

        result.Should().BeOfType<NoContentResult>();
        _clientProxy.Verify(x =>
                x.SendCoreAsync(
                    "TaskDeleted",
                    It.Is<object?[]>(args => MatchesTaskDeleted(args, taskId)),
                    It.IsAny<CancellationToken>()),
            Times.Once);

        _activityEmitter.Verify(x =>
                x.PublishAsync(
                    It.Is<ActivityEvent>(evt => evt.Type == "task_deleted" && evt.TaskId == taskId),
                    It.IsAny<CancellationToken>()),
            Times.Once);
    }

    private static bool MatchesTaskPayload(object?[] args, string expectedTitle, string expectedStatus)
    {
        return MatchesTaskPayloadInternal(args, expectedTitle, expectedStatus, null);
    }

    private static bool MatchesTaskPayload(object?[] args, string expectedTitle, string expectedStatus, Guid expectedId)
    {
        return MatchesTaskPayloadInternal(args, expectedTitle, expectedStatus, expectedId);
    }

    private static bool MatchesTaskPayloadInternal(object?[] args, string expectedTitle, string expectedStatus, Guid? expectedId)
    {
        if (args.Length != 1)
        {
            return false;
        }

        if (args[0] is not TaskResponse payload)
        {
            return false;
        }

        if (expectedId.HasValue && payload.Id != expectedId.Value)
        {
            return false;
        }

        return payload.Title == expectedTitle && payload.Status == expectedStatus;
    }

    private static bool MatchesTaskDeleted(object?[] args, Guid expectedId)
    {
        return args.Length == 1 && args[0] is Guid payload && payload == expectedId;
    }

    private TasksController CreateController() =>
        new(
            _projectRepository.Object,
            _taskRepository.Object,
            _hubContext.Object,
            _activityEmitter.Object,
            _mapper);
}
