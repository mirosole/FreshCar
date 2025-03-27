using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FreshCar.Models
{
    public class CartItem
    {
        public int Id { get; set; }

        [Required]
        public int ProductId { get; set; }

        [Required]
        public string UserId { get; set; } = null!;

        public int Quantity { get; set; }

        public string? Option { get; set; }

        [ForeignKey("ProductId")]
        public Product Product { get; set; } = null!;
    }
}