/* ── Video recommendations ──────────────────────────────────────────────
   Edit this list to change the videos under the hero. They render in the
   order written here.

   url    Any YouTube link works (youtu.be/…, watch?v=…, /embed/…).
          A ?start= or &t= timestamp is picked up and honoured.
   name   Person's full name.
   title  Designation and company.

   Videos must be UNLISTED on YouTube — Private ones cannot be embedded.
   Leave the list empty and the whole section removes itself cleanly.
   ────────────────────────────────────────────────────────────────────── */
const VIDEO_RECS = [
  {
    url:   "https://www.youtube.com/embed/K-8ACnmvkjk?start=3",
    name:  "Yoriko Ueda",
    title: "CEO, Venturas",
  },
  {
    url:   "https://www.youtube.com/embed/tRZK1X-M6Kg",
    name:  "Takahiro Tsukamoto",
    title: "Engineering Lead, ZUU Corp",
  },
];

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
  modalBody.innerHTML = figure.querySelector("blockquote").innerHTML.trim();
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

// video recommendations (edit the VIDEO_RECS list at the top of this file)
(function () {
  const section = document.getElementById("video-recs");
  const grid = document.getElementById("vidrecGrid");
  if (!section || !grid) return;

  // pull the 11-char id out of any YouTube url shape
  function ytId(url) {
    if (typeof url !== "string") return null;
    const m = url.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/|\/live\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
  }

  // keep a ?start=12 / &t=42s timestamp if the link carries one
  function ytStart(url) {
    const m = String(url).match(/[?&](?:start|t)=(\d+)s?/);
    return m ? parseInt(m[1], 10) : 0;
  }

  const items = (VIDEO_RECS || [])
    .map((r) => ({
      id: ytId(r && r.url),
      start: ytStart(r && r.url),
      name: (r && r.name) || "",
      title: (r && r.title) || "",
    }))
    .filter((r) => r.id);

  // nothing configured yet -> drop the section so the live site never shows an empty block
  if (!items.length) {
    section.remove();
    const navLink = document.querySelector('.nav__links a[href="#video-recs"]');
    if (navLink) navLink.remove();
    console.warn("[video-recs] No valid YouTube links in VIDEO_RECS — section hidden.");
    return;
  }

  const playIcon =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>';

  grid.innerHTML = items
    .map(
      (r) => `
      <button class="vcard" type="button" data-id="${r.id}">
        <span class="vcard__thumb">
          <img src="https://i.ytimg.com/vi/${r.id}/maxresdefault.jpg"
               data-fallback="https://i.ytimg.com/vi/${r.id}/hqdefault.jpg"
               alt="" loading="lazy" />
          <span class="vcard__badge">Video</span>
          <span class="vcard__play">${playIcon}</span>
        </span>
        <span class="vcard__meta"><b></b><span></span></span>
      </button>`
    )
    .join("");

  // names/titles go in as text, never as markup
  grid.querySelectorAll(".vcard").forEach((el, i) => {
    el.querySelector(".vcard__meta b").textContent = items[i].name;
    el.querySelector(".vcard__meta span").textContent = items[i].title;
    el.setAttribute("aria-label", `Play video recommendation from ${items[i].name}`);
    el.addEventListener("click", () => openVideo(items[i]));
  });

  // maxresdefault only exists for HD uploads; fall back to the always-present hqdefault
  grid.querySelectorAll(".vcard__thumb img").forEach((img) => {
    img.addEventListener("error", () => {
      if (img.dataset.fallback) {
        img.src = img.dataset.fallback;
        delete img.dataset.fallback;
      }
    });
  });

  const vm = document.getElementById("vidModal");
  const vmFrame = document.getElementById("vidModalFrame");
  const vmName = document.getElementById("vidModalName");
  const vmRole = document.getElementById("vidModalRole");
  let lastFocus = null;

  // the player is only built on click, so the page never loads YouTube up front
  function openVideo(item) {
    lastFocus = document.activeElement;

    const frame = document.createElement("iframe");
    frame.src =
      `https://www.youtube-nocookie.com/embed/${item.id}?autoplay=1&rel=0&playsinline=1` +
      (item.start ? `&start=${item.start}` : "");
    frame.allow = "accelerometer; autoplay; encrypted-media; picture-in-picture; fullscreen";
    frame.allowFullscreen = true;
    frame.title = `Video recommendation from ${item.name}`;
    vmFrame.replaceChildren(frame);
    vmName.textContent = item.name;
    vmRole.textContent = item.title;
    vm.classList.add("open");
    vm.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    vm.querySelector(".modal__close").focus();
  }

  function closeVideo() {
    vm.classList.remove("open");
    vm.setAttribute("aria-hidden", "true");
    vmFrame.replaceChildren(); // tearing out the iframe is what stops the audio
    document.body.style.overflow = "";
    if (lastFocus) lastFocus.focus();
  }

  vm.querySelectorAll("[data-vclose]").forEach((el) => el.addEventListener("click", closeVideo));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && vm.classList.contains("open")) closeVideo();
  });
})();

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

// experience timeline: each block builds in only when scrolled to it
const tlObs = new IntersectionObserver(
  (entries) => {
    // reveal one at a time, in document order, with a small stagger if several cross at once
    const fresh = entries
      .filter((en) => en.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
    fresh.forEach((en, i) => {
      const el = en.target;
      setTimeout(() => el.classList.add("in"), i * 180);
      tlObs.unobserve(el);
    });
  },
  { threshold: 0, rootMargin: "0px 0px -45% 0px" }
);
document.querySelectorAll(".tl").forEach((el) => tlObs.observe(el));

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
