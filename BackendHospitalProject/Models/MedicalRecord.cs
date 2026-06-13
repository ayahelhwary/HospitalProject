namespace BackendHospitalProject.Models;

public class MedicalRecord
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public int? DoctorId { get; set; }
    public int? AppointmentId { get; set; }
    public string RecordType { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string FileUrl { get; set; } = string.Empty;
    public DateTime RecordDate { get; set; } = DateTime.UtcNow;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Extended fields (added columns)
    public string Diagnosis { get; set; } = string.Empty;
    public string Medications { get; set; } = string.Empty;
    public string LabResults { get; set; } = string.Empty;
    public string Radiology { get; set; } = string.Empty;
    public string Surgeries { get; set; } = string.Empty;
    public string Allergies { get; set; } = string.Empty;
    public string DoctorName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = "doctor";

    public Patient? Patient { get; set; }
    public Doctor? Doctor { get; set; }
    public Appointment? Appointment { get; set; }
}
