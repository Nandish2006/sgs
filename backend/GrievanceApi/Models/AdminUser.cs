using System.ComponentModel.DataAnnotations;

namespace GrievanceApi.Models;

public class AdminUser
{
    public int Id { get; set; }

    [Required, MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;
}
