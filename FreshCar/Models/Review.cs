namespace FreshCar.Models;

public class Review
{
    public int Id { get; set; }
    public string FullName { get; set; }
    public string Email { get; set; }
    public string Text { get; set; }
    public int Stars { get; set; } // от 1 до 5
    public DateTime Date { get; set; }
    public int ProductId { get; set; }
    public Product Product { get; set; }
}
