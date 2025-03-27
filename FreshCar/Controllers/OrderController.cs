using FreshCar.DTOs;
using FreshCar.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FreshCar.Controllers
{
    [Route("api/orders")]
    [ApiController]
    public class OrderController : ControllerBase
    {
        private readonly OrderService _orderService;

        public OrderController(OrderService orderService)
        {
            _orderService = orderService;
        }

        [HttpGet]
        [Authorize] // Требуется авторизация
        public async Task<IActionResult> GetAll()
        {
            var orders = await _orderService.GetAll();
            return Ok(orders);
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetById(int id)
        {
            var order = await _orderService.GetById(id);
            if (order == null) return NotFound();
            return Ok(order);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] OrderDto dto)
        {
            var order = await _orderService.Create(dto);
            return CreatedAtAction(nameof(GetById), new { id = order.Id }, order);
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> Update(int id, [FromBody] OrderDto dto)
        {
            var updatedOrder = await _orderService.Update(id, dto);
            if (updatedOrder == null) return NotFound();
            return Ok(updatedOrder);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> Delete(int id)
        {
            var success = await _orderService.Delete(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}