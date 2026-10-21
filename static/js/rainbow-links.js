document.querySelectorAll("[data-rainbow-links]").forEach((container) => {
  const links = [...container.querySelectorAll("a")];
  links.forEach((link) => {
    const href = link.getAttribute("href");
    if (href && new URL(href, location.href).origin !== location.origin) {
      link.dataset.external = "";
    }
  });

  function update(event) {
    const link = event.target.closest("a");
    if (!links.includes(link)) return;
    const column = container.getBoundingClientRect();
    const rect = link.getBoundingClientRect();
    const y = rect.top + rect.height / 2 + window.scrollY;
    link.style.setProperty("--link-hue", y / document.documentElement.scrollHeight * 360);
    link.style.setProperty("--bar-left", `${column.left - rect.left}px`);
    link.style.setProperty("--bar-width", `${column.width}px`);
  }

  container.addEventListener("pointerover", update);
  container.addEventListener("focusin", update);
});
