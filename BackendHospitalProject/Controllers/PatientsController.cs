using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BackendHospitalProject.Data;
using BackendHospitalProject.DTOs.Patient;

namespace BackendHospitalProject.Controllers;

[ApiController]
[Route("api/patients")]
[Authorize]
public class PatientsController(AppDbContext db) : ControllerBase
{
    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    // ─── Patient: own profile ─────────────────────────────────────────────────

    [HttpGet("me")]
    [Authorize(Roles = "patient")]
    public async Task<IActionResult> GetMe()
    {
        var patient = await db.Patients.FindAsync(GetUserId());
        if (patient is null) return NotFound();
        return Ok(ToDto(patient));
    }

    [HttpPut("me")]
    [Authorize(Roles = "patient")]
    public async Task<IActionResult> UpdateMe([FromBody] UpdatePatientDto dto)
    {
        var patient = await db.Patients.FindAsync(GetUserId());
        if (patient is null) return NotFound();

        if (dto.PhoneNumber != null) patient.PhoneNumber = dto.PhoneNumber;
        if (dto.Gender != null) patient.Gender = dto.Gender;
        if (dto.Address != null) patient.Address = dto.Address;
        if (dto.BloodType != null) patient.BloodType = dto.BloodType;
        if (dto.ProfileImageUrl != null) patient.ProfileImageUrl = dto.ProfileImageUrl;
        if (dto.DateOfBirth != null && DateTime.TryParse(dto.DateOfBirth, out var dob))
            patient.DateOfBirth = dob;

        await db.SaveChangesAsync();
        return Ok(ToDto(patient));
    }

    [HttpGet("me/records")]
    [Authorize(Roles = "patient")]
    public async Task<IActionResult> GetMyRecords()
    {
        var id = GetUserId();
        var records = await db.MedicalRecords
            .Where(m => m.PatientId == id)
            .OrderByDescending(m => m.RecordDate)
            .Select(m => new
            {
                m.Id,
                m.PatientId,
                m.DoctorId,
                visit_date = m.RecordDate.ToString("yyyy-MM-dd"),
                doctor_name = m.DoctorName,
                m.Department,
                m.Diagnosis,
                m.Medications,
                m.LabResults,
                m.Radiology,
                m.Surgeries,
                m.Allergies,
                notes = m.Description,
                m.CreatedBy,
                created_at = m.CreatedAt.ToString("o"),
            })
            .ToListAsync();

        return Ok(records);
    }

    // ─── Doctor: view patient info ────────────────────────────────────────────

    [HttpGet("{id:int}")]
    [Authorize(Roles = "doctor")]
    public async Task<IActionResult> GetPatientById(int id)
    {
        var patient = await db.Patients.FindAsync(id);
        if (patient is null) return NotFound();
        return Ok(ToDto(patient));
    }

    [HttpGet("{id:int}/records")]
    [Authorize(Roles = "doctor")]
    public async Task<IActionResult> GetPatientRecords(int id)
    {
        var patient = await db.Patients.FindAsync(id);
        if (patient is null) return NotFound();

        var records = await db.MedicalRecords
            .Where(m => m.PatientId == id)
            .OrderByDescending(m => m.RecordDate)
            .Select(m => new
            {
                m.Id,
                m.PatientId,
                m.DoctorId,
                visit_date = m.RecordDate.ToString("yyyy-MM-dd"),
                doctor_name = m.DoctorName,
                m.Department,
                m.Diagnosis,
                m.Medications,
                m.LabResults,
                m.Radiology,
                m.Surgeries,
                m.Allergies,
                notes = m.Description,
                m.CreatedBy,
                created_at = m.CreatedAt.ToString("o"),
            })
            .ToListAsync();

        return Ok(records);
    }

    [HttpPost("{patientId:int}/records")]
    [Authorize(Roles = "doctor")]
    public async Task<IActionResult> AddRecord(int patientId, [FromBody] BackendHospitalProject.DTOs.MedicalRecord.CreateMedicalRecordDto dto)
    {
        var patient = await db.Patients.FindAsync(patientId);
        if (patient is null) return NotFound();

        var doctorId = GetUserId();
        var doctor = await db.Doctors.FindAsync(doctorId);

        var record = new BackendHospitalProject.Models.MedicalRecord
        {
            PatientId = patientId,
            DoctorId = doctorId,
            RecordType = "Clinical",
            Title = dto.Diagnosis ?? string.Empty,
            Description = dto.Notes ?? string.Empty,
            FileUrl = string.Empty,
            RecordDate = DateTime.UtcNow,
            DoctorName = dto.DoctorName ?? (doctor is null ? string.Empty : $"{doctor.FirstName} {doctor.LastName}".Trim()),
            Department = dto.Department ?? (doctor?.Department ?? string.Empty),
            Diagnosis = dto.Diagnosis ?? string.Empty,
            Medications = dto.Medications ?? string.Empty,
            LabResults = dto.LabResults ?? string.Empty,
            Radiology = dto.Radiology ?? string.Empty,
            Surgeries = dto.Surgeries ?? string.Empty,
            Allergies = dto.Allergies ?? string.Empty,
            CreatedBy = "doctor"
        };

        db.MedicalRecords.Add(record);
        await db.SaveChangesAsync();
        return Ok(new { record.Id, message = "Record added successfully." });
    }

    // ─── Helper ───────────────────────────────────────────────────────────────

    private static PatientDto ToDto(BackendHospitalProject.Models.Patient p) => new()
    {
        Id = p.Id,
        FirstName = p.FirstName,
        LastName = p.LastName,
        Email = p.Email,
        PhoneNumber = p.PhoneNumber,
        DateOfBirth = p.DateOfBirth.ToString("yyyy-MM-dd"),
        Gender = p.Gender,
        Address = p.Address,
        BloodType = p.BloodType,
        ProfileImageUrl = p.ProfileImageUrl
    };
}
