using BackendHospitalProject.Data;
using BackendHospitalProject.DTOs.EyeAnalysis;
using BackendHospitalProject.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using System.Text.Json;

namespace BackendHospitalProject.Controllers
{
    public class UploadEyeImageRequest
    {
        public IFormFile Image { get; set; } = null!;
        public string EyeSide { get; set; } = "Right";
    }

    [ApiController]
    [Route("api/eye-analyses")]
    [Authorize(Roles = "patient")]
    public class EyeAnalysisController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly HttpClient _httpClient = new();

        public EyeAnalysisController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        private int GetCurrentUserId()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (string.IsNullOrEmpty(userIdStr))
                throw new UnauthorizedAccessException("Invalid token");
            return int.Parse(userIdStr);
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<EyeAnalysisDto>> UploadEyeImage([FromForm] UploadEyeImageRequest request)
        {
            var image = request.Image;

            if (image == null || image.Length == 0)
                return BadRequest(new { message = "No image file provided." });

            if (image.Length > 10 * 1024 * 1024)
                return BadRequest(new { message = "File size exceeds 10MB." });

            var allowedTypes = new[] { "image/jpeg", "image/jpg", "image/png", "image/gif" };
            if (!allowedTypes.Contains(image.ContentType.ToLower()))
                return BadRequest(new { message = "Invalid file type." });

            var patientId = GetCurrentUserId();

            // Save image
            var webRoot = _env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
            var uploadsFolder = Path.Combine(webRoot, "uploads", "eye-images");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(image.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
                await image.CopyToAsync(stream);

            // Call Python AI service
            string diagnosisTitle, severity, recommendation, details;
            double confidence;

            try
            {
                using var form = new MultipartFormDataContent();
                using var fileStream = System.IO.File.OpenRead(filePath);
                using var fileContent = new StreamContent(fileStream);
                fileContent.Headers.ContentType = new System.Net.Http.Headers.MediaTypeHeaderValue(image.ContentType);
                form.Add(fileContent, "image", fileName);

                var response = await _httpClient.PostAsync("http://localhost:8001/analyze", form);
                var json = await response.Content.ReadAsStringAsync();
                var result = JsonSerializer.Deserialize<JsonElement>(json);

                diagnosisTitle = result.GetProperty("diagnosis_title").GetString()!;
                confidence = result.GetProperty("confidence").GetDouble();
                severity = result.GetProperty("severity").GetString()!;
                recommendation = result.GetProperty("recommendation").GetString()!;
                details = result.GetProperty("details").GetString()!;
            }
            catch (Exception ex)
            {
                // Fallback if Python service is down
                diagnosisTitle = $"Error: {ex.Message}";
                confidence = 0;
                severity = "Unknown";
                recommendation = "Please try again later.";
                details = ex.InnerException?.Message ?? "No inner exception";
            }

            var analysis = new EyeAnalysis
            {
                PatientId = patientId,
                ImageUrl = $"/uploads/eye-images/{fileName}",
                DiagnosisTitle = diagnosisTitle,
                Confidence = confidence,
                Severity = severity,
                Recommendation = recommendation,
                Details = details,
                CreatedAt = DateTime.UtcNow
            };

            _context.EyeAnalyses.Add(analysis);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAnalysis), new { id = analysis.Id }, MapToDto(analysis));
        }

        [HttpGet("{id:int}")]
        public async Task<ActionResult<EyeAnalysisDto>> GetAnalysis(int id)
        {
            var patientId = GetCurrentUserId();
            var analysis = await _context.EyeAnalyses
                .FirstOrDefaultAsync(e => e.Id == id && e.PatientId == patientId);
            if (analysis == null) return NotFound();
            return Ok(MapToDto(analysis));
        }

        [HttpGet("my")]
        public async Task<ActionResult<List<EyeAnalysisDto>>> GetMyAnalyses()
        {
            var patientId = GetCurrentUserId();
            var analyses = await _context.EyeAnalyses
                .Where(e => e.PatientId == patientId)
                .OrderByDescending(e => e.CreatedAt)
                .ToListAsync();
            return Ok(analyses.Select(MapToDto));
        }

        private static EyeAnalysisDto MapToDto(EyeAnalysis a) => new()
        {
            Id = a.Id,
            PatientId = a.PatientId,
            ImageUrl = a.ImageUrl,
            DiagnosisTitle = a.DiagnosisTitle,
            Confidence = a.Confidence,
            Severity = a.Severity,
            Recommendation = a.Recommendation,
            Details = a.Details,
            CreatedAt = a.CreatedAt.ToString("yyyy-MM-dd HH:mm:ss")
        };
    }
}