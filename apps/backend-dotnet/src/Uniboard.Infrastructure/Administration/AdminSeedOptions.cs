namespace Uniboard.Infrastructure.Administration;

public sealed class AdminSeedOptions
{
    public const string SectionName = "AdminSeed";

    public bool Enabled { get; init; } = true;
    public string Email { get; init; } = string.Empty;
    public string Password { get; init; } = string.Empty;
}
