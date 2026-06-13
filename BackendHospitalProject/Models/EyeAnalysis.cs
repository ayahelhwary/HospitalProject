namespace BackendHospitalProject.Models;

public class EyeAnalysis
{
    public int Id { get; set; }
    public int PatientId { get; set; }
    public string DiagnosisTitle { get; set; } = string.Empty;
    public double Confidence { get; set; }
    public string Severity { get; set; } = string.Empty;
    public string Recommendation { get; set; } = string.Empty;
    public string Details { get; set; } = string.Empty;
    public string ImageUrl { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Patient? Patient { get; set; }
}
