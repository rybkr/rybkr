function reveal() {
  const durationMs = 320;
  const delayMs    = 60;

  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.classList.remove("reveal-ready");
    return;
  }

  function animate(block, delay) {
    const opacity = getComputedStyle(block).opacity;
    const animation = block.animate(
      [{ opacity: 0, transform: "translateY(0.5rem)" }, { opacity, transform: "none" }],
      { duration: durationMs, delay, easing: "ease-out", fill: "backwards" }
    );
    block.classList.add("is-revealed");
    block.addEventListener("focusin", () => animation.cancel(), { once: true });
  }

  const resume = document.querySelector(".resume");
  if (resume) {
    const groups = new Map();
    let group;
    for (const block of resume.children) {
      if (!group || block.matches("h2, h3")) {
        group = [];
        groups.set(block, group);
      }
      group.push(block);
    }

    const observer = new IntersectionObserver((entries) => {
      let index = 0;
      for (const entry of entries) {
        // Scroll restoration can place earlier groups entirely above the viewport.
        if (!entry.isIntersecting && entry.boundingClientRect.top >= 0) continue;
        const delay = index++ * delayMs;
        groups.get(entry.target).forEach((block) => animate(block, delay));
        observer.unobserve(entry.target);
      }
    });
    groups.forEach((blocks, heading) => observer.observe(heading));
    return;
  }

  const notes = document.querySelector(".technical-notes");
  const blocks = notes
    ? notes.querySelectorAll(":scope > a, :scope > h1, .notes-content > :not(ul, ol), .notes-content > ul > li, .notes-content > ol > li")
    : document.querySelector("main").querySelectorAll(":scope > :not(ul, ol), li");
  blocks.forEach((block, index) => animate(block, index * delayMs));
}

reveal();
