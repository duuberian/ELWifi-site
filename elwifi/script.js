const header = document.querySelector(".site-header");
const menuButton = document.querySelector(".menu-button");
const toast = document.querySelector(".download-toast");
const mobile = window.matchMedia("(max-width: 700px)");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

function setMenuOpen(open) {
  header.classList.toggle("open", open);
  menuButton.setAttribute("aria-expanded", String(open));
  menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}
menuButton.addEventListener("click", () =>
  setMenuOpen(!header.classList.contains("open")),
);
header
  .querySelectorAll("nav a")
  .forEach((link) => link.addEventListener("click", () => setMenuOpen(false)));
document.addEventListener("click", (event) => {
  if (!header.contains(event.target)) setMenuOpen(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && header.classList.contains("open")) {
    setMenuOpen(false);
    menuButton.focus();
  }
});
mobile.addEventListener("change", (event) => {
  if (!event.matches) {
    if (document.activeElement === menuButton)
      header.querySelector("nav a").focus();
    setMenuOpen(false);
  } else if (header.querySelector("nav").contains(document.activeElement)) {
    menuButton.focus();
  }
});
let toastTimer;
document.querySelectorAll("a[download]").forEach((link) => {
  link.addEventListener("click", () => {
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 5500);
  });
});
document.querySelectorAll('a[href="#launch-faq"]').forEach((link) => link.addEventListener("click", () => {
  const warning = document.querySelector("#launch-faq");
  warning.open = true;
  warning.querySelector("summary").focus({ preventScroll: true });
}));

// Local, editable simulation: nothing is submitted, persisted, or sent.
const networks = {
  cafe: { title: "Coffee first. Wi-Fi next.", description: "Settle in. Your connection is on us.", eyebrow: "A MOMENT TO YOURSELF", icon: "#i-coffee", name: "Café Guest" },
  airport: { title: "A connection before takeoff.", description: "A little browsing before boarding.", eyebrow: "WHERE TO NEXT?", icon: "#i-plane", name: "Airport Free" },
  hotel: { title: "Make yourself at home.", description: "Unpack, unwind, and get online.", eyebrow: "YOU’VE ARRIVED", icon: "#i-hotel", name: "Hotel Guest" },
};
const desktop = document.querySelector(".desktop");
const action = document.querySelector("#demo-action");
const fill = document.querySelector("#demo-fill");
const status = document.querySelector("#demo-status");
const notification = document.querySelector(".demo-notification");
const form = document.querySelector("#portal-form");
const nameInput = document.querySelector("#demo-name");
const emailInput = document.querySelector("#demo-email");
let selectedNetwork = "cafe";
let state = "detecting";
let visible = false;
let phaseTimer;
let demoAnimation;

function updateClock() {
  const now = new Date();
  const clock = document.querySelector("#demo-clock");
  clock.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  clock.dateTime = now.toISOString();
}
updateClock();
setInterval(updateClock, 1000);

function announce(message) {
  status.textContent = message;
  document.querySelector("#demo-caption").textContent = message;
}
function setState(next) {
  state = next;
  desktop.dataset.state = next;
}
// Networks change only through the picker; interaction never races a timer.
function startNetwork(key) {
  clearTimeout(phaseTimer);
  demoAnimation?.cancel();
  selectedNetwork = key;
  const network = networks[key];
  setState("detecting");
  desktop.dataset.network = key;
  notification.hidden = true;
  fill.disabled = false;
  fill.firstChild.textContent = "Fill";
  form.reset();
  nameInput.readOnly = emailInput.readOnly = false;
  document.querySelector("#demo-fields").hidden = false;
  document.querySelector("#success-content").hidden = true;
  action.querySelector("span").textContent = "Connect";
  document.querySelector("#venue-icon-use").setAttribute("href", network.icon);
  for (const [id, value] of Object.entries({ "portal-title": network.title, "portal-description": network.description, "portal-eyebrow": network.eyebrow, "network-name": network.name })) {
    document.getElementById(id).textContent = value;
  }
  document.querySelector("#notification-title").textContent = "Wi-Fi login detected";
  document.querySelector("#notification-text").textContent = `${network.name} · Ready to fill`;
  document.querySelectorAll("[data-network]").forEach((button) => {
    if (button.tagName === "BUTTON") button.setAttribute("aria-pressed", String(button.dataset.network === key));
  });
  announce("Looking for a Wi-Fi login…");
  if (!reducedMotion.matches) {
    demoAnimation = document.querySelector(".portal-window").animate(
      [{ opacity: 0, translate: "0 8px" }, { opacity: 1, translate: "0 0" }],
      { duration: 400, easing: "ease-out" },
    );
  }
  phaseTimer = setTimeout(() => {
    setState("detected");
    notification.hidden = false;
    announce("Login detected. Click Fill to try ELWifi.");
  }, 1100);
}
fill.addEventListener("click", () => {
  if (state !== "detected") return;
  clearTimeout(phaseTimer);
  setState("filling");
  fill.disabled = true;
  fill.firstChild.textContent = "Filling";
  nameInput.readOnly = emailInput.readOnly = true;
  nameInput.value = "Jordan Hayes";
  phaseTimer = setTimeout(() => {
    emailInput.value = "j.hayes@example.com";
    nameInput.readOnly = emailInput.readOnly = false;
    setState("filled");
    fill.firstChild.textContent = "Filled";
    document.querySelector("#notification-title").textContent = "Ready when you are";
    document.querySelector("#notification-text").textContent = "Demo details filled. You’re in control.";
    announce("Filled privately. Review, then connect.");
    action.focus({ preventScroll: true });
  }, reducedMotion.matches ? 0 : 450);
});
form.addEventListener("submit", (event) => {
  event.preventDefault();
  if (state === "connected") {
    startNetwork(selectedNetwork);
    return;
  }
  if (state === "filling") return;
  clearTimeout(phaseTimer);
  setState("connected");
  notification.hidden = true;
  document.querySelector("#demo-fields").hidden = true;
  document.querySelector("#success-content").hidden = false;
  action.querySelector("span").textContent = "Try again";
  announce("Demo complete. No real connection made.");
});
document.querySelectorAll("button[data-network]").forEach((button) => {
  button.addEventListener("click", () => startNetwork(button.dataset.network));
});
reducedMotion.addEventListener("change", () => {
  demoAnimation?.cancel();
});
document.addEventListener("visibilitychange", updateClock);
new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting;
}, { threshold: 0.25 }).observe(desktop);
startNetwork("cafe");

// Original pen sketches of places that commonly offer guest Wi-Fi.
const dockPlaces = [
  { id: "cafe", name: "Café", path: "M6 12 23 11 22 23Q15 28 8 23ZM23 13c10-3 9 10 0 8M5 28q10 2 20-1M11 8c-4-4 4-4 1-7M18 7c-3-3 3-4 1-6", echo: "M7 14 9 23q6 4 12 0" },
  { id: "airport", name: "Airport", path: "m3 14 26-10-9 25-5-10-12-5ZM15 19 29 4M6 23l-3 4m8-3-5 6", echo: "m5 14 10 4L27 6" },
  { id: "office", name: "Office", path: "m7 29-1-24 18-2 1 26M3 29l26 1M13 29l-1-7 7-1 1 8M10 9l3-.3m5-.5 3-.3M10 15l3-.3m5-.5 3-.3", echo: "M8 6 9 27M7 4l17-2" },
  { id: "hotel", name: "Hotel", path: "M4 27 5 13m23 14-1-12M5 22l23-1M5 17l22-1v5M9 17v-5l7 1v4M7 7l-1-5m0 2 5-.4m0-2 .5 5M16 5l10-1", echo: "M7 23 26 22M17 14l8-.5" },
  { id: "library", name: "Library", path: "M16 8Q9 3 3 6l1 20q6-3 12 1 6-5 13-3L28 4Q22 3 16 8Zm0 0v19M7 11l5 1m-5 4 5 1M20 10l5-2m-5 7 5-2", echo: "M2 8 3 28q7-3 13 1l14-3" },
  { id: "station", name: "Station", path: "M8 3q8-2 16 0l1 19q-8 4-18 0ZM8 8l16-1M8 16l16-1M11 20h1m8-1h1M11 25l-5 6m15-6 5 5M9 28h14", echo: "M10 4 22 3M9 17l13-1" },
];
const dockTrack = document.querySelector(".cafe-dock-track");
let placeIndex = 0;
let dockMoving = false;
function makePlaceTile(index) {
  const place = dockPlaces[index % dockPlaces.length];
  const tile = document.createElement("span");
  tile.className = "cafe-tile";
  tile.dataset.place = place.id;
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 32 34");
  svg.setAttribute("aria-hidden", "true");
  for (const [i, drawing] of [place.path, place.echo].entries()) {
    const path = document.createElementNS(svg.namespaceURI, "path");
    path.setAttribute("d", drawing);
    if (i) path.setAttribute("class", "pencil-echo");
    svg.append(path);
  }
  const label = document.createElement("small");
  label.textContent = place.name;
  tile.append(svg, label);
  return tile;
}
for (let slot = 0; slot < 3; slot++) {
  const tile = makePlaceTile(placeIndex++);
  tile.style.transform = `translateX(${slot * 68}px)`;
  dockTrack.append(tile);
}
async function rotatePlaceDock() {
  if (dockMoving || reducedMotion.matches || !visible || document.hidden || dockTrack.matches(":hover")) return;
  dockMoving = true;
  const outgoing = dockTrack.firstElementChild;
  try {
    await outgoing.animate([
      { transform: "translate(0, 0) scale(1)", opacity: 1 },
      { transform: "translate(-12px, 7px) scale(0.65)", opacity: 0 },
    ], { duration: 180, easing: "ease-in", fill: "forwards" }).finished;
    outgoing.remove();
    const remaining = [...dockTrack.children];
    remaining.forEach((tile, slot) => {
      tile.style.transform = `translateX(${slot * 68}px)`;
      tile.animate([
        { transform: `translateX(${(slot + 1) * 68}px)` },
        { transform: `translateX(${slot * 68 - 3}px)` },
        { transform: `translateX(${slot * 68}px)` },
      ], { duration: 420, easing: "cubic-bezier(.22,1,.36,1)" });
    });
    const incoming = makePlaceTile(placeIndex++);
    incoming.style.transform = "translateX(136px)";
    dockTrack.append(incoming);
    await incoming.animate([
      { transform: "translate(154px, 12px) scale(0.65)", opacity: 0 },
      { transform: "translate(136px, -7px) scale(1.06)", opacity: 1, offset: 0.55 },
      { transform: "translate(136px, 2px) scale(0.98)", offset: 0.8 },
      { transform: "translate(136px, 0) scale(1)", opacity: 1 },
    ], { duration: 520, easing: "ease-out" }).finished;
  } finally {
    dockMoving = false;
  }
}
setInterval(rotatePlaceDock, 1000);

// Optional enhancement: vendored MIT Rough Notation. Core functionality never
// depends on this import or on Google Fonts being available.
async function setupAnnotations() {
  try {
    const { annotate } =
      await import("./assets/vendor/rough-notation-0.5.1.esm.js");
    await document.fonts.ready;
    const annotations = [];
    const elements = document.querySelectorAll(
      ".drawn-underline, .drawn-circle",
    );
    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) => {
              entries.forEach((entry) => {
                if (!entry.isIntersecting) return;
                const item = annotations.find(
                  (item) => item.element === entry.target,
                );
                if (item) item.annotation.show();
                observer.unobserve(entry.target);
              });
            },
            { threshold: 0.8 },
          )
        : null;
    elements.forEach((element) => {
      const circle = element.classList.contains("drawn-circle");
      const annotation = annotate(element, {
        type: circle ? "circle" : "underline",
        color: circle ? "#de927e" : "#d99872",
        strokeWidth: 2,
        padding: circle ? 5 : 4,
        iterations: 2,
        animationDuration: 650,
        animate: !reducedMotion.matches,
      });
      annotations.push({ element, annotation });
      if (circle) {
        element.addEventListener("pointerenter", (event) => {
          if (event.pointerType === "touch" || reducedMotion.matches) return;
          annotation.hide();
          annotation.show();
        });
      }
      if (observer) observer.observe(element);
      else annotation.show();
    });
    document.documentElement.classList.add("annotations-ready");
    reducedMotion.addEventListener("change", () => {
      annotations.forEach(({ annotation }) => {
        const showing = annotation.isShowing();
        annotation.hide();
        annotation.animate = !reducedMotion.matches;
        if (showing) annotation.show();
      });
    });
    // Rough Notation observes element resizing internally, including font and
    // responsive line changes. Its generated SVGs are decorative.
    document
      .querySelectorAll(".rough-annotation")
      .forEach((svg) => svg.setAttribute("aria-hidden", "true"));
  } catch {
    // The CSS underline remains a functional, static fallback.
  }
}
setupAnnotations();

// A gentle pull toward the pointer, with no rotation or layout changes.
const identityArt = document.querySelector(".privacy-art");
const identityCard = document.querySelector(".identity-card");
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
let cardFrame;
function resetIdentityCard() {
  cancelAnimationFrame(cardFrame);
  for (const property of ["--card-x", "--card-y", "--card-scale-x", "--card-scale-y"]) {
    identityCard.style.removeProperty(property);
  }
}
identityArt.addEventListener("pointermove", (event) => {
  if (reducedMotion.matches || !finePointer.matches || event.pointerType === "touch") return;
  const bounds = identityArt.getBoundingClientRect();
  const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
  const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
  cancelAnimationFrame(cardFrame);
  cardFrame = requestAnimationFrame(() => {
    identityCard.style.setProperty("--card-x", `${x * 7}px`);
    identityCard.style.setProperty("--card-y", `${y * 5}px`);
    identityCard.style.setProperty("--card-scale-x", String(1 + Math.abs(x) * 0.025));
    identityCard.style.setProperty("--card-scale-y", String(1 + Math.abs(y) * 0.018));
  });
});
identityArt.addEventListener("pointerleave", resetIdentityCard);
identityArt.addEventListener("pointercancel", resetIdentityCard);
reducedMotion.addEventListener("change", resetIdentityCard);
finePointer.addEventListener("change", resetIdentityCard);
