using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace InfluenceHub.WebApi.Controllers;

[ApiController]
[Route("api/[controller]/[action]")]
public abstract class BaseApiController : ControllerBase
{
	protected Guid UserId
	{
		get
		{
			var userIdClaim = User.FindFirstValue(ClaimTypes.NameIdentifier)
				?? User.FindFirstValue("sub");

			if (!Guid.TryParse(userIdClaim, out var userId))
				throw new InvalidOperationException("Invalid or missing authenticated user id claim.");

			return userId;
		}
	}
}

