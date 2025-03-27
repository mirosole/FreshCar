using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FreshCar.Models
{
    public class Order
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [ForeignKey("UserId")]
        public User? User { get; set; }

        public DateTime OrderDate { get; set; } = DateTime.UtcNow;

        [Required]
        public string Status { get; set; } = "Pending"; // Ожидает обработки

        [Required]
        public required string PaymentMethod { get; set; } // "Карта", "Наличные", "PayPal" и т. д.

        [Required]
        public required string DeliveryMethod { get; set; } // "Почта", "Курьер", "Самовывоз"

        public required string Address { get; set; } // Адрес доставки

        public required List<OrderDetail> OrderDetails { get; set; }
    }
}