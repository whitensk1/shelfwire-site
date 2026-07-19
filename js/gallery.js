(() => {
  "use strict";

  const data = window.WORKLAB_CATALOG;
  if (!data) {
    console.error("WORKLAB_CATALOG missing — run scripts/sync_pinterest.py");
    return;
  }

  const $ = (id) => document.getElementById(id);
  const tabs = $("tabs");
  const stage = $("stage");
  const stageHead = $("stage-head");
  const grid = $("grid");
  const overlay = $("overlay");
  const sheetVideo = $("sheet-video");
  const sheetCat = $("sheet-cat");
  const sheetTitle = $("sheet-title");
  const sheetBlurb = $("sheet-blurb");
  const sheetLink = $("sheet-link");
  const heroVideo = $("hero-video");
  const syncMeta = $("sync-meta");

  let activeId = null;
  let leaveTimer = null;

  const esc = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  function firstVideo() {
    for (const c of data.categories || []) {
      for (const it of c.items || []) {
        if (it.video) return it.video;
      }
    }
    return "";
  }

  function renderTabs() {
    const cats = data.categories || [];
    if (!cats.length) {
      tabs.innerHTML = `<div class="empty" style="grid-column:auto;padding:20px;min-width:240px">No boards yet. Ask to sync Pinterest.</div>`;
      return;
    }
    tabs.innerHTML = cats
      .map((c) => {
        const n = (c.items || []).length;
        return `
        <button type="button" class="tab" data-id="${esc(c.id)}" role="tab">
          <div class="t-label">${esc(c.label || "Board")}</div>
          <div class="t-title">${esc(c.title)}</div>
          <div class="t-count">${n ? n + " works" : "Empty"}</div>
        </button>`;
      })
      .join("");

    tabs.querySelectorAll(".tab").forEach((btn) => {
      btn.addEventListener("mouseenter", () => select(btn.dataset.id));
      btn.addEventListener("focus", () => select(btn.dataset.id));
      btn.addEventListener("click", () => select(btn.dataset.id, true));
    });
  }

  function select(id, scroll) {
    if (!id || id === activeId) {
      if (scroll) $("gallery")?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const cat = (data.categories || []).find((c) => c.id === id);
    if (!cat) return;

    const go = () => {
      stage.classList.remove("is-leave");
      fill(cat);
      requestAnimationFrame(() => stage.classList.add("is-open"));
    };

    if (activeId) {
      stage.classList.remove("is-open");
      stage.classList.add("is-leave");
      clearTimeout(leaveTimer);
      leaveTimer = setTimeout(go, 220);
    } else {
      go();
    }

    activeId = id;
    tabs.querySelectorAll(".tab").forEach((t) => {
      t.classList.toggle("active", t.dataset.id === id);
    });
    if (scroll) $("gallery")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function fill(cat) {
    stageHead.innerHTML = `
      <h2>${esc(cat.title)}</h2>
      <p>${esc(cat.blurb || "")}</p>`;

    const items = cat.items || [];
    if (!items.length) {
      grid.innerHTML = `<div class="empty">Nothing in this board yet.</div>`;
      return;
    }

    grid.innerHTML = items
      .map((item, i) => {
        const hasVideo = Boolean(item.video);
        const poster = item.poster || item.image || "";
        const media = hasVideo
          ? `<video src="${esc(item.video)}" ${poster ? `poster="${esc(poster)}"` : ""} muted loop playsinline preload="metadata"></video>`
          : poster
            ? `<img class="ph" src="${esc(poster)}" alt="" />`
            : `<div class="ph"></div>`;
        return `
      <article class="card" style="--i:${i}" data-id="${esc(item.id)}" data-cat="${esc(cat.id)}">
        ${media}
        <div class="grad"></div>
        <div class="dot" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </div>
        <div class="info">
          <h3>${esc(item.title)}</h3>
          <span>${esc(item.blurb || "Work")}</span>
        </div>
      </article>`;
      })
      .join("");

    grid.querySelectorAll(".card").forEach((card) => {
      const v = card.querySelector("video");
      card.addEventListener("mouseenter", () => v && v.play().catch(() => {}));
      card.addEventListener("mouseleave", () => {
        if (!v) return;
        v.pause();
        v.currentTime = 0;
      });
      card.addEventListener("click", () => {
        const item = items.find((x) => x.id === card.dataset.id);
        if (item) openSheet(cat, item);
      });
    });
  }

  function openSheet(cat, item) {
    sheetCat.textContent = cat.title;
    sheetTitle.textContent = item.title;
    sheetBlurb.textContent = item.blurb || "";

    const productLink = $("sheet-link");
    const pinLink = $("sheet-pin");
    // Product / Wildberries (destination from Pinterest)
    if (productLink) {
      if (item.link) {
        productLink.href = item.link;
        productLink.hidden = false;
        productLink.textContent = /wildberries|wb\.ru/i.test(item.link)
          ? "Wildberries →"
          : "Product link →";
      } else {
        productLink.hidden = true;
      }
    }
    // Pin page
    if (pinLink) {
      if (item.pinterest_url) {
        pinLink.href = item.pinterest_url;
        pinLink.hidden = false;
      } else {
        pinLink.hidden = true;
      }
    }

    sheetVideo.pause();
    sheetVideo.removeAttribute("src");
    const poster = item.poster || item.image || "";
    if (poster) sheetVideo.poster = poster;
    if (item.video) {
      sheetVideo.src = item.video;
      sheetVideo.load();
      sheetVideo.play().catch(() => {});
    } else if (poster) {
      sheetVideo.removeAttribute("src");
      sheetVideo.load();
    }
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeSheet() {
    overlay.classList.remove("open");
    sheetVideo.pause();
    sheetVideo.removeAttribute("src");
    document.body.style.overflow = "";
  }

  $("sheet-close")?.addEventListener("click", closeSheet);
  $("sheet-close-2")?.addEventListener("click", closeSheet);
  overlay?.addEventListener("click", (e) => {
    if (e.target === overlay) closeSheet();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSheet();
  });

  const brand = $("brand-name");
  const h1 = $("hero-title");
  const sub = $("hero-sub");
  if (brand) brand.textContent = data.siteName || "Worklab";
  if (h1) h1.textContent = data.tagline || "";
  if (sub) sub.textContent = data.sub || "";
  if (syncMeta) {
    const when = data.syncedAt ? `Synced ${data.syncedAt}` : "";
    const src = data.pinterestProfile || "";
    syncMeta.textContent = [when, src].filter(Boolean).join(" · ");
  }

  const hv = firstVideo();
  if (heroVideo && hv) {
    heroVideo.src = hv;
    heroVideo.muted = true;
    heroVideo.loop = true;
    heroVideo.playsInline = true;
    heroVideo.play().catch(() => {});
  }

  renderTabs();
  const firstWithItems =
    (data.categories || []).find((c) => (c.items || []).length) ||
    data.categories?.[0];
  if (firstWithItems) select(firstWithItems.id);
})();
