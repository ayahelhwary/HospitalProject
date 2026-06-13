namespace BackendHospitalProject.DTOs.Doctor;

public class DoctorDto
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Specialty { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string Phone { get; set; } = string.Empty;
    public string Bio { get; set; } = string.Empty;
    public string AvatarUrl { get; set; } = string.Empty;
    public string LicenseNumber { get; set; } = string.Empty;
    public int YearsExperience { get; set; }
    public double ConsultationFee { get; set; }
    public bool Available { get; set; }
    public double Rating { get; set; }
    public int ReviewCount { get; set; }
    public string Location { get; set; } = string.Empty;
    public string Qualifications { get; set; } = string.Empty;
    public bool AcceptsVideoConsult { get; set; }
    public bool AcceptsInPerson { get; set; }
}
