/* I Vesperini · split noir — app.js
   Pure static, no libraries. Runs inside a sandboxed iframe (no same-origin):
   never touch localStorage / cookies, never alert(). */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const reduceMQ = matchMedia("(prefers-reduced-motion: reduce)");
  let reduce = reduceMQ.matches;
  const DATA = window.VS_MENU;

  /* ------------------------------------------------------------------ */
  /* toast                                                              */
  /* ------------------------------------------------------------------ */
  const toastEl = $("#toast");
  let toastT = 0;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("is-on"), 2600);
  }

  /* ------------------------------------------------------------------ */
  /* Europe/Rome clock + opening status                                 */
  /* ------------------------------------------------------------------ */
  const GIORNI = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  const GIORNI_S = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
  const MESI = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
  const romeFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  function romeNow(d = new Date()) {
    const o = {};
    for (const p of romeFmt.formatToParts(d)) o[p.type] = p.value;
    const y = +o.year, m = +o.month, day = +o.day;
    const dow = new Date(Date.UTC(y, m - 1, day)).getUTCDay();
    return { y, m, d: day, dow, min: (+o.hour % 24) * 60 + +o.minute, iso: `${o.year}-${o.month}-${o.day}` };
  }
  const hhmm = (min) => { const m = ((min % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); };

  /* open now? Intervals may run past midnight (end > 1440): those belong to the
     previous calendar day, so 00:15 on Saturday is still Friday's dinner. */
  function statusAt(now) {
    const H = DATA.hours;
    for (const [s, e] of H[now.dow]) if (now.min >= s && now.min < e) return { open: true, closes: e };
    const prev = (now.dow + 6) % 7;
    for (const [s, e] of H[prev]) if (e > 1440 && now.min + 1440 >= s && now.min + 1440 < e) return { open: true, closes: e - 1440 };
    // next opening
    for (let k = 0; k < 8; k++) {
      const dw = (now.dow + k) % 7;
      for (const [s] of H[dw]) if (k > 0 || s > now.min) return { open: false, day: k, dow: dw, at: s };
    }
    return { open: false };
  }
  function statusText(st) {
    if (st.open) return `Aperto ora · chiude alle ${hhmm(st.closes)}`;
    if (st.day === 0) return `Chiuso · apre oggi alle ${hhmm(st.at)}`;
    if (st.day === 1) return `Chiuso · apre domani alle ${hhmm(st.at)}`;
    return `Chiuso · apre ${GIORNI[st.dow]} alle ${hhmm(st.at)}`;
  }
  function paintStatus() {
    const now = romeNow();
    const st = statusAt(now);
    const txt = statusText(st);
    for (const el of $$("[data-status]")) {
      if (el.textContent !== txt) el.textContent = txt;
      el.classList.toggle("is-open", st.open);
    }
    const live = $("#liveStatus");
    live.textContent = txt;
    live.classList.toggle("is-open", st.open);
    // hours table, today highlighted
    const dl = $("#hoursList");
    const order = [2, 3, 4, 5, 6, 0, 1];
    const html = order.map((d) => {
      const iv = DATA.hours[d];
      const val = iv.length ? iv.map(([s, e]) => `${hhmm(s)}–${hhmm(e)}`).join("<br>") : "Chiuso";
      const t = d === now.dow ? " is-today" : "";
      return `<dt class="${t}">${GIORNI_S[d]}</dt><dd class="${t}">${val}</dd>`;
    }).join("");
    if (dl.innerHTML !== html) dl.innerHTML = html;
    return st;
  }
  paintStatus();
  setInterval(paintStatus, 30000);

  /* ------------------------------------------------------------------ */
  /* top bar + navigation overlay                                       */
  /* ------------------------------------------------------------------ */
  const top = $("#vsTop");
  const onScrollTop = () => top.classList.toggle("is-solid", scrollY > 40);
  addEventListener("scroll", onScrollTop, { passive: true });
  onScrollTop();

  const burger = $("#burger"), nav = $("#navPanel");
  let navT = 0;
  function openNav() {
    clearTimeout(navT);
    nav.hidden = false;
    burger.setAttribute("aria-expanded", "true");
    burger.setAttribute("aria-label", "Chiudi il menu di navigazione");
    document.body.classList.add("is-locked");
    requestAnimationFrame(() => requestAnimationFrame(() => nav.classList.add("is-open")));
    setTimeout(() => { const a = $(".vs-nav-list a", nav); a && a.focus({ preventScroll: true }); }, 60);
  }
  function closeNav(focusBurger = true) {
    nav.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
    burger.setAttribute("aria-label", "Apri il menu di navigazione");
    document.body.classList.remove("is-locked");
    navT = setTimeout(() => { nav.hidden = true; }, reduce ? 0 : 300);
    if (focusBurger) burger.focus({ preventScroll: true });
  }
  burger.addEventListener("click", () => (burger.getAttribute("aria-expanded") === "true" ? closeNav() : openNav()));
  nav.addEventListener("click", (e) => {
    const a = e.target.closest("[data-navlink]");
    if (!a) return;
    closeNav(false);
    if (a.dataset.split === "future") setTimeout(() => split.animateTo(0.16), 60);
  });

  /* ------------------------------------------------------------------ */
  /* global delegated clicks                                            */
  /* ------------------------------------------------------------------ */
  document.addEventListener("click", (e) => {
    const book = e.target.closest("[data-book]");
    if (book) {
      e.preventDefault();
      if (!nav.hidden) closeNav(false);
      booking.open({ percorso: book.hasAttribute("data-book-percorso"), opener: book });
      return;
    }
    const tabLink = e.target.closest("[data-open-tab]");
    if (tabLink) {
      menu.selectTab(tabLink.dataset.openTab, false);
      if (tabLink.dataset.openFilter) menu.setFilter(tabLink.dataset.openFilter);
      // anchor jump to #menu happens natively
      return;
    }
    const sc = e.target.closest("[data-scroll]");
    if (sc) {
      const t = $(sc.dataset.scroll);
      if (t) t.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      return;
    }
    const dead = e.target.closest('a[href="#"]');
    if (dead) { e.preventDefault(); toast("Contatto di esempio: questo locale è di fantasia."); }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!booking.el.hidden) { booking.close(); return; }
    if (!nav.hidden) closeNav();
  });

  /* ------------------------------------------------------------------ */
  /* 1 · hero liquid lens (design library: interactive-liquid-distortion)
         A full-size copy of the hero scene clipped to a tilted band. The
         band follows the pointer, leans with velocity and straightens up. */
  /* ------------------------------------------------------------------ */
  const hero = (() => {
    const stage = $("#heroStage"), scene = $("#heroScene");
    const lens = document.createElement("div");
    lens.className = "vs-lens";
    lens.setAttribute("aria-hidden", "true");
    lens.inert = true;
    const copy = scene.cloneNode(true);
    copy.removeAttribute("id");
    for (const n of copy.querySelectorAll("[id]")) n.removeAttribute("id");
    for (const n of copy.querySelectorAll("a,button")) n.setAttribute("tabindex", "-1");
    lens.appendChild(copy);
    const edgeL = document.createElement("i"), edgeR = document.createElement("i");
    edgeL.className = "vs-edge vs-edge--l"; edgeR.className = "vs-edge vs-edge--r";
    stage.append(lens, edgeL, edgeR);

    let HALF = innerWidth < 700 ? 30 : 56;
    const MAX_TILT = 38, EASE = 0.1;
    let W = stage.clientWidth, targetX = W * 0.5, x = W * 0.18, tilt = 0, raf = 0;
    let lastMove = -1e9, visible = true, t0 = performance.now();

    const place = () => {
      lens.style.setProperty("--x", x.toFixed(1) + "px");
      lens.style.setProperty("--tilt", tilt.toFixed(1) + "px");
      lens.style.setProperty("--half", HALF + "px");
      const deg = Math.atan2(tilt * 2, stage.clientHeight) * 180 / Math.PI;
      edgeL.style.left = (x - HALF) + "px";
      edgeR.style.left = (x + HALF) + "px";
      edgeL.style.transform = edgeR.style.transform = `rotate(${(-deg).toFixed(2)}deg)`;
    };
    const tick = (now) => {
      raf = 0;
      if (!visible) return;
      // idle: drift like heat over the oven mouth
      if (now - lastMove > 2600) targetX = W * (0.5 + 0.3 * Math.sin((now - t0) / 2600));
      const prev = x;
      x += (targetX - x) * EASE;
      const v = x - prev;
      tilt += (clamp(v * 3.2, -MAX_TILT, MAX_TILT) - tilt) * 0.1;
      place();
      raf = requestAnimationFrame(tick);
    };
    const start = () => { if (!raf && !reduce && visible) raf = requestAnimationFrame(tick); };

    $(".vs-hero").addEventListener("pointermove", (e) => {
      targetX = e.clientX - stage.getBoundingClientRect().left;
      lastMove = performance.now();
      start();
    });
    addEventListener("resize", () => { W = stage.clientWidth; HALF = innerWidth < 700 ? 30 : 56; place(); });
    new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) start(); }, { threshold: 0 }).observe(stage);

    function park() { x = W * 0.5; tilt = 18; place(); }
    if (reduce) park(); else { place(); start(); }
    return { park, start, get x() { return x; } };
  })();

  /* ------------------------------------------------------------------ */
  /* 2 · split: the divider really drags (mouse / touch / keys).        */
  /*     Line moves right → the past (left) opens and tells its story;  */
  /*     line moves left → the future (right) opens.                    */
  /* ------------------------------------------------------------------ */
  const split = (() => {
    const stage = $("#splitStage"), divider = $("#divider"), disc = $("#discover");
    const storyL = $("#storyL"), storyR = $("#storyR"), hint = $("#splitHint");
    const headL = $(".vs-side-head--l"), headR = $(".vs-side-head--r");
    const MIN = 0.08, MAX = 0.92, OPEN_L = 0.84, OPEN_R = 0.16;
    let p = 0.5, anim = 0, touched = false;

    function setStory(el, r) {
      el.style.setProperty("--r", r.toFixed(3));
      const live = r > 0.65;
      if (el.classList.contains("is-live") !== live) {
        el.classList.toggle("is-live", live);
        el.setAttribute("aria-hidden", live ? "false" : "true");
        for (const a of el.querySelectorAll("a")) a.tabIndex = live ? 0 : -1;
      }
    }
    function set(v) {
      p = clamp(v, MIN, MAX);
      stage.style.setProperty("--p", (p * 100).toFixed(3) + "%");
      const rL = clamp((p - 0.6) / 0.2, 0, 1), rR = clamp((0.4 - p) / 0.2, 0, 1);
      stage.style.setProperty("--rl", rL.toFixed(3));
      stage.style.setProperty("--rr", rR.toFixed(3));
      setStory(storyL, rL);
      setStory(storyR, rR);
      // the squeezed side's headline steps back so the open story reads alone
      // on phones the open story also replaces its own headline (no room for both)
      const narrow = innerWidth <= 820;
      headR.style.opacity = (Math.min(1 - rL * 0.85, narrow ? 1 - rR * 0.9 : 1)).toFixed(3);
      headL.style.opacity = (1 - rR * 0.85).toFixed(3);
      // DISCOVER is cut by the same line
      const W = stage.clientWidth, b = disc.offsetLeft, bw = disc.offsetWidth;
      disc.style.setProperty("--cut", clamp(p * W - b, 0, bw).toFixed(1) + "px");
      divider.setAttribute("aria-valuenow", String(Math.round(p * 100)));
      divider.setAttribute("aria-valuetext", p >= 0.6 ? "Il viaggio aperto" : p <= 0.4 ? "Il futuro aperto" : "Al centro");
      stage.dataset.open = p >= 0.6 ? "past" : p <= 0.4 ? "future" : "none";
    }
    function animateTo(to, dur = 460) {
      cancelAnimationFrame(anim);
      const from = p, t0 = performance.now();
      if (reduce || Math.abs(to - from) < 0.002) { set(to); return; }
      const step = (now) => {
        const k = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        set(from + (to - from) * e);
        if (k < 1) anim = requestAnimationFrame(step);
      };
      anim = requestAnimationFrame(step);
    }
    const snap = (v) => (v >= 0.62 ? OPEN_L : v <= 0.38 ? OPEN_R : 0.5);
    const firstTouch = () => { if (!touched) { touched = true; hint.classList.add("is-gone"); } };

    // pointer: anywhere on the stage (not on links/buttons). A press that never
    // travels is a click → line goes to that spot, then snaps.
    let drag = null;
    stage.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || e.target.closest("a, .vs-discover")) return;
      cancelAnimationFrame(anim);
      const onDivider = !!e.target.closest(".vs-divider");
      drag = { id: e.pointerId, x0: e.clientX, p0: p, live: onDivider, W: stage.clientWidth, left: stage.getBoundingClientRect().left };
      if (onDivider) { stage.setPointerCapture(e.pointerId); divider.classList.add("is-drag"); }
    });
    stage.addEventListener("pointermove", (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x0;
      if (!drag.live) {
        if (Math.abs(dx) < 6) return;
        drag.live = true;
        try { stage.setPointerCapture(e.pointerId); } catch (_) {}
        divider.classList.add("is-drag");
      }
      firstTouch();
      set(drag.p0 + dx / drag.W);
    });
    const end = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const d = drag; drag = null;
      divider.classList.remove("is-drag");
      if (e.type === "pointercancel") { animateTo(snap(p)); return; }
      if (!d.live) {
        // plain click on the stage: open the side that was clicked
        firstTouch();
        const fx = (e.clientX - d.left) / d.W;
        animateTo(fx < p ? (p >= 0.6 ? 0.5 : OPEN_L) : (p <= 0.4 ? 0.5 : OPEN_R));
        return;
      }
      animateTo(snap(p));
    };
    stage.addEventListener("pointerup", end);
    stage.addEventListener("pointercancel", end);

    divider.addEventListener("keydown", (e) => {
      let to = null;
      if (e.key === "ArrowLeft" || e.key === "ArrowDown") to = p - 0.04;
      else if (e.key === "ArrowRight" || e.key === "ArrowUp") to = p + 0.04;
      else if (e.key === "Home") to = OPEN_R;
      else if (e.key === "End") to = OPEN_L;
      else if (e.key === "Enter" || e.key === " ") to = 0.5;
      if (to === null) return;
      e.preventDefault();
      firstTouch();
      cancelAnimationFrame(anim);
      if (e.key.startsWith("Arrow")) set(to); else animateTo(to, 380);
    });

    disc.addEventListener("click", (e) => {
      firstTouch();
      if (p >= 0.6 || p <= 0.4) {
        const tab = p >= 0.6 ? "viaggio" : "futuro";
        menu.selectTab(tab, false);
        $("#menu").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
        return;
      }
      const r = stage.getBoundingClientRect();
      const lineX = r.left + p * r.width;
      // keyboard "click" has clientX 0 → the past first, like reading left to right
      animateTo(e.clientX && e.clientX > lineX ? OPEN_R : OPEN_L);
    });
    addEventListener("resize", () => set(p));
    set(0.5);
    return { animateTo, set, get p() { return p; } };
  })();

  /* ------------------------------------------------------------------ */
  /* 3 · scroll-scrubbed build (design library: scroll-scrubbed-sequence)
         Scroll position picks the frame; nothing plays by itself.       */
  /* ------------------------------------------------------------------ */
  const seq = (() => {
    const track = $("#seqTrack"), cv = $("#seqCv"), ctx = cv.getContext("2d");
    const steps = $$("#seqSteps li"), rail = $("#seqRail"), phaseEl = $("#seqPhase"), capEl = $("#seqCap");
    const N = 140;                                  // frames
    const BOUNDS = [0, 0.12, 0.27, 0.41, 0.55, 0.7, 0.87, 1];
    let w = 0, h = 0, shown = -1, pending = 0, raf = 0, season = null, R = null;

    const mulberry = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const ph = (t, a, b) => clamp((t - a) / (b - a), 0, 1);
    const eo = (k) => 1 - Math.pow(1 - k, 3);
    const mix = (c1, c2, k) => { const a = hex(c1), b = hex(c2); return `rgb(${Math.round(a[0] + (b[0] - a[0]) * k)},${Math.round(a[1] + (b[1] - a[1]) * k)},${Math.round(a[2] + (b[2] - a[2]) * k)})`; };
    const hex = (c) => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
    const inDisc = (rnd, rMax) => { const a = rnd() * Math.PI * 2, r = Math.sqrt(rnd()) * rMax; return [Math.cos(a) * r, Math.sin(a) * r]; };

    // Everything random is decided once per season, so frame i always looks the same.
    function build(s) {
      const rnd = mulberry(s.id.length * 977 + 31);
      const edge = Array.from({ length: 72 }, () => rnd());
      const sauceEdge = Array.from({ length: 48 }, () => rnd());
      const cheese = Array.from({ length: 10 }, () => ({ p: inDisc(rnd, 0.6), r: 0.07 + rnd() * 0.05, rot: rnd() * 6.28, k: Array.from({ length: 8 }, () => 0.8 + rnd() * 0.35) }));
      const spots = Array.from({ length: 46 }, () => ({ a: rnd() * 6.28, d: 0.86 + rnd() * 0.12, r: 0.008 + rnd() * 0.022 }));
      const tops = [];
      const kind = s.seq.kind;
      const n = kind === "primavera" ? 34 : 22;
      for (let i = 0; i < n; i++) tops.push({ p: inDisc(rnd, 0.66), rot: rnd() * 6.28, sz: 0.6 + rnd() * 0.5, v: rnd(), order: rnd() });
      tops.sort((a, b) => a.order - b.order);
      const basil = Array.from({ length: 5 }, () => ({ p: inDisc(rnd, 0.5), rot: rnd() * 6.28, sz: 0.8 + rnd() * 0.4 }));
      const flour = Array.from({ length: 70 }, () => ({ a: rnd() * 6.28, d: 0.5 + rnd() * 1.4, r: 0.4 + rnd() * 1.4, o: rnd() }));
      return { edge, sauceEdge, cheese, spots, tops, basil, flour, kind };
    }
    // smooth, closed wobble: three sines with seeded phases (0..1 range)
    const noiseAt = (arr, a) => 0.5 + 0.5 * (0.5 * Math.sin(3 * a + arr[0] * 6.283) + 0.3 * Math.sin(5 * a + arr[1] * 6.283) + 0.2 * Math.sin(11 * a + arr[2] * 6.283));
    function blobPath(cx, cy, r, arr, amp, steps = 120) {
      ctx.beginPath();
      for (let i = 0; i <= steps; i++) {
        const a = (i / steps) * Math.PI * 2, rr = r * (1 + amp * (noiseAt(arr, a) - 0.5));
        const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr;
        i ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
      }
      ctx.closePath();
    }

    function drawTopping(kind, item, cx, cy, Rp, k, bake) {
      const [ux, uy] = item.p, x = cx + ux * Rp, y = cy + uy * Rp;
      const drop = 1 + (1 - k) * 0.5;               // falls in from slightly above
      ctx.save();
      ctx.globalAlpha = k;
      ctx.translate(x, y - (1 - k) * Rp * 0.08);
      ctx.rotate(item.rot);
      ctx.scale(drop, drop);
      const u = Rp * 0.055 * item.sz;
      if (kind === "autunno") {
        if (item.v < 0.62) {                        // cardoncello slice: cap + stem
          ctx.fillStyle = mix("#9a6a3e", "#6e4424", bake);
          ctx.beginPath(); ctx.ellipse(0, -u * 0.35, u * 1.25, u * 0.75, 0, Math.PI, 0); ctx.lineTo(u * 0.45, u * 0.9); ctx.lineTo(-u * 0.45, u * 0.9); ctx.closePath(); ctx.fill();
          ctx.fillStyle = mix("#e8d6b8", "#c9a676", bake); ctx.fillRect(-u * 0.22, -u * 0.25, u * 0.44, u * 1.05);
        } else {                                    // hazelnut
          const g = ctx.createRadialGradient(-u * 0.2, -u * 0.2, 0, 0, 0, u * 0.6);
          g.addColorStop(0, "#d9a66a"); g.addColorStop(1, mix("#8f5a2a", "#5e3616", bake));
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, u * 0.55, 0, 6.283); ctx.fill();
        }
      } else if (kind === "inverno") {
        if (item.v < 0.55) {                        // friarielli: dark leafy cluster
          ctx.fillStyle = mix("#3d6e2a", "#24401a", bake);
          for (let j = 0; j < 4; j++) { ctx.beginPath(); ctx.ellipse(Math.cos(j * 1.6) * u * 0.5, Math.sin(j * 1.6) * u * 0.4, u * 0.9, u * 0.42, j * 1.6, 0, 6.283); ctx.fill(); }
        } else {                                    // sausage crumble
          ctx.fillStyle = mix("#b0573c", "#7c3422", bake);
          ctx.beginPath(); ctx.ellipse(0, 0, u * 0.75, u * 0.55, 0, 0, 6.283); ctx.fill();
          ctx.fillStyle = "rgba(255,220,190,.25)"; ctx.beginPath(); ctx.arc(-u * 0.2, -u * 0.15, u * 0.18, 0, 6.283); ctx.fill();
        }
      } else if (kind === "primavera") {
        if (item.v < 0.5) {                         // peas
          const g = ctx.createRadialGradient(-u * 0.12, -u * 0.12, 0, 0, 0, u * 0.36);
          g.addColorStop(0, "#c6e27a"); g.addColorStop(1, mix("#6e9c2c", "#557a20", bake));
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, u * 0.34, 0, 6.283); ctx.fill();
        } else if (item.v < 0.78) {                 // asparagus tip
          ctx.fillStyle = mix("#7aa23a", "#5c7e26", bake);
          ctx.beginPath(); ctx.roundRect ? ctx.roundRect(-u * 1.5, -u * 0.22, u * 3, u * 0.44, u * 0.22) : ctx.rect(-u * 1.5, -u * 0.22, u * 3, u * 0.44); ctx.fill();
          ctx.fillStyle = "#5e7f2a"; ctx.beginPath(); ctx.ellipse(u * 1.5, 0, u * 0.42, u * 0.3, 0, 0, 6.283); ctx.fill();
        } else {                                    // pecorino flake
          ctx.fillStyle = "rgba(250,244,226,.92)";
          ctx.beginPath(); ctx.moveTo(-u * 0.7, -u * 0.2); ctx.lineTo(u * 0.6, -u * 0.35); ctx.lineTo(u * 0.4, u * 0.3); ctx.lineTo(-u * 0.5, u * 0.25); ctx.closePath(); ctx.fill();
        }
      } else {                                      // estate
        if (item.v < 0.72) {                        // cherry tomato half, red or yellow
          const yellow = item.v < 0.3;
          ctx.fillStyle = yellow ? mix("#f2c230", "#d79a1c", bake) : mix("#d6371f", "#a8260f", bake);
          ctx.beginPath(); ctx.arc(0, 0, u * 0.62, 0, 6.283); ctx.fill();
          ctx.fillStyle = yellow ? "#ffe07a" : "#f07a5c"; ctx.beginPath(); ctx.arc(0, 0, u * 0.42, 0, 6.283); ctx.fill();
          ctx.fillStyle = "rgba(255,240,200,.8)";
          for (let j = 0; j < 3; j++) { ctx.beginPath(); ctx.ellipse(Math.cos(j * 2.1) * u * 0.2, Math.sin(j * 2.1) * u * 0.2, u * 0.08, u * 0.05, j * 2.1, 0, 6.283); ctx.fill(); }
        } else {                                    // anchovy fillet
          ctx.strokeStyle = mix("#9a8670", "#6e5a46", bake); ctx.lineWidth = u * 0.32; ctx.lineCap = "round";
          ctx.beginPath(); ctx.moveTo(-u * 1.4, 0); ctx.quadraticCurveTo(0, -u * 0.6, u * 1.4, 0); ctx.stroke();
          ctx.strokeStyle = "rgba(220,225,230,.45)"; ctx.lineWidth = u * 0.08;
          ctx.beginPath(); ctx.moveTo(-u * 1.2, -u * 0.06); ctx.quadraticCurveTo(0, -u * 0.62, u * 1.2, -u * 0.06); ctx.stroke();
        }
      }
      ctx.restore();
    }

    function render(i) {
      const t = i / (N - 1);
      const R0 = R;
      ctx.clearRect(0, 0, w, h);
      const mobile = w < 700;
      // desktop: sit a little below centre and a touch smaller, so the steam clears the fixed top bar
      const cx = mobile ? w * 0.5 : w * 0.6, cy = mobile ? h * 0.37 : h * 0.53;
      const Rmax = mobile ? Math.min(w * 0.4, h * 0.25) : Math.min(h * 0.345, w * 0.25);

      const s2 = eo(ph(t, BOUNDS[1], BOUNDS[2])), s3 = eo(ph(t, BOUNDS[2], BOUNDS[3])), s4 = ph(t, BOUNDS[3], BOUNDS[4]);
      const s5 = ph(t, BOUNDS[4], BOUNDS[5]), s6 = eo(ph(t, BOUNDS[5], BOUNDS[6])), s7 = eo(ph(t, BOUNDS[6], 1));
      const s1 = eo(ph(t, 0, BOUNDS[1]));

      // room + oven glow (grows during the bake)
      const g0 = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * 0.75);
      g0.addColorStop(0, "#17111b"); g0.addColorStop(1, "#060408");
      ctx.fillStyle = g0; ctx.fillRect(0, 0, w, h);
      if (s6 > 0) {
        const gg = ctx.createRadialGradient(cx, h * 1.05, 0, cx, h * 1.05, h * 0.95);
        gg.addColorStop(0, `rgba(255,120,40,${0.42 * s6 * (1 - 0.45 * s7)})`);
        gg.addColorStop(0.5, `rgba(226,104,60,${0.14 * s6 * (1 - 0.45 * s7)})`);
        gg.addColorStop(1, "rgba(226,104,60,0)");
        ctx.fillStyle = gg; ctx.fillRect(0, 0, w, h);
      }
      // the work surface: a floured steel disc
      ctx.save();
      ctx.fillStyle = "#120d14";
      ctx.beginPath(); ctx.arc(cx, cy, Rmax * 1.16, 0, 6.283); ctx.fill();
      ctx.strokeStyle = "rgba(205,176,131,.12)"; ctx.lineWidth = 1; ctx.stroke();
      ctx.restore();
      // flour dust (settles as the dough opens)
      for (const f of R0.flour) {
        const a = f.o * (0.35 + 0.4 * s1) * (1 - 0.6 * s6);
        if (a <= 0.01) continue;
        ctx.fillStyle = `rgba(245,238,225,${a.toFixed(3)})`;
        const d = Rmax * (0.25 + f.d * 0.55);
        ctx.beginPath(); ctx.arc(cx + Math.cos(f.a) * d, cy + Math.sin(f.a) * d, f.r, 0, 6.283); ctx.fill();
      }

      // dough: ball → disc
      const r = Rmax * (0.36 + 0.64 * s2);
      const crustRaw = "#efdcb6", crustBaked = "#cf8e47";
      ctx.save();
      ctx.shadowColor = "rgba(0,0,0,.65)"; ctx.shadowBlur = Rmax * 0.18; ctx.shadowOffsetY = Rmax * 0.04;
      blobPath(cx, cy, r, R0.edge, 0.06 * s2 + 0.01);
      const gd = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      const inner = mix("#f3e6c8", "#e8c58e", s6);
      gd.addColorStop(0, inner);
      gd.addColorStop(0.74 + 0.0 * s2, inner);
      gd.addColorStop(0.86, mix("#fbf1db", "#e9b16a", s6));
      gd.addColorStop(0.96, mix(crustRaw, crustBaked, s6));
      gd.addColorStop(1, mix("#d9c39a", "#9b5a26", s6));
      ctx.fillStyle = gd; ctx.fill();
      ctx.restore();
      if (s2 < 1) {                                  // the ball's volume fades as it flattens
        const ga = ctx.createRadialGradient(cx - r * 0.32, cy - r * 0.38, r * 0.05, cx, cy, r);
        ga.addColorStop(0, `rgba(255,252,244,${0.85 * (1 - s2)})`);
        ga.addColorStop(0.55, `rgba(240,226,196,${0.2 * (1 - s2)})`);
        ga.addColorStop(1, `rgba(120,96,64,${0.55 * (1 - s2)})`);
        ctx.fillStyle = ga; ctx.beginPath(); ctx.arc(cx, cy, r, 0, 6.283); ctx.fill();
      }

      // base (sauce / cream) spreads in
      if (s3 > 0) {
        const sr = r * 0.8 * s3;
        blobPath(cx, cy, sr, R0.sauceEdge, 0.1);
        const baseCol = season.seq.base;
        const gs = ctx.createRadialGradient(cx, cy, 0, cx, cy, sr);
        gs.addColorStop(0, mix(baseCol, "#ffffff", 0.12));
        gs.addColorStop(0.85, mix(baseCol, "#4a2a10", 0.08 + 0.18 * s6));
        gs.addColorStop(1, mix(baseCol, "#3a2010", 0.25 + 0.2 * s6));
        ctx.fillStyle = gs; ctx.fill();
      }
      // fior di latte
      R0.cheese.forEach((c, ci) => {
        const k = eo(clamp(s4 * 1.4 - ci / R0.cheese.length * 0.4, 0, 1));
        if (k <= 0) return;
        const cr = r * c.r * (0.4 + 0.6 * k) * (1 + 0.32 * s6);
        const x = cx + c.p[0] * r, y = cy + c.p[1] * r;
        ctx.save();
        ctx.globalAlpha = Math.min(1, k * 1.2);
        ctx.beginPath();
        // smooth blob: quadratic curves through the midpoints of 8 jittered spokes
        const pts = c.k.map((kk, j) => { const a = c.rot + j / 8 * 6.283; return [x + Math.cos(a) * cr * kk, y + Math.sin(a) * cr * kk]; });
        const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
        let m0 = mid(pts[7], pts[0]);
        ctx.moveTo(m0[0], m0[1]);
        for (let j = 0; j < 8; j++) { const m = mid(pts[j], pts[(j + 1) % 8]); ctx.quadraticCurveTo(pts[j][0], pts[j][1], m[0], m[1]); }
        ctx.closePath();
        const gc = ctx.createRadialGradient(x - cr * 0.3, y - cr * 0.3, 0, x, y, cr * 1.1);
        gc.addColorStop(0, "#fffcf4"); gc.addColorStop(1, mix("#efe4cc", "#e6c78f", s6));
        ctx.fillStyle = gc; ctx.fill();
        if (s6 > 0.2) {                              // a few blisters on the melted cheese
          ctx.fillStyle = `rgba(176,110,40,${(0.45 * (s6 - 0.2)).toFixed(3)})`;
          ctx.beginPath(); ctx.ellipse(x + cr * 0.25, y - cr * 0.1, cr * 0.16, cr * 0.1, c.rot, 0, 6.283); ctx.fill();
        }
        ctx.restore();
      });
      // season toppings, one by one
      const nt = R0.tops.length;
      R0.tops.forEach((it, ti) => {
        const k = eo(clamp(s5 * 1.5 - (ti / nt) * 0.5, 0, 1));
        if (k > 0) drawTopping(R0.kind, it, cx, cy, r, k, s6 * 0.8);
      });
      // leopard spots on the cornicione
      if (s6 > 0) {
        for (const sp of R0.spots) {
          const a = clamp(s6 * 1.6 - sp.d * 0.4, 0, 1) * 0.85;
          if (a <= 0) continue;
          const x = cx + Math.cos(sp.a) * r * sp.d, y = cy + Math.sin(sp.a) * r * sp.d;
          const g = ctx.createRadialGradient(x, y, 0, x, y, r * sp.r * 1.6);
          g.addColorStop(0, `rgba(38,20,12,${a.toFixed(3)})`); g.addColorStop(1, "rgba(38,20,12,0)");
          ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x, y, r * sp.r * 1.6, 0, 6.283); ctx.fill();
        }
      }
      // finish: basil, olive oil sheen, steam
      if (s7 > 0) {
        for (const b of R0.basil) {
          ctx.save();
          ctx.globalAlpha = s7;
          ctx.translate(cx + b.p[0] * r, cy + b.p[1] * r); ctx.rotate(b.rot);
          const u = r * 0.07 * b.sz * (0.6 + 0.4 * s7);
          ctx.fillStyle = "#3f8a2e";
          ctx.beginPath(); ctx.moveTo(-u, 0); ctx.quadraticCurveTo(0, -u * 0.8, u, 0); ctx.quadraticCurveTo(0, u * 0.8, -u, 0); ctx.fill();
          ctx.strokeStyle = "rgba(190,230,150,.5)"; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(-u * 0.85, 0); ctx.lineTo(u * 0.85, 0); ctx.stroke();
          ctx.restore();
        }
        ctx.save();
        ctx.globalAlpha = 0.35 * s7;
        ctx.strokeStyle = "#fff6d8"; ctx.lineWidth = 2; ctx.lineCap = "round";
        for (let j = 0; j < 4; j++) {
          const a0 = j * 1.7 + 0.4, rr = r * (0.3 + j * 0.1);
          ctx.beginPath(); ctx.arc(cx, cy, rr, a0, a0 + 0.5 * s7); ctx.stroke();
        }
        ctx.restore();
        ctx.save();
        ctx.strokeStyle = `rgba(255,255,255,${(0.12 * s7).toFixed(3)})`; ctx.lineWidth = 6; ctx.lineCap = "round";
        for (let j = -1; j <= 1; j++) {
          const sx = cx + j * r * 0.35, sy = cy - r * 0.8; // starts over the pie, tops out at cy - 1.2r (below the top bar)
          ctx.beginPath(); ctx.moveTo(sx, sy);
          ctx.bezierCurveTo(sx + r * 0.12, sy - r * 0.15 * s7, sx - r * 0.12, sy - r * 0.27 * s7, sx + r * 0.04, sy - r * 0.4 * s7);
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    function paint(i) {
      if (i === shown || !w) return;                 // never redraw the same frame
      shown = i;
      render(i);
    }
    function stepIndex(p) { let s = 0; for (let k = 1; k < BOUNDS.length - 1; k++) if (p >= BOUNDS[k]) s = k; return s; }
    let lastStep = -1;
    function update() {
      const r = track.getBoundingClientRect();
      const span = r.height - innerHeight;
      const p = span > 0 ? clamp(-r.top / span, 0, 1) : 0;
      rail.style.height = (p * 100).toFixed(2) + "%";
      const si = stepIndex(p);
      if (si !== lastStep) {
        lastStep = si;
        steps.forEach((li, k) => { li.classList.toggle("is-on", k === si); li.classList.toggle("is-done", k < si); });
        phaseEl.textContent = String(si + 1).padStart(2, "0");
        const li = steps[si];
        capEl.innerHTML = `<b>${li.childNodes[1].textContent.trim()}</b>${li.querySelector("span").textContent}`;
      }
      pending = Math.min(N - 1, Math.floor(p * N));
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; paint(pending); });
      return p;
    }
    function resize() {
      const dpr = Math.min(2, devicePixelRatio || 1);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      shown = -1;
      paint(pending);
    }
    function setSeason(s) {
      if (season && season.id === s.id) return;
      season = s; R = build(s);
      $("#seqSeason").textContent = s.label;
      $("#seqTitle").textContent = s.pizzas[0].name;
      $("#seqBase").textContent = s.seq.baseName;
      $("#seqTop").textContent = s.seq.top;
      shown = -1; paint(pending);
      lastStep = -1;
    }
    addEventListener("scroll", update, { passive: true });
    addEventListener("resize", () => { resize(); update(); });
    return { setSeason, init() { resize(); update(); }, update, get frame() { return shown; }, N };
  })();

  /* ------------------------------------------------------------------ */
  /* 5 · menu: tabs, filters, seasonal flip carousel                    */
  /* ------------------------------------------------------------------ */
  const euro = (v) => "€ " + (v % 1 ? v.toFixed(2).replace(".", ",") : String(v));
  const currentSeason = () => { const m = romeNow().m - 1; return DATA.seasons.find((s) => s.months.includes(m)); };

  const fc = (() => {
    /* design library: flip-card-carousel. The card swiped in rises edge-on by
       30 % of a page from centre, then lets go and settles flat on its own
       clock (τ ≈ 120 ms); the card leaving just shrinks away. */
    const car = $("#fcCar"), titles = $("#fcTitles"), prices = $("#fcPrices"), dotsEl = $("#fcDots");
    const prev = $("#fcPrev"), next = $("#fcNext"), desc = $("#fcDesc");
    let items = [], slots = [], heads = [], costs = [], dots = [], rot = [];
    let cpos = 0, incoming = -1, latched = false, last = performance.now(), raf = 0, anim = 0, drag = null, tweening = false;
    const SP = () => (innerWidth < 821 ? 268 : 330);

    function load(list) {
      items = list; car.innerHTML = ""; titles.innerHTML = ""; prices.innerHTML = ""; dotsEl.innerHTML = "";
      slots = list.map((it, i) => {
        const el = document.createElement("div");
        el.className = "vs-fc-card";
        el.innerHTML = `<img src="assets/${it.img}.webp" alt="${it.name}" width="560" height="560" draggable="false" loading="lazy"><div class="vs-fc-card-cap"><b>${String(i + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}</b><span>${it.desc.split(",")[0]}</span></div>`;
        car.appendChild(el); return el;
      });
      heads = list.map((it) => { const h = document.createElement("h3"); h.textContent = it.name; titles.appendChild(h); return h; });
      costs = list.map((it) => { const p = document.createElement("p"); p.textContent = euro(it.price); prices.appendChild(p); return p; });
      dots = list.map(() => { const d = document.createElement("i"); dotsEl.appendChild(d); return d; });
      rot = list.map(() => 0);
      cpos = 0; incoming = -1; latched = true;
      kick(); syncText(0);
    }
    function syncText(near) {
      const it = items[near]; if (!it) return;
      const txt = `${it.name} — ${it.desc}`;
      if (desc.textContent !== txt) desc.textContent = txt;
      prev.disabled = near <= 0; next.disabled = near >= items.length - 1;
      car.setAttribute("aria-label", `Pizze di stagione, ${near + 1} di ${items.length}: ${it.name}. Usa le frecce.`);
    }
    function frame(now) {
      raf = 0;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      const sp = SP();
      let moving = !!drag || tweening;
      slots.forEach((el, i) => {
        const p = i - cpos, ap = Math.abs(p);
        if (i === incoming && !latched && ap > 0.3 && ap < 1 && !reduce) rot[i] = 90 * (1 - ap) / 0.7 * Math.sign(p);
        else { if (i === incoming && ap <= 0.3) latched = true; rot[i] *= Math.exp(-dt / 0.12); if (Math.abs(rot[i]) < 0.05) rot[i] = 0; }
        if (rot[i] !== 0) moving = true;
        const s = 1 - 0.14 * Math.min(1, ap);
        el.style.transform = `translateX(${(p * sp).toFixed(2)}px) rotateY(${rot[i].toFixed(2)}deg) scale(${s.toFixed(4)})`;
        el.style.opacity = (1 - 0.45 * Math.min(1, ap)).toFixed(3);
        el.style.visibility = ap > 2.2 ? "hidden" : "visible";
        el.style.zIndex = String(100 - Math.round(ap * 10));
        heads[i].style.transform = `translateX(${(p * 200).toFixed(1)}px)`;
        heads[i].style.opacity = Math.max(0, 1 - ap * 1.35).toFixed(3);
        costs[i].style.opacity = Math.max(0, 1 - ap * 2.2).toFixed(3);
        dots[i].style.width = (5 + 15 * Math.max(0, 1 - ap)).toFixed(2) + "px";
        dots[i].style.opacity = (0.22 + 0.78 * Math.max(0, 1 - ap)).toFixed(3);
      });
      syncText(clamp(Math.round(cpos), 0, items.length - 1));
      if (moving) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } }
    function tweenTo(to, dur) {
      const from = cpos; cancelAnimationFrame(anim);
      if (Math.abs(from - to) < 0.001) { cpos = to; kick(); return; }
      const t0 = performance.now(); tweening = true;
      const step = (now) => {
        const k = Math.min(1, (now - t0) / (reduce ? 1 : dur)), e = 1 - (1 - k) * (1 - k);
        cpos = from + (to - from) * e; kick();
        if (k < 1) anim = requestAnimationFrame(step); else { cpos = to; tweening = false; kick(); }
      };
      anim = requestAnimationFrame(step);
    }
    function goTo(i) { i = clamp(i, 0, items.length - 1); incoming = i; latched = false; tweenTo(i, 450); }

    car.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      cancelAnimationFrame(anim); tweening = false;
      drag = { id: e.pointerId, x: e.clientX, start: cpos, lastX: e.clientX, t: performance.now(), v: 0, moved: false };
    });
    car.addEventListener("pointermove", (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      if (!drag.moved) { if (Math.abs(dx) < 5) return; drag.moved = true; try { car.setPointerCapture(e.pointerId); } catch (_) {} }
      let c = drag.start - dx / SP();
      const n = items.length - 1;
      if (c < 0) c *= 0.3; if (c > n) c = n + (c - n) * 0.3;   // rubber band past either end
      const now = performance.now();
      drag.v = (e.clientX - drag.lastX) / Math.max(1, now - drag.t); drag.t = now; drag.lastX = e.clientX;
      const dirIn = c > drag.start ? Math.ceil(c) : Math.floor(c);
      if (dirIn !== incoming && dirIn !== Math.round(drag.start)) { incoming = dirIn; latched = false; }
      cpos = c; kick();
    });
    const end = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const s0 = Math.round(drag.start), fling = -drag.v * 180 / SP();
      const moved = drag.moved;
      drag = null;
      if (!moved) { kick(); return; }
      const target = clamp(Math.round(clamp(cpos + fling, s0 - 1, s0 + 1)), 0, items.length - 1);
      incoming = target; if (Math.abs(target - cpos) <= 0.3) latched = true;
      tweenTo(target, 380 * Math.min(1, Math.abs(target - cpos) + 0.2));
    };
    car.addEventListener("pointerup", end); car.addEventListener("pointercancel", end);
    car.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); goTo(Math.round(cpos) + 1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); goTo(Math.round(cpos) - 1); }
    });
    prev.addEventListener("click", () => goTo(Math.round(cpos) - 1));
    next.addEventListener("click", () => goTo(Math.round(cpos) + 1));
    addEventListener("resize", kick);
    return { load, goTo, get index() { return Math.round(cpos); }, get pos() { return cpos; } };
  })();

  const menu = (() => {
    const tabs = $$(".vs-tab"), list = $("#menuList"), chips = $("#chips"), count = $("#menuCount");
    let filter = "tutte", season = currentSeason();
    const icon = `<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1"/><circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" stroke-width="1"/></svg>`;

    chips.innerHTML = DATA.cats.map((c) => `<button class="vs-chip" type="button" data-cat="${c.id}" aria-pressed="${c.id === filter}">${c.label}</button>`).join("");
    chips.addEventListener("click", (e) => { const b = e.target.closest("[data-cat]"); if (b) setFilter(b.dataset.cat); });

    function renderList() {
      const rows = DATA.viaggio.filter((it) => filter === "tutte" || it.cat === filter);
      list.innerHTML = rows.map((it, i) => `<li class="vs-item" data-id="${it.id}" style="animation-delay:${Math.min(i, 10) * 25}ms">
        <span class="vs-item-thumb">${it.img ? `<img src="assets/${it.img}.webp" alt="" width="64" height="64" loading="lazy">` : icon}</span>
        <div><h3>${it.name}</h3><p>${it.desc}</p></div>
        <span class="vs-item-price">${euro(it.price)}${it.unit ? `<small>${it.unit}</small>` : ""}</span></li>`).join("");
      count.textContent = `${rows.length} ${rows.length === 1 ? "voce" : "voci"}`;
    }
    function setFilter(id) {
      filter = id;
      for (const b of $$("[data-cat]", chips)) b.setAttribute("aria-pressed", String(b.dataset.cat === id));
      renderList();
    }
    function selectTab(id, focus = true) {
      tabs.forEach((t) => {
        const on = t.dataset.tab === id;
        t.setAttribute("aria-selected", String(on));
        t.tabIndex = on ? 0 : -1;
        $("#" + t.getAttribute("aria-controls")).hidden = !on;
        if (on && focus) t.focus();
      });
      if (id === "futuro") renderSeason();
    }
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => selectTab(t.dataset.tab));
      t.addEventListener("keydown", (e) => {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        e.preventDefault();
        selectTab(tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length].dataset.tab);
      });
    });

    // seasons
    const seasonsEl = $("#seasons"), cur = currentSeason();
    seasonsEl.innerHTML = DATA.seasons.map((s) => `<button class="vs-season" type="button" role="radio" data-season="${s.id}" aria-checked="${s.id === season.id}">${s.label}${s.id === cur.id ? "<em>ora</em>" : ""}</button>`).join("");
    seasonsEl.addEventListener("click", (e) => { const b = e.target.closest("[data-season]"); if (b) setSeason(b.dataset.season); });
    seasonsEl.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      e.preventDefault();
      const i = DATA.seasons.findIndex((s) => s.id === season.id);
      const n = DATA.seasons[(i + (e.key === "ArrowRight" ? 1 : DATA.seasons.length - 1)) % DATA.seasons.length];
      setSeason(n.id); $(`[data-season="${n.id}"]`, seasonsEl).focus();
    });
    let loadedSeason = null;
    function renderSeason() {
      if (loadedSeason === season.id) return;
      loadedSeason = season.id;
      fc.load(season.pizzas);
      const isNow = season.id === cur.id;
      $("#fcWhen").textContent = isNow ? `In carta adesso · ${season.range}` : `Torna in carta: ${season.range}`;
      $("#fcBook").textContent = isNow ? "Prenota per assaggiarla" : "Prenota un tavolo";
    }
    function setSeason(id) {
      season = DATA.seasons.find((s) => s.id === id) || season;
      for (const b of $$("[data-season]", seasonsEl)) b.setAttribute("aria-checked", String(b.dataset.season === season.id));
      renderSeason();
      seq.setSeason(season);
    }
    renderList();
    return { selectTab, setFilter, setSeason, get filter() { return filter; }, get season() { return season.id; } };
  })();

  seq.setSeason(currentSeason());
  seq.init();

  /* ------------------------------------------------------------------ */
  /* booking                                                            */
  /* ------------------------------------------------------------------ */
  const booking = (() => {
    const el = $("#book"), card = $("#bookCard"), form = $("#bookForm");
    const date = $("#bDate"), times = $("#bTimes"), paxOut = $("#paxOut"), percorso = $("#bPercorso");
    const err1 = $("#err1"), err2 = $("#err2"), dateHelp = $("#dateHelp"), paxHelp = $("#paxHelp");
    const PHONE = "089 412 7730";
    let pax = 2, time = null, opener = null, step = 1, closeT = 0;

    const isoAdd = (iso, days) => { const [y, m, d] = iso.split("-").map(Number); const t = new Date(Date.UTC(y, m - 1, d + days)); return t.toISOString().slice(0, 10); };
    const dowOf = (iso) => { const [y, m, d] = iso.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); };
    const svcOn = (dow, svc) => DATA.hours[dow].some(([s]) => (svc === "pranzo" ? s < 1000 : s >= 1000));
    const toMin = (s) => { const [a, b] = s.split(":").map(Number); return a * 60 + b; };
    const svcVal = () => (form.querySelector('input[name="svc"]:checked') || {}).value;
    const prettyDate = (iso) => { const [y, m, d] = iso.split("-").map(Number); return `${GIORNI[dowOf(iso)]} ${d} ${MESI[m - 1]}`; };

    function firstBookable() {
      const now = romeNow();
      for (let k = 0; k < 14; k++) {
        const iso = isoAdd(now.iso, k), dw = dowOf(iso);
        if (!DATA.hours[dw].length) continue;
        if (k === 0 && now.min >= 17 * 60) continue;
        return iso;
      }
      return isoAdd(now.iso, 1);
    }
    /* All the rules in one place; returns { ok, msg, field } */
    function check1() {
      const now = romeNow();
      const iso = date.value;
      if (!iso) return { ok: false, msg: "Scegli una data.", field: date };
      if (iso < now.iso) return { ok: false, msg: "La data è già passata.", field: date };
      if (iso > isoAdd(now.iso, 60)) return { ok: false, msg: "Accettiamo prenotazioni fino a 60 giorni da oggi.", field: date };
      const dw = dowOf(iso);
      if (!DATA.hours[dw].length) return { ok: false, msg: "Il lunedì siamo chiusi: scegli un altro giorno.", field: date };
      if (iso === now.iso && now.min >= 17 * 60) return { ok: false, msg: `Per oggi le prenotazioni online si chiudono alle 17:00. Chiamaci allo ${PHONE}.`, field: date };
      const svc = svcVal();
      if (!svc) return { ok: false, msg: "Scegli pranzo o cena." };
      if (!svcOn(dw, svc)) return { ok: false, msg: `Il ${GIORNI[dw]} siamo aperti solo a cena.` };
      if (percorso.checked && svc !== "cena") return { ok: false, msg: "Il percorso degustazione è servito solo a cena." };
      if (percorso.checked && pax > 6) return { ok: false, msg: "Il percorso degustazione è per massimo 6 persone." };
      if (!time) return { ok: false, msg: "Scegli un orario.", field: times };
      if (iso === now.iso && toMin(time) <= now.min + 30) return { ok: false, msg: "Quell'orario è troppo vicino: scegline uno più tardi." };
      return { ok: true };
    }
    function renderTimes() {
      const now = romeNow(), iso = date.value, svc = svcVal();
      const dw = iso ? dowOf(iso) : -1;
      // service availability for this day
      const pr = form.querySelector('input[value="pranzo"]'), ce = form.querySelector('input[value="cena"]');
      const prOk = dw >= 0 && svcOn(dw, "pranzo") && !percorso.checked;
      pr.disabled = !prOk;
      ce.disabled = dw >= 0 && !svcOn(dw, "cena");
      if (!prOk && pr.checked) { ce.checked = true; }
      const s = svcVal();
      const list = DATA.slots[s] || [];
      const sameDayLate = iso === now.iso && now.min >= 17 * 60;
      times.innerHTML = list.map((tt) => {
        const dis = dw < 0 || !DATA.hours[dw].length || sameDayLate || (iso === now.iso && toMin(tt) <= now.min + 30);
        return `<button type="button" class="vs-time" role="radio" data-time="${tt}" aria-checked="${tt === time && !dis}" ${dis ? "disabled" : ""}>${tt}</button>`;
      }).join("");
      if (time && !list.includes(time)) time = null;
      if (time && times.querySelector(`[data-time="${time}"]:disabled`)) time = null;
      // inline help under the date
      dateHelp.classList.remove("is-warn");
      if (!iso) dateHelp.textContent = "";
      else if (!DATA.hours[dw].length) { dateHelp.textContent = "Lunedì: chiusi."; dateHelp.classList.add("is-warn"); }
      else if (sameDayLate) { dateHelp.textContent = `Dopo le 17:00 per stasera solo al telefono: ${PHONE}.`; dateHelp.classList.add("is-warn"); }
      else dateHelp.textContent = `${prettyDate(iso)} · ${svcOn(dw, "pranzo") ? "pranzo e cena" : "solo cena"}`;
    }
    function setPax(n) {
      pax = clamp(n, 1, 10);
      paxOut.textContent = String(pax);
      $("#paxMinus").disabled = pax <= 1;
      $("#paxPlus").disabled = pax >= 10;
      paxHelp.classList.toggle("is-warn", pax >= 9);
      paxHelp.textContent = pax >= 9 ? "Per 9–10 persone uniamo due tavoli: lo confermiamo al telefono." : "Da 1 a 10 persone online. Per gruppi più grandi chiamaci.";
    }
    function goStep(n) {
      step = n;
      for (const s of $$(".vs-step", form)) s.hidden = Number(s.dataset.step) !== n;
      for (const d of $$("[data-stepdot]", el)) d.classList.toggle("is-on", Number(d.dataset.stepdot) <= n);
      const f = $(`.vs-step[data-step="${n}"]`, form).querySelector("input:not([type=radio]):not([type=checkbox]), button.vs-btn-solid");
      f && f.focus({ preventScroll: true });
      card.scrollTop = 0;
    }
    function open({ percorso: wantP = false, opener: op = null } = {}) {
      clearTimeout(closeT);
      opener = op || document.activeElement;
      const now = romeNow();
      date.min = now.iso; date.max = isoAdd(now.iso, 60);
      if (!date.value || date.value < now.iso) date.value = firstBookable();
      percorso.checked = wantP;
      if (wantP) form.querySelector('input[value="cena"]').checked = true;
      err1.textContent = ""; err2.textContent = "";
      for (const i of $$(".is-bad", form)) i.classList.remove("is-bad");
      setPax(pax); renderTimes(); goStep(1);
      el.hidden = false;
      document.body.classList.add("is-locked");
      requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("is-open")));
    }
    function close() {
      el.classList.remove("is-open");
      document.body.classList.remove("is-locked");
      closeT = setTimeout(() => { el.hidden = true; if (step === 3) { form.reset(); time = null; pax = 2; } }, reduce ? 0 : 260);
      if (opener && opener.focus) opener.focus({ preventScroll: true });
    }
    el.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) close(); });
    // focus trap
    el.addEventListener("keydown", (e) => {
      if (e.key !== "Tab") return;
      const f = $$("button, input, textarea, select, a[href]", card).filter((n) => !n.disabled && n.offsetParent !== null);
      if (!f.length) return;
      const a = f[0], b = f[f.length - 1];
      if (e.shiftKey && document.activeElement === a) { e.preventDefault(); b.focus(); }
      else if (!e.shiftKey && document.activeElement === b) { e.preventDefault(); a.focus(); }
    });
    $("#paxMinus").addEventListener("click", () => { setPax(pax - 1); err1.textContent = ""; });
    $("#paxPlus").addEventListener("click", () => { setPax(pax + 1); err1.textContent = ""; });
    date.addEventListener("change", () => { date.classList.remove("is-bad"); err1.textContent = ""; renderTimes(); });
    date.addEventListener("input", () => renderTimes());
    for (const r of $$('input[name="svc"]', form)) r.addEventListener("change", () => { time = null; err1.textContent = ""; renderTimes(); });
    percorso.addEventListener("change", () => { err1.textContent = ""; renderTimes(); });
    times.addEventListener("click", (e) => {
      const b = e.target.closest("[data-time]");
      if (!b || b.disabled) return;
      time = b.dataset.time;
      for (const x of $$("[data-time]", times)) x.setAttribute("aria-checked", String(x === b));
      err1.textContent = "";
    });
    $("#next1").addEventListener("click", () => {
      renderTimes();
      const r = check1();
      if (!r.ok) { err1.textContent = r.msg; if (r.field === date) date.classList.add("is-bad"); return; }
      const svc = svcVal();
      $("#sum2").textContent = `${pax} ${pax === 1 ? "persona" : "persone"} · ${prettyDate(date.value)} · ${svc} alle ${time}${percorso.checked ? " · percorso degustazione" : ""}`;
      goStep(2);
    });
    $("#back2").addEventListener("click", () => goStep(1));
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (step !== 2) return;
      const name = $("#bName"), phone = $("#bPhone"), mail = $("#bMail");
      for (const i of [name, phone, mail]) i.classList.remove("is-bad");
      const digits = phone.value.replace(/[^\d]/g, "");
      let msg = "";
      if (name.value.trim().length < 2) { msg = "Inserisci nome e cognome."; name.classList.add("is-bad"); }
      else if (!/^\+?[\d\s./-]+$/.test(phone.value.trim()) || digits.length < 8 || digits.length > 13) { msg = "Controlla il numero di telefono."; phone.classList.add("is-bad"); }
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail.value.trim())) { msg = "Controlla l'indirizzo email."; mail.classList.add("is-bad"); }
      else if (!$("#bPrivacy").checked) msg = "Serve il consenso per gestire la prenotazione.";
      if (msg) { err2.textContent = msg; return; }
      const r = check1();                       // time may have passed 17:00 meanwhile
      if (!r.ok) { goStep(1); err1.textContent = r.msg; return; }
      err2.textContent = "";
      const code = "VS-" + Math.random().toString(36).slice(2, 6).toUpperCase();
      $("#doneCode").textContent = code;
      $("#doneText").textContent = `Grazie ${name.value.trim().split(/\s+/)[0]}: tavolo per ${pax}, ${prettyDate(date.value)}, ${svcVal()} alle ${time}. Ti scriviamo un SMS di conferma entro un'ora.`;
      goStep(3);
    });
    setPax(2);
    return { open, close, el, get step() { return step; } };
  })();

  /* tiles: tap-to-focus on touch so the CTA is reachable without hover */
  for (const t of $$(".vs-tile")) t.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target === t) { const c = $(".vs-tile-cta", t); c && c.focus(); } });

  reduceMQ.addEventListener && reduceMQ.addEventListener("change", (e) => { reduce = e.matches; if (reduce) hero.park(); else hero.start(); });

  /* test hooks (read-only) */
  window.__vs = { split, seq, fc, menu, booking, statusAt, romeNow };
})();
