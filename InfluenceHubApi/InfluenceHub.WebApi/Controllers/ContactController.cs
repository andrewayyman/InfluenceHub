using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace InfluenceHub.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactController : ControllerBase
{
    private readonly IContactService _contactService;

    public ContactController(IContactService contactService)
    {
        _contactService = contactService;
    }

    [HttpPost]
    public async Task<IActionResult> Contact([FromBody] ContactRequest request, CancellationToken ct)
    {
        var message = await _contactService.CreateMessageAsync(request, ct);
        return Ok(message);
    }
}
