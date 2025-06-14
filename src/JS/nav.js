// nav.js (Vite ile import edin)
document.addEventListener("DOMContentLoaded", () => {
  const navLinks = document.querySelectorAll(".list-item1 a");

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      if (!link.hash) {
        // # içermeyen linkler için
        e.preventDefault();
        window.location.href = link.getAttribute("href");
      }
    });
  });
});
