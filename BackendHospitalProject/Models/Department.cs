namespace BackendHospitalProject.Models;

public class Department
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public string IconName { get; set; } = string.Empty;
    public bool IsEmergency { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
