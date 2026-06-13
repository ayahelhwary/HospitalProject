namespace BackendHospitalProject.DTOs.Appointment;

public class CreateAppointmentDto
{
    public int DoctorId { get; set; }
    public string AppointmentDate { get; set; } = string.Empty;
    public string AppointmentTime { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string AppointmentType { get; set; } = "In-Person";
    public string Reason { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
}
