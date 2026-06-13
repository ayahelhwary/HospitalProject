namespace BackendHospitalProject.Models;

public class QRAccessCode
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public string Code { get; set; } = string.Empty;
    public DateTime ExpiresAt { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Patient? Patient { get; set; }
}
