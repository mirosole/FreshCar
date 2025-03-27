using FreshCar.Data;
using FreshCar.DTOs;
using FreshCar.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Linq;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;

namespace FreshCar.Services
{
    public class GoogleAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        private readonly IHttpClientFactory _httpClientFactory;

        public GoogleAuthService(AppDbContext context, IConfiguration config, IHttpClientFactory httpClientFactory)
        {
            _context = context;
            _config = config;
            _httpClientFactory = httpClientFactory;
        }

        public async Task<string> AuthenticateWithGoogle(string idToken)
        {
            var client = _httpClientFactory.CreateClient();
            var url = $"https://oauth2.googleapis.com/tokeninfo?id_token={idToken}";
            var response = await client.GetAsync(url);
            if (!response.IsSuccessStatusCode) return null;

            var payload = JObject.Parse(await response.Content.ReadAsStringAsync());
            var email = payload["email"]?.ToString();
            if (string.IsNullOrEmpty(email)) return null;

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
            if (user == null)
            {
                user = new User
                {
                    Email = email,
                    Role = "User",
                    PasswordHash = Guid.NewGuid().ToString()
                };
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }

            return GenerateJwtToken(user);
        }

        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

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
                expires: DateTime.Now.AddDays(7),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
