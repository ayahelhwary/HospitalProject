namespace BackendHospitalProject.Models;

public class DoctorAvailability
{
    public int Id { get; set; }
    public int DoctorId { get; set; }
    public DateTime Date { get; set; }
    public TimeSpan StartTime { get; set; }
    public TimeSpan EndTime { get; set; }
    public int SlotDurationMinutes { get; set; } = 30;
    public bool IsActive { get; set; } = true;

    public Doctor? Doctor { get; set; }
}
