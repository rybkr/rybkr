document.addEventListener("DOMContentLoaded", () => {
    const pills = document.querySelectorAll(".filter-pill");
    const cards = document.querySelectorAll(".project-card");
    const noResults = document.getElementById("no-results");
    const projectCount = document.querySelector("[data-project-count]");

    let activeTags = new Set();

    function formatCount(count) {
        return `${count} ${count === 1 ? "project" : "projects"}`;
    }

    function applyFilter() {
        let visibleCount = 0;

        cards.forEach((card) => {
            const tags = JSON.parse(card.dataset.tags || "[]").map(t => t.toLowerCase());

            // Project must have ALL selected tags
            let matches = true;
            activeTags.forEach(activeTag => {
                if (!tags.includes(activeTag.toLowerCase())) {
                    matches = false;
                }
            });

            const visible = activeTags.size === 0 || matches;
            card.style.display = visible ? "" : "none";
            if (visible) visibleCount++;
        });

        if (noResults) {
            noResults.style.display = (activeTags.size > 0 && visibleCount === 0) ? "" : "none";
        }

        if (projectCount) {
            projectCount.textContent = activeTags.size > 0
                ? `${formatCount(visibleCount)} shown`
                : formatCount(cards.length);
        }
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
