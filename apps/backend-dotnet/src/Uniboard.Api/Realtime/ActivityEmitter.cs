using Microsoft.AspNetCore.SignalR;
using Uniboard.Api.Contracts.Activity;

namespace Uniboard.Api.Realtime;

public interface IActivityEmitter
{
    Task PublishAsync(ActivityEvent activityEvent, CancellationToken cancellationToken = default);
}

internal sealed class ActivityEmitter(IHubContext<ActivityHub> hubContext) : IActivityEmitter
{
    public Task PublishAsync(ActivityEvent activityEvent, CancellationToken cancellationToken = default) =>
        hubContext.Clients.All.SendAsync("ActivityPublished", activityEvent, cancellationToken);
}
