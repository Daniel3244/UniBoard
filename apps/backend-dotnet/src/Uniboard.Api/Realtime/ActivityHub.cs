using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace Uniboard.Api.Realtime;

[Authorize]
public sealed class ActivityHub : Hub
{
}
