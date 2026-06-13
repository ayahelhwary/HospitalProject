namespace BackendHospitalProject.DTOs.Auth;

public class RegisterRequest
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string? Role { get; set; }
    public string? Phone { get; set; }
    public string? BloodType { get; set; }
    public string? Specialty { get; set; }
    public string? Department { get; set; }
}
