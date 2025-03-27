namespace FreshCar.DTOs;

public class ReviewDto
{
    public string FullName { get; set; }
    public string Email { get; set; }
    public string Text { get; set; }
    public int Stars { get; set; }
    public int ProductId { get; set; }
}
