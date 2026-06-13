namespace BackendHospitalProject.Models;

public class Appointment
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public int DoctorId { get; set; }
    public DateTime AppointmentDate { get; set; }
    public TimeSpan AppointmentTime { get; set; }
    public string Department { get; set; } = string.Empty;
    public string AppointmentType { get; set; } = "In-Person";
    public string Status { get; set; } = "Pending";
    public string Notes { get; set; } = string.Empty;
    public string VideoCallLink { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Patient? Patient { get; set; }
    public Doctor? Doctor { get; set; }
}
