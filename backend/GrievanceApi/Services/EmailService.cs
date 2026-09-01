using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace GrievanceApi.Services;

public interface IEmailService
{
    Task SendGrievanceSubmittedEmailAsync(string toEmail, string fullName, string ticketId, string subject);
    Task SendStatusUpdateEmailAsync(string toEmail, string fullName, string ticketId, string subject, string status, string? resolutionNotes);
}

// If SMTP isn't configured or sending fails, this logs a warning instead of throwing —
// a grievance submission should never be lost just because an email couldn't go out.
public class EmailService : IEmailService
{
    private readonly IConfiguration _config;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration config, ILogger<EmailService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public Task SendGrievanceSubmittedEmailAsync(string toEmail, string fullName, string ticketId, string subject)
    {
        var body = $@"
            <p>Hi {fullName},</p>
            <p>Your grievance has been filed and is now in the queue for review.</p>
            <p>
                <strong>Ticket ID:</strong> {ticketId}<br/>
                <strong>Subject:</strong> {subject}
            </p>
            <p>Keep this ticket ID — you'll need it to check your case status. You can track it any time from the Track Status page.</p>
            <p style=""color:#4B5D59;font-size:13px;"">This is an automated message from The Docket. Please don't reply to this email.</p>
        ";

        return SendAsync(toEmail, $"Grievance filed — {ticketId}", body);
    }

    public Task SendStatusUpdateEmailAsync(string toEmail, string fullName, string ticketId, string subject, string status, string? resolutionNotes)
    {
        var notesBlock = string.IsNullOrWhiteSpace(resolutionNotes)
            ? ""
            : $"<p><strong>Note from the reviewing office:</strong><br/>{resolutionNotes}</p>";

        var body = $@"
            <p>Hi {fullName},</p>
            <p>There's an update on your grievance <strong>{ticketId}</strong> — {subject}.</p>
            <p><strong>Current status:</strong> {status}</p>
            {notesBlock}
            <p>You can view full details any time from the Track Status page using your ticket ID.</p>
            <p style=""color:#4B5D59;font-size:13px;"">This is an automated message from The Docket. Please don't reply to this email.</p>
        ";

        return SendAsync(toEmail, $"Update on {ticketId}: {status}", body);
    }

    private async Task SendAsync(string toEmail, string subject, string htmlBody)
    {
        var smtp = _config.GetSection("Smtp");
        var host = smtp["Host"];
        var username = smtp["Username"];

        if (string.IsNullOrWhiteSpace(host) || string.IsNullOrWhiteSpace(username))
        {
            _logger.LogWarning("Smtp is not configured — skipping email to {ToEmail}", toEmail);
            return;
        }

        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(smtp["FromName"] ?? "Grievance System", username));
            message.To.Add(MailboxAddress.Parse(toEmail));
            message.Subject = subject;
            message.Body = new BodyBuilder { HtmlBody = htmlBody }.ToMessageBody();

            using var client = new SmtpClient();
            await client.ConnectAsync(host, int.Parse(smtp["Port"] ?? "587"), SecureSocketOptions.StartTls);
            await client.AuthenticateAsync(username, smtp["Password"]);
            await client.SendAsync(message);
            await client.DisconnectAsync(true);
        }
        catch (Exception ex)
        {
            // Never let an email failure break the grievance flow itself.
            _logger.LogWarning(ex, "Failed to send email to {ToEmail}", toEmail);
        }
    }
}
