document.addEventListener("DOMContentLoaded", () => {
    const input = document.getElementById("live-search");
    if (!input) {
        return;
    }
    const results = document.querySelectorAll(".search-result");

    input.addEventListener("input", () => {
        const term = input.value.trim().toLowerCase();
        results.forEach((r) => {
            const text = r.textContent.toLowerCase();
            r.style.display = !term || text.includes(term) ? "" : "none";
        });
    });
});
