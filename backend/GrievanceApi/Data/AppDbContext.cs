using GrievanceApi.Models;
using Microsoft.EntityFrameworkCore;

namespace GrievanceApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Grievance> Grievances => Set<Grievance>();
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Grievance>()
            .HasIndex(g => g.TicketId)
            .IsUnique();

        modelBuilder.Entity<AdminUser>()
            .HasIndex(a => a.Username)
            .IsUnique();

        // Default seeded admin: username "admin", password "Admin@123"
        // Change this password after first login in a real deployment.
        modelBuilder.Entity<AdminUser>().HasData(new AdminUser
        {
            Id = 1,
            Username = "admin",
            PasswordHash = "$2b$11$OzqJy6MJTgvLI5w/Yu2xNOcPRupm5U6OCY/AZtHpEWkTQQViWwKGC" // Admin@123
        });
    }
}
