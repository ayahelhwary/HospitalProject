using Microsoft.EntityFrameworkCore;
using BackendHospitalProject.Models;

namespace BackendHospitalProject.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<Patient> Patients => Set<Patient>();
    public DbSet<Doctor> Doctors => Set<Doctor>();
    public DbSet<Department> Departments => Set<Department>();
    public DbSet<Appointment> Appointments => Set<Appointment>();
    public DbSet<DoctorSchedule> DoctorSchedules => Set<DoctorSchedule>();
    public DbSet<MedicalRecord> MedicalRecords => Set<MedicalRecord>();
    public DbSet<QRAccessCode> QRAccessCodes => Set<QRAccessCode>();
    public DbSet<EyeAnalysis> EyeAnalyses => Set<EyeAnalysis>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<Patient>(e => e.HasIndex(p => p.Email).IsUnique());

        modelBuilder.Entity<Doctor>(e =>
        {
            e.HasIndex(d => d.Email).IsUnique();
            e.HasMany(d => d.Appointments)
             .WithOne(a => a.Doctor)
             .HasForeignKey(a => a.DoctorId)
             .OnDelete(DeleteBehavior.Restrict);
            e.HasMany(d => d.Schedules)
             .WithOne(s => s.Doctor)
             .HasForeignKey(s => s.DoctorId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Appointment>(e =>
        {
            e.HasOne(a => a.Patient)
             .WithMany(p => p.Appointments)
             .HasForeignKey(a => a.PatientId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<MedicalRecord>(e =>
        {
            e.HasOne(m => m.Patient)
             .WithMany(p => p.MedicalRecords)
             .HasForeignKey(m => m.PatientId)
             .OnDelete(DeleteBehavior.Cascade);
            e.HasOne(m => m.Doctor)
             .WithMany()
             .HasForeignKey(m => m.DoctorId)
             .OnDelete(DeleteBehavior.SetNull);
            e.HasOne(m => m.Appointment)
             .WithMany()
             .HasForeignKey(m => m.AppointmentId)
             .OnDelete(DeleteBehavior.SetNull);
        });

        modelBuilder.Entity<EyeAnalysis>(e =>
        {
            e.HasOne(a => a.Patient)
             .WithMany()
             .HasForeignKey(a => a.PatientId)
             .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<QRAccessCode>(e =>
        {
            e.HasIndex(q => q.Code).IsUnique();
            e.HasOne(q => q.Patient)
             .WithMany(p => p.QRAccessCodes)
             .HasForeignKey(q => q.PatientId)
             .OnDelete(DeleteBehavior.Cascade);
        });
    }
}
