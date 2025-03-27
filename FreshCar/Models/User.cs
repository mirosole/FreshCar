using System.ComponentModel.DataAnnotations;

namespace FreshCar.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(255)]
        public required string Email { get; set; }

        [Required]
        [MaxLength(255)]
        public string PasswordHash { get; set; } = default!;
        public string Role { get; set; } = "User"; // По умолчанию обычный пользователь
        public string? FullName { get; set; }
        public string? Street { get; set; }
        public string? Zip { get; set; }
        public string? City { get; set; }
        public string? Phone { get; set; }

    }
}