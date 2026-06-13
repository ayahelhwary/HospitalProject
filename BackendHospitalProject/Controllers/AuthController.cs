using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using BackendHospitalProject.DTOs.Auth;
using BackendHospitalProject.Services;

namespace BackendHospitalProject.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(AuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        try { return Ok(await authService.RegisterAsync(req)); }
        catch (InvalidOperationException ex) { return Conflict(new { message = ex.Message }); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        try { return Ok(await authService.LoginAsync(req)); }
        catch (UnauthorizedAccessException ex) { return Unauthorized(new { message = ex.Message }); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
    {
        var userId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var role = User.FindFirstValue(ClaimTypes.Role)!;
        try
        {
            await authService.ChangePasswordAsync(userId, role, req);
            return Ok(new { message = "Password changed successfully" });
        }
        catch (UnauthorizedAccessException ex) { return Unauthorized(new { message = ex.Message }); }
        catch (KeyNotFoundException ex) { return NotFound(new { message = ex.Message }); }
        catch (Exception ex) { return BadRequest(new { message = ex.Message }); }
    }
}
