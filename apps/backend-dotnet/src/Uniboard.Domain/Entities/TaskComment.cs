using System;

namespace Uniboard.Domain.Entities;

public class TaskComment
{
    public Guid Id { get; set; }
    public Guid TaskId { get; set; }
    public Guid ProjectId { get; set; }
    public Guid AuthorId { get; set; }
    public string AuthorEmail { get; set; } = null!;
    public string Body { get; set; } = null!;
    public DateTime CreatedAt { get; set; }

    public TaskItem Task { get; set; } = null!;
}
