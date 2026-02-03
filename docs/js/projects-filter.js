document.addEventListener("DOMContentLoaded", () => {
    const pills = document.querySelectorAll(".filter-pill");
    const cards = document.querySelectorAll(".project-card");

    let activeTags = new Set();

    function applyFilter() {
        cards.forEach((card) => {
            const tags = JSON.parse(card.dataset.tags || "[]").map(t => t.toLowerCase());

            // Project must have ALL selected tags
            let matches = true;
            activeTags.forEach(activeTag => {
                if (!tags.includes(activeTag.toLowerCase())) {
                    matches = false;
                }
            });

            card.style.display = (activeTags.size === 0 || matches) ? "" : "none";
        });
    }

    pills.forEach((pill) => {
        pill.addEventListener("click", () => {
            const tag = pill.dataset.tag;

            if (activeTags.has(tag)) {
                activeTags.delete(tag);
                pill.classList.remove("active");
            } else {
                activeTags.add(tag);
                pill.classList.add("active");
            }

            applyFilter();
        });
    });
});
