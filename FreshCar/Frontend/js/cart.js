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
    const place = document.querySelector(".cart-block");
    const empty = document.querySelector(".cart-item-empty");
    const button = document.querySelector(".cart_btn");

    if (!place || !empty || !button) return;

    if (cartItems.length === 0) {
        empty.style.display = "block";
        button.style.display = "none";
        return;
    }

    empty.style.display = "none";
    button.style.display = "block";

    place.innerHTML = "";

    let total = 0;

    cartItems.forEach(item => {
        total += item.price * item.quantity;

        const itemHTML = `
            <div class="cart-item" data-id="${item.id}">
                <div class="cart-item_main-info">
                    <a href="/html/card.html?id=${item.productId}">
                        <img src="${item.imageUrl}">
                    </a>
                    <div class="cart-item_main-info_text">
                        <div>
                            <h1 class="cart-item_main-info_title">
                                <a href="/html/card.html?id=${item.productId}">${item.productName}</a>
                            </h1>
                            ${item.option ? `
                                <span class="cart-item_option ${item.option}">
                                    <p class="option-nav">${item.option}</p>
                                </span>` : ""}
                        </div>
                        <p class="cart-item_main-info_subtitle">Originální osvěžovač vzduchu</p>
                    </div>
                </div>

                <div class="cart-item_details">
                    <p class="cart-item_details_quantity">(${item.quantity} ks)</p>
                    <p class="cart-item_details_price">${item.price * item.quantity} Kč</p>
                    <button class="cart-item_delete-btn remove-btn" data-id="${item.id}">+</button>
                </div>
            </div>
        `;

        place.insertAdjacentHTML("beforeend", itemHTML);
    });

    // 👇 Вставка общей суммы
    const totalBlock = document.createElement("div");
    totalBlock.classList.add("cart-item_total");
    totalBlock.innerHTML = `<p><strong>Celkem:</strong> ${total} Kč</p>`;
    place.appendChild(totalBlock);

    document.querySelectorAll(".remove-btn").forEach(btn => {
        btn.addEventListener("click", () => removeFromCart(btn.dataset.id));
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

        if (!response.ok) throw new Error("Ошибка удаления");

        await loadCart();
    } catch (error) {
        console.error("Ошибка удаления товара:", error);
    }
}

document.addEventListener("DOMContentLoaded", loadCart);
