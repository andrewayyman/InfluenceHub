using InfluenceHub.Application.DTOs.Request;
using InfluenceHub.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace InfluenceHub.WebApi.Controllers;

[Authorize(Roles = "Admin,Brand,Influencer")]
public class TagsController : BaseApiController
{
    private readonly ITagService _tagService;

    public TagsController(ITagService tagService)
    {
        _tagService = tagService;
    }

    [HttpGet]
    public async Task<IActionResult> GetTags(CancellationToken ct)
    {
        var tags = await _tagService.GetTagsAsync(ct);
        return Ok(tags);
    }

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateTag([FromBody] CreateTagRequest request, CancellationToken ct)
    {
        try
        {
            var tag = await _tagService.CreateTagAsync(request, ct);
            return CreatedAtAction(nameof(GetTags), new { id = tag.Id }, tag);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
