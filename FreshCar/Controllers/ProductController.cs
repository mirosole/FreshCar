using FreshCar.DTOs;
using FreshCar.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FreshCar.Controllers
{
    [Route("api/products")]
    [ApiController]
    public class ProductController : ControllerBase
    {
        private readonly ProductService _productService;

        public ProductController(ProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] int? categoryId)
        {
            return Ok(await _productService.GetAll(categoryId));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var product = await _productService.GetById(id);
            return product == null ? NotFound() : Ok(product);
        }

        [Authorize(Roles = "Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromForm] ProductFormDto dto, IFormFile? image)

        {
            return Ok(await _productService.Create(dto, image));
        }

        [Authorize(Roles = "Admin")]
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] ProductFormDto dto, IFormFile? image)
        {
            var updatedProduct = await _productService.Update(id, dto, image);
            return updatedProduct == null ? NotFound() : Ok(updatedProduct);
        }

        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            return await _productService.Delete(id) ? Ok() : NotFound();
        }
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string query)
        {
            try
            {
                var products = await _productService.Search(query);
                return Ok(products);
            }
            catch (Exception ex)
            {
                return BadRequest(new { error = ex.Message });
            }
        }

    }
}   