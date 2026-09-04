const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-button");
const menuLinks = document.querySelectorAll(".site-header nav a");
const downloadLinks = document.querySelectorAll('a[download]');
const toast = document.querySelector(".download-toast");

const setMenuOpen = (open) => {
  header?.classList.toggle("open", open);
  menuButton?.setAttribute("aria-expanded", String(open));
  menuButton?.setAttribute("aria-label", open ? "Close menu" : "Open menu");
};

menuButton?.addEventListener("click", () => {
  setMenuOpen(!header.classList.contains("open"));
});

menuLinks.forEach((link) => link.addEventListener("click", () => setMenuOpen(false)));

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && header?.classList.contains("open")) {
    setMenuOpen(false);
    menuButton?.focus();
  }
});

window.matchMedia("(min-width: 981px)").addEventListener("change", (event) => {
  if (event.matches) setMenuOpen(false);
});

const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealItems = document.querySelectorAll(".reveal");

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("visible"));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -45px" });

  revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index % 3, 2) * 80}ms`;
    observer.observe(item);
  });
}

downloadLinks.forEach((link) => link.addEventListener("click", () => {
  toast.classList.add("show");
  window.clearTimeout(window.elWifiToastTimer);
  window.elWifiToastTimer = window.setTimeout(() => toast.classList.remove("show"), 4500);
}));

if (!reducedMotion) {
  const visual = document.querySelector(".hero-visual");
  const menu = document.querySelector(".menu-mockup");
  visual?.addEventListener("pointermove", (event) => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    const bounds = visual.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    menu.style.transform = `rotate(2.5deg) perspective(900px) rotateY(${x * 5}deg) rotateX(${y * -5}deg)`;
  });
  visual?.addEventListener("pointerleave", () => {
    menu.style.transform = "rotate(2.5deg) perspective(900px) rotateY(0) rotateX(0)";
  });
}
