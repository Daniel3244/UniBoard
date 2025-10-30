using Uniboard.Domain.Entities;

namespace Uniboard.Api.Contracts.Projects;

internal static class ProjectMapping
{
    public static ProjectResponse ToResponse(Project project) =>
        new(project.Id, project.Name, project.Description, project.CreatedAt);
}
