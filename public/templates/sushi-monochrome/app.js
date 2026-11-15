/* Kaname — omakase al banco. Plain JS, no libraries.
   Runs inside a sandboxed iframe: no storage, no alert, no popups. */
(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const slice = (p, a, b) => clamp01((p - a) / (b - a));
  const smooth = (x) => x * x * (3 - 2 * x);
  const lerp = (a, b, t) => a + (b - a) * t;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const TZ = "Europe/Rome";

  // Storage throws in the sandbox; keep everything in memory.
  const mem = {};
  const store = {
    get(k) { try { return window.localStorage.getItem(k); } catch (e) { return mem[k] ?? null; } },
    set(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { mem[k] = v; } },
  };

  /* ---------------- toast ---------------- */
  const toastEl = $("#toast");
  let toastT = 0;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("is-on");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("is-on"), 3200);
  }

  /* ---------------- Rome time ---------------- */
  const romeFmt = new Intl.DateTimeFormat("en-GB", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", weekday: "short", hourCycle: "h23",
  });
  const DOW = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  function romeNow(d = new Date()) {
    const o = {};
    for (const p of romeFmt.formatToParts(d)) o[p.type] = p.value;
    return {
      y: +o.year, m: +o.month, d: +o.day, hh: +o.hour, mm: +o.minute, ss: +o.second,
      dow: DOW[o.weekday], min: +o.hour * 60 + +o.minute,
    };
  }
  const pad2 = (n) => String(n).padStart(2, "0");

  /* clock, bottom-right of the hero */
  const clock = $("#clock");
  function tick() {
    const n = romeNow();
    clock.textContent = `${pad2(n.hh)}:${pad2(n.mm)}:${pad2(n.ss)}`;
  }
  tick();
  setTimeout(function loop() { tick(); setTimeout(loop, 1000 - (Date.now() % 1000) + 5); }, 1000 - (Date.now() % 1000) + 5);

  /* ---------------- open / closed ----------------
     Dinner Tue–Sat 18:30 → 00:30. The close runs past midnight, so Saturday's
     service is still "open" at 00:10 on Sunday. */
  const SERVICE = [2, 3, 4, 5, 6].map((d) => ({ d, s: 18 * 60 + 30, e: 24 * 60 + 30 }));
  const DAYNAME = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  const hm = (m) => `${pad2(Math.floor((m % 1440) / 60))}:${pad2(m % 60)}`;
  function statusFor(dow, min) {
    for (const iv of SERVICE) {
      if (dow === iv.d && min >= iv.s && min < iv.e) return { open: true, text: `Aperto ora · chiude alle ${hm(iv.e)}` };
      if (dow === (iv.d + 1) % 7 && min + 1440 < iv.e) return { open: true, text: `Aperto ora · chiude alle ${hm(iv.e)}` };
    }
    for (let k = 0; k < 8; k++) {
      const d = (dow + k) % 7;
      const iv = SERVICE.find((x) => x.d === d);
      if (!iv || (k === 0 && min >= iv.s)) continue;
      const when = k === 0 ? "oggi" : k === 1 ? "domani" : DAYNAME[d];
      return { open: false, text: `Chiuso · riapre ${when} alle ${hm(iv.s)}` };
    }
    return { open: false, text: "Chiuso" };
  }
  window.__knStatusFor = statusFor; // used by the checks
  function paintStatus() {
    const n = romeNow();
    const st = statusFor(n.dow, n.min);
    $$("[data-status]").forEach((el) => {
      el.classList.toggle("is-open", st.open);
      el.querySelector("span").textContent = st.text;
    });
  }
  paintStatus();
  setInterval(paintStatus, 30000);

  /* ---------------- staggered character reveal (hero title) ---------------- */
  let ci = 0;
  function split(el) {
    const label = el.textContent;
    const parts = label.split(/(\s+)/);
    el.textContent = "";
    for (const word of parts) {
      if (!word) continue;
      if (/^\s+$/.test(word)) { el.appendChild(document.createTextNode(" ")); continue; }
      const w = document.createElement("span");
      w.className = "kn-w";
      w.setAttribute("aria-hidden", "true");
      for (const ch of word) {
        const c = document.createElement("span");
        c.className = "kn-c";
        c.style.setProperty("--i", ci++);
        c.textContent = ch;
        w.appendChild(c);
      }
      el.appendChild(w);
    }
    el.setAttribute("aria-label", label);
  }
  const h1 = $(".kn-h1");
  $$("[data-split]", h1).forEach(split);
  const reveal = () => requestAnimationFrame(() => h1.classList.add("is-go"));
  if (reduce) h1.classList.add("is-go");
  else if (document.fonts && document.fonts.ready) Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 900))]).then(() => setTimeout(reveal, 120));
  else setTimeout(reveal, 300);

  /* ---------------- hero: pinned recomposition ----------------
     One scroll progress drives three things: the full-bleed photo (A) shrinks
     into the left tile of a pair, the second tile (B) rises in beside it, and
     the ground turns from ink to paper. The pair is where the next screen of
     the page starts, so the hero never "ends" — it becomes the grid. */
  const hero = $("#hero"), stage = $("#heroStage"), tA = $("#tileA"), tB = $("#tileB");
  const frag = $(".kn-frag"), bg = $(".kn-hero-bg"), heroBook = $(".kn-hero-book");
  const INK = [38, 37, 32], PAPER = [248, 247, 243];
  let G = null;
  function layoutHero() {
    const W = stage.clientWidth, H = stage.clientHeight;
    const mobile = W < 760;
    const g = 12;
    let a, b, f;
    if (!mobile) {
      const top = 88, w = (W - 4 * g) / 3, h = H - top - g;
      a = { x: g, y: top, w, h };
      b = { x: 2 * g + w, y: top, w, h };
      f = { x: 3 * g + 2 * w + 12, y: top, w: w - 24, h };
    } else {
      const top = 80, w = (W - 3 * g) / 2, h = Math.min(H * 0.5, w * 1.8);
      a = { x: g, y: top, w, h };
      b = { x: 2 * g + w, y: top, w, h };
      f = { x: g, y: top + h + 26, w: W - 2 * g, h: H - (top + h + 26) - 24 };
    }
    G = { W, H, a, b, f, mobile };
    tB.style.width = b.w + "px"; tB.style.height = b.h + "px";
    frag.style.left = f.x + "px"; frag.style.top = f.y + "px"; frag.style.width = f.w + "px"; frag.style.height = f.h + "px";
    frag.style.alignContent = mobile ? "start" : "space-between";
  }
  let heroP = -1;
  function updateHero() {
    if (!G) layoutHero();
    const r = hero.getBoundingClientRect();
    const max = hero.offsetHeight - G.H;
    const p = reduce ? 0 : (max > 0 ? clamp01(-r.top / max) : 0);
    if (p === heroP) return;
    heroP = p;
    const m = smooth(slice(p, 0, 0.72));
    const p1 = smooth(slice(p, 0, 0.3));
    const p2 = smooth(slice(p, 0.32, 0.8));
    const p3 = smooth(slice(p, 0.58, 0.96));
    const k = smooth(slice(p, 0.12, 0.6));
    const { a, b, W, H } = G;
    const x = lerp(0, a.x, m), y = lerp(0, a.y, m), w = lerp(W, a.w, m), h = lerp(H, a.h, m);
    tA.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
    tA.style.width = w.toFixed(2) + "px"; tA.style.height = h.toFixed(2) + "px";
    tB.style.transform = `translate3d(${b.x}px, ${(b.y + (1 - p2) * 90).toFixed(2)}px, 0)`;
    bg.style.backgroundColor = `rgb(${INK.map((c, i) => Math.round(lerp(c, PAPER[i], k))).join(",")})`;
    stage.style.setProperty("--p", m.toFixed(4));
    stage.style.setProperty("--p1", p1.toFixed(4));
    stage.style.setProperty("--p2", p2.toFixed(4));
    stage.style.setProperty("--p3", p3.toFixed(4));
    heroBook.classList.toggle("is-hidden", p1 > 0.5);
    heroBook.tabIndex = p1 > 0.5 ? -1 : 0;
    stage.dataset.k = k.toFixed(3);
  }

  /* ---------------- chapter headline roller ---------------- */
  const CH = [
    ["01 — Il taglio", "Togliere,", "non aggiungere", "Ogni gesto al banco — tagliare, spennellare, salare — serve a lasciar parlare il pesce. Niente è decorazione."],
    ["02 — Il legno", "Un banco", "di hinoki", "Nove metri di cipresso giapponese, levigato a mano ogni mattina finché torna morbido. Il nigiri si appoggia lì, direttamente."],
    ["03 — La stagione", "Solo ciò", "che è pronto", "Rami di stagione sul banco, pesce da Chioggia e da Mazara. Se un ingrediente non è al suo meglio, quella sera non c'è."],
    ["04 — Il tempo", "Servito", "al momento", "Ogni nigiri arriva appena formato, alla temperatura della mano. Aspettare dieci secondi è già troppo."],
  ];
  const roller = $("#filosofia");
  const rows = [$("#rollEye"), $("#rollL1"), $("#rollL2"), $("#rollText")];
  const bgs = $$("[data-bg]", roller);
  const pipsBox = $("#rollPips");
  let chapter = -1, cells = [], pips = [];
  if (reduce) {
    roller.classList.add("kn-roller--static");
    const box = $(".kn-roller-type", roller);
    box.innerHTML = CH.map((c) => `<div class="kn-st-ch"><p>${c[0]}</p><h3>${c[1]} <em>${c[2]}</em></h3><p>${c[3]}</p></div>`).join("");
  } else {
    cells = rows.map((row, r) => CH.map((c) => {
      const el = document.createElement(r === 3 ? "p" : "span");
      el.className = "kn-roll";
      el.textContent = c[r];
      row.appendChild(el);
      return el;
    }));
    CH.forEach(() => pipsBox.appendChild(document.createElement("i")));
    pips = [...pipsBox.children];
  }
  function showChapter(i) {
    if (i === chapter) return;
    chapter = i;
    cells.forEach((row) => row.forEach((el, j) => {
      el.className = "kn-roll" + (j === i ? " is-now" : j < i ? " is-past" : "");
      el.setAttribute("aria-hidden", j === i ? "false" : "true");
    }));
    pips.forEach((p, j) => p.classList.toggle("is-on", j === i));
    bgs.forEach((b, j) => b.classList.toggle("is-on", j === i));
    roller.dataset.chapter = i;
  }
  const HYST = 0.035;
  function updateRoller() {
    if (reduce) return;
    const r = roller.getBoundingClientRect();
    const max = roller.offsetHeight - innerHeight;
    const p = max > 0 ? clamp01(-r.top / max) : 0;
    const next = Math.min(CH.length - 1, Math.floor(p * CH.length));
    if (next === chapter) return;
    const edge = Math.max(next, chapter) / CH.length;
    if (chapter < 0 || Math.abs(p - edge) > HYST || p === 0 || p === 1) showChapter(next);
  }

  /* ---------------- nav tone + section highlight ---------------- */
  const nav = $("#nav");
  const overlay = $("#overlay");
  const toned = $$("[data-tone]").filter((el) => el !== nav);
  const navLinks = $$(".kn-links a");
  function updateNav() {
    let tone = "dark", solid = false;
    if (!overlay.hidden) tone = "light";
    else {
      const hr = hero.getBoundingClientRect();
      if (hr.bottom > 44) {
        tone = (+stage.dataset.k || 0) < 0.5 ? "light" : "dark";
        solid = hr.bottom < innerHeight - 1; // pin released (or no pin): content now scrolls under the bar
      } else {
        for (const el of toned) {
          const r = el.getBoundingClientRect();
          if (r.top <= 44 && r.bottom > 44) { tone = el.dataset.tone; break; }
        }
        solid = tone === "dark";
      }
    }
    nav.dataset.tone = tone;
    nav.classList.toggle("is-solid", solid);
    let cur = "";
    for (const a of navLinks) {
      const t = $(a.getAttribute("href"));
      if (!t) continue;
      const r = t.getBoundingClientRect();
      if (r.top <= innerHeight * 0.4 && r.bottom > innerHeight * 0.4) cur = a.getAttribute("href");
    }
    navLinks.forEach((a) => a.classList.toggle("is-on", a.getAttribute("href") === cur));
  }

  let raf = 0;
  function frame() { raf = 0; updateHero(); updateRoller(); updateNav(); }
  const req = () => { if (!raf) raf = requestAnimationFrame(frame); };
  addEventListener("scroll", req, { passive: true });
  addEventListener("resize", () => { G = null; heroP = -1; req(); });
  frame();

  /* ---------------- reveal-on-view: headings, touch recolour ---------------- */
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
  }), { threshold: 0.25 });
  $$(".kn-stagger").forEach((el) => (reduce ? el.classList.add("is-in") : io.observe(el)));

  // No hover on touch screens: a photo takes its colour back while it sits in
  // the middle band of the viewport instead.
  if (!fine) {
    const cio = new IntersectionObserver((es) => es.forEach((e) => e.target.classList.toggle("is-color", e.isIntersecting)),
      { rootMargin: "-38% 0px -38% 0px" });
    $$(".kn-photo").filter((f) => f !== tA && f !== tB && !f.closest(".kn-pair-static")).forEach((f) => cio.observe(f));
  }

  /* ---------------- magnetic buttons ---------------- */
  const magnets = $$(".kn-magnet");
  if (!reduce && fine && magnets.length) {
    const RADIUS = 56, PULL = 0.3;
    const st = new Map(magnets.map((m) => [m, { x: 0, y: 0 }]));
    const set = (el, x, y, tracking) => {
      const s = st.get(el); s.x = x; s.y = y;
      el.classList.toggle("is-tracking", tracking);
      el.style.setProperty("--mx", x.toFixed(2) + "px");
      el.style.setProperty("--my", y.toFixed(2) + "px");
    };
    const releaseAll = () => magnets.forEach((m) => set(m, 0, 0, false));
    addEventListener("pointermove", (e) => {
      for (const el of magnets) {
        if (!el.offsetParent) continue;
        const s = st.get(el), r = el.getBoundingClientRect();
        const dx = e.clientX - (r.left + r.width / 2 - s.x);
        const dy = e.clientY - (r.top + r.height / 2 - s.y);
        const inside = Math.abs(dx) < r.width / 2 + RADIUS && Math.abs(dy) < r.height / 2 + RADIUS;
        if (inside) set(el, dx * PULL, dy * PULL, true);
        else if (s.x || s.y) set(el, 0, 0, false);
      }
    }, { passive: true });
    document.addEventListener("mouseout", (e) => { if (!e.relatedTarget) releaseAll(); });
    addEventListener("blur", releaseAll);
    addEventListener("scroll", () => { if (magnets.some((m) => st.get(m).x)) releaseAll(); }, { passive: true });
  }

  /* ---------------- overlay menu ---------------- */
  const menuBtn = $("#menuBtn");
  let lastFocus = null;
  function openMenu() {
    overlay.hidden = false;
    requestAnimationFrame(() => overlay.classList.add("is-open"));
    menuBtn.setAttribute("aria-expanded", "true");
    menuBtn.setAttribute("aria-label", "Chiudi il menu");
    document.documentElement.style.overflow = "hidden";
    updateNav();
  }
  function closeMenu() {
    overlay.classList.remove("is-open");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Apri il menu");
    document.documentElement.style.overflow = "";
    setTimeout(() => { if (!overlay.classList.contains("is-open")) { overlay.hidden = true; updateNav(); } }, reduce ? 0 : 320);
  }
  menuBtn.addEventListener("click", () => (overlay.hidden || !overlay.classList.contains("is-open") ? openMenu() : closeMenu()));
  $$("[data-close]", overlay).forEach((a) => a.addEventListener("click", () => closeMenu()));

  /* ---------------- menu tabs ---------------- */
  const tabs = $$("[data-tab]");
  function selectTab(btn, focus) {
    tabs.forEach((t) => {
      const on = t === btn;
      t.setAttribute("aria-selected", on);
      t.tabIndex = on ? 0 : -1;
      $("#" + t.getAttribute("aria-controls")).hidden = !on;
    });
    if (focus) btn.focus();
  }
  tabs.forEach((t, i) => {
    t.addEventListener("click", () => selectTab(t));
    t.addEventListener("keydown", (e) => {
      const d = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : e.key === "ArrowLeft" || e.key === "ArrowUp" ? -1 : 0;
      if (d) { e.preventDefault(); selectTab(tabs[(i + d + tabs.length) % tabs.length], true); }
    });
  });
  const seg = $$(".kn-seg button");
  seg.forEach((b) => b.addEventListener("click", () => {
    seg.forEach((x) => x.setAttribute("aria-checked", x === b));
    const size = b.dataset.size;
    $$("#bevList strong").forEach((s) => (s.textContent = "€ " + s.dataset[size]));
    $("#bevNote").textContent = size === "glass" ? "Prezzi al calice da 90 ml." : "Prezzi a bottiglia da 720 ml.";
  }));

  /* ---------------- modal shell ---------------- */
  let openModal = null;
  function showModal(m) {
    lastFocus = document.activeElement;
    if (!overlay.hidden) closeMenu();
    m.hidden = false;
    openModal = m;
    document.documentElement.style.overflow = "hidden";
    requestAnimationFrame(() => {
      m.classList.add("is-open");
      const f = m.querySelector(".kn-modal-card button:not([disabled]):not(.kn-x), .kn-modal-card input");
      (f || m.querySelector(".kn-x")).focus({ preventScroll: true });
    });
  }
  function hideModal(m) {
    m.classList.remove("is-open");
    openModal = null;
    document.documentElement.style.overflow = "";
    setTimeout(() => { if (!m.classList.contains("is-open")) m.hidden = true; }, reduce ? 0 : 300);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  $$(".kn-modal").forEach((m) => $$("[data-dismiss]", m).forEach((b) => b.addEventListener("click", () => {
    if (m.id === "book") closeBooking(); else hideModal(m);
  })));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (openModal) { openModal.id === "book" ? closeBooking() : hideModal(openModal); }
      else if (!overlay.hidden) { closeMenu(); menuBtn.focus(); }
    }
    if (e.key === "Tab" && openModal) {
      const f = $$("button:not([disabled]), input, select, textarea, a[href]", openModal).filter((x) => x.offsetParent);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* ---------------- booking ---------------- */
  const PRICE = { banco: 280, sala: 190 };
  const EXP_NAME = { banco: "Banco Hinoki", sala: "Omakase in sala" };
  const SAKE = 95, DEPOSIT = 100, MAX_PARTY = 6;
  const TURNS = [{ id: "I", t: "18:30", label: "Primo turno" }, { id: "II", t: "21:15", label: "Secondo turno" }];
  const CAP = { banco: 12, sala: 14 };
  const MONTHS = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
  const DAYS_SHORT = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];
  const fmtEUR = (n) => "€ " + n.toLocaleString("it-IT");

  const B = { step: 0, date: null, exp: "banco", turn: null, guests: 2, sake: false, view: null };
  const book = $("#book");
  const stepsEl = $$("#steps li");
  const panes = $$(".kn-step", book);
  const nextBtn = $("#bookNext"), backBtn = $("#bookBack"), totalEl = $("#bookTotal");

  const key = (y, m, d) => `${y}-${pad2(m)}-${pad2(d)}`;
  function hash(s) { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }
  function seatsLeft(dateKey, exp, turn) {
    const h = hash(dateKey + exp + turn);
    if (hash(dateKey) % 9 === 0) return 0; // whole evening gone
    const pool = exp === "banco" ? [0, 2, 3, 4, 5, 6, 8, 12] : [0, 4, 6, 8, 10, 14];
    return pool[h % pool.length];
  }
  const today = () => { const n = romeNow(); return { y: n.y, m: n.m, d: n.d, min: n.min }; };
  const utc = (y, m, d) => Date.UTC(y, m - 1, d);
  function dayInfo(y, m, d) {
    const t = today();
    const diff = Math.round((utc(y, m, d) - utc(t.y, t.m, t.d)) / 864e5);
    const dow = new Date(utc(y, m, d)).getUTCDay();
    const k = key(y, m, d);
    if (diff < 0 || diff > 30) return { k, off: true, why: diff < 0 ? "passato" : "non ancora aperto" };
    if (dow === 0 || dow === 1) return { k, off: true, why: "chiuso" };
    if (diff === 0 && t.min >= 17 * 60) return { k, off: true, why: "troppo tardi per oggi" };
    const full = TURNS.every((tn) => seatsLeft(k, "banco", tn.id) === 0 && seatsLeft(k, "sala", tn.id) === 0);
    return { k, off: false, full, today: diff === 0, dow };
  }

  function renderCal() {
    const t = today();
    if (!B.view) B.view = { y: t.y, m: t.m };
    const { y, m } = B.view;
    $("#calMonth").textContent = `${MONTHS[m - 1]} ${y}`;
    const first = (new Date(utc(y, m, 1)).getUTCDay() + 6) % 7; // Monday-first
    const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const cal = $("#cal");
    cal.innerHTML = "";
    for (let i = 0; i < first; i++) { const s = document.createElement("span"); s.className = "kn-day is-blank"; cal.appendChild(s); }
    for (let d = 1; d <= days; d++) {
      const info = dayInfo(y, m, d);
      const b = document.createElement("button");
      b.type = "button"; b.className = "kn-day"; b.textContent = d; b.dataset.key = info.k;
      if (info.today) b.classList.add("is-today");
      if (info.off) { b.disabled = true; b.setAttribute("aria-label", `${d} ${MONTHS[m - 1]}, ${info.why}`); }
      else if (info.full) { b.disabled = true; b.classList.add("is-full"); b.setAttribute("aria-label", `${d} ${MONTHS[m - 1]}, al completo`); }
      else b.setAttribute("aria-label", `${DAYS_SHORT[info.dow]} ${d} ${MONTHS[m - 1]}`);
      b.setAttribute("aria-pressed", B.date === info.k);
      b.addEventListener("click", () => {
        B.date = info.k; B.turn = null;
        $$(".kn-day", cal).forEach((x) => x.setAttribute("aria-pressed", x === b));
        sync();
      });
      cal.appendChild(b);
    }
    const lastAllowed = new Date(utc(t.y, t.m, t.d) + 30 * 864e5);
    $("#calPrev").disabled = y === t.y && m === t.m;
    $("#calNext").disabled = y > lastAllowed.getUTCFullYear() || (y === lastAllowed.getUTCFullYear() && m >= lastAllowed.getUTCMonth() + 1);
  }
  $("#calPrev").addEventListener("click", () => { let { y, m } = B.view; m--; if (m < 1) { m = 12; y--; } B.view = { y, m }; renderCal(); });
  $("#calNext").addEventListener("click", () => { let { y, m } = B.view; m++; if (m > 12) { m = 1; y++; } B.view = { y, m }; renderCal(); });

  function renderTurns() {
    const box = $("#turnPick");
    box.innerHTML = "";
    for (const tn of TURNS) {
      const left = B.date ? seatsLeft(B.date, B.exp, tn.id) : 0;
      const b = document.createElement("button");
      b.type = "button"; b.className = "kn-turn"; b.setAttribute("role", "radio"); b.dataset.turn = tn.id;
      b.setAttribute("aria-checked", B.turn === tn.id);
      const cap = CAP[B.exp];
      const dots = B.exp === "banco"
        ? `<span class="kn-seats" aria-hidden="true">${Array.from({ length: cap }, (_, i) => `<i class="${i < cap - left ? "is-taken" : ""}"></i>`).join("")}</span>` : "";
      b.innerHTML = `<b>${tn.label}</b><strong>${tn.t}</strong><span>${left ? (left === 1 ? "1 posto libero" : left + " posti liberi") : "Al completo"}</span>${dots}`;
      if (!left) b.disabled = true;
      b.addEventListener("click", () => { B.turn = tn.id; clampGuests(); renderTurns(); sync(); });
      box.appendChild(b);
    }
  }
  $$("#expPick button").forEach((b) => b.addEventListener("click", () => {
    B.exp = b.dataset.exp;
    $$("#expPick button").forEach((x) => x.setAttribute("aria-checked", x === b));
    if (B.turn && !seatsLeft(B.date, B.exp, B.turn)) B.turn = null;
    clampGuests(); renderTurns(); sync();
  }));

  const maxGuests = () => (B.date && B.turn ? Math.min(MAX_PARTY, seatsLeft(B.date, B.exp, B.turn)) : MAX_PARTY);
  function clampGuests() { B.guests = Math.max(1, Math.min(B.guests, maxGuests())); }
  $("#gMinus").addEventListener("click", () => { B.guests = Math.max(1, B.guests - 1); sync(); });
  $("#gPlus").addEventListener("click", () => { B.guests = Math.min(maxGuests(), B.guests + 1); sync(); });
  $("#sakeOpt").addEventListener("change", (e) => { B.sake = e.target.checked; sync(); });
  $("#toEvents").addEventListener("click", () => closeBooking());

  const perHead = () => PRICE[B.exp] + (B.sake ? SAKE : 0);
  const total = () => perHead() * B.guests;
  const deposit = () => DEPOSIT * B.guests;
  function dateLabel(k) {
    const [y, m, d] = k.split("-").map(Number);
    const dow = new Date(utc(y, m, d)).getUTCDay();
    return `${DAYNAME[dow]} ${d} ${MONTHS[m - 1]}`;
  }

  function renderSummary() {
    const tn = TURNS.find((x) => x.id === B.turn);
    $("#sum").innerHTML = `
      <dt>Data</dt><dd>${dateLabel(B.date)}</dd>
      <dt>Turno</dt><dd>${tn.label} · ${tn.t}</dd>
      <dt>${EXP_NAME[B.exp]}</dt><dd>${fmtEUR(PRICE[B.exp])} × ${B.guests} = ${fmtEUR(PRICE[B.exp] * B.guests)}</dd>
      ${B.sake ? `<dt>Abbinamento sake</dt><dd>${fmtEUR(SAKE)} × ${B.guests} = ${fmtEUR(SAKE * B.guests)}</dd>` : ""}
      <dt class="kn-sum-total">Totale stimato</dt><dd class="kn-sum-total" id="sumTotal">${fmtEUR(total())}</dd>
      <dt class="kn-sum-dep">Caparra adesso</dt><dd class="kn-sum-dep" id="sumDep">${fmtEUR(deposit())}</dd>
      <dd class="kn-sum-note">La caparra di ${fmtEUR(DEPOSIT)} a persona si versa ora e viene scalata dal conto. Cancellazione gratuita fino a 48 ore prima; dopo, la caparra viene trattenuta. Bevande extra e servizio si pagano in sala.</dd>`;
  }

  function sync() {
    const s = B.step;
    panes.forEach((p) => (p.hidden = +p.dataset.step !== s));
    stepsEl.forEach((li, i) => {
      li.classList.toggle("is-now", i === s);
      li.classList.toggle("is-done", i < s);
      if (i === s) li.setAttribute("aria-current", "step"); else li.removeAttribute("aria-current");
    });
    $("#gOut").textContent = B.guests;
    $("#gMinus").disabled = B.guests <= 1;
    $("#gPlus").disabled = B.guests >= maxGuests();
    const left = B.date && B.turn ? seatsLeft(B.date, B.exp, B.turn) : 0;
    $("#gNote").textContent = B.turn
      ? `${left} posti liberi in questo turno · massimo ${MAX_PARTY} per prenotazione.`
      : `Massimo ${MAX_PARTY} per prenotazione.`;
    const okStep = [!!B.date, !!B.turn, B.guests >= 1, true][s];
    nextBtn.disabled = !okStep;
    nextBtn.innerHTML = s === 3 ? "Conferma<span class=\"kn-long\"> e versa la caparra</span>" : s === 4 ? "Chiudi" : "Continua";
    backBtn.hidden = s === 0 || s === 4;
    $("#bookFoot").classList.toggle("is-done", s === 4);
    if (s === 0) totalEl.innerHTML = B.date ? `<span>${dateLabel(B.date)}</span>` : `<span>Scegli una sera</span>`;
    else if (s === 4) totalEl.innerHTML = `<span>Caparra versata</span><b>${fmtEUR(deposit())}</b>`;
    else if (s === 3) totalEl.innerHTML = `<span>Caparra ora</span><b>${fmtEUR(deposit())}</b>`;
    else totalEl.innerHTML = `<span>${fmtEUR(perHead())} × ${B.guests} ${B.guests === 1 ? "ospite" : "ospiti"}</span><b>${fmtEUR(total())}</b>`;
    if (s === 1) renderTurns();
    if (s === 3) renderSummary();
  }

  function goStep(n) {
    B.step = n;
    if (n === 0) renderCal();
    sync();
    $("#bookBody").scrollTop = 0;
  }
  stepsEl.forEach((li, i) => li.addEventListener("click", () => { if (i < B.step && B.step < 4) goStep(i); }));
  backBtn.addEventListener("click", () => goStep(Math.max(0, B.step - 1)));
  nextBtn.addEventListener("click", () => {
    if (B.step < 3) return goStep(B.step + 1);
    if (B.step === 3) return submitBooking();
    closeBooking();
  });

  const form = $("#bookForm");
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function fieldErr(input, msg) {
    const lab = input.closest(".kn-field");
    lab.classList.toggle("is-bad", !!msg);
    lab.querySelector(".kn-err").textContent = msg || "";
    return !msg;
  }
  function submitBooking() {
    const f = form.elements;
    let ok = true;
    ok = fieldErr(f.name, f.name.value.trim().length < 3 ? "Scrivi nome e cognome." : "") && ok;
    ok = fieldErr(f.email, !EMAIL.test(f.email.value.trim()) ? "Serve un'email valida per la conferma." : "") && ok;
    ok = fieldErr(f.phone, f.phone.value.replace(/[^\d]/g, "").length < 8 ? "Numero di telefono troppo corto." : "") && ok;
    const pol = !f.policy.checked;
    $("#policyErr").textContent = pol ? "Per confermare bisogna accettare la caparra." : "";
    if (pol) ok = false;
    if (!ok) {
      const bad = form.querySelector(".is-bad input") || (pol ? f.policy : null);
      if (bad) bad.focus();
      return;
    }
    const code = "KN-" + (hash(B.date + B.turn + f.email.value) % 9000 + 1000);
    const tn = TURNS.find((x) => x.id === B.turn);
    $("#doneCode").textContent = code;
    $("#doneText").textContent = `${B.guests === 1 ? "Un posto" : B.guests + " posti"} ${B.exp === "banco" ? "al banco" : "in sala"}, ${dateLabel(B.date)}, ${tn.label.toLowerCase()} alle ${tn.t}. Vi aspettiamo dieci minuti prima: il primo nigiri parte per tutti insieme.`;
    store.set("kn-last-booking", code);
    goStep(4);
    toast(`Prenotazione confermata · ${code}`);
  }
  $$("input", form).forEach((i) => i.addEventListener("input", () => { if (i.closest(".kn-field.is-bad")) fieldErr(i, ""); }));

  function openBooking(opts = {}) {
    if (B.step === 4) { // a finished booking starts over
      Object.assign(B, { step: 0, date: null, turn: null, guests: 2, sake: false, view: null });
      form.reset(); $("#sakeOpt").checked = false;
      $$(".kn-field", form).forEach((l) => { l.classList.remove("is-bad"); l.querySelector(".kn-err") && (l.querySelector(".kn-err").textContent = ""); });
      $("#policyErr").textContent = "";
    }
    if (opts.exp) {
      B.exp = opts.exp;
      $$("#expPick button").forEach((x) => x.setAttribute("aria-checked", x.dataset.exp === B.exp));
    }
    goStep(B.step);
    showModal(book);
  }
  function closeBooking() { hideModal(book); }
  $$("[data-book]").forEach((b) => b.addEventListener("click", () => openBooking(b.closest("#maestro") ? { exp: "banco" } : {})));

  /* ---------------- event inquiry ---------------- */
  const evt = $("#evt"), evtForm = $("#evtForm");
  $("#eventBtn").addEventListener("click", () => showModal(evt));
  evtForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = evtForm.elements;
    let ok = true;
    ok = fieldErr(f.name, f.name.value.trim().length < 2 ? "Come vi chiamate?" : "") && ok;
    ok = fieldErr(f.email, !EMAIL.test(f.email.value.trim()) ? "Email non valida." : "") && ok;
    const t = today();
    ok = fieldErr(f.date, !f.date.value ? "Scegli una data indicativa." : f.date.value <= key(t.y, t.m, t.d) ? "Serve una data futura." : "") && ok;
    const g = +f.guests.value;
    ok = fieldErr(f.guests, !(g >= 7 && g <= 40) ? "Da 7 a 40 ospiti (fino a 6 si prenota normalmente)." : "") && ok;
    if (!ok) { (evtForm.querySelector(".is-bad input") || f.name).focus(); return; }
    hideModal(evt);
    evtForm.reset();
    toast("Richiesta inviata: il team eventi risponde entro 48 ore.");
  });
  $$("input", evtForm).forEach((i) => i.addEventListener("input", () => { if (i.closest(".kn-field.is-bad")) fieldErr(i, ""); }));

  /* ---------------- newsletter ---------------- */
  $("#newsForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = $("#newsEmail").value.trim();
    if (!EMAIL.test(v)) { $("#newsErr").textContent = "Controlla l'indirizzo email."; $("#newsEmail").focus(); return; }
    $("#newsErr").textContent = "";
    $("#newsEmail").value = "";
    toast("Grazie. Sei nella lista degli ospiti.");
  });
})();
