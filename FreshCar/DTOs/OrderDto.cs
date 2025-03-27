namespace FreshCar.DTOs
{
    public class OrderDto
    {
        public int Id { get; set; }
        public int UserId { get; set; }
        public string PaymentMethod { get; set; } = null!;
        public string DeliveryMethod { get; set; } = null!;
        public string Address { get; set; } = null!;
        public string Status { get; set; } = "Pending";
        public DateTime OrderDate { get; set; }
        public List<OrderDetailDto> OrderDetails { get; set; } = new();
    }
}

public class OrderDetailDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
    public decimal Price { get; set; }
}