namespace BackendHospitalProject.DTOs.MedicalRecord;

public class CreateMedicalRecordDto
{
    public int PatientId { get; set; }
    public int? AppointmentId { get; set; }
    public string? DoctorName { get; set; }
    public string? Department { get; set; }
    public string? Diagnosis { get; set; }
    public string? Medications { get; set; }
    public string? LabResults { get; set; }
    public string? Radiology { get; set; }
    public string? Surgeries { get; set; }
    public string? Allergies { get; set; }
    public string? Notes { get; set; }
}
