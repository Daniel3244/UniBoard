using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Uniboard.Api.Realtime;

[Authorize]
public sealed class TaskHub : Hub
{
    public Task JoinProject(Guid projectId) =>
        Groups.AddToGroupAsync(Context.ConnectionId, GetGroupName(projectId));

    public Task LeaveProject(Guid projectId) =>
        Groups.RemoveFromGroupAsync(Context.ConnectionId, GetGroupName(projectId));

    internal static string GetGroupName(Guid projectId) => $"project:{projectId:D}";
}
