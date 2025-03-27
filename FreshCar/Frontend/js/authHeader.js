const waitForElement = (selector, callback) => {
    const el = document.querySelector(selector);
    if (el) return callback(el);
    const observer = new MutationObserver(() => {
        const el = document.querySelector(selector);
        if (el) {
            observer.disconnect();
            callback(el);
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });
};

waitForElement("#account-btn", () => {
    const token = localStorage.getItem("token");
    const accountBtn = document.getElementById("account-btn");

    if (token) {
        accountBtn.href = "/html/account/profile.html";
    } else {
        accountBtn.href = "#";
        accountBtn.addEventListener("click", (e) => {
            e.preventDefault();
            const authBlock = document.querySelector(".authorization");
            if (authBlock) {
                authBlock.style.display = "block";
            }
        });
    }
});
