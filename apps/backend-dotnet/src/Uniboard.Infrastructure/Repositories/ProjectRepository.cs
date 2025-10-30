using System.Linq;
using Microsoft.EntityFrameworkCore;
using Uniboard.Application.Projects;
using Uniboard.Domain.Entities;
using Uniboard.Infrastructure.Persistence;

namespace Uniboard.Infrastructure.Repositories;

internal sealed class ProjectRepository(UniboardDbContext dbContext) : IProjectRepository
{
    public async Task<IReadOnlyCollection<Project>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Projects
            .AsNoTracking()
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public Task<Project?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        dbContext.Projects
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);

    public async Task<Project> AddAsync(Project project, CancellationToken cancellationToken = default)
    {
        await dbContext.Projects.AddAsync(project, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        return project;
    }

    public async Task UpdateAsync(Project project, CancellationToken cancellationToken = default)
    {
        dbContext.Projects.Update(project);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Project project, CancellationToken cancellationToken = default)
    {
        dbContext.Projects.Remove(project);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
