using BackendHospitalProject.Models;

namespace BackendHospitalProject.Data;

public static class DbSeeder
{
    public static void Seed(AppDbContext db)
    {
        if (db.Doctors.Any() || db.Patients.Any())
            return;

        var departments = new[]
        {
            new Department { Name = "Heart & Vascular", Description = "Cardiology and vascular care", Category = "Specialty", IconName = "heart" },
            new Department { Name = "Neuroscience", Description = "Neurology and brain health", Category = "Specialty", IconName = "brain" },
            new Department { Name = "Children's Health", Description = "Pediatric care", Category = "Specialty", IconName = "baby" },
        };
        db.Departments.AddRange(departments);

        var doctors = new[]
        {
            new Doctor
            {
                FirstName = "Sarah", LastName = "Johnson",
                Email = "doctor1@hospital.com",
                PasswordHash = "$2a$10$hPtUqb3Ror0pgZUpe/YYcurl3CYNR.jY1GVLdxzHtL9RCwMDcHxG.",
                PhoneNumber = "+1-555-0101",
                Specialty = "Cardiology", Department = "Heart & Vascular",
                Bio = "Board-certified cardiologist with 12 years of experience specializing in interventional cardiology and heart failure management.",
                ExperienceYears = 12, Rating = 4.8, ReviewCount = 42,
                IsAvailableToday = true,
            },
            new Doctor
            {
                FirstName = "Ahmed", LastName = "Hassan",
                Email = "doctor2@hospital.com",
                PasswordHash = "$2a$10$olYNQpw/K40of2ptujfKE.zZaLt87Lhnw8QqEB6.SQCcs9jsQMsl6",
                PhoneNumber = "+1-555-0102",
                Specialty = "Neurology", Department = "Neuroscience",
                Bio = "Specialist in neurological disorders including stroke, epilepsy, and multiple sclerosis with 8 years of clinical practice.",
                ExperienceYears = 8, Rating = 4.6, ReviewCount = 31,
                IsAvailableToday = true,
            },
            new Doctor
            {
                FirstName = "Emily", LastName = "Chen",
                Email = "doctor3@hospital.com",
                PasswordHash = "$2a$10$KTxRflqOXwgeufhRyiX8gu5Nez6lS9Ll0LuTdy4AgQG1rt0F5Q9fy",
                PhoneNumber = "+1-555-0103",
                Specialty = "Pediatrics", Department = "Children's Health",
                Bio = "Dedicated pediatrician focused on child development, preventive care, and managing chronic childhood conditions.",
                ExperienceYears = 6, Rating = 4.9, ReviewCount = 55,
                IsAvailableToday = true,
            },
        };
        db.Doctors.AddRange(doctors);

        var patients = new[]
        {
            new Patient
            {
                FirstName = "Mohammed", LastName = "Al-Rashid",
                Email = "patient1@example.com",
                PasswordHash = "$2a$10$yZVPXW/hUp0a/euNnaRGaOWg8F7XQCiYFR.re9jeNphL4njkAgeou",
                PhoneNumber = "+1-555-0201",
                DateOfBirth = new DateTime(1990, 5, 15),
                BloodType = "O+", Gender = "Male",
                Address = "123 Elm Street, Springfield, IL 62701",
            },
            new Patient
            {
                FirstName = "Layla", LastName = "Mostafa",
                Email = "patient2@example.com",
                PasswordHash = "$2a$10$6HCMAOv5Q9cbdNjDZyQfjuGIxNuJmXuR0/V9SqDIhKYCozWQXNRWK",
                PhoneNumber = "+1-555-0203",
                DateOfBirth = new DateTime(1985, 11, 30),
                BloodType = "A-", Gender = "Female",
                Address = "456 Oak Avenue, Chicago, IL 60601",
            },
        };
        db.Patients.AddRange(patients);

        db.SaveChanges();

        foreach (var doctor in doctors)
        {
            for (var day = 1; day <= 4; day++)
            {
                db.DoctorSchedules.Add(new DoctorSchedule
                {
                    DoctorId = doctor.Id,
                    DayOfWeek = day,
                    StartTime = "09:00:00",
                    EndTime = "17:00:00",
                    SlotDurationMinutes = 30,
                    IsActive = true,
                });
            }
        }

        db.SaveChanges();
    }
}
