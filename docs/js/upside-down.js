try {
  document.documentElement.classList.toggle("upside-down",
    localStorage.getItem("upside-down") === "true");
} catch {
  // The toggle still works on this page when storage is unavailable.
}

document.addEventListener("click", (event) => {
  if (!event.target.closest("a.runaway")) return;
  event.preventDefault();
  const enabled = document.documentElement.classList.toggle("upside-down");
  try {
    localStorage.setItem("upside-down", String(enabled));
  } catch {}
});
