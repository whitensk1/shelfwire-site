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
  let openCat = null;
  let openItem = null;
  let ignoreHash = false;

  const esc = (s) =>
    String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  /** Shareable URL for one work: https://worklab.page/#work/horbi/horbi-1 */
  function workShareUrl(catId, itemId) {
    const u = new URL(window.location.href);
    u.search = "";
    u.hash = `work/${encodeURIComponent(catId)}/${encodeURIComponent(itemId)}`;
    return u.toString();
  }

  function parseRoute() {
    const raw = (location.hash || "").replace(/^#/, "").trim();
    if (!raw) return null;

    // #work/catId/itemId
    let m = raw.match(/^work\/([^/]+)\/([^/?#]+)/i);
    if (m) {
      return {
        catId: decodeURIComponent(m[1]),
        itemId: decodeURIComponent(m[2]),
      };
    }
    // #w=itemId  or  #item=itemId
    m = raw.match(/^(?:w|item)=([^&?#]+)/i);
    if (m) return { catId: null, itemId: decodeURIComponent(m[1]) };

    // #itemId only if it matches a known work
    if (/^[\w.-]+$/.test(raw) && findWork(null, raw)) {
      return { catId: null, itemId: raw };
    }
    return null;
  }

  function findWork(catId, itemId) {
    const cats = data.categories || [];
    if (catId) {
      const cat = cats.find((c) => c.id === catId);
      if (!cat) return null;
      const item = (cat.items || []).find((x) => x.id === itemId);
      return item ? { cat, item } : null;
    }
    for (const cat of cats) {
      const item = (cat.items || []).find((x) => x.id === itemId);
      if (item) return { cat, item };
    }
    return null;
  }

  function setRoute(catId, itemId) {
    const next = itemId
      ? `#work/${encodeURIComponent(catId)}/${encodeURIComponent(itemId)}`
      : catId
        ? `#board/${encodeURIComponent(catId)}`
        : "";
    if (location.hash === next || (location.hash === "" && next === "")) return;
    ignoreHash = true;
    if (next) history.replaceState(null, "", next);
    else history.replaceState(null, "", location.pathname + location.search);
    requestAnimationFrame(() => {
      ignoreHash = false;
    });
  }

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

  function select(id, scroll, after) {
    if (!id) return;
    const cat = (data.categories || []).find((c) => c.id === id);
    if (!cat) return;

    if (id === activeId) {
      if (scroll) $("gallery")?.scrollIntoView({ behavior: "smooth", block: "start" });
      if (after) after(cat);
      return;
    }

    const go = () => {
      stage.classList.remove("is-leave");
      fill(cat);
      requestAnimationFrame(() => {
        stage.classList.add("is-open");
        if (after) after(cat);
      });
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
        const share = workShareUrl(cat.id, item.id);
        return `
      <article class="card" style="--i:${i}" data-id="${esc(item.id)}" data-cat="${esc(cat.id)}" data-share="${esc(share)}">
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
    openCat = cat;
    openItem = item;
    sheetCat.textContent = cat.title;
    sheetTitle.textContent = item.title;
    sheetBlurb.textContent = item.blurb || "";

    const productLink = $("sheet-link");
    const siteLink = $("sheet-site");
    const pinLink = $("sheet-pin");
    const copyBtn = $("sheet-copy");

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
    if (siteLink) {
      const isHorbi =
        cat.id === "horbi" ||
        /horbi|hörbi|h\u00f6rbi/i.test(cat.title || "") ||
        /horbi|hörbi/i.test(item.title || "") ||
        Boolean(item.site);
      if (isHorbi || item.site) {
        siteLink.href = item.site || "https://horbi.org/";
        siteLink.hidden = false;
        siteLink.textContent = "Official site →";
      } else {
        siteLink.hidden = true;
      }
    }
    if (pinLink) {
      if (item.pinterest_url) {
        pinLink.href = item.pinterest_url;
        pinLink.hidden = false;
      } else {
        pinLink.hidden = true;
      }
    }
    if (copyBtn) {
      copyBtn.hidden = false;
      copyBtn.textContent = "Copy link";
      copyBtn.dataset.url = workShareUrl(cat.id, item.id);
    }

    sheetVideo.pause();
    sheetVideo.removeAttribute("src");
    const poster = item.poster || item.image || "";
    if (poster) sheetVideo.poster = poster;
    else sheetVideo.removeAttribute("poster");
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
    setRoute(cat.id, item.id);
  }

  function closeSheet() {
    overlay.classList.remove("open");
    sheetVideo.pause();
    sheetVideo.removeAttribute("src");
    document.body.style.overflow = "";
    const catId = openCat?.id || activeId;
    openCat = null;
    openItem = null;
    // keep board context in URL without a work id
    setRoute(catId || null, null);
  }

  async function copyShareLink() {
    const btn = $("sheet-copy");
    if (!btn || !openCat || !openItem) return;
    const url = workShareUrl(openCat.id, openItem.id);
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      btn.textContent = "Copied!";
      setTimeout(() => {
        if (btn) btn.textContent = "Copy link";
      }, 1600);
    } catch {
      // last resort: prompt so user can still copy
      window.prompt("Copy this link:", url);
    }
  }

  function openFromRoute() {
    if (ignoreHash) return;
    const route = parseRoute();
    if (!route || !route.itemId) return;
    const found = findWork(route.catId, route.itemId);
    if (!found) return;

    select(found.cat.id, true, () => {
      openSheet(found.cat, found.item);
    });
  }

  $("sheet-close")?.addEventListener("click", closeSheet);
  $("sheet-close-2")?.addEventListener("click", closeSheet);
  $("sheet-copy")?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    copyShareLink();
  });
  overlay?.addEventListener("click", (e) => {
    if (e.target === overlay) closeSheet();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeSheet();
  });
  window.addEventListener("hashchange", () => {
    if (ignoreHash) return;
    const route = parseRoute();
    if (route && route.itemId) openFromRoute();
    else if (overlay?.classList.contains("open")) closeSheet();
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

  // Deep link first, else open first board with works
  const route = parseRoute();
  if (route && route.itemId) {
    openFromRoute();
  } else {
    const firstWithItems =
      (data.categories || []).find((c) => (c.items || []).length) ||
      data.categories?.[0];
    if (firstWithItems) select(firstWithItems.id);
  }
})();
