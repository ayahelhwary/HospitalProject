using Microsoft.EntityFrameworkCore;
using BackendHospitalProject.Data;
using BackendHospitalProject.DTOs.Auth;
using BackendHospitalProject.Models;

namespace BackendHospitalProject.Services;

public class AuthService(AppDbContext db, JwtService jwtService)
{
    public async Task<AuthResponse> RegisterAsync(RegisterRequest req)
    {
        var role = req.Role?.ToLower() == "doctor" ? "doctor" : "patient";

        var emailLower = req.Email.ToLower();
        var emailExists = await db.Doctors.AnyAsync(d => d.Email == emailLower)
                       || await db.Patients.AnyAsync(p => p.Email == emailLower);
        if (emailExists)
            throw new InvalidOperationException("Email is already in use");

        if (role == "doctor")
        {

            var parts = req.FullName.Split(' ', 2);
            var doctor = new Doctor
            {
                FirstName = parts[0],
                LastName = parts.Length > 1 ? parts[1] : string.Empty,
                Email = emailLower,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                PhoneNumber = req.Phone ?? string.Empty,
                Specialty = req.Specialty ?? "General",
                Department = req.Department ?? string.Empty,
                Qualifications = string.Empty,
                Bio = string.Empty,
                Location = string.Empty,
                ProfileImageUrl = string.Empty,
            };
            db.Doctors.Add(doctor);
            await db.SaveChangesAsync();

            var token = jwtService.GenerateToken(doctor.Id, doctor.Email, "doctor", $"{doctor.FirstName} {doctor.LastName}".Trim());
            return new AuthResponse { Token = token, Email = doctor.Email, Role = "doctor", UserId = doctor.Id, FullName = $"{doctor.FirstName} {doctor.LastName}".Trim() };
        }
        else
        {
            var parts = req.FullName.Split(' ', 2);
            var patient = new Patient
            {
                FirstName = parts[0],
                LastName = parts.Length > 1 ? parts[1] : string.Empty,
                Email = emailLower,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password),
                PhoneNumber = req.Phone ?? string.Empty,
                BloodType = req.BloodType ?? string.Empty,
                Gender = string.Empty,
                Address = string.Empty,
                ProfileImageUrl = string.Empty,
            };
            db.Patients.Add(patient);
            await db.SaveChangesAsync();

            var token = jwtService.GenerateToken(patient.Id, patient.Email, "patient", $"{patient.FirstName} {patient.LastName}".Trim());
            return new AuthResponse { Token = token, Email = patient.Email, Role = "patient", UserId = patient.Id, FullName = $"{patient.FirstName} {patient.LastName}".Trim() };
        }
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest req)
    {
        // Check doctors first
        var doctor = await db.Doctors.FirstOrDefaultAsync(d => d.Email == req.Email.ToLower());
        if (doctor != null)
        {
            if (!BCrypt.Net.BCrypt.Verify(req.Password, doctor.PasswordHash))
                throw new UnauthorizedAccessException("Invalid email or password");

            var token = jwtService.GenerateToken(doctor.Id, doctor.Email, "doctor", $"{doctor.FirstName} {doctor.LastName}".Trim());
            return new AuthResponse { Token = token, Email = doctor.Email, Role = "doctor", UserId = doctor.Id, FullName = $"{doctor.FirstName} {doctor.LastName}".Trim() };
        }

        // Check patients
        var patient = await db.Patients.FirstOrDefaultAsync(p => p.Email == req.Email.ToLower());
        if (patient != null)
        {
            if (!BCrypt.Net.BCrypt.Verify(req.Password, patient.PasswordHash))
                throw new UnauthorizedAccessException("Invalid email or password");

            var token = jwtService.GenerateToken(patient.Id, patient.Email, "patient", $"{patient.FirstName} {patient.LastName}".Trim());
            return new AuthResponse { Token = token, Email = patient.Email, Role = "patient", UserId = patient.Id, FullName = $"{patient.FirstName} {patient.LastName}".Trim() };
        }

        throw new UnauthorizedAccessException("Invalid email or password");
    }

    public async Task ChangePasswordAsync(int userId, string role, ChangePasswordRequest req)
    {
        if (role == "doctor")
        {
            var doctor = await db.Doctors.FindAsync(userId)
                ?? throw new KeyNotFoundException("Doctor not found");
            if (!BCrypt.Net.BCrypt.Verify(req.CurrentPassword, doctor.PasswordHash))
                throw new UnauthorizedAccessException("Current password is incorrect");
            doctor.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        }
        else
        {
            var patient = await db.Patients.FindAsync(userId)
                ?? throw new KeyNotFoundException("Patient not found");
            if (!BCrypt.Net.BCrypt.Verify(req.CurrentPassword, patient.PasswordHash))
                throw new UnauthorizedAccessException("Current password is incorrect");
            patient.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.NewPassword);
        }
        await db.SaveChangesAsync();
    }
}
