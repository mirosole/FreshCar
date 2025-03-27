using System.Security.Claims;
using FreshCar.DTOs;
using FreshCar.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FreshCar.Controllers
{
    [Route("api/auth")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;
        private readonly GoogleAuthService _googleAuthService;

        public AuthController(AuthService authService, GoogleAuthService googleAuthService)
        {
            _authService = authService;
            _googleAuthService = googleAuthService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            try
            {
                await _authService.Register(dto);
                return Ok(new { message = "Регистрация успешна!" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto request)
        {
            try
            {
                var token = await _authService.Login(request);
                return Ok(new { token });
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            try
            {
                var user = await _authService.GetCurrentUser(User);
                if (user == null) return Unauthorized();

                return Ok(user);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

        [HttpPost("google-login")]
        public async Task<IActionResult> GoogleLogin([FromBody] GoogleTokenDto dto)
        {
            var token = await _googleAuthService.AuthenticateWithGoogle(dto.IdToken);
            if (token == null)
                return BadRequest("Invalid Google token");

            return Ok(new { token });
        }
    }
}
