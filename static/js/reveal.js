function reveal() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.classList.remove("reveal-ready");
    return;
  }

  function animate(block, delay) {
    const opacity = getComputedStyle(block).opacity;
    const animation = block.animate(
      [{ opacity: 0, transform: "translateY(0.5rem)" }, { opacity, transform: "none" }],
      { duration: 400, delay, easing: "ease-out", fill: "backwards" }
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
        if (!entry.isIntersecting) continue;
        const delay = index++ * 75;
        groups.get(entry.target).forEach((block) => animate(block, delay));
        observer.unobserve(entry.target);
      }
    });
    groups.forEach((blocks, heading) => observer.observe(heading));
    return;
  }

  const blocks = document.querySelector("main").querySelectorAll(":scope > :not(ul, ol), li");
  blocks.forEach((block, index) => animate(block, index * 75));
}

reveal();
