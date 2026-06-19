using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BackendHospitalProject.Data;
using BackendHospitalProject.DTOs;
using BackendHospitalProject.DTOs.MedicalRecord;
using BackendHospitalProject.Models;

namespace BackendHospitalProject.Controllers;

[ApiController]
[Route("api/medical-records")]
[Authorize]
public class MedicalRecordsController(AppDbContext db) : ControllerBase
{
    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private string GetRole() => User.FindFirstValue(ClaimTypes.Role) ?? "";

    private static MedicalRecordDto ToDto(MedicalRecord m) => new()
    {
        Id = m.Id, PatientId = m.PatientId, DoctorId = m.DoctorId,
        VisitDate = m.RecordDate.ToString("yyyy-MM-dd"),
        DoctorName = m.DoctorName.Length > 0 ? m.DoctorName
            : (m.Doctor is null ? string.Empty : $"{m.Doctor.FirstName} {m.Doctor.LastName}".Trim()),
        Department = m.Department,
        Diagnosis = m.Diagnosis.Length > 0 ? m.Diagnosis : m.Title,
        Medications = m.Medications,
        LabResults = m.LabResults,
        Radiology = m.Radiology,
        Surgeries = m.Surgeries,
        Allergies = m.Allergies,
        Notes = m.Description,
        CreatedBy = m.CreatedBy,
        CreatedAt = m.CreatedAt.ToString("o")
    };

    [HttpGet]
    public async Task<IActionResult> GetRecords(
        [FromQuery] int? patientId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 10;
        
        var id = GetUserId();
        var role = GetRole();
        
        IQueryable<MedicalRecord> query = db.MedicalRecords.Include(m => m.Doctor);
        
        if (role == "patient") query = query.Where(m => m.PatientId == id);
        else if (role == "doctor" && patientId.HasValue) query = query.Where(m => m.PatientId == patientId.Value && m.DoctorId == id);
        else if (role == "doctor") query = query.Where(m => m.DoctorId == id);
        
        var totalCount = await query.CountAsync();
        
        var records = await query
        .OrderByDescending(m => m.RecordDate)
        .Skip((page - 1) * pageSize)
        .Take(pageSize)
        .ToListAsync();
        
        var result = new PagedResult<MedicalRecordDto>
        {
            Items = records.Select(ToDto).ToList(),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };

         return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = GetUserId();
        var role = GetRole();

        var record = await db.MedicalRecords.Include(m => m.Doctor)
            .FirstOrDefaultAsync(m => m.Id == id);
        if (record is null) return NotFound();

        if (role == "patient" && record.PatientId != userId) return Forbid();
        if (role == "doctor" && record.DoctorId != userId) return Forbid();

        return Ok(ToDto(record));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "doctor")]
    public async Task<IActionResult> Delete(int id)
    {
        var doctorId = GetUserId();
        var record = await db.MedicalRecords.FindAsync(id);
        if (record is null) return NotFound();
        if (record.DoctorId != doctorId) return Forbid();

        db.MedicalRecords.Remove(record);
        await db.SaveChangesAsync();
        return Ok(new { message = "Medical record deleted successfully" });
    }

    [HttpPost]
    [Authorize(Roles = "doctor")]
    public async Task<IActionResult> Create([FromBody] CreateMedicalRecordDto dto)
    {
        var doctorId = GetUserId();
        var doctor = await db.Doctors.FindAsync(doctorId);

        var record = new MedicalRecord
        {
            PatientId = dto.PatientId,
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
        return Ok(ToDto(record));
    }
}
