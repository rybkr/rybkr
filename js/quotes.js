const quotes = [
    { text: "Ideas are bulletproof.", author: "Alan Moore" },
];

document.addEventListener("DOMContentLoaded", () => {
    if (!quotes) {
        return;
    }
    const { text, author } = quotes[Math.floor(Math.random() * quotes.length)];

    const subtitleEl = document.querySelector(".quarto-title .subtitle");
    if (subtitleEl) {
        subtitleEl.innerHTML = `
            <span class="quote-line">“${text}”</span><br>
            <span class="quote-author">-${author}</span>
        `;
    subtitleEl.classList.add("quote-fade");
}});
