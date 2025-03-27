using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using FreshCar.Data;
using FreshCar.DTOs;
using FreshCar.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using BC = BCrypt.Net.BCrypt;

namespace FreshCar.Services
{
    public class AuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthService(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        public async Task<string> Register(RegisterDto request)
        {
            try
            {
                if (await _context.Users.AnyAsync(u => u.Email == request.Email))
                    throw new Exception("Этот email уже зарегистрирован");

                var newUser = new User
                {
                    Email = request.Email,
                    PasswordHash = BC.HashPassword(request.Password),
                    Role = "User"
                };

                _context.Users.Add(newUser);
                await _context.SaveChangesAsync();

                return GenerateJwtToken(newUser);
            }
            catch (Exception ex)
            {
                throw new Exception($"Ошибка при регистрации: {ex.Message}");
            }
        }

        public async Task<string> Login(LoginDto request)
        {
            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
                if (user == null || !BC.Verify(request.Password, user.PasswordHash))
                    throw new Exception("Неверный email или пароль");

                return GenerateJwtToken(user);
            }
            catch (Exception ex)
            {
                throw new Exception($"Ошибка при входе: {ex.Message}");
            }
        }

        public async Task<UserDto?> GetCurrentUser(ClaimsPrincipal userClaims)
        {
            try
            {
                var userId = userClaims.FindFirst(ClaimTypes.NameIdentifier)?.Value;
                if (string.IsNullOrEmpty(userId))
                    return null;

                var user = await _context.Users.FirstOrDefaultAsync(u => u.Id.ToString() == userId);
                if (user == null)
                    return null;

                return new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FullName = user.FullName,
                    Street = user.Street,
                    Zip = user.Zip,
                    City = user.City,
                    Phone = user.Phone
                };

            }
            catch (Exception ex)
            {
                throw new Exception($"Ошибка получения пользователя: {ex.Message}");
            }
        }

        private string GenerateJwtToken(User user)
        {
            var key = Encoding.UTF8.GetBytes(_config["Jwt:Key"]);
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim(ClaimTypes.Role, user.Role)
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddDays(7),
                signingCredentials: new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256)
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
