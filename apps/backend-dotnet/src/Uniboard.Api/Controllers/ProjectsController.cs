using System.Linq;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Uniboard.Api.Contracts.Projects;
using Uniboard.Application.Projects;
using Uniboard.Domain.Entities;

namespace Uniboard.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/[controller]")]
public class ProjectsController(IProjectRepository repository) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<ProjectResponse>>> GetProjects(CancellationToken cancellationToken)
    {
        var projects = await repository.GetAllAsync(cancellationToken);
        return Ok(projects.Select(ProjectMapping.ToResponse));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProjectResponse>> GetProject(Guid id, CancellationToken cancellationToken)
    {
        var project = await repository.GetByIdAsync(id, cancellationToken);
        if (project is null)
        {
            return NotFound();
        }

        return Ok(ProjectMapping.ToResponse(project));
    }

    [HttpPost]
    public async Task<ActionResult<ProjectResponse>> CreateProject(CreateProjectRequest request, CancellationToken cancellationToken)
    {
        var project = new Project
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            CreatedAt = DateTime.UtcNow
        };

        await repository.AddAsync(project, cancellationToken);

        return CreatedAtAction(
            nameof(GetProject),
            new { id = project.Id },
            ProjectMapping.ToResponse(project));
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> UpdateProject(Guid id, UpdateProjectRequest request, CancellationToken cancellationToken)
    {
        var existing = await repository.GetByIdAsync(id, cancellationToken);
        if (existing is null)
        {
            return NotFound();
        }

        existing.Name = request.Name;
        existing.Description = request.Description;

        await repository.UpdateAsync(existing, cancellationToken);

        return NoContent();
    }

    [Authorize(Policy = "AdminOnly")]
    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> DeleteProject(Guid id, CancellationToken cancellationToken)
    {
        var existing = await repository.GetByIdAsync(id, cancellationToken);
        if (existing is null)
        {
            return NotFound();
        }

        await repository.DeleteAsync(existing, cancellationToken);
        return NoContent();
    }
}
