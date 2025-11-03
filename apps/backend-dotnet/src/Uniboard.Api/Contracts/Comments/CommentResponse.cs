namespace Uniboard.Api.Contracts.Comments;

public sealed record CommentResponse(
    Guid Id,
    Guid TaskId,
    Guid ProjectId,
    string AuthorEmail,
    string Body,
    DateTime CreatedAt);
