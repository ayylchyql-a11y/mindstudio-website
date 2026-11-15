/* koyomi · izakaya contemporanea · Torino — all site behaviour.
   Runs inside a sandboxed iframe without allow-same-origin: storage throws,
   alert() is swallowed. Everything below is defensive about that. */
(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const params = new URLSearchParams(location.search);

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* sandbox: memory only */ } },
  };

  /* ================= time in Rome ================= */
  const DAYS = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  const MONTHS = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
  function romeNow() {
    // ?now=2026-11-14T23:30 lets the checks fake a Rome wall-clock time
    const fake = params.get("now");
    if (fake && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(fake)) {
      const [d, t] = fake.split("T"); const [y, m, dd] = d.split("-").map(Number); const [hh, mi] = t.split(":").map(Number);
      return { y, m, d: dd, wd: new Date(Date.UTC(y, m - 1, dd)).getUTCDay(), min: hh * 60 + mi };
    }
    const parts = {};
    new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false })
      .formatToParts(new Date()).forEach((p) => { parts[p.type] = p.value; });
    const y = +parts.year, m = +parts.month, d = +parts.day;
    return { y, m, d, wd: new Date(Date.UTC(y, m - 1, d)).getUTCDay(), min: (+parts.hour % 24) * 60 + +parts.minute };
  }
  const pad = (n) => String(n).padStart(2, "0");
  const hm = (min) => pad(Math.floor((min % 1440) / 60)) + ":" + pad(min % 60);
  const ymd = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
  function addDays(y, m, d, n) { const t = new Date(Date.UTC(y, m - 1, d + n)); return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate(), wd: t.getUTCDay() }; }
  function parseYmd(s) { const [y, m, d] = s.split("-").map(Number); return { y, m, d, wd: new Date(Date.UTC(y, m - 1, d)).getUTCDay() }; }
  const longDate = (o) => `${DAYS[o.wd]} ${o.d} ${MONTHS[o.m - 1]}`;

  /* ================= opening hours ================= */
  // minutes from the start of the day; end > 1440 runs past midnight
  const HOURS = {
    0: [[690, 930], [1110, 1410]], // dom: brunch 11:30–15:30, cena 18:30–23:30
    1: [],                         // lun: chiuso
    2: [[1110, 1470]], 3: [[1110, 1470]], 4: [[1110, 1470]], // 18:30–00:30
    5: [[1110, 1560]], 6: [[1110, 1560]],                   // 18:30–02:00
  };
  function status(now = romeNow()) {
    const yd = (now.wd + 6) % 7;
    for (const [, e] of HOURS[yd]) if (e > 1440 && now.min < e - 1440) return { open: true, closes: e - 1440, left: e - 1440 - now.min };
    for (const [s, e] of HOURS[now.wd]) if (now.min >= s && now.min < e) return { open: true, closes: e, left: e - now.min };
    for (const [s] of HOURS[now.wd]) if (s > now.min) return { open: false, text: `apre alle ${hm(s)}` };
    for (let i = 1; i <= 7; i++) {
      const wd = (now.wd + i) % 7;
      if (HOURS[wd].length) return { open: false, text: `apre ${i === 1 ? "domani" : DAYS[wd]} alle ${hm(HOURS[wd][0][0])}` };
    }
    return { open: false, text: "chiuso" };
  }
  function paintStatus() {
    const s = status();
    const txt = s.open
      ? (s.left <= 30 ? `aperto · chiude tra ${s.left} min` : `aperto ora · chiude alle ${hm(s.closes)}`)
      : `chiuso · ${s.text}`;
    $$("[data-status]").forEach((el) => { el.classList.toggle("is-open", s.open); el.querySelector("[data-status-text]").textContent = txt; });
  }
  function paintHours() {
    const rows = [
      [[2, 3, 4], "mar – gio", "18:30 – 00:30"],
      [[5, 6], "ven – sab", "18:30 – 02:00 · dj dalle 22:30"],
      [[0], "domenica", "brunch 11:30 – 15:30 · cena 18:30 – 23:30"],
      [[1], "lunedì", "chiuso"],
    ];
    const wd = romeNow().wd;
    $("#hoursTable tbody").innerHTML = rows.map(([d, a, b]) => `<tr${d.includes(wd) ? ' class="is-today"' : ""}><td>${a}</td><td>${b}</td></tr>`).join("");
  }

  /* ================= season + ambient hue ================= */
  const HUE = { inverno: 206, estate: 24 };
  const now0 = romeNow();
  let season = params.get("season") || store.get("kz-season") || (now0.m >= 4 && now0.m <= 9 ? "estate" : "inverno");
  if (!HUE[season]) season = "inverno";
  let hueLock = null; // a focused event card can borrow the hue

  function setHue(h) { root.style.setProperty("--h", String(h)); }
  function currentHue() { const v = parseFloat(getComputedStyle(root).getPropertyValue("--h")); return isNaN(v) ? HUE[season] : v; }

  /* ================= header + overlay ================= */
  const head = $("#head");
  const onScrollHead = () => head.classList.toggle("is-solid", scrollY > 40);
  addEventListener("scroll", onScrollHead, { passive: true }); onScrollHead();

  const burger = $("#burger"), overlay = $("#overlay");
  function setOverlay(open) {
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
    if (open) {
      overlay.hidden = false; void overlay.offsetWidth; overlay.classList.add("is-open");
      root.style.overflow = "hidden";
    } else {
      overlay.classList.remove("is-open"); root.style.overflow = "";
      setTimeout(() => { if (!overlay.classList.contains("is-open")) overlay.hidden = true; }, reduce ? 0 : 280);
    }
  }
  burger.addEventListener("click", () => setOverlay(burger.getAttribute("aria-expanded") !== "true"));
  $$(".kz-ov-nav a", overlay).forEach((a) => a.addEventListener("click", () => setOverlay(false)));

  /* ================= staggered character reveal ================= */
  function split(el) {
    const words = el.textContent.trim().split(/(\s+)/);
    const label = el.textContent.trim();
    el.textContent = "";
    let n = 0;
    for (const word of words) {
      if (/^\s+$/.test(word)) { el.appendChild(document.createTextNode(" ")); continue; }
      const w = document.createElement("span"); w.className = "kz-w"; w.setAttribute("aria-hidden", "true");
      for (const ch of word) { const c = document.createElement("span"); c.className = "kz-c"; c.style.setProperty("--i", n++); c.textContent = ch; w.appendChild(c); }
      el.appendChild(w);
    }
    el.setAttribute("aria-label", label);
  }
  const splits = $$("[data-split]");
  splits.forEach(split);
  if (reduce || !("IntersectionObserver" in window)) splits.forEach((el) => el.classList.add("is-split-go"));
  else {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-split-go"); io.unobserve(e.target); } }), { threshold: 0.3 });
    splits.forEach((el) => { if (el.dataset.split === "load") { const go = () => el.classList.add("is-split-go"); (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(() => setTimeout(go, 200)); setTimeout(go, 1500); } else io.observe(el); });
  }

  /* ================= hero: photo push instead of video ================= */
  const SHOTS = {
    inverno: [["h-tempura", "Tempura di gamberi sotto una cupola di bambù"], ["h-uramaki", "Uramaki al bancone"], ["h-nigiri-salmone-2", "Nigiri di salmone in sala"]],
    estate: [["h-sashimi-vetro", "Sashimi su vetro ghiacciato"], ["h-gunkan-ikura", "Gunkan con ikura su vetro"], ["h-tartare-ardesia", "Tartare su ardesia"]],
  };
  const DRIFT = [["-1.5%", "-1%"], ["1.5%", "-1.2%"], ["-1%", "1%"]];
  const heroMedia = $("#heroMedia");
  const heroShots = {};
  Object.keys(SHOTS).forEach((s) => {
    heroShots[s] = SHOTS[s].map(([f, alt], i) => {
      const d = document.createElement("div"); d.className = "kz-shot";
      d.style.setProperty("--dx", DRIFT[i][0]); d.style.setProperty("--dy", DRIFT[i][1]);
      const img = new Image(); img.alt = alt; img.draggable = false; img.decoding = "async";
      img.dataset.src = `assets/${f}.webp`;
      d.appendChild(img); heroMedia.appendChild(d); return d;
    });
  });
  let heroIdx = 0, heroTimer = 0;
  function showShot(s, i) {
    const d = heroShots[s][i], img = d.querySelector("img");
    if (!img.src) img.src = img.dataset.src;
    // preload the next one quietly
    const nx = heroShots[s][(i + 1) % 3].querySelector("img"); if (!nx.src) setTimeout(() => { nx.src = nx.dataset.src; }, 1200);
    $$(".kz-shot", heroMedia).forEach((x) => { if (x !== d) x.classList.remove("is-on"); });
    // restart the push on the incoming shot
    d.classList.remove("is-on"); void d.offsetWidth; d.classList.add("is-on");
  }
  function startHero() {
    heroIdx = 0; showShot(season, 0);
    clearInterval(heroTimer);
    if (!reduce) heroTimer = setInterval(() => { heroIdx = (heroIdx + 1) % 3; showShot(season, heroIdx); }, 6000);
  }

  /* ================= curtain (procedural velvet) ================= */
  function Curtain(canvas, seed) {
    const W = 300, H = 160;
    canvas.width = W; canvas.height = H;
    const ctx = canvas.getContext("2d");
    const img = ctx.createImageData(W, H);
    const data = img.data;
    let s = seed || 7; const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647;
    const strand = new Float32Array(W + 16); for (let i = 0; i < strand.length; i++) strand[i] = rnd();
    const rowLight = new Float32Array(H);
    for (let y = 0; y < H; y++) { const v = y / (H - 1); rowLight[y] = 0.35 + 0.65 * Math.pow(Math.sin(Math.PI * Math.min(1, v * 1.05 + 0.04)), 0.7); }
    const STEP = 4, N = (W + 16) * STEP;
    const B = new Float32Array(N);
    const colPh = new Float32Array(W);
    for (let x = 0; x < W; x++) colPh[x] = 4 * Math.sin(x * 0.047 + seed) + 2.5 * Math.sin(x * 0.013 + seed * 2);
    this.draw = (t, hue) => {
      // fold profile across x (three drifting sines = uneven folds), sampled at 1/4 px
      const ph = t * 0.2;
      for (let k = 0; k < N; k++) {
        const x = k / STEP - 8;
        const a1 = Math.sin(x * 0.16 + 1.6 * Math.sin(x * 0.029 + ph));
        const a2 = Math.sin(x * 0.37 + 0.9 * Math.sin(x * 0.051 - ph * 1.3) + 2.0);
        const a3 = Math.sin(x * 0.065 - ph * 0.7 + 1.0);
        const a = 0.5 + 0.5 * (0.55 * a1 + 0.3 * a2 + 0.15 * a3);
        const st = strand[Math.max(0, Math.min(W + 15, Math.round(x + 8)))];
        B[k] = Math.pow(a, 3.2) + st * 0.05 * a;
      }
      // hue -> base rgb (hsl hue, 70% sat, ~42% light)
      const hh = ((hue % 360) + 360) % 360 / 60, c = 0.7, xx = c * (1 - Math.abs((hh % 2) - 1));
      let r = 0, g = 0, b = 0;
      if (hh < 1) { r = c; g = xx; } else if (hh < 2) { r = xx; g = c; } else if (hh < 3) { g = c; b = xx; } else if (hh < 4) { g = xx; b = c; } else if (hh < 5) { r = xx; b = c; } else { r = c; b = xx; }
      const m = 0.05; r += m; g += m; b += m;
      let p = 0;
      for (let y = 0; y < H; y++) {
        const v = y / H;
        const sway = Math.sin(v * 3.1 + t * 0.5) * 2.2 * v + Math.sin(v * 7 - t * 0.7) * 0.6 * v;
        const L0 = rowLight[y];
        for (let x = 0; x < W; x++) {
          const k = Math.round((x + 8 + sway * (0.6 + 0.4 * Math.sin(x * 0.05))) * STEP);
          // light runs down each fold unevenly, like a spotlight on velvet
          const streak = 0.62 + 0.38 * Math.sin(v * 4.2 + colPh[x] + t * 0.25);
          const L = B[k < 0 ? 0 : k >= N ? N - 1 : k] * L0 * streak;
          const hi = L * L * L * 0.4;
          data[p] = Math.min(255, (r * L * 1.25 + hi) * 255);
          data[p + 1] = Math.min(255, (g * L * 1.25 + hi) * 255);
          data[p + 2] = Math.min(255, (b * L * 1.25 + hi) * 255);
          data[p + 3] = 255; p += 4;
        }
      }
      ctx.putImageData(img, 0, 0);
    };
  }

  const velvet = $(".kz-velvet");
  const curtain = new Curtain($("#curtain"), 11);
  const copyCanvas = $("#curtainCopy");
  copyCanvas.width = 300; copyCanvas.height = 160;
  const copyCtx = copyCanvas.getContext("2d");
  const curtain2 = new Curtain($("#curtain2"), 29);
  const quotesSec = $(".kz-quotes");

  const visible = new Map();
  if ("IntersectionObserver" in window) {
    const vio = new IntersectionObserver((es) => es.forEach((e) => visible.set(e.target, e.isIntersecting)), { rootMargin: "100px" });
    [velvet, quotesSec].forEach((el) => vio.observe(el));
  } else { visible.set(velvet, true); visible.set(quotesSec, true); }

  function sizeCopy() { copyCanvas.style.height = velvet.offsetHeight + "px"; copyCanvas.style.bottom = "auto"; }
  addEventListener("resize", sizeCopy);

  /* ================= liquid lens over the curtain ================= */
  const intro = $("#intro"), lens = $("#lens"), edgeL = $("#edgeL"), edgeR = $("#edgeR");
  let HALF = innerWidth < 600 ? 32 : 46;
  const MAX_TILT = 34, EASE = 0.12;
  addEventListener("resize", () => { HALF = innerWidth < 600 ? 32 : 46; });
  let lx = 0, ltx = 0, tilt = 0, lastMove = -1e9;
  function placeLens() {
    lens.style.setProperty("--x", lx.toFixed(1) + "px");
    lens.style.setProperty("--tilt", tilt.toFixed(1) + "px");
    lens.style.setProperty("--half", HALF + "px");
    const deg = Math.atan2(tilt * 2, intro.clientHeight) * 180 / Math.PI;
    edgeL.style.left = (lx - HALF) + "px"; edgeR.style.left = (lx + HALF) + "px";
    edgeL.style.transform = edgeR.style.transform = `rotate(${(-deg).toFixed(2)}deg)`;
  }
  intro.addEventListener("pointermove", (e) => { ltx = e.clientX - intro.getBoundingClientRect().left; lastMove = performance.now(); });
  lx = ltx = intro.clientWidth * 0.5;
  if (reduce) { lx = intro.clientWidth * 0.68; tilt = 18; placeLens(); }

  /* ================= the frame loop (curtains + lens) ================= */
  let lastDraw = 0;
  function frame(ts) {
    requestAnimationFrame(frame);
    if (document.hidden) return;
    const t = ts / 1000;
    const vOn = visible.get(velvet) !== false, qOn = visible.get(quotesSec) === true;
    if (vOn && !reduce) {
      // lens: idle drift when nobody is steering it (touch screens, or hands off)
      if (ts - lastMove > 2500) ltx = intro.clientWidth * (0.5 + 0.32 * Math.sin(t * 0.45));
      const prev = lx; lx += (ltx - lx) * EASE;
      const v = lx - prev;
      tilt += (Math.max(-MAX_TILT, Math.min(MAX_TILT, v * 3.2)) - tilt) * 0.1;
      placeLens();
    }
    if (ts - lastDraw < 33) return; // curtains at ~30 fps
    lastDraw = ts;
    const hue = currentHue();
    const tt = reduce ? 3 : t;
    if (vOn && (!reduce || needStatic)) { curtain.draw(tt, hue); copyCtx.drawImage($("#curtain"), 0, 0); }
    if (qOn && (!reduce || needStatic)) curtain2.draw(tt + 40, hue);
    if (reduce && needStatic) needStatic--;
  }
  let needStatic = 3; // reduced motion: paint a few still frames, then on hue change

  /* ================= discover the seasons (circle reveal) ================= */
  const SHOW = [
    { s: "inverno", nuovo: true, img: "h-tempura", t: "tempura sotto la cupola", d: "gamberi e verdure d'inverno in pastella leggera, sale al tè verde.", p: "€ 14", cat: "cucina" },
    { s: "inverno", img: "c-sashimi-piatto", t: "sashimi del mercato", d: "pesce bianco dell'alto Adriatico tagliato al banco, servito su ghiaccio.", p: "€ 22", cat: "crudi" },
    { s: "inverno", img: "h-uramaki", t: "uramaki scottato", d: "salmone passato sul binchotan, miso dolce e cipollotto.", p: "€ 15", cat: "crudi" },
    { s: "inverno", nuovo: true, img: "c-nigiri-salmone", t: "nigiri & sake caldo", d: "due nigiri e un tokkuri di junmai servito a 45 gradi.", p: "€ 16", cat: "bere" },
    { s: "estate", nuovo: true, img: "h-sashimi-vetro", t: "crudi sul vetro", d: "tonno, ricciola e gambero su vetro ghiacciato, ponzu al bergamotto.", p: "€ 24", cat: "crudi" },
    { s: "estate", img: "h-gunkan-ikura", t: "gunkan agli agrumi", d: "salmone, ikura e scorza di yuzu grattata al momento.", p: "€ 12", cat: "crudi" },
    { s: "estate", nuovo: true, img: "h-tartare-ardesia", t: "tartare da dividere", d: "cinque tartare sull'ardesia, una per ogni persona al tavolo.", p: "€ 28", cat: "crudi" },
    { s: "estate", img: "c-tartare-coppe", t: "cucchiai freddi", d: "tartare in cucchiaio con granita di cetriolo e shiso.", p: "€ 13", cat: "crudi" },
  ];
  let view = "stagione";
  const showGrid = $("#showGrid"), showStage = $("#showStage"), seasonTabs = $("#seasonTabs");
  function showItems() {
    if (view === "nuovo") return SHOW.filter((x) => x.nuovo);
    if (view === "tutto") return SHOW.slice().sort((a, b) => (a.s === season ? -1 : 0) - (b.s === season ? -1 : 0));
    return SHOW.filter((x) => x.s === season);
  }
  const showHTML = () => showItems().map((x) => `
    <article class="kz-sc">
      <div class="kz-sc-img"><img src="assets/${x.img}.webp" alt="${x.t}" loading="lazy" draggable="false">
        ${x.nuovo ? '<span class="kz-sc-tag kz-sc-tag--new">novità</span>' : ""}</div>
      <p class="kz-eyebrow">${x.s} · ${x.p}</p>
      <h3>${x.t}</h3>
      <p>${x.d}</p>
      <div class="kz-sc-btns">
        <button class="kz-btn" type="button" data-goto-cat="${x.cat}">Vedi nel menu <span class="kz-arr" aria-hidden="true"></span></button>
        <button class="kz-btn kz-btn--solid" type="button" data-book="table">Prenota <span class="kz-arr" aria-hidden="true"></span></button>
      </div>
    </article>`).join("");

  let revealTimer = 0;
  function renderShow(origin) {
    const html = showHTML();
    if (!origin || reduce) { showGrid.innerHTML = html; return; }
    // drop any reveal still in flight
    $$(".kz-grid.is-ghost", showStage).forEach((g) => g.remove());
    clearTimeout(revealTimer);
    const ghost = showGrid.cloneNode(true);
    ghost.removeAttribute("id"); ghost.classList.remove("is-revealing"); ghost.classList.add("is-ghost");
    ghost.setAttribute("aria-hidden", "true"); ghost.inert = true;
    showStage.insertBefore(ghost, showGrid);
    ghost.scrollLeft = showGrid.scrollLeft;
    showGrid.innerHTML = html; showGrid.scrollLeft = 0;
    const r = showGrid.getBoundingClientRect();
    const cx = Math.min(Math.max(origin.x - r.left, -200), r.width + 200), cy = origin.y - r.top;
    const R = Math.max(Math.hypot(cx, cy), Math.hypot(r.width - cx, cy), Math.hypot(cx, r.height - cy), Math.hypot(r.width - cx, r.height - cy)) + 4;
    showGrid.style.setProperty("--cx", cx + "px"); showGrid.style.setProperty("--cy", cy + "px");
    showGrid.style.setProperty("--kz-r", "0px");
    showGrid.classList.add("is-revealing");
    void showGrid.offsetWidth;
    // the ring leads, the page follows 210 ms later
    revealTimer = setTimeout(() => {
      showGrid.style.setProperty("--kz-r", R.toFixed(0) + "px");
      revealTimer = setTimeout(() => {
        ghost.remove(); showGrid.classList.remove("is-revealing");
        showGrid.style.removeProperty("--kz-r");
      }, 600);
    }, 210);
  }

  function ripple(origin) {
    if (reduce || !origin) return;
    const ring = $("#ring"), wash = $("#wash");
    ring.style.left = origin.x + "px"; ring.style.top = origin.y + "px";
    ring.classList.remove("is-go"); void ring.offsetWidth; ring.classList.add("is-go");
    wash.style.setProperty("--cx", origin.x + "px"); wash.style.setProperty("--cy", origin.y + "px");
    wash.classList.remove("is-go"); void wash.offsetWidth; wash.classList.add("is-go");
  }

  function originOf(e) {
    if (e && e.clientX !== undefined && (e.clientX || e.clientY) && e.detail !== 0) return { x: e.clientX, y: e.clientY };
    const b = e && e.currentTarget && e.currentTarget.getBoundingClientRect ? e.currentTarget.getBoundingClientRect() : null;
    return b ? { x: b.left + b.width / 2, y: b.top + b.height / 2 } : null;
  }

  function applySeason(next, origin) {
    const changed = next !== season;
    season = next; store.set("kz-season", season);
    if (!hueLock) setHue(HUE[season]);
    needStatic = 3;
    $$("[data-season]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.season === season)));
    $$("[data-season-label]").forEach((el) => { el.textContent = season; });
    paintSeasonalEvent();
    if (changed) {
      ripple(origin);
      renderShow(view === "nuovo" ? null : origin);
      startHero();
      renderMenu();
    }
  }

  $$("[data-season]").forEach((b) => b.addEventListener("click", (e) => {
    const inShowcase = b.closest("#seasonTabs");
    if (inShowcase && view !== "stagione") setView("stagione", null);
    applySeason(b.dataset.season, originOf(e));
  }));
  function setView(v, origin) {
    view = v;
    $$(".kz-disc .kz-tabs:not(.kz-tabs--sub) button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.view === v)));
    seasonTabs.classList.toggle("is-off", v !== "stagione");
    renderShow(origin);
  }
  $$(".kz-disc [data-view]").forEach((b) => b.addEventListener("click", (e) => { if (b.dataset.view !== view) setView(b.dataset.view, originOf(e)); }));

  /* ================= three kitchens: scroll-driven scenes ================= */
  const kitTrack = $("#kitTrack");
  const kitPanels = $$(".kz-kit-panel");
  const kitCaps = $$(".kz-kit-cap");
  const kitBar = $("#kitBar");
  function kitUpdate() {
    const r = kitTrack.getBoundingClientRect();
    const max = r.height - innerHeight;
    const p = max > 0 ? Math.min(1, Math.max(0, -r.top / max)) : 0;
    const pos = p * (kitPanels.length - 1);
    const rot = reduce ? 0 : 1;
    kitPanels.forEach((el, i) => {
      const d = i - pos, k = Math.min(1, Math.abs(d));
      el.style.transform = `translateX(${(d * 68).toFixed(2)}%) rotateY(${(d * -26 * rot).toFixed(2)}deg) translateZ(${(-k * 190 * rot).toFixed(1)}px)`;
      el.style.zIndex = String(100 - Math.round(k * 100));
      el.querySelector(".kz-kit-veil").style.opacity = (k * 0.68).toFixed(3);
      el.style.visibility = Math.abs(d) > 1.6 ? "hidden" : "visible";
    });
    kitCaps.forEach((el, i) => {
      const k = Math.min(1, Math.abs(i - pos) * 2.2);
      el.style.opacity = (1 - k).toFixed(3);
      el.style.transform = `translateY(${((i - pos) * 26).toFixed(1)}px)`;
    });
    kitBar.style.transform = `scaleX(${p.toFixed(4)})`;
  }
  addEventListener("scroll", kitUpdate, { passive: true });
  addEventListener("resize", kitUpdate);

  /* ================= menu ================= */
  const CATS = [["crudi", "crudi"], ["robata", "dalla brace"], ["cucina", "cucina"], ["dolci", "dolci"], ["bere", "da bere"]];
  // s: "inverno" | "estate" | null (tutto l'anno)
  const MENU = [
    { c: "crudi", n: "Sashimi misto, 9 fette", d: "salmone, tonno, ricciola e gambero, taglio del giorno", p: 22, s: null, img: "m-sashimi-misto" },
    { c: "crudi", n: "Nigiri al tartufo bianco, 2 pz", d: "riso tiepido, tartufo d'Alba grattato al tavolo", p: 14, s: "inverno", img: "m-nigiri-tartufo" },
    { c: "crudi", n: "Tartare di tonno", d: "ponzu al bergamotto, avocado, foglia di shiso", p: 16, s: "estate", img: "m-tartare-tonno" },
    { c: "crudi", n: "Tataki di salmone", d: "scottato al cannello, sesamo tostato, salsa yuzu", p: 17, s: null, img: "m-tataki-salmone-10-pz" },
    { c: "crudi", n: "Gunkan ikura, 2 pz", d: "uova di salmone marinate nella soia, alga croccante", p: 11, s: "inverno", img: "m-gunkan-ikura" },
    { c: "crudi", n: "Nigiri gambero rosso, 2 pz", d: "gambero di Mazara crudo, lime e sale in fiocchi", p: 13, s: "estate", img: "m-nigiri-gambero-rosso" },
    { c: "crudi", n: "Rainbow maki, 8 pz", d: "granchio e cetriolo dentro, cinque pesci sopra", p: 17, s: null, img: "m-rainbow-maki-8-pz" },
    { c: "crudi", n: "Uramaki crispy tuna, 8 pz", d: "tonno piccante, briciole di tempura, erba cipollina", p: 15, s: "estate", img: "m-ura-crispy-tuna-8-pz" },
    { c: "crudi", n: "Sashimi di tonno, 10 fette", d: "akami e chutoro, wasabi fresco", p: 24, s: null, img: "m-sashimi-tonno-10-pz" },
    { c: "crudi", n: "Temaki salmone", d: "cono di alga da mangiare subito, prima che si ammorbidisca", p: 7, s: "estate", img: "m-temaki-salmone" },
    { c: "robata", n: "Tsukune, 2 spiedini", d: "polpette di pollo alla brace, tuorlo marinato", p: 9, s: null, k: "炭" },
    { c: "robata", n: "Anguilla laccata", d: "nigiri di anguilla con glassa kabayaki e pepe sansho", p: 15, s: "inverno", img: "m-nigiri-anguilla" },
    { c: "robata", n: "Fassona alla brace", d: "tagliata di Fassona piemontese, wasabi e sale affumicato", p: 26, s: "inverno", k: "牛" },
    { c: "robata", n: "Pannocchia al burro di miso", d: "mais dolce del Canavese, nori sbriciolata", p: 7, s: "estate", k: "夏" },
    { c: "robata", n: "Polpo e yuzu kosho", d: "tentacolo alla brace, patate novelle schiacciate", p: 16, s: "estate", k: "蛸" },
    { c: "robata", n: "Cavolo nero e sesamo", d: "foglie croccanti alla brace, salsa goma", p: 7, s: "inverno", k: "冬" },
    { c: "cucina", n: "Gyoza di maiale, 5 pz", d: "piastra e vapore, aceto nero e olio al peperoncino", p: 9, s: null, img: "m-gyoza" },
    { c: "cucina", n: "Ramen di gamberi", d: "brodo di teste tostate, uovo marinato, noodles sottili", p: 17, s: "inverno", img: "m-ramen-gamberi" },
    { c: "cucina", n: "Zuppa di miso", d: "tofu, wakame, cipollotto", p: 5, s: "inverno", img: "m-miso" },
    { c: "cucina", n: "Edamame", d: "al vapore, sale affumicato", p: 6, s: "estate", img: "m-edamame" },
    { c: "cucina", n: "Ebi kataifi", d: "gamberi avvolti in pasta kataifi, maionese al wasabi", p: 13, s: null, img: "m-ebi-kataifi" },
    { c: "cucina", n: "Tempura di stagione", d: "verdure del mercato di Porta Palazzo e due gamberi", p: 14, s: null, k: "天" },
    { c: "dolci", n: "Mochi, 3 gusti", d: "matcha, sesamo nero, fragola", p: 7, s: null, img: "m-mochi" },
    { c: "dolci", n: "Dorayaki alle castagne", d: "pancake giapponesi, anko e marron glacé", p: 7, s: "inverno", img: "m-dorayaki" },
    { c: "dolci", n: "Kakigori alla pesca", d: "ghiaccio grattato, sciroppo di pesca bianca, latte condensato", p: 8, s: "estate", k: "氷" },
    { c: "dolci", n: "Gelato al sesamo nero", d: "fatto qui, con miele di castagno", p: 6, s: null, k: "胡" },
    { c: "bere", n: "Sake caldo, tokkuri 180 ml", d: "junmai servito a 45 gradi", p: 12, s: "inverno", k: "燗" },
    { c: "bere", n: "Vermouth di Torino & hojicha", d: "vermouth rosso, tè tostato, scorza d'arancia", p: 12, s: "inverno", k: "茶" },
    { c: "bere", n: "Highball allo yuzu", d: "whisky giapponese, soda, yuzu", p: 11, s: "estate", k: "柚" },
    { c: "bere", n: "Spritz allo shiso", d: "bitter, prosecco, sciroppo di shiso rosso", p: 10, s: "estate", k: "紫" },
    { c: "bere", n: "Umeshu on the rocks", d: "liquore di prugne, ghiaccio a blocco", p: 9, s: null, k: "梅" },
    { c: "bere", n: "Negroni al sencha", d: "gin infuso al tè verde, bitter, vermouth", p: 12, s: null, k: "酒" },
  ];
  let cat = "crudi", filt = "tutto";
  const catTabs = $("#catTabs"), dishes = $("#dishes"), menuNote = $("#menuNote");
  catTabs.innerHTML = CATS.map(([k, l]) => `<button type="button" role="tab" data-cat="${k}" aria-selected="${k === cat}">${l}</button>`).join("");
  const other = () => (season === "inverno" ? "estate" : "inverno");
  function renderMenu() {
    let list = MENU.filter((x) => x.c === cat);
    const total = list.length;
    if (filt === "stagione") list = list.filter((x) => x.s === season);
    if (filt === "sempre") list = list.filter((x) => !x.s);
    // current season first, off-season last
    const rank = (x) => (x.s === season ? 0 : x.s ? 2 : 1);
    list.sort((a, b) => rank(a) - rank(b));
    const nSeason = MENU.filter((x) => x.c === cat && x.s === season).length;
    const nOff = MENU.filter((x) => x.c === cat && x.s === other()).length;
    menuNote.textContent = filt === "tutto"
      ? `${total} piatti · ${nSeason} solo d'${season === "inverno" ? "inverno" : "estate"}${nOff ? ` · ${nOff} tornano in ${other()}` : ""}`
      : `${list.length} di ${total} piatti`;
    dishes.innerHTML = list.map((x, i) => {
      const off = x.s && x.s !== season;
      const tag = x.s ? `<span class="kz-dish-tag${off ? "" : " kz-dish-tag--on"}">${off ? "torna in " + x.s : x.s}</span>` : "";
      const media = x.img
        ? `<div class="kz-dish-img"><img src="assets/${x.img}.webp" alt="${x.n}" loading="lazy" draggable="false"></div>`
        : `<div class="kz-dish-img kz-dish-img--kanji" aria-hidden="true"><span>${x.k}</span></div>`;
      return `<li class="kz-dish${off ? " is-off" : ""}" style="--i:${i}" data-season-item="${x.s || "sempre"}">${media}
        <div class="kz-dish-body"><div class="kz-dish-row"><h3>${x.n}</h3><span class="kz-price">€ ${x.p}</span></div><p>${x.d}</p>${tag}${off ? `<span class="kz-vh">non disponibile in questa stagione</span>` : ""}</div></li>`;
    }).join("") || `<li class="kz-menu-note">Niente in questa categoria per ora.</li>`;
  }
  catTabs.addEventListener("click", (e) => {
    const b = e.target.closest("[data-cat]"); if (!b) return;
    cat = b.dataset.cat; $$("[data-cat]", catTabs).forEach((x) => x.setAttribute("aria-selected", String(x === b))); renderMenu();
  });
  $("#menuFilter").addEventListener("click", (e) => {
    const b = e.target.closest("[data-f]"); if (!b) return;
    filt = b.dataset.f; $$("[data-f]").forEach((x) => x.setAttribute("aria-pressed", String(x === b))); renderMenu();
  });
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-goto-cat]"); if (!b) return;
    cat = b.dataset.gotoCat; $$("[data-cat]", catTabs).forEach((x) => x.setAttribute("aria-selected", String(x.dataset.cat === cat)));
    renderMenu();
    $("#menu").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  });

  /* ================= events: hue follows the focused card ================= */
  const SEASONAL_EV = {
    inverno: { when: "ogni giovedì · 20:00 · 8 posti", title: "nabe al banco", text: "una pentola di brodo al centro del banco, il cuoco serve a giro e si finisce con il riso nel brodo. € 45 a persona, massimo 4 per prenotazione.", img: "c-sashimi-piatto", alt: "Piatto di sashimi misto", h: 190 },
    estate: { when: "ogni giovedì · 20:00 · in cortile", title: "hanabi in cortile", text: "lanterne, crudi sul ghiaccio e highball alla spina nel cortile interno. € 45 a persona, massimo 4 per prenotazione.", img: "c-nigiri-gambero", alt: "Nigiri di gambero su piatto bianco", h: 345 },
  };
  function paintSeasonalEvent() {
    const ev = SEASONAL_EV[season], card = $("#evSeasonal");
    $("[data-ev-when]", card).textContent = ev.when;
    $("[data-ev-title]", card).textContent = ev.title;
    $("[data-ev-text]", card).textContent = ev.text;
    const img = $("[data-ev-img]", card); img.src = `assets/${ev.img}.webp`; img.alt = ev.alt;
    card.dataset.h = ev.h;
  }
  const evList = $("#evList");
  function lockHue(h) { hueLock = h; setHue(h); }
  function unlockHue() { if (hueLock === null) return; hueLock = null; setHue(HUE[season]); }
  evList.addEventListener("pointerover", (e) => { const c = e.target.closest(".kz-ev"); if (c) lockHue(+c.dataset.h); });
  evList.addEventListener("focusin", (e) => { const c = e.target.closest(".kz-ev"); if (c) lockHue(+c.dataset.h); });
  evList.addEventListener("pointerleave", unlockHue);
  evList.addEventListener("focusout", (e) => { if (!evList.contains(e.relatedTarget)) unlockHue(); });
  if ("IntersectionObserver" in window) new IntersectionObserver((es) => es.forEach((e) => { if (!e.isIntersecting) unlockHue(); })).observe(evList);

  /* ================= quotes ================= */
  const qs = $$(".kz-q"); let qi = 0, qTimer = 0;
  function showQ(i) { qi = (i + qs.length) % qs.length; qs.forEach((q, k) => q.classList.toggle("is-on", k === qi)); $("#qCount").textContent = `${qi + 1} / ${qs.length}`; }
  function qAuto() { clearInterval(qTimer); if (!reduce) qTimer = setInterval(() => { if (visible.get(quotesSec)) showQ(qi + 1); }, 6500); }
  $("#qPrev").addEventListener("click", () => { showQ(qi - 1); qAuto(); });
  $("#qNext").addEventListener("click", () => { showQ(qi + 1); qAuto(); });

  /* ================= toast ================= */
  let toastT = 0;
  function toast(msg) { const t = $("#toast"); t.textContent = msg; t.classList.add("is-on"); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("is-on"), 3200); }

  /* ================= la lista ================= */
  const EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  $("#listForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const inp = $("#listEmail"), err = $("#listErr");
    if (!EMAIL.test(inp.value.trim())) { err.textContent = "Scrivi un indirizzo email valido."; inp.setAttribute("aria-invalid", "true"); inp.focus(); return; }
    err.textContent = ""; inp.removeAttribute("aria-invalid"); inp.value = "";
    toast("Sei nella lista. La prima mail arriva a inizio stagione.");
  });

  /* ================= booking dialog: table / events ================= */
  const modal = $("#modal"), formT = $("#formTable"), formE = $("#formEvent"), done = $("#done");
  let lastFocus = null;
  const SLOTS = { 0: [1140, 1320], 2: [1140, 1350], 3: [1140, 1350], 4: [1140, 1350], 5: [1140, 1380], 6: [1140, 1380] }; // first,last seating
  const EVENTS = {
    dj: { name: "notte izakaya · dj set", days: [5, 6], start: 1350, max: 8, adult: true, note: "ven e sab · 22:30" },
    brunch: { name: "brunch della domenica", days: [0], start: 690, max: 10, adult: false, note: "dom · 11:30" },
    stagione: { name: "", days: [4], start: 1200, max: 4, adult: false, note: "gio · 20:00" },
  };
  let tSlot = null, evKey = "dj", evDate = null;

  function people(sel, max, extra) {
    sel.innerHTML = Array.from({ length: max }, (_, i) => `<option value="${i + 1}">${i + 1} ${i ? "persone" : "persona"}</option>`).join("") + (extra ? `<option value="more">più di ${max}</option>` : "");
  }
  people($("#tPeople"), 8, true); $("#tPeople").value = "2";

  function slotsFor(dateStr) {
    const o = parseYmd(dateStr), rng = SLOTS[o.wd];
    if (!rng) return null;
    const now = romeNow(), isToday = dateStr === ymd(now.y, now.m, now.d);
    const out = [];
    for (let m = rng[0]; m <= rng[1]; m += 30) out.push({ m, off: isToday && m < now.min + 30 });
    return out;
  }
  function renderSlots() {
    const box = $("#tSlots"), dErr = $("#tDateErr"), v = $("#tDate").value;
    dErr.textContent = ""; box.innerHTML = "";
    if (!v) { box.innerHTML = `<p class="kz-empty">Scegli una data.</p>`; return; }
    const now = romeNow(), today = ymd(now.y, now.m, now.d);
    if (v < $("#tDate").min || v > $("#tDate").max) { dErr.textContent = "Prenotiamo da oggi fino a 60 giorni."; tSlot = null; return; }
    const sl = slotsFor(v);
    if (!sl) { dErr.textContent = "Il lunedì siamo chiusi. Scegli un altro giorno."; tSlot = null; return; }
    if (sl.every((s) => s.off)) { box.innerHTML = `<p class="kz-empty">Per stasera i turni sono finiti${v === today ? "" : ""}. Prova domani.</p>`; tSlot = null; return; }
    if (tSlot !== null && !sl.some((s) => s.m === tSlot && !s.off)) tSlot = null;
    box.innerHTML = sl.map((s) => `<button type="button" role="radio" aria-checked="${s.m === tSlot}" data-m="${s.m}" ${s.off ? "disabled" : ""}>${hm(s.m)}</button>`).join("");
  }
  $("#tSlots").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-m]"); if (!b || b.disabled) return;
    tSlot = +b.dataset.m; $$("#tSlots button").forEach((x) => x.setAttribute("aria-checked", String(x === b))); $("#tSlotErr").textContent = "";
  });
  $("#tDate").addEventListener("change", renderSlots);
  $("#tPeople").addEventListener("change", () => {
    $("#tErr").textContent = $("#tPeople").value === "more" ? "Per gruppi oltre 8 persone chiamaci al +39 011 555 0192: apriamo la sala privata." : "";
  });

  function initTableForm() {
    const now = romeNow(), today = ymd(now.y, now.m, now.d), max = addDays(now.y, now.m, now.d, 60);
    const di = $("#tDate"); di.min = today; di.max = ymd(max.y, max.m, max.d);
    if (!di.value || di.value < today) {
      // first day that still has a free seating
      for (let i = 0; i < 8; i++) { const o = addDays(now.y, now.m, now.d, i), s = ymd(o.y, o.m, o.d), sl = slotsFor(s); if (sl && sl.some((x) => !x.off)) { di.value = s; break; } }
    }
    renderSlots();
  }

  const hashOf = (s) => { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
  function eventDates(key) {
    const ev = EVENTS[key], now = romeNow(), out = [];
    for (let i = 0; out.length < 6 && i < 60; i++) {
      const o = addDays(now.y, now.m, now.d, i);
      if (!ev.days.includes(o.wd)) continue;
      if (i === 0 && now.min >= ev.start - 60) continue;
      const s = ymd(o.y, o.m, o.d);
      out.push({ s, o, full: out.length > 0 && hashOf(s + key) % 5 === 0 });
    }
    return out;
  }
  function renderEvPick() {
    EVENTS.stagione.name = SEASONAL_EV[season].title;
    $("#evPick").innerHTML = Object.entries(EVENTS).map(([k, ev]) => `<button type="button" role="radio" aria-checked="${k === evKey}" data-ev="${k}"><b>${ev.name}</b><small>${ev.note}<br>max ${ev.max} persone</small></button>`).join("");
    const ds = eventDates(evKey);
    if (evDate && !ds.some((d) => d.s === evDate && !d.full)) evDate = null;
    $("#eDates").innerHTML = ds.map((d) => `<button type="button" role="radio" aria-checked="${d.s === evDate}" data-d="${d.s}" ${d.full ? "disabled" : ""}>${DAYS[d.o.wd].slice(0, 3)} ${d.o.d} ${MONTHS[d.o.m - 1].slice(0, 3)}${d.full ? " · completo" : ""}</button>`).join("");
    const sel = $("#ePeople"), keep = +sel.value || 2;
    people(sel, EVENTS[evKey].max, false); sel.value = String(Math.min(keep, EVENTS[evKey].max));
    $("#eAdultWrap").hidden = !EVENTS[evKey].adult;
  }
  $("#evPick").addEventListener("click", (e) => { const b = e.target.closest("[data-ev]"); if (!b) return; evKey = b.dataset.ev; evDate = null; $("#eErr").textContent = ""; renderEvPick(); });
  $("#eDates").addEventListener("click", (e) => { const b = e.target.closest("[data-d]"); if (!b || b.disabled) return; evDate = b.dataset.d; $$("#eDates button").forEach((x) => x.setAttribute("aria-checked", String(x === b))); $("#eDateErr").textContent = ""; });

  function setTab(kind) {
    const isT = kind === "table";
    $("#tabTable").setAttribute("aria-selected", String(isT)); $("#tabEvent").setAttribute("aria-selected", String(!isT));
    formT.hidden = !isT; formE.hidden = isT; done.hidden = true;
    $("#mTitle").textContent = isT ? "prenota un tavolo" : "eventi & brunch";
    if (isT) initTableForm(); else renderEvPick();
  }
  $("#tabTable").addEventListener("click", () => setTab("table"));
  $("#tabEvent").addEventListener("click", () => setTab("event"));

  function openModal(kind, opener) {
    lastFocus = opener || document.activeElement;
    if (overlay.classList.contains("is-open")) setOverlay(false);
    if (kind.startsWith("event")) { const k = kind.split(":")[1]; if (k && EVENTS[k]) { evKey = k; evDate = null; } setTab("event"); }
    else setTab("table");
    $$(".kz-err", modal).forEach((x) => { x.textContent = ""; });
    modal.hidden = false; void modal.offsetWidth; modal.classList.add("is-open");
    root.style.overflow = "hidden";
    setTimeout(() => { const f = $(".kz-mtabs [aria-selected='true']", modal); f && f.focus(); }, 30);
  }
  function closeModal() {
    modal.classList.remove("is-open"); root.style.overflow = "";
    setTimeout(() => { if (!modal.classList.contains("is-open")) modal.hidden = true; }, reduce ? 0 : 260);
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-book]"); if (b) { e.preventDefault(); openModal(b.dataset.book, b); return; }
    if (e.target.closest("[data-close]")) closeModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { if (!modal.hidden) closeModal(); else if (!overlay.hidden) { setOverlay(false); burger.focus(); } }
    if (e.key === "Tab" && !modal.hidden) {
      const f = $$("button, input, select, a[href]", $(".kz-dialog")).filter((x) => !x.disabled && x.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  function mark(inp, bad) { if (bad) inp.setAttribute("aria-invalid", "true"); else inp.removeAttribute("aria-invalid"); return bad; }
  const code = (p) => p + "-" + Math.random().toString(36).slice(2, 6).toUpperCase();
  function finish(kicker, title, text, c) {
    formT.hidden = formE.hidden = true; done.hidden = false;
    $("#doneKicker").textContent = kicker; $("#doneTitle").textContent = title; $("#doneText").textContent = text; $("#doneCode").textContent = "codice " + c;
    $("#mTitle").textContent = "fatto";
    $("button", done).focus();
  }

  formT.addEventListener("submit", (e) => {
    e.preventDefault();
    const err = $("#tErr"); err.textContent = "";
    const ppl = $("#tPeople").value;
    if (ppl === "more") { err.textContent = "Per gruppi oltre 8 persone chiamaci al +39 011 555 0192: apriamo la sala privata."; return; }
    const v = $("#tDate").value, sl = v ? slotsFor(v) : null;
    if (!v || !sl || v < $("#tDate").min || v > $("#tDate").max) { renderSlots(); if (!$("#tDateErr").textContent) $("#tDateErr").textContent = "Scegli una data valida."; $("#tDate").focus(); return; }
    if (tSlot === null) { $("#tSlotErr").textContent = "Scegli un orario."; return; }
    const bad = [
      mark($("#tName"), $("#tName").value.trim().length < 2),
      mark($("#tPhone"), !/^\+?[\d\s]{8,}$/.test($("#tPhone").value.trim())),
      mark($("#tEmail"), !EMAIL.test($("#tEmail").value.trim())),
    ];
    if (bad.some(Boolean)) {
      err.textContent = ["Scrivi il tuo nome", "un telefono valido", "un'email valida"].filter((_, i) => bad[i]).join(", ").replace(/^./, (c) => c.toUpperCase()) + ".";
      $$("#formTable [aria-invalid='true']")[0].focus(); return;
    }
    const o = parseYmd(v);
    finish("tavolo confermato", "a presto, " + $("#tName").value.trim().split(" ")[0],
      `Tavolo per ${ppl} ${ppl === "1" ? "persona" : "persone"}, ${longDate(o)} alle ${hm(tSlot)}. Ti abbiamo scritto a ${$("#tEmail").value.trim()}.`, code("KY"));
  });

  formE.addEventListener("submit", (e) => {
    e.preventDefault();
    const err = $("#eErr"); err.textContent = "";
    if (!evDate) { $("#eDateErr").textContent = "Scegli una data."; return; }
    const bad = [mark($("#eName"), $("#eName").value.trim().length < 2), mark($("#eEmail"), !EMAIL.test($("#eEmail").value.trim()))];
    if (bad.some(Boolean)) { err.textContent = "Controlla nome ed email."; $$("#formEvent [aria-invalid='true']")[0].focus(); return; }
    if (EVENTS[evKey].adult && !$("#eAdult").checked) { err.textContent = "La notte dj è solo per maggiorenni: conferma la casella."; return; }
    const ev = EVENTS[evKey], o = parseYmd(evDate), ppl = $("#ePeople").value;
    finish("sei in lista", ev.name, `${ppl} ${ppl === "1" ? "persona" : "persone"} · ${longDate(o)} alle ${hm(ev.start)}. Il promemoria arriva a ${$("#eEmail").value.trim()} il giorno prima.`, code("EV"));
  });

  /* ================= boot ================= */
  setHue(HUE[season]);
  $$("[data-season]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.season === season)));
  $$("[data-season-label]").forEach((el) => { el.textContent = season; });
  paintSeasonalEvent();
  renderShow(null);
  renderMenu();
  startHero();
  paintStatus(); paintHours();
  setInterval(paintStatus, 30000);
  sizeCopy();
  placeLens();
  kitUpdate();
  qAuto();
  requestAnimationFrame(frame);
  // expose for the checks
  window.__kz = { status, romeNow, get season() { return season; }, setSeason: (s) => applySeason(s, null) };
})();
