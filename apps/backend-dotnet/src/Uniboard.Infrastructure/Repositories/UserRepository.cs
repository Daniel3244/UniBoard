using Microsoft.EntityFrameworkCore;
using Uniboard.Application.Users;
using Uniboard.Domain.Entities;
using Uniboard.Infrastructure.Persistence;

namespace Uniboard.Infrastructure.Repositories;

internal sealed class UserRepository(UniboardDbContext dbContext) : IUserRepository
{
    public async Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken = default)
    {
        return await dbContext.Users
            .AnyAsync(user => user.Email == email, cancellationToken);
    }

    public async Task<bool> HasAnyAsync(CancellationToken cancellationToken = default)
    {
        return await dbContext.Users.AnyAsync(cancellationToken);
    }

    public async Task<User?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await dbContext.Users
            .FirstOrDefaultAsync(user => user.Email == email, cancellationToken);
    }

    public async Task<User?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await dbContext.Users
            .FirstOrDefaultAsync(user => user.Id == id, cancellationToken);
    }

    public async Task<User> AddAsync(User user, CancellationToken cancellationToken = default)
    {
        await dbContext.Users.AddAsync(user, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        return user;
    }

    public async Task UpdateAsync(User user, CancellationToken cancellationToken = default)
    {
        dbContext.Users.Update(user);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    public async Task<RefreshToken> AddRefreshTokenAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default)
    {
        await dbContext.RefreshTokens.AddAsync(refreshToken, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        return refreshToken;
    }

    public async Task<RefreshToken?> GetRefreshTokenAsync(Guid userId, string tokenHash, CancellationToken cancellationToken = default)
    {
        return await dbContext.RefreshTokens
            .FirstOrDefaultAsync(token => token.UserId == userId && token.TokenHash == tokenHash, cancellationToken);
    }

    public async Task UpdateRefreshTokenAsync(RefreshToken refreshToken, CancellationToken cancellationToken = default)
    {
        dbContext.RefreshTokens.Update(refreshToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
