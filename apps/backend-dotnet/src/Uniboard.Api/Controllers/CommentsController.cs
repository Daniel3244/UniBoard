using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Uniboard.Api.Contracts.Activity;
using Uniboard.Api.Contracts.Comments;
using Uniboard.Api.Realtime;
using Uniboard.Application.Comments;
using Uniboard.Application.Projects;
using Uniboard.Application.Tasks;
using Uniboard.Domain.Entities;

namespace Uniboard.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/projects/{projectId:guid}/tasks/{taskId:guid}/comments")]
public sealed class CommentsController(
    IProjectRepository projectRepository,
    ITaskRepository taskRepository,
    ITaskCommentRepository commentRepository,
    IHubContext<TaskHub> hubContext,
    IMapper mapper,
    IActivityEmitter activityEmitter) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<CommentResponse>>> GetComments(Guid projectId, Guid taskId, CancellationToken cancellationToken)
    {
        if (!await ProjectAndTaskExist(projectId, taskId, cancellationToken))
        {
            return NotFound();
        }

        var comments = await commentRepository.GetByTaskAsync(projectId, taskId, cancellationToken);
        var response = mapper.Map<IEnumerable<CommentResponse>>(comments);
        return Ok(response);
    }

    [HttpPost]
    public async Task<ActionResult<CommentResponse>> CreateComment(Guid projectId, Guid taskId, CreateCommentRequest request, CancellationToken cancellationToken)
    {
        var project = await projectRepository.GetByIdAsync(projectId, cancellationToken);
        if (project is null)
        {
            return NotFound();
        }

        var task = await taskRepository.GetByIdAsync(projectId, taskId, cancellationToken);
        if (task is null)
        {
            return NotFound();
        }

        var authorIdClaim = User.FindFirstValue(JwtRegisteredClaimNames.Sub) ??
                            User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(authorIdClaim) || !Guid.TryParse(authorIdClaim, out var authorId))
        {
            return Forbid();
        }

        var authorEmail = User.FindFirstValue(JwtRegisteredClaimNames.Email) ??
                          User.FindFirstValue(ClaimTypes.Email) ??
                          "unknown@uniboard";

        var trimmedBody = request.Body.Trim();

        var comment = new TaskComment
        {
            Id = Guid.NewGuid(),
            TaskId = taskId,
            ProjectId = projectId,
            AuthorId = authorId,
            AuthorEmail = authorEmail,
            Body = trimmedBody,
            CreatedAt = DateTime.UtcNow
        };

        await commentRepository.AddAsync(comment, cancellationToken);
        var response = mapper.Map<CommentResponse>(comment);

        await hubContext.Clients
            .Group(TaskHub.GetGroupName(projectId))
            .SendAsync("CommentAdded", response, cancellationToken: cancellationToken);

        await activityEmitter.PublishAsync(new ActivityEvent(
            Guid.NewGuid(),
            "comment_added",
            $"Dodano komentarz do zadania \"{task.Title}\"",
            trimmedBody.Length > 120 ? trimmedBody[..120] + "…" : trimmedBody,
            projectId,
            taskId,
            comment.Id,
            comment.CreatedAt),
            cancellationToken);

        return CreatedAtAction(nameof(GetComments), new { projectId, taskId }, response);
    }

    private async Task<bool> ProjectAndTaskExist(Guid projectId, Guid taskId, CancellationToken cancellationToken)
    {
        var project = await projectRepository.GetByIdAsync(projectId, cancellationToken);
        if (project is null)
        {
            return false;
        }

        var task = await taskRepository.GetByIdAsync(projectId, taskId, cancellationToken);
        return task is not null;
    }
}
