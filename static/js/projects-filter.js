document.addEventListener("DOMContentLoaded", () => {
    const pills = document.querySelectorAll(".filter-pill");
    const cards = document.querySelectorAll(".project-card");
    const noResults = document.getElementById("no-results");
    const projectCount = document.querySelector("[data-project-count]");

    const activeTagsByGroup = new Map();

    function activeGroups() {
        return Array.from(activeTagsByGroup.values()).filter(tags => tags.size > 0);
    }

    function formatCount(count) {
        return `${count} ${count === 1 ? "project" : "projects"}`;
    }

    function applyFilter() {
        let visibleCount = 0;
        const selectedGroups = activeGroups();

        cards.forEach((card) => {
            const tags = JSON.parse(card.dataset.tags || "[]").map(t => t.toLowerCase());

            // OR within a filter row, AND across rows.
            const matches = selectedGroups.every(groupTags => {
                return Array.from(groupTags).some(activeTag => tags.includes(activeTag.toLowerCase()));
            });

            const visible = selectedGroups.length === 0 || matches;
            card.style.display = visible ? "" : "none";
            if (visible) visibleCount++;
        });

        if (noResults) {
            noResults.style.display = (selectedGroups.length > 0 && visibleCount === 0) ? "" : "none";
        }

        if (projectCount) {
            projectCount.textContent = selectedGroups.length > 0
                ? `${formatCount(visibleCount)} shown`
                : formatCount(cards.length);
        }
    }

    pills.forEach((pill) => {
        pill.addEventListener("click", () => {
            const tag = pill.dataset.tag;
            const group = pill.dataset.filterGroup || "default";
            const activeTags = activeTagsByGroup.get(group) || new Set();

            if (activeTags.has(tag)) {
                activeTags.delete(tag);
                pill.classList.remove("active");
                pill.setAttribute("aria-pressed", "false");
            } else {
                activeTags.add(tag);
                pill.classList.add("active");
                pill.setAttribute("aria-pressed", "true");
            }

            if (activeTags.size > 0) {
                activeTagsByGroup.set(group, activeTags);
            } else {
                activeTagsByGroup.delete(group);
            }

            applyFilter();
        });
    });
});
