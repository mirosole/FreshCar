import { addHeader, addFooter } from "/js/addHTML.js";
import { cartCounter } from "/js/cartCounter.js";

const API_URL = "http://localhost:5064/api";

addHeader();
addFooter();

let cartArray = [];

async function loadCart() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            console.warn("Пользователь не авторизован");
            return;
        }

        const response = await fetch(`${API_URL}/cart`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Ошибка загрузки корзины");

        cartArray = await response.json();
        cartCounter();
        renderCart(cartArray);
    } catch (error) {
        console.error("Ошибка загрузки корзины:", error);
    }
}

function renderCart(cartItems) {
    const cartContainer = document.querySelector("#cart-container");
    if (!cartContainer) return;

    if (cartItems.length === 0) {
        cartContainer.innerHTML = "<p>Košík je prázdný.</p>";
        return;
    }

    cartContainer.innerHTML = cartItems
        .map(item => `
            <div class="content-item">
                <div class="content-item_main-info">
                    <img src="${item.imageUrl}" alt="${item.productName}">
                    <div class="content-item_main-info_text">
                        <div>
                            <h1 class="content-item_main-info_title">${item.productName}</h1>
                            ${item.option ? `
                            <span class="content-item_option ${item.option}">
                                <p class="option-nav">${item.option}</p>
                            </span>` : ""}
                        </div>
                        <p class="content-item_main-info_subtitle">Originální osvěžovač vzduchu s designem "${item.productName}".</p>
                    </div>
                </div>

                <div class="content-item_details">
                    <p class="content-item_details_quantity">(${item.quantity} ks)</p>
                    <p class="content-item_details_price">${item.price} Kč</p>
                    <button class="content-item_delete-btn remove-btn" data-id="${item.id}">+</button>
                </div>
            </div>
        `)
        .join("");

    document.querySelectorAll(".remove-btn").forEach(button => {
        button.addEventListener("click", () => removeFromCart(button.dataset.id));
    });
}

async function removeFromCart(productId) {
    try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(`${API_URL}/cart/${productId}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Ошибка удаления товара из корзины");

        await loadCart();
    } catch (error) {
        console.error("Ошибка удаления товара:", error);
    }
}

async function checkout() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Вы не авторизованы!");
            return;
        }

        const response = await fetch(`${API_URL}/orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ items: cartArray })
        });

        if (!response.ok) throw new Error("Ошибка оформления заказа");

        alert("Objednávka byla úspěšně odeslána!");
        window.location.href = "/html/account/historyOrders.html";
    } catch (error) {
        console.error("Ошибка оформления заказа:", error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    loadCart();

    const checkoutBtn = document.querySelector("#checkout-button");
    if (checkoutBtn) {
        checkoutBtn.addEventListener("click", checkout);
    }
});
