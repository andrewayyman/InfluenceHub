using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InfluenceHub.WebApi.Controllers;

public class ContactController : BaseApiController
{
    private readonly IContactService _contactService;

    public ContactController(IContactService contactService)
    {
        _contactService = contactService;
    }

    [AllowAnonymous]
    [HttpPost]
    public async Task<IActionResult> Contact([FromBody] ContactRequest request, CancellationToken ct)
    {
        Guid? senderUserId = User.Identity?.IsAuthenticated == true ? UserId : null;
        var message = await _contactService.CreateMessageAsync(request, senderUserId, ct);
        return Ok(message);
    }
}
