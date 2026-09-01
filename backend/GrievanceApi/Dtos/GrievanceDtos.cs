using System.ComponentModel.DataAnnotations;
using GrievanceApi.Models;

namespace GrievanceApi.Dtos;

public class GrievanceCreateDto
{
    [Required, MaxLength(100)]
    public string FullName { get; set; } = string.Empty;

    [Required, EmailAddress, MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public GrievanceCategory Category { get; set; }

    [Required, MaxLength(150)]
    public string Subject { get; set; } = string.Empty;

    [Required, MaxLength(2000)]
    public string Description { get; set; } = string.Empty;
}

public class GrievanceCreatedResponseDto
{
    public string TicketId { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class GrievanceTrackResponseDto
{
    public string TicketId { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? ResolutionNotes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class GrievanceAdminListItemDto
{
    public int Id { get; set; }
    public string TicketId { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? ResolutionNotes { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
}

public class GrievanceStatusUpdateDto
{
    [Required]
    public GrievanceStatus Status { get; set; }

    [MaxLength(2000)]
    public string? ResolutionNotes { get; set; }
}
