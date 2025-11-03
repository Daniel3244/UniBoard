using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Uniboard.Api.Contracts.Tasks;
using Uniboard.Api.Realtime;
using Uniboard.Application.Projects;
using Uniboard.Application.Tasks;
using Uniboard.Domain.Entities;

namespace Uniboard.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/projects/{projectId:guid}/tasks")]
public class TasksController(
    IProjectRepository projectRepository,
    ITaskRepository taskRepository,
    IHubContext<TaskHub> hubContext,
    IMapper mapper) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<TaskResponse>>> GetTasks(Guid projectId, CancellationToken cancellationToken)
    {
        if (!await ProjectExists(projectId, cancellationToken))
        {
            return NotFound();
        }

        var tasks = await taskRepository.GetByProjectAsync(projectId, cancellationToken);
        var response = mapper.Map<IEnumerable<TaskResponse>>(tasks);
        return Ok(response);
    }

    [HttpGet("{taskId:guid}")]
    public async Task<ActionResult<TaskResponse>> GetTask(Guid projectId, Guid taskId, CancellationToken cancellationToken)
    {
        if (!await ProjectExists(projectId, cancellationToken))
        {
            return NotFound();
        }

        var task = await taskRepository.GetByIdAsync(projectId, taskId, cancellationToken);
        if (task is null)
        {
            return NotFound();
        }

        return Ok(mapper.Map<TaskResponse>(task));
    }

    [HttpPost]
    public async Task<ActionResult<TaskResponse>> CreateTask(Guid projectId, CreateTaskRequest request, CancellationToken cancellationToken)
    {
        if (!await ProjectExists(projectId, cancellationToken))
        {
            return NotFound();
        }

        var task = mapper.Map<TaskItem>(request);
        task.Id = Guid.NewGuid();
        task.ProjectId = projectId;
        task.CreatedAt = DateTime.UtcNow;

        await taskRepository.AddAsync(task, cancellationToken);

        var response = mapper.Map<TaskResponse>(task);
        await hubContext.Clients
            .Group(TaskHub.GetGroupName(projectId))
            .SendAsync("TaskCreated", response, cancellationToken: cancellationToken);

        return CreatedAtAction(nameof(GetTask), new { projectId, taskId = task.Id }, response);
    }

    [HttpPut("{taskId:guid}")]
    public async Task<IActionResult> UpdateTask(Guid projectId, Guid taskId, UpdateTaskRequest request, CancellationToken cancellationToken)
    {
        if (!await ProjectExists(projectId, cancellationToken))
        {
            return NotFound();
        }

        var task = await taskRepository.GetByIdAsync(projectId, taskId, cancellationToken);
        if (task is null)
        {
            return NotFound();
        }

        mapper.Map(request, task);

        await taskRepository.UpdateAsync(task, cancellationToken);

        var response = mapper.Map<TaskResponse>(task);
        await hubContext.Clients
            .Group(TaskHub.GetGroupName(projectId))
            .SendAsync("TaskUpdated", response, cancellationToken: cancellationToken);

        return NoContent();
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("{taskId:guid}")]
    public async Task<IActionResult> DeleteTask(Guid projectId, Guid taskId, CancellationToken cancellationToken)
    {
        if (!await ProjectExists(projectId, cancellationToken))
        {
            return NotFound();
        }

        var task = await taskRepository.GetByIdAsync(projectId, taskId, cancellationToken);
        if (task is null)
        {
            return NotFound();
        }

        await taskRepository.DeleteAsync(task, cancellationToken);
        await hubContext.Clients
            .Group(TaskHub.GetGroupName(projectId))
            .SendAsync("TaskDeleted", taskId, cancellationToken: cancellationToken);
        return NoContent();
    }

    private async Task<bool> ProjectExists(Guid projectId, CancellationToken cancellationToken)
    {
        var project = await projectRepository.GetByIdAsync(projectId, cancellationToken);
        return project is not null;
    }
}
