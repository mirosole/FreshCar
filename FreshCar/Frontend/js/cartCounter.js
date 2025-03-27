const API_URL = "http://localhost:5064/api"; // Подставь правильный порт API

// 📌 Получение корзины с сервера
export async function getCart() {
    const token = localStorage.getItem("token");
    if (!token) return [];

    try {
        const response = await fetch(`${API_URL}/cart`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Ошибка загрузки корзины");

        return await response.json();
    } catch (error) {
        console.error("Ошибка загрузки корзины:", error);
        return [];
    }
}

// 📌 Сохранение корзины на сервере
export async function saveCart(cart) {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        await fetch(`${API_URL}/cart`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(cart)
        });
    } catch (error) {
        console.error("Ошибка сохранения корзины:", error);
    }
}

// 📌 Обновление счетчика корзины
export async function cartCounter() {
    const count = document.querySelector(".header__userbar__cart-count");
    if (!count) return;

    const cart = await getCart();
    count.style.display = cart.length > 0 ? "flex" : "none";
    count.innerHTML = cart.length;
}

// 📌 Вызываем обновление счетчика при загрузке страницы
document.addEventListener("DOMContentLoaded", cartCounter);
