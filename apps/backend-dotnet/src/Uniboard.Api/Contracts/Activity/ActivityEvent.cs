namespace Uniboard.Api.Contracts.Activity;

public sealed record ActivityEvent(
    Guid EventId,
    string Type,
    string Title,
    string? Description,
    Guid? ProjectId,
    Guid? TaskId,
    Guid? CommentId,
    DateTime OccurredAt);
