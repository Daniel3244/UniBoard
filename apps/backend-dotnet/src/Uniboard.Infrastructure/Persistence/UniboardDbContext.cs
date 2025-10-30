using Microsoft.EntityFrameworkCore;
using Uniboard.Application.Common.Interfaces;
using Uniboard.Domain.Entities;

namespace Uniboard.Infrastructure.Persistence;

public sealed class UniboardDbContext(DbContextOptions<UniboardDbContext> options)
    : DbContext(options), IApplicationDbContext
{
    public DbSet<Project> Projects => Set<Project>();
    public DbSet<TaskItem> TaskItems => Set<TaskItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(UniboardDbContext).Assembly);
        base.OnModelCreating(modelBuilder);
    }
}
