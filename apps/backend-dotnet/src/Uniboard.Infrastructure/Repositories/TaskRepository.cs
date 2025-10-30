using System;
using System.Linq;
using Microsoft.EntityFrameworkCore;
using Uniboard.Application.Tasks;
using Uniboard.Domain.Entities;
using Uniboard.Infrastructure.Persistence;

namespace Uniboard.Infrastructure.Repositories;

internal sealed class TaskRepository(UniboardDbContext dbContext) : ITaskRepository
{
    public async Task<IReadOnlyCollection<TaskItem>> GetByProjectAsync(Guid projectId, CancellationToken cancellationToken = default)
    {
        return await dbContext.TaskItems
            .AsNoTracking()
            .Where(t => t.ProjectId == projectId)
            .OrderByDescending(t => t.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<TaskItem?> GetByIdAsync(Guid projectId, Guid taskId, CancellationToken cancellationToken = default)
    {
        return await dbContext.TaskItems
            .FirstOrDefaultAsync(t => t.ProjectId == projectId && t.Id == taskId, cancellationToken);
    }

    public async Task<TaskItem> AddAsync(TaskItem task, CancellationToken cancellationToken = default)
    {
        await dbContext.TaskItems.AddAsync(task, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        return task;
    }

    public async Task UpdateAsync(TaskItem task, CancellationToken cancellationToken = default)
    {
        dbContext.TaskItems.Update(task);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(TaskItem task, CancellationToken cancellationToken = default)
    {
        dbContext.TaskItems.Remove(task);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
