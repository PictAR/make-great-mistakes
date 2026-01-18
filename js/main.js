/* ========== Mobile nav toggle (robust + scroll-safe + API) ========== */
(function () {
  const btn = document.querySelector(".hamburger");
  const panel = document.getElementById("mobile-menu");
  if (!btn || !panel) return;

  let scrollY = 0;

  function isOpen() {
    return btn.getAttribute("aria-expanded") === "true";
  }

  function lockScroll() {
    scrollY = window.scrollY || 0;
    document.body.classList.add("no-scroll");
    document.body.style.top = `-${scrollY}px`;
  }

  function unlockScroll() {
    document.body.classList.remove("no-scroll");
    const y = Math.abs(parseInt(document.body.style.top || "0", 10)) || scrollY;
    document.body.style.top = "";
    window.scrollTo({ top: y, behavior: "auto" });
  }

  function open({ restoreFocus = false } = {}) {
    if (isOpen()) return;
    panel.hidden = false;
    panel.setAttribute("aria-hidden", "false");
    btn.setAttribute("aria-expanded", "true");
    lockScroll();
    if (restoreFocus) btn.focus({ preventScroll: true });
  }

  function close({ restoreFocus = false } = {}) {
    if (!isOpen()) return;
    panel.hidden = true;
    panel.setAttribute("aria-hidden", "true");
    btn.setAttribute("aria-expanded", "false");
    unlockScroll();
    if (restoreFocus) btn.focus({ preventScroll: true });
  }

  btn.addEventListener("click", (e) => {
    e.preventDefault();
    isOpen() ? close() : open();
  });

  // Close when a link inside is tapped
  panel.addEventListener("click", (e) => {
    if (e.target.closest("a")) close();
  });

  // Close on Escape
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isOpen()) close({ restoreFocus: true });
  });

  // Close when clicking outside
  document.addEventListener("click", (e) => {
    if (!isOpen()) return;
    if (e.target.closest("#mobile-menu") || e.target.closest(".hamburger"))
      return;
    close();
  });

  // bfcache safety
  window.addEventListener("pageshow", () => {
    panel.hidden = true;
    panel.setAttribute("aria-hidden", "true");
    btn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("no-scroll");
    document.body.style.top = "";
  });

  // Expose for modal to close menu
  window.GMMenu = { open, close, isOpen };
})();

/* ========== Header height → CSS var + helper ========== */

function setHeaderHeightVar() {
  const header = document.querySelector(".header");
  const h = header ? Math.ceil(header.getBoundingClientRect().height) : 64;
  document.documentElement.style.setProperty("--header-h", `${h}px`);
  return h;
}
window.addEventListener("resize", setHeaderHeightVar, { passive: true });
document.addEventListener("DOMContentLoaded", setHeaderHeightVar);
setHeaderHeightVar();

/* ========== Smooth-scroll offset for sticky header (dynamic) ========== */

document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener("click", (e) => {
    const id = a.getAttribute("href");
    if (!id || id === "#") return;
    const el = document.querySelector(id);
    if (!el) return;

    e.preventDefault();
    const header = document.querySelector(".header");
    const headerH = header
      ? Math.ceil(header.getBoundingClientRect().height)
      : 64;

    const y = el.getBoundingClientRect().top + window.scrollY - headerH;
    window.scrollTo({ top: y, behavior: "smooth" });
  });
});

/* ========== Footer year ========== */

document
  .getElementById("year")
  ?.appendChild(document.createTextNode(new Date().getFullYear()));

/* ========== Video poster → robust YouTube embed ========== */

function getYouTubeId(input) {
  if (!input) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
  const patterns = [
    /youtu\.be\/([a-zA-Z0-9_-]{11})/, // youtu.be/ID
    /[?&]v=([a-zA-Z0-9_-]{11})/, // ?v=ID
    /\/embed\/([a-zA-Z0-9_-]{11})/, // /embed/ID
    /\/shorts\/([a-zA-Z0-9_-]{11})/, // /shorts/ID
  ];
  for (const re of patterns) {
    const m = String(input).match(re);
    if (m && m[1]) return m[1];
  }
  return null;
}

(function initVideoEmbeds() {
  const posters = document.querySelectorAll(".video-poster");
  if (!posters.length) return;

  posters.forEach((poster) => {
    const raw = poster.getAttribute("data-yt");
    const id = getYouTubeId(raw);

    function loadPlayer() {
      if (!id) {
        if (raw) window.open(raw, "_blank", "noopener");
        return;
      }
      poster.innerHTML = `
        <iframe
          class="yt"
          src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&modestbranding=1&rel=0&playsinline=1"
          title="Great Mistakes — Video"
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture; web-share"
          referrerpolicy="strict-origin-when-cross-origin"
          allowfullscreen></iframe>
      `;
    }

    poster.style.cursor = "pointer";
    poster.addEventListener("click", (e) => {
      e.preventDefault();
      loadPlayer();
    });
  });
})();

/* ========== Shows accordion (stable: no height animation) ========== */
(function showsAccordion() {
  const toggle = document.querySelector(".shows-toggle");
  const panel = document.getElementById("shows-panel");
  if (!toggle || !panel) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let anim = null;

  function openPanel() {
    if (!panel.hidden) return;
    panel.hidden = false;
    toggle.setAttribute("aria-expanded", "true");

    if (reduce) return;

    anim?.cancel?.();
    anim = panel.animate(
      [
        { opacity: 0, transform: "translateY(-6px)", filter: "blur(2px)" },
        { opacity: 1, transform: "translateY(0)", filter: "blur(0)" },
      ],
      { duration: 220, easing: "cubic-bezier(.2,.8,.2,1)" },
    );
  }

  function closePanel() {
    if (panel.hidden) return;

    if (reduce) {
      panel.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      return;
    }

    anim?.cancel?.();
    anim = panel.animate(
      [
        { opacity: 1, transform: "translateY(0)", filter: "blur(0)" },
        { opacity: 0, transform: "translateY(-6px)", filter: "blur(2px)" },
      ],
      { duration: 180, easing: "cubic-bezier(.4,0,.2,1)" },
    );
    anim.onfinish = () => {
      panel.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
    };
  }

  toggle.addEventListener("click", () => {
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    expanded ? closePanel() : openPanel();
  });

  if (location.hash === "#shows") openPanel();
})();

/* ========== Shows loader (Upcoming + Past) ========== */

(async function loadShows() {
  const tbody = document.getElementById("shows-body");
  const empty = document.getElementById("shows-empty");
  if (!tbody) return;

  const src = "assets/data/shows.json";

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const parseDate = (iso) => {
    // Treat YYYY-MM-DD as local date (avoids timezone shifting)
    if (!iso) return null;
    return new Date(`${iso}T00:00:00`);
  };

  const esc = (s) =>
    String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");

  const rowHTML = (it) => {
    const ticketCell = it.tickets
      ? `<a class="ticket" href="${esc(
          it.tickets,
        )}" target="_blank" rel="noopener">Tickets</a>`
      : "—";

    return `
      <tr>
        <td>${esc(it.date || "")}</td>
        <td>${esc(it.time || "")}</td>
        <td>${esc(it.venue || "")}</td>
        <td>${esc(it.city || "")}</td>
        <td>${esc(it.with || "")}</td>
        <td>${ticketCell}</td>
      </tr>
    `;
  };

  const groupRow = (label) => `
    <tr class="shows-group">
      <td colspan="6">${label}</td>
    </tr>
  `;

  try {
    const res = await fetch(src, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const items = await res.json();

    if (!Array.isArray(items) || items.length === 0) {
      tbody.innerHTML = "";
      empty && (empty.hidden = false);
      return;
    }

    // Split + sort
    const upcoming = [];
    const past = [];

    for (const it of items) {
      const d = parseDate(it.date);
      if (!d || isNaN(d)) continue;
      (d >= today ? upcoming : past).push(it);
    }

    upcoming.sort((a, b) => parseDate(a.date) - parseDate(b.date));
    past.sort((a, b) => parseDate(b.date) - parseDate(a.date));

    let html = "";
    if (upcoming.length) {
      html += groupRow("Upcoming");
      html += upcoming.map(rowHTML).join("");
    }
    if (past.length) {
      html += groupRow("Past");
      html += past.map(rowHTML).join("");
    }

    tbody.innerHTML = html;
    empty && (empty.hidden = upcoming.length + past.length > 0);
  } catch (err) {
    console.warn("Failed to load shows:", err);
    tbody.innerHTML = "";
    empty && (empty.hidden = false);
  }
})();

/* ========== Listen modal ========== */

(function listenModal() {
  const modal = document.getElementById("listen-modal");
  const trigger = document.querySelector(".listen-trigger");
  if (!modal || !trigger) return;

  let lastFocus = null;

  function open() {
    if (!modal.hidden) return;

    if (window.GMMenu?.isOpen?.()) {
      window.GMMenu.close({ restoreFocus: false });
    }
    lastFocus = document.activeElement;

    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    trigger.setAttribute("aria-expanded", "true");

    // Lock scroll using your existing menu lock style (safe)
    const y = window.scrollY || 0;
    document.body.classList.add("no-scroll");
    document.body.style.top = `-${y}px`;
    modal.dataset.scrollY = String(y);

    // Focus first link
    modal.querySelector(".modal-link")?.focus({ preventScroll: true });
  }

  function close() {
    if (modal.hidden) return;

    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    trigger.setAttribute("aria-expanded", "false");

    // Restore scroll
    const y = parseInt(modal.dataset.scrollY || "0", 10);
    document.body.classList.remove("no-scroll");
    document.body.style.top = "";
    window.scrollTo({ top: isNaN(y) ? 0 : y, behavior: "auto" });

    lastFocus?.focus?.({ preventScroll: true });
  }

  trigger.addEventListener("click", open);

  modal.addEventListener("click", (e) => {
    if (
      e.target.matches("[data-modal-close]") ||
      e.target.closest("[data-modal-close]")
    )
      close();
    // Clicking any link closes it too (optional, but feels right)
    if (e.target.closest(".modal-link")) close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) close();
  });

  // Back/forward cache safety
  window.addEventListener("pageshow", () => {
    modal.hidden = true;
    modal.setAttribute("aria-hidden", "true");
    trigger.setAttribute("aria-expanded", "false");
  });
})();

/* ========== Press loader ========== */

(async function loadPress() {
  const scroller = document.getElementById("press-scroller");
  if (!scroller) return;

  const src = scroller.getAttribute("data-press-src");
  if (!src) return;

  try {
    const res = await fetch(src, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const items = await res.json();

    if (!Array.isArray(items) || items.length === 0) {
      scroller.innerHTML = `<a class="press-card" role="listitem" href="#" tabindex="-1" style="pointer-events:none;opacity:.8">
        <div class="press-outlet">Press</div>
        <blockquote class="press-quote">No reviews yet. Check back soon.</blockquote>
        <span class="press-cta">Read <i class="fa-solid fa-arrow-up-right-from-square"></i></span>
      </a>`;
      return;
    }

    // sort newest first if dates exist
    items.sort((a, b) => {
      const da = Date.parse(a.date || 0);
      const db = Date.parse(b.date || 0);
      return isNaN(db) - isNaN(da) || db - da;
    });

    const frag = document.createDocumentFragment();

    items.forEach((it) => {
      const outlet = (it.outlet || "Review").toUpperCase();
      const url = it.url || "#";
      const quote = it.quote || "";
      const logo = it.logo;

      const a = document.createElement("a");
      a.className = "press-card";
      a.role = "listitem";
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";

      // outlet block (supports optional logo)
      const outletDiv = document.createElement("div");
      outletDiv.className = "press-outlet";
      if (logo) {
        const img = document.createElement("img");
        img.src = logo;
        img.alt = outlet;
        img.className = "press-outlet-logo";
        outletDiv.appendChild(img);
      } else {
        outletDiv.textContent = outlet;
      }

      const block = document.createElement("blockquote");
      block.className = "press-quote";
      block.textContent = `“${quote.replace(/(^“|”$)/g, "")}”`;

      const cta = document.createElement("span");
      cta.className = "press-cta";
      cta.innerHTML = `Read <i class="fa-solid fa-arrow-up-right-from-square"></i>`;

      a.appendChild(outletDiv);
      a.appendChild(block);
      a.appendChild(cta);

      frag.appendChild(a);
    });

    scroller.innerHTML = "";
    scroller.appendChild(frag);
  } catch (err) {
    console.warn("Failed to load press:", err);
    scroller.innerHTML = `<a class="press-card" role="listitem" href="#" tabindex="-1" style="pointer-events:none;opacity:.8">
      <div class="press-outlet">Press</div>
      <blockquote class="press-quote">Couldn’t load reviews right now.</blockquote>
      <span class="press-cta">Read <i class="fa-solid fa-arrow-up-right-from-square"></i></span>
    </a>`;
  }
})();

/* ========== Press accordion (animated height) ========== */

(function pressAccordion() {
  const toggle = document.querySelector(".press-toggle");
  const panel = document.getElementById("press-panel");
  if (!toggle || !panel) return;

  let animating = false;

  function openPanel() {
    if (!panel.hidden) return;
    panel.hidden = false;
    const start = 0;
    const end = panel.scrollHeight;

    panel.style.height = start + "px";
    panel.style.opacity = "0";

    const duration = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? 1
      : 350;

    animating = true;
    panel.animate(
      [
        { height: start + "px", opacity: 0, filter: "blur(2px)" },
        { height: end + "px", opacity: 1, filter: "blur(0)" },
      ],
      { duration, easing: "cubic-bezier(.2,.8,.2,1)" },
    ).onfinish = () => {
      panel.style.height = "";
      panel.style.opacity = "";
      toggle.setAttribute("aria-expanded", "true");
      animating = false;
    };
  }

  function closePanel() {
    if (panel.hidden) return;
    const start = panel.scrollHeight;
    const end = 0;

    panel.style.height = start + "px";

    const duration = window.matchMedia("(prefers-reduced-motion: reduce)")
      .matches
      ? 1
      : 320;

    animating = true;
    panel.animate(
      [
        { height: start + "px", opacity: 1, filter: "blur(0)" },
        { height: end + "px", opacity: 0, filter: "blur(2px)" },
      ],
      { duration, easing: "cubic-bezier(.4,0,.2,1)" },
    ).onfinish = () => {
      panel.style.height = "";
      panel.hidden = true;
      toggle.setAttribute("aria-expanded", "false");
      animating = false;
    };
  }

  toggle.addEventListener("click", () => {
    if (animating) return;
    const expanded = toggle.getAttribute("aria-expanded") === "true";
    expanded ? closePanel() : openPanel();
  });

  // Optional: open on hash #press
  if (location.hash === "#press") {
    openPanel();
    setTimeout(() => {
      const y = panel.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: y, behavior: "smooth" });
    }, 20);
  }

  /* ========== Parallax background (page-wide, mobile-safe) ========== */
  (function parallaxBg() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const strength = 0.06;
    const maxShift = 140;

    const y = window.scrollY || document.documentElement.scrollTop || 0;
    const shift = Math.min(maxShift, Math.round(y * strength));

    document.documentElement.style.setProperty("--bg-y", `${shift}px`);

    let ticking = false;

    function update() {
      ticking = false;
      if (reduce.matches) return;
      if (document.body.classList.contains("no-scroll")) return;

      const y = window.scrollY || 0;
      const shift = Math.min(maxShift, Math.round(y * strength));
      document.documentElement.style.setProperty("--bg-y", `${-shift}px`);
    }

    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    update();
    reduce.addEventListener?.("change", update);
  })();
})();
