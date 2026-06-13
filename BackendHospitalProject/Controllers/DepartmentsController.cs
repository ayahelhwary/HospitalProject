using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BackendHospitalProject.Data;

namespace BackendHospitalProject.Controllers;

[ApiController]
[Route("api/departments")]
public class DepartmentsController(AppDbContext db) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var departments = await db.Departments
            .OrderBy(d => d.Id)
            .Select(d => new
            {
                d.Id,
                d.Name,
                d.Description,
                d.Category,
                d.IconName,
                d.IsEmergency,
            })
            .ToListAsync();

        return Ok(departments);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var dept = await db.Departments
            .Where(d => d.Id == id)
            .Select(d => new
            {
                d.Id,
                d.Name,
                d.Description,
                d.Category,
                d.IconName,
                d.IsEmergency,
            })
            .FirstOrDefaultAsync();

        if (dept is null) return NotFound();
        return Ok(dept);
    }

    [HttpGet("categories")]
    public async Task<IActionResult> GetCategories()
    {
        var categories = await db.Departments
            .Select(d => d.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();

        return Ok(categories);
    }
}
