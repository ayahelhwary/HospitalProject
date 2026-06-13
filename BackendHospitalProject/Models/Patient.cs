namespace BackendHospitalProject.Models;

public class Patient
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public DateTime DateOfBirth { get; set; }
    public string Gender { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string BloodType { get; set; } = string.Empty;
    public string ProfileImageUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Appointment> Appointments { get; set; } = [];
    public ICollection<MedicalRecord> MedicalRecords { get; set; } = [];
    public ICollection<QRAccessCode> QRAccessCodes { get; set; } = [];
}
