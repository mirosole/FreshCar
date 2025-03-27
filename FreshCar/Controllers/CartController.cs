using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FreshCar.Data;
using FreshCar.Models;
using System.Security.Claims;
using FreshCar.DTOs;

namespace FreshCar.Controllers
{
    [ApiController]
    [Route("api/cart")]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CartController(AppDbContext context)
        {
            _context = context;
        }

        private string GetUserId() =>
            User.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new Exception("User not found");

        [HttpGet]
        public async Task<IActionResult> GetCart()
        {
            var userId = GetUserId();

            var cartItems = await _context.CartItems
                .Include(c => c.Product)
                .Where(c => c.UserId == userId)
                .Select(c => new
                {
                    c.Id,
                    ProductId = c.ProductId,
                    ProductName = c.Product.Name,
                    Price = c.Product.Price,
                    ImageUrl = c.Product.ImageUrl,
                    Quantity = c.Quantity,
                    Option = c.Option
                })
                .ToListAsync();

            return Ok(cartItems);
        }

        [HttpPost]
        public async Task<IActionResult> AddToCart([FromBody] CartItemDto dto)
        {
            var userId = GetUserId();

            var existing = await _context.CartItems
                .FirstOrDefaultAsync(c => c.UserId == userId && c.ProductId == dto.ProductId && c.Option == dto.Option);

            if (existing != null)
            {
                existing.Quantity += dto.Quantity;
            }
            else
            {
                var item = new CartItem
                {
                    UserId = userId,
                    ProductId = dto.ProductId,
                    Quantity = dto.Quantity,
                    Option = dto.Option
                };
                _context.CartItems.Add(item);
            }

            await _context.SaveChangesAsync();
            return Ok();
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> RemoveItem(int id)
        {
            var userId = GetUserId();
            var item = await _context.CartItems.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

            if (item == null) return NotFound();

            _context.CartItems.Remove(item);
            await _context.SaveChangesAsync();
            return Ok();
        }

        [HttpDelete("clear")]
        public async Task<IActionResult> ClearCart()
        {
            var userId = GetUserId();
            var items = _context.CartItems.Where(c => c.UserId == userId);
            _context.CartItems.RemoveRange(items);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
