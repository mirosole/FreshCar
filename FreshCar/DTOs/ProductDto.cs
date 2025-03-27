using System.Collections.Generic;

namespace FreshCar.DTOs
{
    public class ProductDto
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public string? ShortDescription { get; set; }
        public required string Description { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public int CategoryId { get; set; }
        public string? CategoryName { get; set; }
        public string ImageUrl { get; set; }

        public Dictionary<string, List<string>> Options { get; set; } = new();

        // Добавляем:
        public List<string> ImageUrls => new() { ImageUrl };
        public int Stock => Quantity;
        public string Category => CategoryName ?? "";
    }

}