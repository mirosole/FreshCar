using Microsoft.AspNetCore.Mvc;
using FreshCar.Services;
using FreshCar.DTOs;
using FreshCar.Models;
using System.Threading.Tasks;
using System.Collections.Generic;
using Microsoft.AspNetCore.Authorization;

[Route("api/categories")]
[ApiController]
public class CategoryController : ControllerBase
{
    private readonly CategoryService _categoryService;

    public CategoryController(CategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    // ✅ Создание категории (только админ)
    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CategoryDto dto)
    {
        var category = await _categoryService.Create(dto);
        return Ok(category);
    }

    // ✅ Получение списка всех категорий
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var categories = await _categoryService.GetAll();
        return Ok(categories);
    }
    // ✅ Удаление категории (только админ)
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var success = await _categoryService.Delete(id);
        if (!success) return NotFound(new { message = "Категория не найдена или не может быть удалена" });

        return Ok(new { message = "Категория успешно удалена" });
    }

}