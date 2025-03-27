using FreshCar.Data;
using FreshCar.DTOs;
using FreshCar.Models;
using Microsoft.EntityFrameworkCore;

namespace FreshCar.Services
{
    public class OrderService
    {
        private readonly AppDbContext _context;

        public OrderService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<OrderDto>> GetAll()
        {
            return await _context.Orders
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .Select(o => new OrderDto
                {
                    Id = o.Id,
                    UserId = o.UserId,
                    PaymentMethod = o.PaymentMethod,
                    DeliveryMethod = o.DeliveryMethod,
                    Address = o.Address,
                    Status = o.Status,
                    OrderDate = o.OrderDate,
                    OrderDetails = o.OrderDetails.Select(od => new OrderDetailDto
                    {
                        ProductId = od.ProductId,
                        Quantity = od.Quantity,
                        Price = od.Price
                    }).ToList()
                })
                .ToListAsync();
        }

        public async Task<OrderDto?> GetById(int id)
        {
            var order = await _context.Orders
                .Include(o => o.OrderDetails)
                .ThenInclude(od => od.Product)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return null;

            return new OrderDto
            {
                Id = order.Id,
                UserId = order.UserId,
                PaymentMethod = order.PaymentMethod,
                DeliveryMethod = order.DeliveryMethod,
                Address = order.Address,
                Status = order.Status,
                OrderDate = order.OrderDate,
                OrderDetails = order.OrderDetails.Select(od => new OrderDetailDto
                {
                    ProductId = od.ProductId,
                    Quantity = od.Quantity,
                    Price = od.Price
                }).ToList()
            };
        }

        public async Task<OrderDto> Create(OrderDto dto)
        {
            var order = new Order
            {
                UserId = dto.UserId,
                PaymentMethod = dto.PaymentMethod,
                DeliveryMethod = dto.DeliveryMethod,
                Address = dto.Address,
                OrderDetails = dto.OrderDetails.Select(od => new OrderDetail
                {
                    ProductId = od.ProductId,
                    Quantity = od.Quantity,
                    Price = od.Price
                }).ToList()
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return await GetById(order.Id);
        }

        public async Task<OrderDto?> Update(int id, OrderDto dto)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return null;

            order.Status = dto.Status;

            await _context.SaveChangesAsync();
            return await GetById(id);
        }

        public async Task<bool> Delete(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return false;

            _context.Orders.Remove(order);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}
