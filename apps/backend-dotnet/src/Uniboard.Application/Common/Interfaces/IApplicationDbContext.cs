using System.Threading;
using System.Threading.Tasks;

namespace Uniboard.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
