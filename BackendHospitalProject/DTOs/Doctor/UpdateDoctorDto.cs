namespace BackendHospitalProject.DTOs.Doctor;

public class UpdateDoctorDto
{
    public string? Phone { get; set; }
    public string? Specialty { get; set; }
    public string? Department { get; set; }
    public string? Qualifications { get; set; }
    public string? Bio { get; set; }
    public string? Location { get; set; }
    public string? AvatarUrl { get; set; }
    public bool? Available { get; set; }
    public bool? AcceptsVideoConsult { get; set; }
    public bool? AcceptsInPerson { get; set; }
    public double? ConsultationFee { get; set; }
}
