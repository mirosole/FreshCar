const API_URL = "http://localhost:5064/api";

// Отложенный запуск поиска, пока загружается хедер
document.addEventListener("DOMContentLoaded", async () => {
    const header = document.getElementById("header");

    const waitForSearchInput = () =>
        new Promise(resolve => {
            const check = () => {
                const input = header.querySelector(".header__search__input");
                if (input) return resolve(input);
                setTimeout(check, 50);
            };
            check();
        });

    const input = await waitForSearchInput();
    if (input) setupSearch(input);
});

// Основной метод
function setupSearch(searchInput) {
    const searchItems = document.querySelector(".header__search__products");
    let timeout = null;

    searchInput.addEventListener("input", (e) => {
        const query = e.target.value.trim().toLowerCase();

        clearTimeout(timeout);

        // Минимум 2 символа
        if (query.length < 2) {
            searchItems.innerHTML = "";
            return;
        }

        // Задержка перед поиском (debounce)
        timeout = setTimeout(() => {
            performSearch(query, searchItems);
        }, 300);
    });

    // При потере фокуса скрывать список
    searchInput.addEventListener("blur", () => {
        setTimeout(() => {
            searchItems.innerHTML = "";
        }, 200); // даем время кликнуть на результат
    });
}

// Поиск по API и отрисовка
async function performSearch(query, container) {
    container.innerHTML = '<p class="search-loading">Hledání...</p>';

    try {
        let response = await fetch(`${API_URL}/products/search?query=${query}`);
        if (!response.ok) throw new Error("Ошибка запроса");

        const results = await response.json();
        if (results.length === 0) {
            container.innerHTML = '<p class="no-results">Nebylo nic nalezeno</p>';
            return;
        }

        container.innerHTML = results.map(({ id, name, imageUrls }) => `
            <a href="/html/card.html?id=${id}" class="header__search__item">
                <img src="${imageUrls?.[0] || '/img/no-image.png'}" alt="${name}">
                <h1 class="header__search__item__title">${highlightQuery(name, query)}</h1>
            </a>
        `).join("");
    } catch (error) {
        console.error("Ошибка поиска:", error);
        container.innerHTML = '<p class="error">Došlo k chybě při hledání</p>';
    }
}

// Подсветка совпадения
function highlightQuery(text, query) {
    const re = new RegExp(`(${query})`, "gi");
    return text.replace(re, "<mark>$1</mark>");
}
