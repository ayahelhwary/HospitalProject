namespace BackendHospitalProject.Models;

public class DoctorSchedule
{
    public int Id { get; set; }
    public int DoctorId { get; set; }
    public int DayOfWeek { get; set; }  // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
    public string StartTime { get; set; } = "09:00:00";
    public string EndTime { get; set; } = "17:00:00";
    public int SlotDurationMinutes { get; set; } = 30;
    public bool IsActive { get; set; } = true;

    public Doctor? Doctor { get; set; }
}
