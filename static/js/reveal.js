if (!matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const blocks = document.querySelector("main").querySelectorAll(":scope > :not(ul, ol), li");
  blocks.forEach((block, index) => {
    const opacity = getComputedStyle(block).opacity;
    const animation = block.animate(
      [{ opacity: 0, transform: "translateY(0.5rem)" }, { opacity, transform: "none" }],
      { duration: 500, delay: index * 150, easing: "ease-out", fill: "backwards" }
    );
    block.addEventListener("focusin", () => animation.cancel(), { once: true });
  });
}
