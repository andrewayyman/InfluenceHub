using InfluenceHub.Application.Interfaces;
using InfluenceHub.Application.DTOs.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace InfluenceHub.WebApi.Controllers;

[ApiController]
[Route("api/[controller]/[action]")]
public class PaymentsController : BaseApiController
{
    private readonly IPaymentService _paymentService;

    public PaymentsController(IPaymentService paymentService)
    {
        _paymentService = paymentService;
    }

    [Authorize(Roles = "Brand")]
    [HttpGet("{campaignId:guid}")]
    public async Task<IActionResult> GetCampaignPayment(Guid campaignId, CancellationToken ct)
    {
        var payment = await _paymentService.GetCampaignPaymentAsync(campaignId, ct);
        if (payment is null) return NotFound();
        return Ok(payment);
    }

    [Authorize(Roles = "Influencer")]
    [HttpGet]
    public async Task<IActionResult> GetMyPayments(CancellationToken ct)
    {
        var payments = await _paymentService.GetInfluencerPaymentsAsync(UserId, ct);
        return Ok(payments);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetAllPayments([FromQuery] string? status, [FromQuery] string? search, CancellationToken ct)
    {
        var payments = await _paymentService.GetAllPaymentsAsync(status, search, ct);
        return Ok(payments);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetPaymentSummary(CancellationToken ct)
    {
        var summary = await _paymentService.GetPaymentSummaryAsync(ct);
        return Ok(summary);
    }

    [Authorize(Roles = "Brand,Influencer")]
    [HttpGet("{paymentId:guid}")]
    public async Task<IActionResult> GetPaymentDetails(Guid paymentId, CancellationToken ct)
    {
        try
        {
            var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
            var payment = await _paymentService.GetPaymentDetailsAsync(paymentId, UserId, role, ct);
            if (payment is null) return NotFound();
            return Ok(payment);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [Authorize(Roles = "Brand")]
    [HttpPost("{paymentId:guid}")]
    public async Task<IActionResult> UploadProof(Guid paymentId, [FromForm] string paymentMethod, [FromForm] string? transactionReference, [FromForm] string? brandNotes, [FromForm] IFormFile? proofFile, CancellationToken ct)
    {
        try
        {
            await using var stream = proofFile?.OpenReadStream();
            var extension = proofFile is null ? null : Path.GetExtension(proofFile.FileName);

            var result = await _paymentService.UploadProofAsync(
                paymentId,
                UserId,
                new UploadPaymentProofRequest(paymentMethod, transactionReference, brandNotes),
                stream,
                extension,
                ct);

            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Influencer")]
    [HttpPost("{paymentId:guid}")]
    public async Task<IActionResult> ConfirmReceipt(Guid paymentId, CancellationToken ct)
    {
        try
        {
            var result = await _paymentService.ConfirmReceiptAsync(paymentId, UserId, ct);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Brand,Influencer")]
    [HttpPost("{paymentId:guid}")]
    public async Task<IActionResult> Dispute(Guid paymentId, [FromBody] DisputeRequest request, CancellationToken ct)
    {
        try
        {
            var role = User.FindFirstValue(ClaimTypes.Role) ?? string.Empty;
            var result = await _paymentService.DisputeAsync(paymentId, UserId, role, request, ct);
            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
