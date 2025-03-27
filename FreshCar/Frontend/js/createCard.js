const API_URL = "http://localhost:5064/api";

// 📌 Создание карточек товара
export function createCard(data, category, place) {
    data.forEach(item => {
        const { id, name, description, imageUrls, price, stock, options } = item;

        const cardHTML = `<div class="catalog__item" data-product-id="${id}" data-stock="${stock}">
            <a href="/html/card.html?id=${id}" class="catalog__item__img">
                <img src="${imageUrls.length > 0 ? imageUrls[0] : '/img/no-image.png'}">
            </a>
            <div class="catalog__item__text">
                <div class="catalog__item__main">
                    <a href="/html/card.html?id=${id}" class="catalog__item__title">${name}</a>
                    <div class="catalog__item__info">${description}</div>
                </div>
                <div class="catalog__item__footer">
                    ${options?.colors ? `<div class="catalog__item__options">
                        ${pushProductsOptions(options.colors, id)}
                    </div>` : ''}

                    <div class="catalog__item__details">
                        ${stock < 1
            ? '<div class="catalog__item__details__unavailable">Momentálně nedostupné</div>'
            : `<div class="catalog__item__details price">${price} Kč</div>
                               <div class="catalog__item__details quantity" data-quantity-for="${id}">
                                   ${stock > 5 ? 'skladem(>5 ks)' : `skladem(${stock} ks)`}
                               </div>`
        }
                    </div>

                    <button class="catalog__item__btn add-to-cart" data-id="${id}" ${stock < 1 ? 'disabled' : ''}>
                        ${stock < 1 ? `<a href="/html/card.html?id=${id}">DETAIL</a>` : 'DO KOŠÍKU'}
                    </button>
                </div>
            </div>
        </div>`;

        if (category === item.category) {
            place.insertAdjacentHTML('beforeend', cardHTML);
        }
    });

    // 📌 Обработчик кнопок "DO KOŠÍKU"
    document.querySelectorAll(".add-to-cart").forEach(button => {
        button.addEventListener("click", () => addToCart(button.dataset.id));
    });
}

// 📌 Добавление в корзину и обновление карточки
async function addToCart(productId) {
    console.log("✅ addToCart вызван для товара:", productId);
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Вы не авторизованы!");
            return;
        }

        const response = await fetch(`${API_URL}/cart`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ productId, quantity: 1 })
        });

        if (!response.ok) throw new Error("Ошибка добавления в корзину");

        const btn = document.querySelector(`.add-to-cart[data-id="${productId}"]`);
        const card = btn.closest(".catalog__item");

        // 🔁 Обновление кнопки
        if (btn) {
            btn.textContent = "V KOŠÍKU";
            btn.classList.add("added");
            btn.disabled = true;
        }

        // 🔁 Обновление количества на складе
        const quantityDiv = card.querySelector(`.quantity[data-quantity-for="${productId}"]`);
        if (quantityDiv) {
            let currentStock = parseInt(card.dataset.stock);
            if (!isNaN(currentStock)) {
                currentStock = Math.max(0, currentStock - 1);
                card.dataset.stock = currentStock;

                if (currentStock < 1) {
                    quantityDiv.textContent = "skladem(0 ks)";
                } else if (currentStock <= 5) {
                    quantityDiv.textContent = `skladem(${currentStock} ks)`;
                } else {
                    quantityDiv.textContent = "skladem(>5 ks)";
                }
            }
        }

        alert("Товар добавлен в корзину!");
    } catch (error) {
        console.error("Ошибка добавления в корзину:", error);
    }
}

// 📌 Генерация опций (цвета)
function pushProductsOptions(o, id) {
    let options = [];
    getProductsOptions(o, options, id);
    return options.join("");
}

function getProductsOptions(options, arr, id) {
    Object.keys(options).forEach(key => {
        const quote = `<a href="/html/card.html?id=${id}" class="catalog__item__option ${key}"></a>`;
        arr.push(quote);
    });
}
