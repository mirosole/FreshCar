using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FreshCar.Models
{
    public class ProductImage
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string ImageUrl { get; set; } = string.Empty;

        // Внешний ключ к продукту
        public int ProductId { get; set; }

        [ForeignKey("ProductId")]
        public Product Product { get; set; } = null!;
    }
}