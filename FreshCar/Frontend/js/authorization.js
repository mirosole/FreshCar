const API_URL = "http://localhost:5064/api";
const BG_EFFECT = document.querySelector(".bg-effect");
const AUTHORIZATION_BLOCK = document.querySelector(".authorization-block");

const GOOGLE_BUTTON = `
<div class="authorization__google">
    <div id="g_id_onload"
         data-client_id="107181197715-6svipi5n3tph0ks25k3aq1d5o69gd6un.apps.googleusercontent.com"
         data-callback="handleGoogleCredentialResponse"
         data-auto_prompt="false">
    </div>
    <div class="g_id_signin"
         data-type="standard"
         data-shape="rectangular"
         data-theme="outline"
         data-text="sign_in_with"
         data-size="large"
         data-logo_alignment="left">
    </div>
</div>
`;

const AUTH_TEMPLATES = {
    login: `
        <div class="authorization__input email">
            <h1>Email</h1>
            <input type="email" id="login-email">
        </div>
        <div class="authorization__input password">
            <div>
                <h1>Heslo</h1>
                <a href="#">Zapomněli jste heslo?</a>
            </div>
            <input type="password" id="login-password">
        </div>
        <button class="authorization__btn" id="login-btn">Přihlasit se</button>
    ` + GOOGLE_BUTTON,

    register: `
        <div class="authorization__input email">
            <h1>Email</h1>
            <input type="email" id="register-email">
        </div>
        <div class="authorization__input password">
            <h1>Heslo</h1>
            <input type="password" id="register-password">
        </div>
        <button class="authorization__btn" id="register-btn">Registrace</button>
    `
};

function changeAuthorizationBlock(type) {
    if (!AUTHORIZATION_BLOCK) return;

    AUTHORIZATION_BLOCK.innerHTML = AUTH_TEMPLATES[type];

    if (type === "login") {
        document.getElementById("login-btn").addEventListener("click", login);
    } else {
        document.getElementById("register-btn").addEventListener("click", register);
    }

    // ✅ Безопасная инициализация Google кнопки
    if (window.google && google.accounts && google.accounts.id) {
        google.accounts.id.initialize({
            client_id: "107181197715-6svipi5n3tph0ks25k3aq1d5o69gd6un.apps.googleusercontent.com",
            callback: handleGoogleCredentialResponse
        });

        google.accounts.id.renderButton(
            document.querySelector(".g_id_signin"),
            { theme: "outline", size: "large" }
        );
    } else {
        console.warn("Google Identity API ещё не загружена");
    }
}


async function login() {
    const email = document.getElementById("login-email").value;
    const password = document.getElementById("login-password").value;

    try {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const result = await res.json();

        if (res.ok) {
            localStorage.setItem("token", result.token);
            alert("Вы успешно вошли!");
            window.location.href = "/html/account/profile.html";
        } else {
            alert("Ошибка: " + result.message);
        }
    } catch (err) {
        console.error("Ошибка авторизации:", err);
    }
}

async function register() {
    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value.trim();

    if (!email || !password) return alert("Введите email и пароль!");

    try {
        const res = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password })
        });
        const result = await res.json();

        if (res.ok) {
            alert("Регистрация успешна!");
            changeAuthorizationBlock("login");
        } else {
            alert("Ошибка: " + (result.message || JSON.stringify(result.errors)));
        }
    } catch (err) {
        console.error("Ошибка регистрации:", err);
    }
}

export function authorizationBtns(authoBtn) {
    authoBtn.forEach(btn => {
        btn.addEventListener("click", () => {
            authoBtn.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            updateBgEffectPosition();
            changeAuthorizationBlock(btn.classList.contains("sign-in") ? "login" : "register");
        });
    });
}

export function updateBgEffectPosition() {
    const activeBtn = document.querySelector(".authorization-choice__btn.active");
    if (activeBtn) {
        BG_EFFECT.style.left = `${activeBtn.offsetLeft}px`;
    }
}

window.handleGoogleCredentialResponse = async function (response) {
    const idToken = response.credential;

    try {
        const res = await fetch(`${API_URL}/auth/google-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken })
        });
        const result = await res.json();

        if (res.ok) {
            localStorage.setItem("token", result.token);
            alert("Вы вошли через Google!");
            window.location.href = "/html/account/profile.html";
        } else {
            alert("Ошибка входа через Google");
        }
    } catch (err) {
        console.error("Ошибка Google авторизации:", err);
        alert("Ошибка Google авторизации");
    }
};

document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    const currentPath = window.location.pathname;

    if (token && currentPath.includes("/html/account/profile.html")) {
        window.location.href = "/html/account/profile.html";
        return;
    }

    if (!token && AUTHORIZATION_BLOCK) {
        changeAuthorizationBlock("login");
    }

    const accountBtn = document.getElementById("account-btn");
    if (accountBtn) {
        accountBtn.addEventListener("click", () => {
            const token = localStorage.getItem("token");
            if (token) {
                window.location.href = "/html/account/profile.html";
            } else {
                changeAuthorizationBlock("login");
            }
        });
    }

    const authButtons = document.querySelectorAll(".authorization-choice__btn");
    authorizationBtns(authButtons);
});

export function hideAuthForm() {
    const authForm = document.querySelector(".authorization");
    if (authForm) authForm.style.display = "none";
}

export function showAuthForm() {
    const authForm = document.querySelector(".authorization");
    if (authForm) authForm.style.display = "block";
}
