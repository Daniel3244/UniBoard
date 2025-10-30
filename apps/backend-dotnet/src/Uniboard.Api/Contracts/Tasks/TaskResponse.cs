namespace Uniboard.Api.Contracts.Tasks;

public record TaskResponse(Guid Id, string Title, string Status, Guid ProjectId, DateTime CreatedAt);
