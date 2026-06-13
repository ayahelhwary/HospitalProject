namespace BackendHospitalProject.Models;

public class Doctor
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string Specialty { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Qualifications { get; set; } = string.Empty;
    public int ExperienceYears { get; set; }
    public double Rating { get; set; } = 0.0;
    public int ReviewCount { get; set; } = 0;
    public string ProfileImageUrl { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public bool IsAvailableToday { get; set; } = false;
    public bool AcceptsVideoConsult { get; set; } = true;
    public bool AcceptsInPerson { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public int? DepartmentId { get; set; }

    public ICollection<Appointment> Appointments { get; set; } = [];
    public ICollection<DoctorSchedule> Schedules { get; set; } = [];
}
