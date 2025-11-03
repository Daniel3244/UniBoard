using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Uniboard.Domain.Entities;

namespace Uniboard.Application.Comments;

public interface ITaskCommentRepository
{
    Task<IReadOnlyCollection<TaskComment>> GetByTaskAsync(Guid projectId, Guid taskId, CancellationToken cancellationToken = default);
    Task<TaskComment> AddAsync(TaskComment comment, CancellationToken cancellationToken = default);
}
