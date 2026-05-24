(function () {
  const storageKey = "senior2026-theme";
  const root = document.documentElement;
  const savedTheme = localStorage.getItem(storageKey);
  const prefersDark = window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;

  function setTheme(theme) {
    root.dataset.theme = theme;
    localStorage.setItem(storageKey, theme);
    document.querySelectorAll("[data-theme-label]").forEach((label) => {
      label.textContent = theme === "dark" ? "Light" : "Dark";
    });
  }

  setTheme(savedTheme || (prefersDark ? "dark" : "light"));

  document.addEventListener("click", (event) => {
    const themeButton = event.target.closest("[data-theme-toggle]");
    if (themeButton) {
      setTheme(root.dataset.theme === "dark" ? "light" : "dark");
    }

    const menuButton = event.target.closest("[data-menu-toggle]");
    if (menuButton) {
      const nav = document.querySelector("[data-nav-links]");
      const isOpen = nav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(isOpen));
    }
  });

  const currentPage = document.body.dataset.page;
  if (currentPage) {
    document.querySelectorAll(".nav-link").forEach((link) => {
      if (link.dataset.page === currentPage) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      }
    });
  }
})();
