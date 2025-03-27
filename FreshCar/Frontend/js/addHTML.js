export async function loadHTML(elementId, url) {
    const el = document.getElementById(elementId);
    if(!el) {
        console.error(`Элемент #${elementId} не найден!`);
        return;
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Ошибка загрузки ${url}: ${response.statusText}`);
        }
        el.innerHTML = await response.text();
    } catch (error) {
        console.error(error);
    }
}

export function addHeader() {
    loadHTML('header', '/html/header.html');
}

export function addFooter() {
    loadHTML('footer', '/html/footer.html');
}