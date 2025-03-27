using FreshCar.Data;
using FreshCar.DTOs;
using FreshCar.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

public class CategoryService
{
    private readonly AppDbContext _context;

    public CategoryService(AppDbContext context)
    {
        _context = context;
    }

    // ✅ Создание категории
    public async Task<Category> Create(CategoryDto dto)
    {
        var category = new Category { Name = dto.Name, Products = new List<Product>() };
        _context.Categories.Add(category);
        await _context.SaveChangesAsync();
        return category;
    }

    // ✅ Получение всех категорий
    public async Task<List<Category>> GetAll()
    {
        return await _context.Categories.ToListAsync();
    }
    public async Task<bool> Delete(int id)
    {
        var category = await _context.Categories.FindAsync(id);
        if (category == null) return false;

        // Проверяем, есть ли товары в этой категории
        bool hasProducts = _context.Products.Any(p => p.CategoryId == id);
        if (hasProducts) return false; // Нельзя удалить категорию с товарами

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();
        return true;
    }

}