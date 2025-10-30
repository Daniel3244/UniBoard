namespace Uniboard.Api.Contracts.Projects;

public record ProjectResponse(Guid Id, string Name, string? Description, DateTime CreatedAt);
