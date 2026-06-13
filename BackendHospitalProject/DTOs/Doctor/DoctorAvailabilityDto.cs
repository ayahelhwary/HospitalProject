namespace BackendHospitalProject.DTOs.Doctor;

public class DoctorAvailabilityDto
{
    public int Id { get; set; }
    public int DayOfWeek { get; set; }      // 0=Sun, 1=Mon, ..., 6=Sat
    public string StartTime { get; set; } = string.Empty;  // "HH:mm"
    public string EndTime { get; set; } = string.Empty;    // "HH:mm"
    public int SlotDurationMinutes { get; set; }
    public bool IsActive { get; set; }
}

public class CreateAvailabilityDto
{
    public int DayOfWeek { get; set; }
    public string StartTime { get; set; } = string.Empty;  // "HH:mm"
    public string EndTime { get; set; } = string.Empty;    // "HH:mm"
    public int SlotDurationMinutes { get; set; } = 30;
    public bool IsActive { get; set; } = true;
}
