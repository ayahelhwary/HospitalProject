using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BackendHospitalProject.Data;
using BackendHospitalProject.DTOs.Appointment;
using BackendHospitalProject.Models;

namespace BackendHospitalProject.Controllers;

[ApiController]
[Route("api/appointments")]
[Authorize]
public class AppointmentsController(AppDbContext db) : ControllerBase
{
    private int GetUserId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
    private string GetRole() => User.FindFirstValue(ClaimTypes.Role) ?? "";

    private static AppointmentDto ToDto(Appointment a, Patient? p, Doctor? d) => new()
    {
        Id = a.Id,
        PatientId = a.PatientId,
        DoctorId = a.DoctorId,
        PatientName = p is null ? string.Empty : $"{p.FirstName} {p.LastName}".Trim(),
        PatientEmail = p?.Email ?? string.Empty,
        PatientPhone = p?.PhoneNumber ?? string.Empty,
        DoctorName = d is null ? string.Empty : $"{d.FirstName} {d.LastName}".Trim(),
        DoctorSpecialty = d?.Specialty ?? string.Empty,
        AppointmentDate = a.AppointmentDate.ToString("yyyy-MM-dd"),
        AppointmentTime = a.AppointmentTime.ToString(@"hh\:mm"),
        Department = a.Department,
        AppointmentType = a.AppointmentType,
        Status = a.Status,
        Reason = a.Notes,
        Notes = a.Notes,
        CreatedAt = a.CreatedAt.ToString("o")
    };

    [HttpPost]
    [Authorize(Roles = "patient")]
    public async Task<IActionResult> Create([FromBody] CreateAppointmentDto dto)
    {
        var patientId = GetUserId();
        var doctor = await db.Doctors.FindAsync(dto.DoctorId);
        if (doctor is null) return NotFound(new { message = "Doctor not found" });

        if (!TimeSpan.TryParse(dto.AppointmentTime, out var time))
            return BadRequest(new { message = "Invalid time format" });
        if (!DateTime.TryParse(dto.AppointmentDate, out var date))
            return BadRequest(new { message = "Invalid date format" });

        var apt = new Appointment
        {
            PatientId = patientId,
            DoctorId = dto.DoctorId,
            AppointmentDate = date,
            AppointmentTime = time,
            Department = dto.Department.Length > 0 ? dto.Department : doctor.Department,
            AppointmentType = dto.AppointmentType,
            Notes = dto.Reason.Length > 0 ? dto.Reason : dto.Notes,
            Status = "Pending"
        };
        db.Appointments.Add(apt);
        await db.SaveChangesAsync();

        var patient = await db.Patients.FindAsync(patientId);
        return Ok(ToDto(apt, patient, doctor));
    }

    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] string? status)
    {
        var userId = GetUserId();
        var role = GetRole();

        var query = db.Appointments
            .Include(a => a.Doctor).Include(a => a.Patient)
            .AsQueryable();

        if (role == "patient")
            query = query.Where(a => a.PatientId == userId);
        else if (role == "doctor")
            query = query.Where(a => a.DoctorId == userId);

        if (!string.IsNullOrEmpty(status))
            query = query.Where(a => a.Status.ToLower() == status.ToLower());

        var apts = await query.OrderByDescending(a => a.AppointmentDate).ToListAsync();
        return Ok(apts.Select(a => ToDto(a, a.Patient, a.Doctor)));
    }

    [HttpGet("patient")]
    [Authorize(Roles = "patient")]
    public async Task<IActionResult> GetPatientAppointments()
    {
        var id = GetUserId();
        var apts = await db.Appointments
            .Include(a => a.Doctor).Include(a => a.Patient)
            .Where(a => a.PatientId == id)
            .OrderByDescending(a => a.AppointmentDate).ToListAsync();
        return Ok(apts.Select(a => ToDto(a, a.Patient, a.Doctor)));
    }

    [HttpGet("doctor")]
    [Authorize(Roles = "doctor")]
    public async Task<IActionResult> GetDoctorAppointments([FromQuery] string? status)
    {
        var id = GetUserId();
        var query = db.Appointments.Include(a => a.Doctor).Include(a => a.Patient)
            .Where(a => a.DoctorId == id);
        if (!string.IsNullOrEmpty(status))
            query = query.Where(a => a.Status.ToLower() == status.ToLower());
        var apts = await query.OrderByDescending(a => a.AppointmentDate).ToListAsync();
        return Ok(apts.Select(a => ToDto(a, a.Patient, a.Doctor)));
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var userId = GetUserId();
        var role = GetRole();
        var apt = await db.Appointments
            .Include(a => a.Patient).Include(a => a.Doctor)
            .FirstOrDefaultAsync(a => a.Id == id);
        if (apt is null) return NotFound();
        if (role == "patient" && apt.PatientId != userId) return Forbid();
        if (role == "doctor" && apt.DoctorId != userId) return Forbid();
        return Ok(ToDto(apt, apt.Patient, apt.Doctor));
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var userId = GetUserId();
        var role = GetRole();
        var apt = await db.Appointments.FindAsync(id);
        if (apt is null) return NotFound();
        if (role == "patient" && apt.PatientId != userId) return Forbid();
        if (role == "doctor" && apt.DoctorId != userId) return Forbid();
        db.Appointments.Remove(apt);
        await db.SaveChangesAsync();
        return Ok(new { message = "Appointment deleted successfully" });
    }

    [HttpPatch("{id:int}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateAppointmentStatusDto dto)
    {
        var userId = GetUserId();
        var role = GetRole();
        var apt = await db.Appointments.FindAsync(id);
        if (apt is null) return NotFound();
        if (role == "patient" && apt.PatientId != userId) return Forbid();
        if (role == "doctor" && apt.DoctorId != userId) return Forbid();
        apt.Status = dto.Status;
        await db.SaveChangesAsync();
        return Ok(new { message = "Status updated successfully", status = apt.Status });
    }
}
