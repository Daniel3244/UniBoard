using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Uniboard.Api.Controllers;

[ApiController]
[AllowAnonymous]
[Route("healthz")]
public sealed class HealthController : ControllerBase
{
    [HttpGet]
    public IActionResult Get() =>
        Ok(new
        {
            status = "healthy",
            timestamp = DateTime.UtcNow
        });
}
