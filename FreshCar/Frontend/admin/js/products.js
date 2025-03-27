
const API_URL = "http://localhost:5064/api/products";
const CATEGORY_API_URL = "http://localhost:5064/api/categories";
const IMAGE_BASE_PATH = "/img/products/";
const DEFAULT_IMAGE = IMAGE_BASE_PATH + "default-image.png";

const table = document.querySelector(".tbody");
let editingProductId = null;
let categoriesCache = [];

// 📌 Загрузка категорий в выпадающий список
async function loadCategories() {
    try {
        const response = await fetch(CATEGORY_API_URL);
        if (!response.ok) throw new Error("Ошибка загрузки категорий");

        categoriesCache = await response.json();

        const select = document.getElementById("input-category");
        select.innerHTML = '<option value="">-- Выберите категорию --</option>';
        categoriesCache.forEach(cat => {
            const option = document.createElement("option");
            option.value = cat.id;
            option.textContent = cat.name;
            select.appendChild(option);
        });
    } catch (error) {
        console.error("Ошибка загрузки категорий:", error);
    }
}

// 📌 Загрузка товаров
async function loadProducts() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Вы не авторизованы!");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.status === 401) {
            alert("Ошибка авторизации! Пожалуйста, войдите в систему заново.");
            return;
        }
        if (!response.ok) throw new Error("Ошибка загрузки товаров");

        const products = await response.json();
        renderProducts(products);
    } catch (error) {
        console.error("Ошибка загрузки товаров:", error);
        table.innerHTML = "<tr><td colspan='10'>Ошибка загрузки товаров</td></tr>";
    }
}

// 📌 Отображение товаров в таблице
function renderProducts(data) {
    table.innerHTML = "";

    data.forEach(product => {
        const imageUrl = product.imageUrl ? product.imageUrl : DEFAULT_IMAGE;
        const row = document.createElement("tr");

        row.innerHTML = `
            <td><img src="${imageUrl}" width="50" onerror="this.src='${DEFAULT_IMAGE}'"></td>
            <td>${product.id}</td>
            <td>${product.name || "Без названия"}</td>
            <td>${product.price ? product.price.toFixed(2) + " Kč" : "Цена не указана"}</td>
            <td>${product.quantity ?? "Нет данных"}</td>
            <td>${product.categoryName || "Неизвестно"}</td>
            <td>${product.shortDescription || "Нет краткого описания"}</td>
            <td>${product.description || "Описание отсутствует"}</td>
            <td>${product.options?.colors?.length ? product.options.colors.join(", ") : "Нет цветов"}</td>
            <td>
                <button class="edit-product-btn" data-id="${product.id}">✏️ Изменить</button>
                <button class="delete-product-btn" data-id="${product.id}">❌ Удалить</button>
            </td>
        `;

        table.appendChild(row);
    });

    document.querySelectorAll(".edit-product-btn").forEach(btn => {
        btn.addEventListener("click", async (event) => {
            const productId = event.target.dataset.id;
            const product = await getProductById(productId);
            fillEditForm(product);
        });
    });

    document.querySelectorAll(".delete-product-btn").forEach(btn => {
        btn.addEventListener("click", async (event) => {
            const productId = event.target.dataset.id;
            await deleteProduct(productId);
        });
    });
}

// 📌 Получение товара по ID
async function getProductById(productId) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Вы не авторизованы!");
        return;
    }

    try {
        const response = await fetch(`${API_URL}/${productId}`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) throw new Error("Ошибка получения товара");
        return await response.json();
    } catch (error) {
        console.error("Ошибка:", error);
    }
}

// 📌 Заполнение формы редактирования
function fillEditForm(product) {
    document.getElementById("form-title").innerText = "Редактирование товара:";
    document.getElementById("input-img").value = "";
    document.getElementById("input-name").value = product.name || "";
    document.getElementById("input-subtitle").value = product.shortDescription || "";
    document.getElementById("input-descr").value = product.description || "";
    document.getElementById("input-price").value = product.price || "";
    document.getElementById("input-quantity").value = product.quantity || "";
    document.getElementById("input-category").value = product.categoryId || "";
    document.getElementById("input-colors").value = Array.isArray(product.colors) ? product.colors.join(", ") : "";

    const addBtn = document.querySelector(".add-product");
    addBtn.innerText = "Сохранить изменения";
    addBtn.dataset.editingId = product.id;
    editingProductId = product.id;
}

// 📌 Добавление или редактирование товара
async function saveProduct() {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Вы не авторизованы!");
        return;
    }

    const name = document.getElementById("input-name").value.trim();
    const description = document.getElementById("input-descr").value.trim();
    const shortDescription = document.getElementById("input-subtitle").value.trim();
    const price = parseFloat(document.getElementById("input-price").value);
    const quantity = parseInt(document.getElementById("input-quantity").value);
    const categoryId = parseInt(document.getElementById("input-category").value);
    const rawColors = document.getElementById("input-colors").value;
    const colors = rawColors
        .split(",")
        .map(c => c.trim())
        .filter(c => c.length > 0);

    if (!name || !description || isNaN(price) || isNaN(quantity) || isNaN(categoryId)) {
        alert("Заполните все обязательные поля!");
        return;
    }

    if (colors.length === 0) {
        colors.push("Нет цвета");
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    formData.append("shortDescription", shortDescription);
    formData.append("price", price);
    formData.append("quantity", quantity);
    formData.append("categoryId", categoryId);
    formData.append("colors", colors.join(","));

    const imageFile = document.getElementById("input-img").files[0];
    if (imageFile) {
        formData.append("image", imageFile);
    }

    const method = editingProductId ? "PUT" : "POST";
    const url = editingProductId ? `${API_URL}/${editingProductId}` : API_URL;

    try {
        const response = await fetch(url, {
            method,
            headers: { "Authorization": `Bearer ${token}` },
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Ошибка при сохранении товара:", errorText);
            alert(`Ошибка: ${errorText}`);
            return;
        }

        document.getElementById("add-product-form").reset();
        document.getElementById("form-title").innerText = "Добавление товара:";
        document.querySelector(".add-product").innerText = "Добавить товар +";
        editingProductId = null;
        loadProducts();
    } catch (error) {
        console.error("Ошибка запроса:", error);
        alert("Произошла ошибка при сохранении товара.");
    }
}

// 📌 Удаление товара
async function deleteProduct(productId) {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("Вы не авторизованы!");
        return;
    }

    if (!confirm("Вы уверены, что хотите удалить этот товар?")) return;

    const response = await fetch(`${API_URL}/${productId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
    });

    if (response.status === 401) {
        alert("Ошибка авторизации! Пожалуйста, войдите в систему заново.");
        return;
    }

    loadProducts();
}

// 📌 Обработчики событий
document.addEventListener("DOMContentLoaded", async () => {
    await loadCategories();
    await loadProducts();
    document.querySelector(".add-product").addEventListener("click", saveProduct);
});
