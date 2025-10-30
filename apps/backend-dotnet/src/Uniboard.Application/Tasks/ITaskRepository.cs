using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Uniboard.Domain.Entities;

namespace Uniboard.Application.Tasks;

public interface ITaskRepository
{
    Task<IReadOnlyCollection<TaskItem>> GetByProjectAsync(Guid projectId, CancellationToken cancellationToken = default);
    Task<TaskItem?> GetByIdAsync(Guid projectId, Guid taskId, CancellationToken cancellationToken = default);
    Task<TaskItem> AddAsync(TaskItem task, CancellationToken cancellationToken = default);
    Task UpdateAsync(TaskItem task, CancellationToken cancellationToken = default);
    Task DeleteAsync(TaskItem task, CancellationToken cancellationToken = default);
}
