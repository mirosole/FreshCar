// ✅ Финальная версия card.js
import { addHeader, addFooter } from "/js/addHTML.js";
import { getCart, saveCart, cartCounter } from "/js/cartCounter.js";
import { createCard } from "/js/createCard.js";

const API_URL = "http://localhost:5064/api";
let selectedRating = 0;

addHeader();
addFooter();

function getProductId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

async function loadProduct() {
    const productId = getProductId();
    if (!productId) {
        console.error("ID товара не найден в URL");
        return;
    }

    try {
        let response = await fetch(`${API_URL}/products/${productId}`);
        if (!response.ok) {
            throw new Error("Ошибка загрузки товара");
        }

        let product = await response.json();
        renderProduct(product);
        await loadSimilarProducts(product.categoryId);
        setupReviewModal();
    } catch (error) {
        console.error("Ошибка загрузки товара:", error);
    }
}

function renderProduct(product) {
    const { id, name, description, subtitle, price, imageUrls, categoryId, options, quantity } = product;
    const place = document.querySelector('.product__inner');

    const itemHTML = `<div class="product__img">
                        <div class="product__img__inner">
                            <img src="${imageUrls[0] || '/img/no-image.png'}">
                            <div class="product__img__nav">
                                <div class="product__img__nav__item active"></div>
                                <div class="product__img__nav__item"></div>
                                <div class="product__img__nav__item"></div>
                            </div>
                        </div>
                    </div>
                    <div class="product__block">
                        <div class="product__block__main">
                            <h1 class="product__block__title">${name}</h1>
                            <p class="product__block__subtitle">${subtitle || ''}</p>
                            <p class="product__block__descr">${description}</p>
                            <div class="product__block__reviews">
                                <a href="#" class="product__block__reviews_link">Hodnoceni (ks)</a>
                                <div class="product__block__reviews_stars"></div>

                            </div>
                        </div>
                        <div class="product__block__footer">
                            <div class="product__block__price">
                                <p>${price} Kč</p> 
                                <span>${price} Kč / 1 ks</span>
                            </div>
                            ${options?.colors ? `<div class="product__block__options">
                                ${options.colors.map(c => `<span class="product__block__options__item">${c}</span>`).join('')}
                            </div>` : ''}
                            <div class="product__block__quantity">
                                <button class="product__block__quantity__btn minus">-</button>
                                <input id="product-quantity-input" type="number" placeholder="1" min="1" max="${quantity || 99}">
                                <button class="product__block__quantity__btn plus">+</button>
                            </div>
                            <button class="product__block__btn">DO KOŠÍKU</button>
                        </div>
                        <div class="product__block__details">
                            <p>Kategorie: <span>${product.categoryName}</span></p>
                        </div>
                    </div>`;

    place.insertAdjacentHTML('beforeend', itemHTML);

    setupOptionSelection();
    setupQuantityControls();
    setupAddToCart(product);
    setupReviewModal();
    fillUserReviewFields();
    loadReviews(product.id);
}

function setupOptionSelection() {
    const optionBtns = document.querySelectorAll('.product__block__options__item');
    optionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            optionBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

function setupQuantityControls() {
    const input = document.getElementById('product-quantity-input');
    const plusBtn = document.querySelector('.plus');
    const minusBtn = document.querySelector('.minus');

    plusBtn?.addEventListener('click', () => {
        if (input.value < Number(input.max)) input.value++;
    });

    minusBtn?.addEventListener('click', () => {
        if (input.value > 1) input.value--;
    });
}

function setupAddToCart(product) {
    const btn = document.querySelector('.product__block__btn');
    btn.addEventListener('click', async () => {
        const quantity = Number(document.getElementById('product-quantity-input').value) || 1;
        const selectedOption = document.querySelector('.product__block__options__item.active')?.textContent;

        if (product.options?.colors && !selectedOption) {
            alert('Vyberte barvu!');
            return;
        }

        const cartItem = {
            productId: product.id,
            quantity: quantity,
            option: selectedOption
        };

        try {
            const token = localStorage.getItem("token");
            const response = await fetch(`${API_URL}/cart`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(cartItem)
            });

            if (!response.ok) throw new Error("Ошибка при добавлении в корзину");

            alert("Товар добавлен в корзину!");
            cartCounter();
        } catch (error) {
            console.error("Ошибка при добавлении в корзину:", error);
        }
    });
}

function setupReviewModal() {
    const modal = document.querySelector(".reviews-block");
    const darkBg = document.querySelector(".dark-bg");
    const openBtn = document.querySelector(".product__block__reviews_link");
    const closeBtn = document.querySelector(".reviews-block_close-btn");

    if (!modal || !darkBg || !openBtn || !closeBtn) return;

    openBtn.addEventListener("click", (e) => {
        e.preventDefault();
        modal.classList.add("show");
        darkBg.classList.add("show");

        const productId = getProductId();
        loadReviews(productId); // 👈 загружаем отзывы при открытии
    });


    closeBtn.addEventListener("click", () => {
        modal.classList.remove("show");
        darkBg.classList.remove("show");
    });

    darkBg.addEventListener("click", () => {
        modal.classList.remove("show");
        darkBg.classList.remove("show");
    });
}


async function loadSimilarProducts(categoryId) {
    try {
        let response = await fetch(`${API_URL}/products?category=${categoryId}`);
        let products = await response.json();

        const currentProductId = getProductId();
        products = products.filter(p => p.id !== parseInt(currentProductId));

        const similar = products.sort(() => Math.random() - 0.5).slice(0, 2);

        const container = document.querySelector(".suggestions__offers__block");
        container.innerHTML = "";

        createCard(similar, categoryId, container, true);
    } catch (error) {
        console.error("Ошибка загрузки похожих товаров:", error);
    }
}
async function fillUserReviewFields() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/auth/me`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) throw new Error("Ошибка загрузки пользователя");

        const user = await response.json();

        const nameInput = document.querySelector(".suggestions__commentars__name");
        const emailInput = document.querySelector(".suggestions__commentars__email");

        if (nameInput) nameInput.value = user.fullName || "";
        if (emailInput) emailInput.value = user.email || "";
    } catch (err) {
        console.error("Ошибка загрузки данных пользователя:", err);
    }
}
function setupReviewForm() {
    const submitBtn = document.querySelector(".suggestions__commentars__btn");
    if (!submitBtn) return;

    submitBtn.addEventListener("click", async () => {
        const name = document.querySelector(".suggestions__commentars__name")?.value.trim();
        const email = document.querySelector(".suggestions__commentars__email")?.value.trim();
        const text = document.querySelector(".suggestions__commentars__text")?.value.trim();
        const stars = selectedRating;
        const productId = getProductId();

        if (!name || !email || !text || !stars) {
            alert("Vyplňte všechna pole a ohodnoťte hvězdičkami.");
            return;
        }

        const body = {
            fullName: name,
            email: email,
            text,
            stars,
            productId: Number(productId)
        };

        try {
            const response = await fetch(`${API_URL}/reviews`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) throw new Error("Chyba při odesílání komentáře");

            alert("Děkujeme za váš komentář!");
            document.querySelector(".suggestions__commentars__text").value = "";
            document.querySelectorAll(".suggestions__commentars__stars i").forEach(star => {
                star.classList.remove("fa-solid");
                star.classList.add("fa-regular");
            });
            selectedRating = 0;
        } catch (err) {
            console.error(err);
            alert("Nepodařilo se odeslat komentář.");
        }
        loadReviews(getProductId());
    });
}
function setupStarSelection() {
    const stars = document.querySelectorAll(".suggestions__commentars__stars i");
    stars.forEach(star => {
        star.addEventListener("click", () => {
            selectedRating = Number(star.dataset.num);
            stars.forEach(s => {
                s.classList.toggle("fa-solid", Number(s.dataset.num) <= selectedRating);
                s.classList.toggle("fa-regular", Number(s.dataset.num) > selectedRating);
            });
        });
    });
}
async function loadReviews(productId) {
    try {
        const response = await fetch(`${API_URL}/reviews/${productId}`);
        if (!response.ok) throw new Error("Chyba při načítání hodnocení");

        const reviews = await response.json();
        const container = document.querySelector(".reviews-block_inner");
        container.innerHTML = "";

        if (!reviews.length) {
            container.innerHTML = "<p>Zatím žádné komentáře.</p>";
        } else {
            const totalStars = reviews.reduce((sum, r) => sum + r.stars, 0);
            const avgRating = Math.round(totalStars / reviews.length);

            const modalStars = document.querySelector(".reviews-block_total-info_stars");
            if (modalStars) {
                modalStars.innerHTML = Array.from({ length: 5 }, (_, i) =>
                    `<i class="fa-${i < avgRating ? "solid" : "regular"} fa-star"></i>`
                ).join("");
            }

            const previewStars = document.querySelector(".product__block__reviews_stars");
            if (previewStars) {
                previewStars.innerHTML = Array.from({ length: 5 }, (_, i) =>
                    `<i class="fa-${i < avgRating ? "solid" : "regular"} fa-star"></i>`
                ).join("");
            }

            reviews.forEach(review => {
                const starsHTML = Array.from({ length: 5 }, (_, i) =>
                    `<i class="fa-${i < review.stars ? "solid" : "regular"} fa-star"></i>`
                ).join("");

                const date = new Date(review.date).toLocaleDateString("cs-CZ");

                const html = `
            <div class="reviews-block_item">
                <div class="reviews-block_item_header">
                    <h1 class="reviews-block_item_name">${review.fullName}</h1>
                    <p class="reviews-block_item_date">${date}</p>
                </div>
                <div class="reviews-block_item_stars">${starsHTML}</div>
                <div class="reviews-block_item_text">${review.text}</div>
            </div>
        `;
                container.insertAdjacentHTML("beforeend", html);
            });
        }
        ;
    } catch (err) {
        console.error("Chyba načítání hodnocení:", err);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    await loadProduct();         // ⬅️ внутри него вызываются renderProduct, fillUserReviewFields и т.д.
    setupStarSelection();        // 👈 добавь сюда
    setupReviewForm();           // 👈 и сюда
});
