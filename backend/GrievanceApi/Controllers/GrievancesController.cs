using GrievanceApi.Data;
using GrievanceApi.Dtos;
using GrievanceApi.Models;
using GrievanceApi.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace GrievanceApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class GrievancesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IEmailService _emailService;

    public GrievancesController(AppDbContext db, IEmailService emailService)
    {
        _db = db;
        _emailService = emailService;
    }

    // POST /api/grievances  — public: anyone can submit a grievance
    [HttpPost]
    public async Task<ActionResult<GrievanceCreatedResponseDto>> Create(GrievanceCreateDto dto)
    {
        var grievance = new Grievance
        {
            FullName = dto.FullName.Trim(),
            Email = dto.Email.Trim(),
            Category = dto.Category,
            Subject = dto.Subject.Trim(),
            Description = dto.Description.Trim(),
            Status = GrievanceStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Grievances.Add(grievance);
        // Save once to get the DB-generated Id, then assign the human-readable ticket code.
        await _db.SaveChangesAsync();

        grievance.TicketId = $"GRV-{grievance.CreatedAt:yyyy}-{grievance.Id:D5}";
        await _db.SaveChangesAsync();

        await _emailService.SendGrievanceSubmittedEmailAsync(
            grievance.Email, grievance.FullName, grievance.TicketId, grievance.Subject);

        return CreatedAtAction(nameof(Track), new { ticketId = grievance.TicketId }, new GrievanceCreatedResponseDto
        {
            TicketId = grievance.TicketId,
            CreatedAt = grievance.CreatedAt
        });
    }

    // GET /api/grievances/track/{ticketId} — public: look up status by ticket code only
    [HttpGet("track/{ticketId}")]
    public async Task<ActionResult<GrievanceTrackResponseDto>> Track(string ticketId)
    {
        var grievance = await _db.Grievances.FirstOrDefaultAsync(g => g.TicketId == ticketId);

        if (grievance is null)
        {
            return NotFound(new { message = "No grievance found for that ticket ID." });
        }

        return Ok(new GrievanceTrackResponseDto
        {
            TicketId = grievance.TicketId,
            Subject = grievance.Subject,
            Category = grievance.Category.ToString(),
            Status = grievance.Status.ToString(),
            ResolutionNotes = grievance.ResolutionNotes,
            CreatedAt = grievance.CreatedAt,
            UpdatedAt = grievance.UpdatedAt
        });
    }

    // GET /api/grievances — admin only: full list, optionally filtered by status
    [HttpGet]
    [Authorize]
    public async Task<ActionResult<IEnumerable<GrievanceAdminListItemDto>>> GetAll([FromQuery] string? status)
    {
        var query = _db.Grievances.AsQueryable();

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<GrievanceStatus>(status, true, out var parsedStatus))
        {
            query = query.Where(g => g.Status == parsedStatus);
        }

        var grievances = await query
            .OrderByDescending(g => g.CreatedAt)
            .Select(g => new GrievanceAdminListItemDto
            {
                Id = g.Id,
                TicketId = g.TicketId,
                FullName = g.FullName,
                Email = g.Email,
                Category = g.Category.ToString(),
                Subject = g.Subject,
                Description = g.Description,
                Status = g.Status.ToString(),
                ResolutionNotes = g.ResolutionNotes,
                CreatedAt = g.CreatedAt,
                UpdatedAt = g.UpdatedAt
            })
            .ToListAsync();

        return Ok(grievances);
    }

    // PUT /api/grievances/{id}/status — admin only: move a grievance through its workflow
    [HttpPut("{id:int}/status")]
    [Authorize]
    public async Task<IActionResult> UpdateStatus(int id, GrievanceStatusUpdateDto dto)
    {
        var grievance = await _db.Grievances.FindAsync(id);

        if (grievance is null)
        {
            return NotFound(new { message = "Grievance not found." });
        }

        grievance.Status = dto.Status;
        grievance.ResolutionNotes = dto.ResolutionNotes;
        grievance.UpdatedAt = DateTime.UtcNow;

        if (dto.Status == GrievanceStatus.Resolved || dto.Status == GrievanceStatus.Rejected)
        {
            grievance.ResolvedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        await _emailService.SendStatusUpdateEmailAsync(
            grievance.Email, grievance.FullName, grievance.TicketId, grievance.Subject,
            grievance.Status.ToString(), grievance.ResolutionNotes);

        return NoContent();
    }
}
