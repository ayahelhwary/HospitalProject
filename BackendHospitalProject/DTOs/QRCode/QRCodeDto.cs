namespace BackendHospitalProject.DTOs.QRCode;

public class QRCodeDto
{
    public int Id { get; set; }
    public string Token { get; set; } = string.Empty;
    public string ExpiresAt { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}
