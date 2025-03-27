namespace FreshCar.Models
{
    public class Product
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string? ShortDescription { get; set; }
        public required string Description { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public int CategoryId { get; set; }
        public string ImageUrl { get; set; } // ✅ сохраняем URL изображения
        public string? Colors { get; set; }

        // 🔧 Добавить навигационное свойство
        public Category? Category { get; set; }
    }
}