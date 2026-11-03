/* =========================================================
   S. Kiriprasath — Developer's Scroll
   ========================================================= */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

  const root = document.documentElement;

  /* ---------- 1. Theme toggle (persisted: sumi / washi) ---------- */
  const themeToggle = $("#themeToggle");
  const applyTheme = (theme) => {
    if (theme === "light") root.setAttribute("data-theme", "light");
    else root.removeAttribute("data-theme");
    themeToggle?.setAttribute("aria-pressed", String(theme === "light"));
  };
  try {
    const saved = localStorage.getItem("scroll-theme");
    if (saved) applyTheme(saved);
  } catch (_) { /* storage unavailable */ }

  themeToggle?.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    applyTheme(next);
    try { localStorage.setItem("scroll-theme", next); } catch (_) {}
  });

  /* ---------- 2. Live clock + year ---------- */
  const yearEl = $("#currentYear");
  const clockEl = $("#liveClock");
  const updateClock = () => {
    const now = new Date();
    if (yearEl) yearEl.textContent = String(now.getFullYear());
    if (clockEl) clockEl.textContent = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  updateClock();
  setInterval(updateClock, 30_000);

  /* ---------- 3. Skill search filter ---------- */
  const skillSearch = $("#skillSearch");
  const skillCards = $$(".skill");
  const skillEmpty = $("#skillEmpty");

  skillSearch?.addEventListener("input", () => {
    const query = skillSearch.value.trim().toLowerCase();
    let visible = 0;
    skillCards.forEach((card) => {
      const match = card.textContent.toLowerCase().includes(query);
      card.classList.toggle("is-hidden", !match);
      if (match) visible += 1;
    });
    if (skillEmpty) skillEmpty.hidden = visible !== 0 || query === "";
  });

  /* ---------- 4. Project category filter ---------- */
  const filterChips = $$(".filter-chip");
  const projects = $$(".project[data-category]");

  const setFilter = (category) => {
    projects.forEach((card) => {
      const categories = (card.dataset.category || "").split(" ");
      card.hidden = category !== "all" && !categories.includes(category);
    });
    filterChips.forEach((chip) => chip.classList.toggle("is-active", chip.dataset.filter === category));
  };
  filterChips.forEach((chip) => chip.addEventListener("click", () => setFilter(chip.dataset.filter)));

  /* ---------- 5. Expand / collapse project detail ---------- */
  $$(".details-toggle").forEach((button) => {
    button.addEventListener("click", () => {
      const detail = button.nextElementSibling;
      if (!detail) return;
      const opening = detail.hidden;
      detail.hidden = !opening;
      button.setAttribute("aria-expanded", String(opening));
      button.textContent = opening ? "Less detail −" : "More detail +";
    });
  });

  /* ---------- 6. Copy email to clipboard ---------- */
  const copyBtn = $("#copyEmail");
  const copyStatus = $("#copyStatus");
  const announce = (message) => {
    if (!copyStatus) return;
    copyStatus.textContent = message;
    clearTimeout(announce.timer);
    announce.timer = setTimeout(() => { copyStatus.textContent = ""; }, 2600);
  };

  copyBtn?.addEventListener("click", async () => {
    const email = copyBtn.dataset.email || "";
    try {
      await navigator.clipboard.writeText(email);
      announce("Email address copied to clipboard.");
    } catch (_) {
      const field = document.createElement("textarea");
      field.value = email;
      field.setAttribute("readonly", "");
      Object.assign(field.style, { position: "fixed", opacity: "0", left: "-9999px" });
      document.body.appendChild(field);
      field.select();
      const ok = document.execCommand("copy");
      field.remove();
      announce(ok ? "Email address copied to clipboard." : email);
    }
  });

  /* ---------- 7. Print / export as PDF ---------- */
  $("#printBtn")?.addEventListener("click", () => {
    setFilter("all");
    $$(".project-extra").forEach((node) => { node.hidden = true; });
    $$(".details-toggle").forEach((button) => {
      button.textContent = "More detail +";
      button.setAttribute("aria-expanded", "false");
    });
    window.print();
  });
  window.addEventListener("beforeprint", () => setFilter("all"));

  /* ---------- 8. Back to top ---------- */
  $("#topButton")?.addEventListener("click", () => {
    document.getElementById("top")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  /* ---------- 9. External link safety ---------- */
  $$('a[target="_blank"]').forEach((link) => { link.rel = "noopener noreferrer"; });
})();
