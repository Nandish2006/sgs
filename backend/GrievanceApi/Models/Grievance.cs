using System.ComponentModel.DataAnnotations;

namespace GrievanceApi.Models;

public enum GrievanceStatus
{
    Pending = 0,
    InProgress = 1,
    Resolved = 2,
    Rejected = 3
}

public enum GrievanceCategory
{
    Academic = 0,
    Hostel = 1,
    Infrastructure = 2,
    Faculty = 3,
    Administration = 4,
    Other = 5
}

public class Grievance
{
    public int Id { get; set; }

    // Public-facing tracking code, e.g. GRV-2026-00042. Never expose the raw Id.
    [MaxLength(20)]
    public string TicketId { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required, MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    public GrievanceCategory Category { get; set; }

    [Required, MaxLength(150)]
    public string Subject { get; set; } = string.Empty;

    [Required, MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    public GrievanceStatus Status { get; set; } = GrievanceStatus.Pending;

    [MaxLength(2000)]
    public string? ResolutionNotes { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ResolvedAt { get; set; }
}
