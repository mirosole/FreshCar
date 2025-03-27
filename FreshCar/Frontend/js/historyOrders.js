import { addHeader, addFooter } from "/js/addHTML.js";
import { searchInput } from "/js/search.js";
import { cartCounter } from "/js/cartCounter.js";

const API_URL = "http://localhost:5064/api"; // Укажи свой API

addHeader();
addFooter();

document.addEventListener("DOMContentLoaded", async () => {
    cartCounter();
    await loadOrders();
});

// 📌 Получение списка заказов из API
async function loadOrders() {
    const token = localStorage.getItem("token");
    if (!token) {
        console.warn("Пользователь не авторизован");
        document.querySelector("#orders-container").innerHTML = "<p>Вы не авторизованы</p>";
        return;
    }

    try {
        const response = await fetch(`${API_URL}/orders`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Ошибка загрузки заказов");

        const orders = await response.json();
        renderOrders(orders);
    } catch (error) {
        console.error("Ошибка загрузки заказов:", error);
    }
}

// 📌 Отображение списка заказов
function renderOrders(orders) {
    const ordersContainer = document.querySelector("#orders-container");
    if (!ordersContainer) return;

    if (orders.length === 0) {
        ordersContainer.innerHTML = "<p>У вас пока нет заказов.</p>";
        return;
    }

    ordersContainer.innerHTML = orders
        .map(order => `
            <div class="order">
                <h3>Заказ №${order.id}</h3>
                <p>Дата: ${new Date(order.orderDate).toLocaleDateString()}</p>
                <p>Статус: ${order.status}</p>
                <p>Сумма: ${order.orderDetails.reduce((sum, item) => sum + item.price * item.quantity, 0)} Kč</p>
            </div>
        `)
        .join("");
}
