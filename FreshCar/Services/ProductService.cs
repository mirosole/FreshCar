using FreshCar.Data;
using FreshCar.DTOs;
using FreshCar.Models;
using Microsoft.EntityFrameworkCore;

namespace FreshCar.Services
{
    public class ProductService
    {
        private readonly AppDbContext _context;

        public ProductService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ProductDto>> GetAll(int? categoryId)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .AsQueryable();

            if (categoryId.HasValue)
                query = query.Where(p => p.CategoryId == categoryId.Value);

            var products = await query.ToListAsync();

            return products.Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                ShortDescription = p.ShortDescription,
                Price = p.Price,
                Quantity = p.Quantity,
                CategoryId = p.CategoryId,
                ImageUrl = p.ImageUrl,
                CategoryName = p.Category?.Name ?? "Неизвестно",
                Options = new Dictionary<string, List<string>>
                {
                    { "colors", !string.IsNullOrEmpty(p.Colors) ? p.Colors.Split(',').ToList() : new List<string>() }
                }
            }).ToList();
        }

        public async Task<ProductDto?> GetById(int id)
        {
            var product = await _context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id);
            if (product == null) return null;

            return new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                ShortDescription = product.ShortDescription,
                Price = product.Price,
                Quantity = product.Quantity,
                CategoryId = product.CategoryId,
                ImageUrl = product.ImageUrl,
                CategoryName = product.Category?.Name ?? "Неизвестно",
                Options = new Dictionary<string, List<string>>
                {
                    { "colors", !string.IsNullOrEmpty(product.Colors) ? product.Colors.Split(',').ToList() : new List<string>() }
                }
            };
        }

        public async Task<ProductDto> Create(ProductFormDto dto, IFormFile? image)
        {
            var product = new Product
            {
                Name = dto.Name,
                Description = dto.Description,
                ShortDescription = dto.ShortDescription,
                Price = dto.Price,
                Quantity = dto.Quantity,
                CategoryId = dto.CategoryId,
                Colors = dto.Colors,
                ImageUrl = image != null ? SaveImage(image) : "/img/products/default-image.png"
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return await GetById(product.Id);
        }

        public async Task<ProductDto?> Update(int id, ProductFormDto dto, IFormFile? image)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
            if (product == null) return null;

            product.Name = dto.Name;
            product.Description = dto.Description;
            product.ShortDescription = dto.ShortDescription;
            product.Price = dto.Price;
            product.Quantity = dto.Quantity;
            product.CategoryId = dto.CategoryId;
            product.Colors = dto.Colors;

            if (image != null)
                product.ImageUrl = SaveImage(image);

            await _context.SaveChangesAsync();
            return await GetById(id);
        }

        public async Task<bool> Delete(int id)
        {
            var product = await _context.Products.FirstOrDefaultAsync(p => p.Id == id);
            if (product == null) return false;

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return true;
        }

        private string SaveImage(IFormFile file)
        {
            var folderPath = Path.Combine("wwwroot", "img", "products");
            Directory.CreateDirectory(folderPath);

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            var fullPath = Path.Combine(folderPath, fileName);

            using (var stream = new FileStream(fullPath, FileMode.Create))
            {
                file.CopyTo(stream);
            }

            return "/img/products/" + fileName;
        }
        public async Task<List<ProductDto>> Search(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return new List<ProductDto>();

            var queryLower = query.ToLower();

            var products = await _context.Products
                .Include(p => p.Category)
                .Where(p => p.Name.ToLower().Contains(queryLower) ||
                            p.Description.ToLower().Contains(queryLower) ||
                            p.Colors.ToLower().Contains(queryLower) ||
                            (p.Category != null && p.Category.Name.ToLower().Contains(queryLower)))
                .ToListAsync();

            return products.Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                ShortDescription = p.ShortDescription,
                Price = p.Price,
                Quantity = p.Quantity,
                CategoryId = p.CategoryId,
                ImageUrl = p.ImageUrl,
                CategoryName = p.Category?.Name ?? "Неизвестно",
                Options = new Dictionary<string, List<string>>
                {
                    { "colors", !string.IsNullOrEmpty(p.Colors) ? p.Colors.Split(',').ToList() : new List<string>() }
                }
            }).ToList();
        }

    }
}
