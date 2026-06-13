using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BackendHospitalProject.Data;
using BackendHospitalProject.DTOs.MedicalRecord;
using BackendHospitalProject.DTOs.QRCode;
using BackendHospitalProject.Models;

namespace BackendHospitalProject.Controllers;

[ApiController]
[Route("api/qr-codes")]
[Authorize]
public class QRCodesController(AppDbContext db) : ControllerBase
{
    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpPost]
    [Authorize(Roles = "patient")]
    public async Task<IActionResult> Generate()
    {
        var patientId = GetUserId();
        var code = Guid.NewGuid().ToString("N");
        var qr = new QRAccessCode
        {
            PatientId = patientId,
            Code = code,
            ExpiresAt = DateTime.UtcNow.AddHours(24),
            IsActive = true
        };
        db.QRAccessCodes.Add(qr);
        await db.SaveChangesAsync();
        return Ok(new QRCodeDto { Id = qr.Id, Token = qr.Code, ExpiresAt = qr.ExpiresAt.ToString("o"), IsActive = true });
    }

    [HttpGet("{token}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetByToken(string token)
    {
        var qr = await db.QRAccessCodes
            .Include(q => q.Patient)
            .FirstOrDefaultAsync(q => q.Code == token && q.IsActive && q.ExpiresAt > DateTime.UtcNow);

        if (qr is null) return NotFound(new { message = "Invalid or expired QR code" });

        var p = qr.Patient!;
        var records = await db.MedicalRecords.Include(m => m.Doctor)
            .Where(m => m.PatientId == p.Id)
            .OrderByDescending(m => m.RecordDate).ToListAsync();

        return Ok(new
        {
            patient = new
            {
                id = p.Id,
                full_name = $"{p.FirstName} {p.LastName}".Trim(),
                email = p.Email,
                phone = p.PhoneNumber,
                blood_type = p.BloodType,
                date_of_birth = p.DateOfBirth.ToString("yyyy-MM-dd"),
                gender = p.Gender,
                address = p.Address
            },
            medical_records = records.Select(m => new MedicalRecordDto
            {
                Id = m.Id, PatientId = m.PatientId, DoctorId = m.DoctorId,
                VisitDate = m.RecordDate.ToString("yyyy-MM-dd"),
                DoctorName = m.DoctorName.Length > 0 ? m.DoctorName
                    : (m.Doctor is null ? string.Empty : $"{m.Doctor.FirstName} {m.Doctor.LastName}".Trim()),
                Department = m.Department,
                Diagnosis = m.Diagnosis.Length > 0 ? m.Diagnosis : m.Title,
                Medications = m.Medications, LabResults = m.LabResults,
                Radiology = m.Radiology, Surgeries = m.Surgeries,
                Allergies = m.Allergies, Notes = m.Description,
                CreatedBy = m.CreatedBy, CreatedAt = m.CreatedAt.ToString("o")
            }),
            appointments = (await db.Appointments.Include(a => a.Doctor)
                .Where(a => a.PatientId == p.Id)
                .OrderByDescending(a => a.AppointmentDate)
                .ToListAsync())
                .OrderByDescending(a => a.AppointmentDate)
                .ThenByDescending(a => a.AppointmentTime)
                .Select(a => new
                {
                    id = a.Id,
                    date = a.AppointmentDate.ToString("yyyy-MM-dd"),
                    time = a.AppointmentTime.ToString(),
                    department = a.Department,
                    type = a.AppointmentType,
                    status = a.Status,
                    notes = a.Notes,
                    doctor_name = a.Doctor is null ? string.Empty : $"{a.Doctor.FirstName} {a.Doctor.LastName}".Trim()
                }),
            eye_scans = (await db.EyeAnalyses
                .Where(e => e.PatientId == p.Id)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync())
                .Select(e => new
                {
                    id = e.Id,
                    diagnosis_title = e.DiagnosisTitle,
                    confidence = e.Confidence,
                    severity = e.Severity,
                    recommendation = e.Recommendation,
                    details = e.Details,
                    image_url = e.ImageUrl,
                    created_at = e.CreatedAt.ToString("o")
                }),
            appointments_timeline = await BuildTimeline(p.Id)
        });
    }

    private async Task<object> BuildTimeline(int patientId)
    {
        var appts = (await db.Appointments.Include(a => a.Doctor)
            .Where(a => a.PatientId == patientId)
            .ToListAsync())
            .OrderBy(a => a.AppointmentDate)
            .ThenBy(a => a.AppointmentTime)
            .ToList();

        var records = await db.MedicalRecords.Include(m => m.Doctor)
            .Where(m => m.PatientId == patientId)
            .ToListAsync();

        var scans = await db.EyeAnalyses
            .Where(e => e.PatientId == patientId)
            .OrderBy(e => e.CreatedAt)
            .ToListAsync();

        var usedRecordIds = new HashSet<int>();
        var timeline = new List<object>();

        foreach (var a in appts)
        {
            var recordsForAppt = records
               .Where(r => r.AppointmentId == a.Id)
               .ToList();

            foreach (var r in recordsForAppt)
                usedRecordIds.Add(r.Id);

            // Eye scans on the same day as the appointment
            var scansForAppt = scans.Where(e => e.CreatedAt.Date == a.AppointmentDate.Date).ToList();

            timeline.Add(new
            {
                appointment_id = a.Id,
                date = a.AppointmentDate.ToString("yyyy-MM-dd"),
                time = a.AppointmentTime.ToString(),
                department = a.Department,
                type = a.AppointmentType,
                status = a.Status,
                notes = a.Notes,
                doctor_name = a.Doctor is null ? string.Empty : $"{a.Doctor.FirstName} {a.Doctor.LastName}".Trim(),
                medical_records = recordsForAppt.OrderBy(r => r.RecordDate).Select(r => new
                {
                    id = r.Id,
                    diagnosis = r.Diagnosis.Length > 0 ? r.Diagnosis : r.Title,
                    medications = r.Medications,
                    lab_results = r.LabResults,
                    radiology = r.Radiology,
                    surgeries = r.Surgeries,
                    allergies = r.Allergies,
                    notes = r.Description,
                    created_at = r.CreatedAt.ToString("o")
                }),
                eye_scans = scansForAppt.Select(e => new
                {
                    id = e.Id,
                    diagnosis_title = e.DiagnosisTitle,
                    confidence = e.Confidence,
                    severity = e.Severity,
                    recommendation = e.Recommendation,
                    details = e.Details,
                    image_url = e.ImageUrl,
                    created_at = e.CreatedAt.ToString("o")
                })
            });
        }

        // Any leftover records/scans not tied to an appointment date (general history)
        var unassignedRecords = records.Where(r => r.AppointmentId == null && !usedRecordIds.Contains(r.Id))
            .OrderBy(r => r.RecordDate).Select(r => new
            {
                id = r.Id,
                diagnosis = r.Diagnosis.Length > 0 ? r.Diagnosis : r.Title,
                medications = r.Medications,
                lab_results = r.LabResults,
                radiology = r.Radiology,
                surgeries = r.Surgeries,
                allergies = r.Allergies,
                notes = r.Description,
                created_at = r.CreatedAt.ToString("o")
            });

        var assignedScanDates = new HashSet<DateTime>(appts.Select(a => a.AppointmentDate.Date));
        var unassignedScans = scans.Where(e => !assignedScanDates.Contains(e.CreatedAt.Date))
            .Select(e => new
            {
                id = e.Id,
                diagnosis_title = e.DiagnosisTitle,
                confidence = e.Confidence,
                severity = e.Severity,
                recommendation = e.Recommendation,
                details = e.Details,
                image_url = e.ImageUrl,
                created_at = e.CreatedAt.ToString("o")
            });

        return new
        {
            visits = timeline,
            unassigned_medical_records = unassignedRecords,
            unassigned_eye_scans = unassignedScans
        };
    }

    [HttpDelete("{token}/records/{recordId:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> DeleteRecord(string token, int recordId)
    {
        var qr = await db.QRAccessCodes
            .FirstOrDefaultAsync(q => q.Code == token && q.IsActive && q.ExpiresAt > DateTime.UtcNow);
        if (qr is null) return NotFound(new { message = "Invalid or expired QR code" });

        var record = await db.MedicalRecords.FindAsync(recordId);
        if (record is null) return NotFound(new { message = "Record not found" });
        if (record.PatientId != qr.PatientId) return StatusCode(403, new { message = "Access denied" });

        db.MedicalRecords.Remove(record);
        await db.SaveChangesAsync();
        return Ok(new { message = "Medical record deleted successfully" });
    }

    [HttpPut("{token}/records/{recordId:int}")]
    [AllowAnonymous]
    public async Task<IActionResult> UpdateRecord(string token, int recordId, [FromBody] CreateMedicalRecordDto dto)
    {
        var qr = await db.QRAccessCodes
            .FirstOrDefaultAsync(q => q.Code == token && q.IsActive && q.ExpiresAt > DateTime.UtcNow);
        if (qr is null) return NotFound(new { message = "Invalid or expired QR code" });

        var record = await db.MedicalRecords.FindAsync(recordId);
        if (record is null) return NotFound(new { message = "Record not found" });
        if (record.PatientId != qr.PatientId) return StatusCode(403, new { message = "Access denied" });

        if (dto.AppointmentId is not null) record.AppointmentId = dto.AppointmentId;
        if (dto.DoctorName is not null) record.DoctorName = dto.DoctorName;
        if (dto.Department is not null) record.Department = dto.Department;
        if (dto.Diagnosis is not null) { record.Diagnosis = dto.Diagnosis; record.Title = dto.Diagnosis; }
        if (dto.Medications is not null) record.Medications = dto.Medications;
        if (dto.LabResults is not null) record.LabResults = dto.LabResults;
        if (dto.Radiology is not null) record.Radiology = dto.Radiology;
        if (dto.Surgeries is not null) record.Surgeries = dto.Surgeries;
        if (dto.Allergies is not null) record.Allergies = dto.Allergies;
        if (dto.Notes is not null) record.Description = dto.Notes;

        await db.SaveChangesAsync();
        return Ok(new { message = "Medical record updated successfully" });
    }

    [HttpPost("{token}/records")]
    [AllowAnonymous]
    public async Task<IActionResult> AddRecord(string token, [FromBody] CreateMedicalRecordDto dto)
    {
        var qr = await db.QRAccessCodes.Include(q => q.Patient)
            .FirstOrDefaultAsync(q => q.Code == token && q.IsActive && q.ExpiresAt > DateTime.UtcNow);

        if (qr is null) return NotFound(new { message = "Invalid or expired QR code" });

        // Try to get doctor id from token if logged in
        int? doctorId = null;
        if (User.Identity?.IsAuthenticated == true)
        {
            var claim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (int.TryParse(claim, out var did)) doctorId = did;
        }
        var doctor = doctorId.HasValue ? await db.Doctors.FindAsync(doctorId.Value) : null;

        var record = new MedicalRecord
        {
            PatientId = qr.PatientId,
            DoctorId = doctorId,
            AppointmentId = dto.AppointmentId,
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
        return Ok(new { message = "Medical record added successfully", id = record.Id });
    }
}
