// year
document.getElementById("year").textContent = new Date().getFullYear();

// nav shadow on scroll
const nav = document.getElementById("nav");
const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 30);
onScroll();
window.addEventListener("scroll", onScroll, { passive: true });

// mobile menu
const burger = document.getElementById("burger");
const links = document.querySelector(".nav__links");
burger.addEventListener("click", () => links.classList.toggle("open"));
links.addEventListener("click", (e) => {
  if (e.target.tagName === "A") links.classList.remove("open");
});

// typewriter role
const roles = [
  "Technical Consultant",
  "Software Engineer",
  "Backend Engineer · Go",
  "Microservices & FinTech",
  "Distributed Systems",
];
const typed = document.getElementById("typed");
let ri = 0, ci = 0, deleting = false;
function tick() {
  const word = roles[ri];
  typed.textContent = word.slice(0, ci);
  if (!deleting && ci < word.length) {
    ci++;
  } else if (deleting && ci > 0) {
    ci--;
  } else if (!deleting && ci === word.length) {
    deleting = true;
    return setTimeout(tick, 1600);
  } else if (deleting && ci === 0) {
    deleting = false;
    ri = (ri + 1) % roles.length;
  }
  setTimeout(tick, deleting ? 45 : 85);
}
tick();

// recommendation modal
const modal = document.getElementById("recModal");
const modalPic = document.getElementById("recModalPic");
const modalName = document.getElementById("recModalName");
const modalRole = document.getElementById("recModalRole");
const modalBody = document.getElementById("recModalBody");

function openModal(figure) {
  const pic = figure.querySelector(".quote__pic");
  const cap = figure.querySelector("figcaption");
  modalPic.src = pic.src;
  modalPic.alt = pic.alt;
  modalName.textContent = cap.querySelector("b").textContent;
  modalRole.textContent = cap.querySelector("span").textContent;
  modalBody.textContent = figure.querySelector("blockquote").textContent.trim();
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}
function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}
document.querySelectorAll(".quote").forEach((fig) => {
  const btn = fig.querySelector(".quote__more");
  if (btn) btn.textContent = "See more →";
  fig.addEventListener("click", () => openModal(fig));
});
modal.querySelectorAll("[data-close]").forEach((el) => el.addEventListener("click", closeModal));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("open")) closeModal();
});

// reveal on scroll
const io = new IntersectionObserver(
  (entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        en.target.classList.add("in");
        io.unobserve(en.target);
      }
    });
  },
  { threshold: 0.12 }
);
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));

// count-up stats
function animateCount(el) {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || "";
  const dur = 1400;
  const start = performance.now();
  function step(now) {
    const p = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    const val = Math.round(target * eased);
    el.textContent = val + (p === 1 ? suffix : "");
    if (p < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}
const statObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        animateCount(en.target);
        statObserver.unobserve(en.target);
      }
    });
  },
  { threshold: 0.6 }
);
document.querySelectorAll(".num[data-count]").forEach((el) => statObserver.observe(el));
