namespace FreshCar.DTOs
{
    public class CartItemDto
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        public string? Option { get; set; }
    }
}   