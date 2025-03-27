using FreshCar.DTOs;
using FreshCar.Models;
using FreshCar.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace FreshCar.Controllers
{
    [Route("api/user")]
    [ApiController]
    [Authorize]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UserController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("update-billing")]
        public async Task<IActionResult> UpdateBilling([FromBody] BillingInfoDto dto)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (userId == null) return Unauthorized();

            var user = await _context.Users.FindAsync(int.Parse(userId));
            if (user == null) return NotFound();

            user.FullName = dto.FullName;
            user.Street = dto.Street;
            user.Zip = dto.Zip;
            user.City = dto.City;
            user.Phone = dto.Phone;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Billing info updated" });
        }
    }
}