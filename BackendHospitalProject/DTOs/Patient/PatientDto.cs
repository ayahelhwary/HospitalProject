namespace BackendHospitalProject.DTOs.Patient;

public class PatientDto
{
    public int Id { get; set; }
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string FullName => $"{FirstName} {LastName}".Trim();
    public string Email { get; set; } = string.Empty;
    public string PhoneNumber { get; set; } = string.Empty;
    public string DateOfBirth { get; set; } = string.Empty;
    public string Gender { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string BloodType { get; set; } = string.Empty;
    public string ProfileImageUrl { get; set; } = string.Empty;
}
