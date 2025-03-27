using System.ComponentModel.DataAnnotations;

namespace FreshCar.Models
{
    public class Category
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public required string Name { get; set; }

        public required List<Product> Products { get; set; }
    }
}