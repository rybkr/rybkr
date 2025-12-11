document.addEventListener("DOMContentLoaded", () => {
    const pills = document.querySelectorAll(".filter-pill");
    const cards = document.querySelectorAll(".project-card");
    const searchInput = document.getElementById("project-search");

    let activeTag = null;
    let searchTerm = "";

    function applyFilters() {
        cards.forEach((card) => {
            const tags = JSON.parse(card.dataset.tags || "[]");
            const text = card.textContent.toLowerCase();

            const matchesTag = !activeTag || tags.includes(activeTag);
            const matchesSearch = !searchTerm || text.includes(searchTerm);

            card.style.display = matchesTag && matchesSearch ? "" : "none";
        });
    }

    pills.forEach((pill) => {
        pill.addEventListener("click", () => {
            const tag = pill.dataset.tag;

            if (activeTag === tag) {
                activeTag = null;
                pills.forEach((p) => p.classList.remove("active"));
            } else {
                activeTag = tag;
                pills.forEach((p) => p.classList.remove("active"));
                pill.classList.add("active");
            }

            applyFilters();
        });
    });

    if (searchInput) {
        searchInput.addEventListener("input", () => {
            searchTerm = searchInput.value.trim().toLowerCase();
            applyFilters();
        });
    }
});
