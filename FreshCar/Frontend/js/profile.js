import { addHeader, addFooter } from "/js/addHTML.js";
import { cartCounter } from "/js/cartCounter.js";

const API_URL = "http://localhost:5064/api";

addHeader();
addFooter();

let iti;
let currentUserData = {};

document.addEventListener("DOMContentLoaded", async () => {
    cartCounter();
    await loadUserProfile();
    await loadUserOrders();
    setupIntlTelInput();
    setupBillingEdit();
});

// 📌 Подключение intl-tel-input
function setupIntlTelInput() {
    const phoneInput = document.querySelector("#billing-phone");
    if (!phoneInput) return;

    iti = window.intlTelInput(phoneInput, {
        initialCountry: "cz",
        preferredCountries: ["cz", "sk", "de"],
        separateDialCode: true,
        utilsScript: "https://cdn.jsdelivr.net/npm/intl-tel-input@18.1.1/build/js/utils.js"
    });
}

// 📌 Загрузка данных пользователя
async function loadUserProfile() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Вы не авторизованы!");
        window.location.href = "/html/login.html";
        return;
    }

    try {
        let response = await fetch(`${API_URL}/auth/me`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Ошибка загрузки профиля");

        const user = await response.json();
        document.getElementById("user-email").textContent = user.email;

        currentUserData = user;
        if (
            !user.fullName &&
            !user.street &&
            !user.zip &&
            !user.city &&
            !user.phone
        ) {
            // Нет данных — сразу открыть редактирование
            document.getElementById("billing-view").style.display = "none";
            document.getElementById("billing-edit").style.display = "block";
        } else {
            // Есть данные — показать просмотр
            showBillingView(user);
        }

    } catch (error) {
        console.error("Ошибка при загрузке профиля:", error);
    }
}

// 📌 Загрузка заказов (если нужно)
async function loadUserOrders() {
    const token = localStorage.getItem("token");

    try {
        let response = await fetch(`${API_URL}/orders`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Ошибка загрузки заказов");

        let orders = await response.json();
        const ordersContainer = document.getElementById("orders-container");
        if (!ordersContainer) return;

        if (orders.length === 0) {
            ordersContainer.innerHTML = "<p>У вас пока нет заказов.</p>";
            return;
        }

        ordersContainer.innerHTML = orders.map(order => `
            <div class="order">
                <h3>Заказ №${order.id}</h3>
                <p>Дата: ${new Date(order.orderDate).toLocaleDateString()}</p>
                <p>Статус: ${order.status}</p>
                <p>Сумма: ${order.orderDetails.reduce((sum, item) => sum + item.price * item.quantity, 0)} Kč</p>
            </div>
        `).join("");
    } catch (error) {
        console.error("Ошибка загрузки заказов:", error);
    }
}

// 📌 Отображение данных в режиме просмотра
function showBillingView(user) {
    document.getElementById("view-fullName").textContent = user.fullName || "";
    document.getElementById("view-street").textContent = user.street || "";
    document.getElementById("view-zip").textContent = user.zip || "";
    document.getElementById("view-city").textContent = user.city || "";
    document.getElementById("view-phone").textContent = user.phone || "";
}

// 📌 Переключение между режимами и сохранение
function setupBillingEdit() {
    const editBtn = document.getElementById("edit-billing");
    const saveBtn = document.getElementById("save-billing");

    editBtn.addEventListener("click", () => {
        document.getElementById("billing-view").style.display = "none";
        document.getElementById("billing-edit").style.display = "block";

        document.getElementById("input-fullName").value = currentUserData.fullName || "";
        document.getElementById("input-street").value = currentUserData.street || "";
        document.getElementById("input-zip").value = currentUserData.zip || "";
        document.getElementById("input-city").value = currentUserData.city || "";
        document.getElementById("billing-phone").value = currentUserData.phone || "";

        if (iti && currentUserData.phone) {
            iti.setNumber(currentUserData.phone);
        }
    });

    saveBtn.addEventListener("click", async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Вы не авторизованы!");
            return;
        }

        const billingData = {
            fullName: document.getElementById("input-fullName").value,
            street: document.getElementById("input-street").value,
            zip: document.getElementById("input-zip").value,
            city: document.getElementById("input-city").value,
            phone: iti.getNumber()
        };

        try {
            const response = await fetch(`${API_URL}/user/update-billing`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(billingData)
            });

            if (!response.ok) throw new Error("Ошибка при сохранении");

            currentUserData = billingData;
            showBillingView(currentUserData);

            document.getElementById("billing-edit").style.display = "none";
            document.getElementById("billing-view").style.display = "block";
            alert("Данные успешно обновлены!");
        } catch (error) {
            console.error("Ошибка при сохранении:", error);
            alert("Произошла ошибка при сохранении");
        }
    });
}
