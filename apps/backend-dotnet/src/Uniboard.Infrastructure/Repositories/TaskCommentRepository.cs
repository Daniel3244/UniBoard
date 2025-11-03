using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Uniboard.Application.Comments;
using Uniboard.Domain.Entities;
using Uniboard.Infrastructure.Persistence;

namespace Uniboard.Infrastructure.Repositories;

internal sealed class TaskCommentRepository(UniboardDbContext dbContext) : ITaskCommentRepository
{
    public async Task<IReadOnlyCollection<TaskComment>> GetByTaskAsync(Guid projectId, Guid taskId, CancellationToken cancellationToken = default)
    {
        return await dbContext.TaskComments
            .AsNoTracking()
            .Where(comment => comment.ProjectId == projectId && comment.TaskId == taskId)
            .OrderBy(comment => comment.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<TaskComment> AddAsync(TaskComment comment, CancellationToken cancellationToken = default)
    {
        await dbContext.TaskComments.AddAsync(comment, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        return comment;
    }
}
