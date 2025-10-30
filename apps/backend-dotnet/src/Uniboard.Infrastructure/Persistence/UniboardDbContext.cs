using Microsoft.EntityFrameworkCore;
using Uniboard.Application.Common.Interfaces;

namespace Uniboard.Infrastructure.Persistence;

public sealed class UniboardDbContext(DbContextOptions<UniboardDbContext> options)
    : DbContext(options), IApplicationDbContext
{
}
