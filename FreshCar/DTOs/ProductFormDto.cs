namespace FreshCar.DTOs;

public class ProductFormDto
{
    public string Name { get; set; } = "";
    public string Description { get; set; } = "";
    public string? ShortDescription { get; set; }
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public int CategoryId { get; set; }
    public string Colors { get; set; } = "";
}