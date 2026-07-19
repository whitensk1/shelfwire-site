(() => {
  "use strict";

  const data = window.SHELFWIRE_CATALOG;
  if (!data) {
    console.error("catalog.js not loaded");
    return;
  }

  const rail = document.getElementById("rail");
  const stage = document.getElementById("stage");
  const stageHead = document.getElementById("stage-head");
  const fan = document.getElementById("fan");
  const modal = document.getElementById("modal");
  const modalVideo = document.getElementById("modal-video");
  const modalTitle = document.getElementById("modal-title");
  const modalBlurb = document.getElementById("modal-blurb");
  const modalCat = document.getElementById("modal-cat");
  const modalLink = document.getElementById("modal-link");
  const modalClose = document.getElementById("modal-close");

  let activeId = null;
  let collapseTimer = null;

  function esc(s) {
    return String(s ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderRail() {
    rail.innerHTML = data.categories
      .map(
        (c) => `
      <button type="button" class="folder" data-id="${esc(c.id)}"
        style="--folder-accent:${esc(c.accent || "#3ecf8e")}">
        <span class="fe">${esc(c.emoji || "📁")}</span>
        <div class="ft">${esc(c.title)}</div>
        <div class="fb">${esc(c.blurb || "")}</div>
        <div class="fc">${(c.items || []).length} clips</div>
      </button>`
      )
      .join("");

    rail.querySelectorAll(".folder").forEach((btn) => {
      btn.addEventListener("mouseenter", () => openCategory(btn.dataset.id, false));
      btn.addEventListener("click", () => openCategory(btn.dataset.id, true));
      btn.addEventListener("focus", () => openCategory(btn.dataset.id, false));
    });
  }

  function openCategory(id, force) {
    if (!id) return;
    if (id === activeId && !force) return;

    const cat = data.categories.find((c) => c.id === id);
    if (!cat) return;

    // collapse current
    if (activeId && activeId !== id) {
      stage.classList.add("collapsing");
      stage.classList.remove("open");
      clearTimeout(collapseTimer);
      collapseTimer = setTimeout(() => {
        stage.classList.remove("collapsing");
        fillFan(cat);
        stage.classList.add("open");
      }, 280);
    } else {
      fillFan(cat);
      requestAnimationFrame(() => stage.classList.add("open"));
    }

    activeId = id;
    rail.querySelectorAll(".folder").forEach((b) => {
      b.classList.toggle("active", b.dataset.id === id);
    });
  }

  function fillFan(cat) {
    stage.style.setProperty("--cat-accent", cat.accent || "#3ecf8e");
    stageHead.innerHTML = `
      <div>
        <h2>${esc(cat.emoji || "")} ${esc(cat.title)}</h2>
        <p>${esc(cat.blurb || "")}</p>
      </div>`;

    const items = cat.items || [];
    if (!items.length) {
      fan.innerHTML = `<div class="stage-empty">No product clips in this collection yet.<br><span style="font-size:0.85em;opacity:0.8">Add videos in <code>js/catalog.js</code> and files under <code>media/</code>.</span></div>`;
      return;
    }

    fan.innerHTML = items
      .map(
        (item, i) => `
      <article class="clip" data-item="${esc(item.id)}" data-cat="${esc(cat.id)}" style="--i:${i}">
        ${
          item.video
            ? `<video src="${esc(item.video)}" ${item.poster ? `poster="${esc(item.poster)}"` : ""} muted loop playsinline preload="metadata"></video>`
            : `<div class="poster"></div>`
        }
        <div class="shade"></div>
        <div class="play" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
        </div>
        <div class="meta">
          <h3>${esc(item.title)}</h3>
          <p>${esc(item.blurb || "")}</p>
        </div>
      </article>`
      )
      .join("");

    fan.querySelectorAll(".clip").forEach((el) => {
      const video = el.querySelector("video");
      el.addEventListener("mouseenter", () => {
        if (video) {
          video.play().catch(() => {});
        }
      });
      el.addEventListener("mouseleave", () => {
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
      });
      el.addEventListener("click", () => {
        const item = items.find((x) => x.id === el.dataset.item);
        if (item) openModal(cat, item);
      });
    });
  }

  function openModal(cat, item) {
    modalCat.textContent = cat.title;
    modalTitle.textContent = item.title;
    modalBlurb.textContent = item.blurb || "";
    if (item.link) {
      modalLink.href = item.link;
      modalLink.style.display = "";
    } else {
      modalLink.style.display = "none";
    }
    modalVideo.pause();
    modalVideo.removeAttribute("src");
    if (item.poster) modalVideo.poster = item.poster;
    if (item.video) {
      modalVideo.src = item.video;
      modalVideo.load();
      modalVideo.play().catch(() => {});
    }
    modal.classList.add("open");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("open");
    modalVideo.pause();
    modalVideo.removeAttribute("src");
    document.body.style.overflow = "";
  }

  modalClose.addEventListener("click", closeModal);
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });

  // init
  const nameEl = document.getElementById("site-name");
  const tagEl = document.getElementById("site-tagline");
  if (nameEl) nameEl.textContent = data.siteName || "Shelfwire";
  if (tagEl) tagEl.textContent = data.tagline || "";

  renderRail();
  if (data.categories[0]) openCategory(data.categories[0].id, true);
})();
