using FreshCar.Data;
using FreshCar.DTOs;
using FreshCar.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FreshCar.Controllers;

[ApiController]
[Route("api/reviews")]
public class ReviewController : ControllerBase
{
    private readonly AppDbContext _context;

    public ReviewController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet("{productId}")]
    public async Task<IActionResult> GetByProduct(int productId)
    {
        var reviews = await _context.Reviews
            .Where(r => r.ProductId == productId)
            .OrderByDescending(r => r.Date)
            .ToListAsync();

        return Ok(reviews);
    }

    [HttpPost]
    public async Task<IActionResult> AddReview([FromBody] ReviewDto dto)
    {
        var review = new Review
        {
            FullName = dto.FullName,
            Email = dto.Email,
            Text = dto.Text,
            Stars = dto.Stars,
            ProductId = dto.ProductId,
            Date = DateTime.UtcNow
        };

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();

        return Ok();
    }
}
