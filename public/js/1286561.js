(function() {
  const init = () => {
    const toggles = document.querySelectorAll(".navbar-toggle");
    toggles.forEach(function(toggle) {
      toggle.addEventListener("click", function() {
        const header = toggle.closest("header");
        if (!header) return;
        const menu = header.querySelector(".navbar-menu");
        if (menu) {
          menu.classList.toggle("hidden");
        }
      });
    });
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();