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
document.querySelector("#launch-help").addEventListener("click", () => {
  const warning = document.querySelector("#launch-faq");
  warning.open = true;
  warning.querySelector("summary").focus({ preventScroll: true });
});

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
const pause = document.querySelector("#demo-pause");
let selectedNetwork = "cafe";
let state = "detecting";
let paused = reducedMotion.matches;
let visible = false;
let rotationTimer;
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
function scheduleRotation() {
  clearTimeout(rotationTimer);
  if (paused || !visible || document.hidden) return;
  rotationTimer = setTimeout(() => {
    // Never replace a form while someone is editing or using its controls.
    if (desktop.contains(document.activeElement) || state === "filling") {
      scheduleRotation();
      return;
    }
    const keys = Object.keys(networks);
    startNetwork(keys[(keys.indexOf(selectedNetwork) + 1) % keys.length]);
  }, 14000);
}
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
  scheduleRotation();
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
    scheduleRotation();
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
  scheduleRotation();
});
form.addEventListener("input", scheduleRotation);
desktop.addEventListener("focusout", scheduleRotation);
document.querySelectorAll("button[data-network]").forEach((button) => {
  button.addEventListener("click", () => startNetwork(button.dataset.network));
});
function renderPause() {
  pause.setAttribute("aria-pressed", String(paused));
  pause.textContent = paused ? "Resume rotation" : "Pause rotation";
  scheduleRotation();
}
pause.addEventListener("click", () => { paused = !paused; renderPause(); });
reducedMotion.addEventListener("change", () => {
  demoAnimation?.cancel();
  if (reducedMotion.matches) { paused = true; renderPause(); }
});
document.addEventListener("visibilitychange", () => { updateClock(); scheduleRotation(); });
new IntersectionObserver(([entry]) => {
  visible = entry.isIntersecting;
  scheduleRotation();
}, { threshold: 0.25 }).observe(desktop);
renderPause();
startNetwork("cafe");

// Café-name tiles are illustrative, not official logos or partner claims.
const cafeNames = [
  { id: "starbucks", name: "STARBUCKS" },
  { id: "costa", name: "COSTA", detail: "COFFEE" },
  { id: "nero", name: "CAFFÈ", detail: "NERO" },
  { id: "pret", name: "PRET", detail: "A MANGER" },
  { id: "tims", name: "Tim", detail: "HORTONS" },
];
const dockTrack = document.querySelector(".cafe-dock-track");
let cafeIndex = 0;
let dockMoving = false;
function makeCafeTile(index) {
  const cafe = cafeNames[index % cafeNames.length];
  const tile = document.createElement("span");
  tile.className = "cafe-tile";
  tile.dataset.cafe = cafe.id;
  tile.textContent = cafe.name;
  if (cafe.detail) {
    const detail = document.createElement("small");
    detail.textContent = cafe.detail;
    tile.append(detail);
  }
  return tile;
}
for (let slot = 0; slot < 3; slot++) {
  const tile = makeCafeTile(cafeIndex++);
  tile.style.transform = `translateX(${slot * 68}px)`;
  dockTrack.append(tile);
}
async function rotateCafeDock() {
  if (dockMoving || paused || reducedMotion.matches || !visible || document.hidden) return;
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
    const incoming = makeCafeTile(cafeIndex++);
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
setInterval(rotateCafeDock, 1000);

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

// A one-pass walkthrough. Editing takes over immediately from the animation.
const profileForm = document.querySelector("#profile-demo-form");
const profileLogin = document.querySelector("#profile-login");
const profileName = document.querySelector("#profile-name");
const profileEmail = document.querySelector("#profile-email");
const profileFill = document.querySelector("#profile-fill");
let profileTimers = [];
let profileValues;
function stopProfileAnimation() {
  profileTimers.forEach(clearTimeout);
  profileTimers = [];
}
function profileLater(callback, delay) {
  profileTimers.push(setTimeout(callback, delay));
}
function revealProfileLogin() {
  stopProfileAnimation();
  profileValues = { name: profileName.value, email: profileEmail.value };
  profileForm.hidden = true;
  profileLogin.hidden = false;
  document.querySelector("#profile-step").textContent = "02 / A LOGIN APPEARS";
  if (!reducedMotion.matches) profileLogin.animate([{ opacity: 0, translate: "0 8px" }, { opacity: 1, translate: "0 0" }], { duration: 450, easing: "ease-out" });
}
function fillProfileLogin() {
  stopProfileAnimation();
  document.querySelector("#profile-result-name").textContent = profileValues.name;
  document.querySelector("#profile-result-email").textContent = profileValues.email;
  document.querySelector("#profile-result-status").textContent = "Filled from your profile. That’s it.";
  document.querySelector("#profile-step").textContent = "03 / ALREADY FILLED";
  profileFill.textContent = "Filled";
  profileFill.disabled = true;
  if (!reducedMotion.matches) document.querySelectorAll(".profile-result").forEach((field, index) => field.animate([{ background: "#dce6d6" }, { background: "#fffaf2" }], { duration: 700, delay: index * 150 }));
}
function resetProfileDemo(autoplay = false) {
  stopProfileAnimation();
  profileForm.hidden = false;
  profileLogin.hidden = true;
  profileForm.reset();
  profileFill.disabled = false;
  profileFill.textContent = "Fill";
  document.querySelector("#profile-step").textContent = "01 / YOUR PROFILE";
  document.querySelector("#profile-result-name").textContent = "Your name";
  document.querySelector("#profile-result-email").textContent = "Your email";
  document.querySelector("#profile-result-status").textContent = "One click. Your details, filled in.";
  if (!autoplay || reducedMotion.matches) return;
  let delay = 650;
  for (const [field, value] of [[profileName, "Jordan Hayes"], [profileEmail, "j.hayes@example.com"]]) {
    [...value].forEach((_, index) => { profileLater(() => { field.value = value.slice(0, index + 1); }, delay); delay += 65; });
    delay += 300;
  }
  profileLater(() => { revealProfileLogin(); profileLater(fillProfileLogin, 1800); }, delay + 800);
}
profileForm.addEventListener("focusin", stopProfileAnimation);
profileForm.addEventListener("input", stopProfileAnimation);
profileForm.addEventListener("submit", (event) => {
  event.preventDefault(); revealProfileLogin(); profileFill.focus({ preventScroll: true });
});
profileFill.addEventListener("click", fillProfileLogin);
document.querySelector("#profile-replay").addEventListener("click", () => resetProfileDemo(true));
reducedMotion.addEventListener("change", stopProfileAnimation);
const profileObserver = new IntersectionObserver(([entry]) => {
  if (entry.isIntersecting) { resetProfileDemo(true); profileObserver.disconnect(); }
}, { threshold: 0.5 });
profileObserver.observe(document.querySelector(".profile-demo"));
