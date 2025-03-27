import { addHeader, addFooter } from "/js/addHTML.js";
import { cartCounter, saveCart, getCart } from "/js/cartCounter.js";
import * as auth from "/js/authorization.js";
import { createCard } from "/js/createCard.js";

const API_URL = "http://localhost:5064/api"; // Укажи свой API

document.addEventListener("DOMContentLoaded", () => {
    addHeader();
    addFooter();
    loadProducts();
    cartCounter();
    setupAccountButton();
});

const CATALOG = document.querySelector(".catalog__block");
const COUNT_SHOW_CARDS_CLICK = 5;

let productsData = [];
const activeBtn = { osvezovace: true, naplne: false, doplnky: false };
let cartArray = [];

// 📌 Проверка токена при нажатии на кнопку "Кабинет"
function setupAccountButton() {
    const accountBtn = document.getElementById("account-btn");
    if (!accountBtn) return;

    accountBtn.addEventListener("click", () => {
        const token = localStorage.getItem("token");

        if (token) {
            window.location.href = "/html/account/profile.html";
        } else {
            auth.showAuthForm();
        }
    });
}

// 📌 Загрузка товаров из API
async function loadProducts() {
    try {
        const response = await fetch(`${API_URL}/products`);
        if (!response.ok) throw new Error("Ошибка загрузки товаров");

        productsData = await response.json();
        updateCatalog();
    } catch (error) {
        console.error("Ошибка загрузки товаров:", error);
    }
}

function updateCatalog() {
    changeCategoryCards();
    setTimeout(() => {
        cartCounter();
    }, 100);
}

// 📌 Фильтрация товаров по категории
function changeCategoryCards() {
    CATALOG.innerHTML = "";
    if (activeBtn.osvezovace) {
        createCard(productsData.filter(p => p.categoryId === 1), "Osvěžovače", CATALOG);
    } else if (activeBtn.naplne) {
        createCard(productsData.filter(p => p.categoryId === 2), "Náplně", CATALOG);
    } else if (activeBtn.doplnky) {
        createCard(productsData.filter(p => p.categoryId === 3), "Doplňky", CATALOG);
    }
}

// 📌 Закрытие формы авторизации
document.addEventListener("DOMContentLoaded", () => {
    const AUTHORIZATION_CLOSE_BTN = document.querySelector(".authorization__close-btn");
    if (AUTHORIZATION_CLOSE_BTN) {
        AUTHORIZATION_CLOSE_BTN.addEventListener("click", () => {
            auth.hideAuthForm();
        });
    }
});

// 📌 Обработчики кнопок категорий
const categoryBtn = document.querySelectorAll(".catalog__categories__btn");

categoryBtn.forEach(btn => {
    btn.addEventListener("click", () => {
        categoryBtn.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        activeCatalogBtn(activeBtn);
        updateCatalog();
    });
});

// 📌 Выбор активной кнопки категории
function activeCatalogBtn(o) {
    categoryBtn.forEach(btn => {
        if (btn.classList.contains("active")) {
            const id = btn.getAttribute("id");
            switch (id) {
                case "osvezovace":
                    o.osvezovace = true;
                    o.naplne = false;
                    o.doplnky = false;
                    break;
                case "naplne":
                    o.osvezovace = false;
                    o.naplne = true;
                    o.doplnky = false;
                    break;
                case "doplnky":
                    o.osvezovace = false;
                    o.naplne = false;
                    o.doplnky = true;
                    break;
            }
        }
    });
}
