import { addHeader, addFooter } from "/js/addHTML.js";
import { getCart, saveCart, cartCounter } from "/js/cartCounter.js";

const API_URL = "http://localhost:5064/api";

addHeader();
addFooter();

// 📌 Получаем ID товара из URL
function getProductId() {
    const params = new URLSearchParams(window.location.search);
    return params.get("id");
}

// 📌 Загружаем информацию о товаре
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
        await loadSimilarProducts(product.categoryId); // Загружаем похожие товары
    } catch (error) {
        console.error("Ошибка загрузки товара:", error);
    }
}

// 📌 Отображение товара
function renderProduct(product) {
    document.querySelector(".product__block__title").textContent = product.name;
    document.querySelector(".product__block__descr").textContent = product.description;
    document.querySelector(".product__block__price p").textContent = `${product.price} Kč`;
    document.querySelector(".product__img img").src = product.imageUrls[0] || "/img/no-image.png";

    // 📌 Отображение цветов (если есть)
    if (product.options && product.options.colors) {
        document.querySelector(".product__block__options").innerHTML = product.options.colors
            .map(color => `<span class="product__block__options__item">${color}</span>`)
            .join("");
    }

    // 📌 Добавление товара в корзину
    document.querySelector(".product__block__btn").addEventListener("click", () => addToCart(product));
}

// 📌 Загружаем похожие товары (из той же категории)
async function loadSimilarProducts(categoryId) {
    try {
        let response = await fetch(`${API_URL}/products?category=${categoryId}`);
        let products = await response.json();

        // Убираем текущий товар из списка похожих
        const currentProductId = getProductId();
        products = products.filter(product => product.id !== parseInt(currentProductId));

        // Выбираем 2 случайных товара
        const shuffled = products.sort(() => Math.random() - 0.5).slice(0, 2);

        const similarProductsContainer = document.querySelector(".suggestions__offers__block");
        similarProductsContainer.innerHTML = shuffled
            .map(product => `
                <div class="catalog__item">
                    <a href="/html/card.html?id=${product.id}" class="catalog__item__img">
                        <img src="${product.imageUrls[0]}" alt="${product.name}">
                    </a>
                    <div class="catalog__item__text">
                        <a href="/html/card.html?id=${product.id}" class="catalog__item__title">${product.name}</a>
                        <div class="catalog__item__details">${product.price} Kč</div>
                    </div>
                </div>
            `)
            .join("");
    } catch (error) {
        console.error("Ошибка загрузки похожих товаров:", error);
    }
}

// 📌 Добавление товара в корзину
async function addToCart(product) {
    const quantity = document.getElementById("product-quantity-input")?.value || 1;
    const optionBtns = document.querySelectorAll(".product__block__options__item");

    // 📌 Проверяем, выбран ли цвет
    function findActiveBtn() {
        let option = null;
        optionBtns.forEach(btn => {
            if (btn.classList.contains("active")) {
                option = btn.textContent;
            }
        });
        return option;
    }

    const selectedOption = findActiveBtn();
    if (!selectedOption) {
        alert("Выберите цвет!");
        return;
    }

    const cartItem = {
        productId: product.id,
        quantity: Number(quantity),
        option: selectedOption
    };

    try {
        const token = localStorage.getItem("token");
        let response = await fetch(`${API_URL}/cart`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(cartItem)
        });

        if (!response.ok) {
            throw new Error("Ошибка добавления в корзину");
        }

        alert("Товар добавлен в корзину!");
        cartCounter(); // Обновляем счетчик корзины
    } catch (error) {
        console.error("Ошибка добавления в корзину:", error);
    }
}

// 📌 Загружаем товар при загрузке страницы
document.addEventListener("DOMContentLoaded", loadProduct);
