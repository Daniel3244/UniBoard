using System;

namespace Uniboard.Domain.Entities;

public class TaskItem
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string Status { get; set; } = null!;
    public DateTime CreatedAt { get; set; }

    public Guid ProjectId { get; set; }
    public Project Project { get; set; } = null!;
}
