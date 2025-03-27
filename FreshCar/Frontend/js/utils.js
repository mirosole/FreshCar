const API_URL = "http://localhost:5064/api";

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

// 📌 Добавление товара в корзину через API
export async function addToCart(productId) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Вы не авторизованы!");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/cart`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ productId, quantity: 1 })
        });

        if (!response.ok) throw new Error("Ошибка добавления в корзину");

        alert("Товар добавлен в корзину!");
    } catch (error) {
        console.error("Ошибка добавления в корзину:", error);
    }
}
