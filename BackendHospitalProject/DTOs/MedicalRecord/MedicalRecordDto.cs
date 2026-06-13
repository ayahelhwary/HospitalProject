namespace BackendHospitalProject.DTOs.MedicalRecord;

public class MedicalRecordDto
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public int? DoctorId { get; set; }
    public string VisitDate { get; set; } = string.Empty;
    public string DoctorName { get; set; } = string.Empty;
    public string Department { get; set; } = string.Empty;
    public string Diagnosis { get; set; } = string.Empty;
    public string Medications { get; set; } = string.Empty;
    public string LabResults { get; set; } = string.Empty;
    public string Radiology { get; set; } = string.Empty;
    public string Surgeries { get; set; } = string.Empty;
    public string Allergies { get; set; } = string.Empty;
    public string Notes { get; set; } = string.Empty;
    public string CreatedBy { get; set; } = string.Empty;
    public string CreatedAt { get; set; } = string.Empty;
}
