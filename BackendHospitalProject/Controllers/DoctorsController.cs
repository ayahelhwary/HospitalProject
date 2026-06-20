using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using BackendHospitalProject.Data;
using BackendHospitalProject.DTOs;
using BackendHospitalProject.DTOs.Doctor;

namespace BackendHospitalProject.Controllers;

[ApiController]
[Route("api/doctors")]
public class DoctorsController(AppDbContext db) : ControllerBase
{
    private int GetDoctorId() => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    private static DoctorDto ToDto(Models.Doctor d, bool availableToday = false, string category = "") => new()
    {
        Id = d.Id,
        FullName = $"{d.FirstName} {d.LastName}".Trim(),
        Specialty = d.Specialty,
        Category = category,
        Phone = d.PhoneNumber,
        Bio = d.Bio,
        AvatarUrl = d.ProfileImageUrl,
        LicenseNumber = string.Empty,
        YearsExperience = d.ExperienceYears,
        ConsultationFee = d.Rating * 10,
        Available = availableToday,
        Rating = d.Rating,
        ReviewCount = d.ReviewCount,
        Location = d.Location,
        Qualifications = d.Qualifications,
        AcceptsVideoConsult = d.AcceptsVideoConsult,
        AcceptsInPerson = d.AcceptsInPerson
    };

    // ─── Public endpoints ─────────────────────────────────────────────────────

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] string? specialty,
        [FromQuery] string? category,
        [FromQuery] string? search,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        if (page < 1) page = 1;
        if (pageSize < 1 || pageSize > 100) pageSize = 10;
        
        var query = db.Doctors.AsQueryable();
        if (!string.IsNullOrEmpty(specialty))
            query = query.Where(d => d.Specialty.ToLower().Contains(specialty.ToLower()));
        if (!string.IsNullOrEmpty(category))
        {
            var deptNames = await db.Departments
                .Where(d => d.Category.ToLower() == category.ToLower())
                .Select(d => d.Name.ToLower())
                .ToListAsync();
            query = query.Where(d => deptNames.Contains(d.Department.ToLower()));
        }
        if (!string.IsNullOrEmpty(search))
            query = query.Where(d =>
                d.FirstName.ToLower().Contains(search.ToLower()) ||
                d.LastName.ToLower().Contains(search.ToLower()) ||
                d.Specialty.ToLower().Contains(search.ToLower()));

        var totalCount = await query.CountAsync();

        var doctors = await query
            .OrderBy(d => d.FirstName)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var todayDow = (int)DateTime.Today.DayOfWeek;
        var availableIds = await db.DoctorSchedules
            .Where(s => s.DayOfWeek == todayDow && s.IsActive)
            .Select(s => s.DoctorId)
            .Distinct()
            .ToListAsync();
        var deptCategories = await db.Departments
            .ToDictionaryAsync(dep => dep.Name.ToLower(), dep => dep.Category);

        var result = new PagedResult<DoctorDto>
        {
            Items = doctors.Select(d => ToDto(d, availableIds.Contains(d.Id),
                deptCategories.TryGetValue(d.Department?.ToLower() ?? "", out var cat) ? cat : "")).ToList(),
            Page = page,
            PageSize = pageSize,
            TotalCount = totalCount
        };

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var d = await db.Doctors.FindAsync(id);
        if (d is null) return NotFound(new { message = "Doctor not found" });
        var todayDow = (int)DateTime.Today.DayOfWeek;
        var isAvailable = await db.DoctorSchedules
            .AnyAsync(s => s.DoctorId == id && s.DayOfWeek == todayDow && s.IsActive);
        var dept = await db.Departments.FirstOrDefaultAsync(dep => dep.Name.ToLower() == d.Department.ToLower());
        return Ok(ToDto(d, isAvailable, dept?.Category ?? ""));
    }

    [HttpGet("{id:int}/available-slots")]
    public async Task<IActionResult> GetAvailableSlots(int id, [FromQuery] string? date)
    {
        var doctor = await db.Doctors.FindAsync(id);
        if (doctor is null) return NotFound(new { message = "Doctor not found" });

        if (!DateTime.TryParse(date ?? DateTime.Today.ToString("yyyy-MM-dd"), out var targetDate))
            return BadRequest(new { message = "Invalid date format" });

        var dow = (int)targetDate.DayOfWeek;
        var schedule = await db.DoctorSchedules
            .FirstOrDefaultAsync(s => s.DoctorId == id && s.DayOfWeek == dow && s.IsActive);

        if (schedule is null)
            return Ok(Array.Empty<string>());

        if (!TimeSpan.TryParse(schedule.StartTime, out var startTime) ||
            !TimeSpan.TryParse(schedule.EndTime, out var endTime))
            return Ok(Array.Empty<string>());

        var bookedTimes = await db.Appointments
            .Where(a => a.DoctorId == id
                     && a.AppointmentDate.Date == targetDate.Date
                     && a.Status.ToLower() != "cancelled")
            .Select(a => a.AppointmentTime)
            .ToListAsync();

        var slots = new List<TimeSpan>();
        var current = startTime;
        while (current + TimeSpan.FromMinutes(schedule.SlotDurationMinutes) <= endTime)
        {
            if (!bookedTimes.Contains(current))
                slots.Add(current);
            current = current.Add(TimeSpan.FromMinutes(schedule.SlotDurationMinutes));
        }

        return Ok(slots.OrderBy(s => s).Select(s => $"{s.Hours:D2}:{s.Minutes:D2}"));
    }

    // ─── Authenticated doctor endpoints (/me) ─────────────────────────────────

    [HttpGet("me")]
    [Authorize(Roles = "doctor")]
    public async Task<IActionResult> GetMe()
    {
        var id = GetDoctorId();
        var doctor = await db.Doctors.FindAsync(id);
        if (doctor is null) return NotFound(new { message = "Doctor not found" });
        var deptMe = await db.Departments.FirstOrDefaultAsync(dep => dep.Name.ToLower() == doctor.Department.ToLower());
        return Ok(ToDto(doctor, category: deptMe?.Category ?? ""));
    }

    [HttpPut("me")]
    [Authorize(Roles = "doctor")]
    public async Task<IActionResult> UpdateMe([FromBody] UpdateDoctorDto dto)
    {
        var id = GetDoctorId();
        var doctor = await db.Doctors.FindAsync(id);
        if (doctor is null) return NotFound();

        if (dto.Phone != null) doctor.PhoneNumber = dto.Phone;
        if (dto.Specialty != null) doctor.Specialty = dto.Specialty;
        if (dto.Department != null) doctor.Department = dto.Department;
        if (dto.Qualifications != null) doctor.Qualifications = dto.Qualifications;
        if (dto.Bio != null) doctor.Bio = dto.Bio;
        if (dto.Location != null) doctor.Location = dto.Location;
        if (dto.AvatarUrl != null) doctor.ProfileImageUrl = dto.AvatarUrl;
        if (dto.Available.HasValue) doctor.IsAvailableToday = dto.Available.Value;
        if (dto.AcceptsVideoConsult.HasValue) doctor.AcceptsVideoConsult = dto.AcceptsVideoConsult.Value;
        if (dto.AcceptsInPerson.HasValue) doctor.AcceptsInPerson = dto.AcceptsInPerson.Value;

        await db.SaveChangesAsync();
        var deptUpdated = await db.Departments.FirstOrDefaultAsync(dep => dep.Name.ToLower() == doctor.Department.ToLower());
        return Ok(ToDto(doctor, category: deptUpdated?.Category ?? ""));
    }

    // ─── Availability endpoints (/me/availability) ────────────────────────────

    private static DoctorAvailabilityDto ToAvailabilityDto(Models.DoctorSchedule s) => new()
    {
        Id = s.Id,
        DayOfWeek = s.DayOfWeek,
        StartTime = s.StartTime[..5],   // "09:00:00" → "09:00"
        EndTime = s.EndTime[..5],
        SlotDurationMinutes = s.SlotDurationMinutes,
        IsActive = s.IsActive
    };

    [HttpGet("me/availability")]
    [Authorize(Roles = "doctor")]
    public async Task<IActionResult> GetMyAvailability()
    {
        var id = GetDoctorId();
        var slots = await db.DoctorSchedules
            .Where(s => s.DoctorId == id)
            .OrderBy(s => s.DayOfWeek)
            .ToListAsync();
        return Ok(slots.Select(ToAvailabilityDto));
    }

    [HttpPost("me/availability")]
    [Authorize(Roles = "doctor")]
    public async Task<IActionResult> AddAvailability([FromBody] CreateAvailabilityDto dto)
    {
        if (dto.DayOfWeek < 0 || dto.DayOfWeek > 6)
            return BadRequest(new { message = "Invalid day (0=Sun ... 6=Sat)" });
        if (dto.DayOfWeek == 5 || dto.DayOfWeek == 6)
            return BadRequest(new { message = "Cannot add availability on Friday or Saturday" });
        if (!TimeSpan.TryParse(dto.StartTime, out var start) ||
            !TimeSpan.TryParse(dto.EndTime, out var end))
            return BadRequest(new { message = "Invalid time format" });
        if (end <= start)
            return BadRequest(new { message = "End time must be after start time" });

        var slot = new Models.DoctorSchedule
        {
            DoctorId = GetDoctorId(),
            DayOfWeek = dto.DayOfWeek,
            StartTime = dto.StartTime,
            EndTime = dto.EndTime,
            SlotDurationMinutes = dto.SlotDurationMinutes,
            IsActive = dto.IsActive
        };
        db.DoctorSchedules.Add(slot);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetMyAvailability), ToAvailabilityDto(slot));
    }

    [HttpPut("me/availability/{avId:int}")]
    [Authorize(Roles = "doctor")]
    public async Task<IActionResult> UpdateAvailability(int avId, [FromBody] CreateAvailabilityDto dto)
    {
        var id = GetDoctorId();
        var slot = await db.DoctorSchedules.FindAsync(avId);
        if (slot is null || slot.DoctorId != id) return NotFound();

        if (dto.DayOfWeek == 5 || dto.DayOfWeek == 6)
            return BadRequest(new { message = "Cannot add availability on Friday or Saturday" });
        if (dto.DayOfWeek >= 0 && dto.DayOfWeek <= 6) slot.DayOfWeek = dto.DayOfWeek;
        if (!string.IsNullOrEmpty(dto.StartTime)) slot.StartTime = dto.StartTime;
        if (!string.IsNullOrEmpty(dto.EndTime)) slot.EndTime = dto.EndTime;
        slot.SlotDurationMinutes = dto.SlotDurationMinutes;
        slot.IsActive = dto.IsActive;

        await db.SaveChangesAsync();
        return Ok(ToAvailabilityDto(slot));
    }

    [HttpDelete("me/availability/{avId:int}")]
    [Authorize(Roles = "doctor")]
    public async Task<IActionResult> DeleteAvailability(int avId)
    {
        var id = GetDoctorId();
        var slot = await db.DoctorSchedules.FindAsync(avId);
        if (slot is null || slot.DoctorId != id) return NotFound();

        db.DoctorSchedules.Remove(slot);
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("me/photo")]
    [Authorize(Roles = "doctor")]
    public async Task<IActionResult> UploadPhoto(IFormFile file)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded" });

        var allowedTypes = new[] { "image/jpeg", "image/png", "image/webp" };
        if (!allowedTypes.Contains(file.ContentType))
            return BadRequest(new { message = "Only JPEG, PNG, or WEBP images are allowed" });

        if (file.Length > 5 * 1024 * 1024) // 5MB
            return BadRequest(new { message = "File too large (max 5MB)" });

        var doctorId = GetDoctorId();
        var doctor = await db.Doctors.FindAsync(doctorId);
        if (doctor is null) return NotFound();

        var ext = Path.GetExtension(file.FileName);
        var fileName = $"doctor_{doctorId}_{Guid.NewGuid()}{ext}";
        var folderPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "uploads", "doctors");
        Directory.CreateDirectory(folderPath);
        var filePath = Path.Combine(folderPath, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }
        
        doctor.ProfileImageUrl = $"/uploads/doctors/{fileName}";
        await db.SaveChangesAsync();
        
        return Ok(new { profile_image_url = doctor.ProfileImageUrl });
    }

}
