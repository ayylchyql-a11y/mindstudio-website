/* Lenta · pizza di pasta madre — modello di fantasia.
   Nessun localStorage obbligatorio: nel riquadro sandbox lo storage lancia SecurityError, quindi tutto passa da try/catch. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const REDUCE = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const store = {
    get(k, d) { try { const v = window.localStorage.getItem("lenta:" + k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } },
    set(k, v) { try { window.localStorage.setItem("lenta:" + k, JSON.stringify(v)); } catch (e) { /* sandbox: memory only */ } },
  };
  const euro = (n) => n.toFixed(2).replace(".", ",") + " €";
  const pad = (n) => String(n).padStart(2, "0");
  const hhmm = (m) => { m = ((m % 1440) + 1440) % 1440; return pad(Math.floor(m / 60)) + ":" + pad(m % 60); };
  const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* ---------- toast ---------- */
  const toastEl = $("#toast"); let toastT = 0;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("on"), 2600); }

  /* ---------- Europe/Rome clock ---------- */
  const DOW = { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 };
  const DAYS = ["lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato", "domenica"];
  let FAKE = null;
  function romeNow() {
    if (FAKE) return { ...FAKE };
    const p = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
    const g = (t) => p.find((x) => x.type === t).value;
    return { dow: DOW[g("weekday")], min: (+g("hour") % 24) * 60 + +g("minute") };
  }
  function romeDateISO(addDays = 0) {
    const d = new Date(Date.now() + addDays * 86400000);
    return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  }

  /* ---------- data ---------- */
  const PIZZE = [
    { id: "margherita", n: "Margherita", d: "Pomodoro della Bassa, fior di latte, basilico, olio extravergine.", p: 7, cat: "rossa", tag: "V" },
    { id: "marinara", n: "Marinara", d: "Pomodoro, aglio rosso, origano di collina, olio. Nient'altro.", p: 5.5, cat: "rossa", tag: "VG" },
    { id: "piccante", n: "Piccante", d: "Pomodoro, fior di latte, salame piccante, miele al peperoncino.", p: 8.9, cat: "rossa" },
    { id: "felino", n: "Felino & pomodorini", d: "Pomodoro, salame di Felino, pomodorini al forno, rucola a crudo.", p: 9.5, cat: "rossa", nuova: 1 },
    { id: "crudo", n: "Crudo & rucola", d: "Fior di latte, crudo 24 mesi, rucola, scaglie di Parmigiano.", p: 10.5, cat: "bianca" },
    { id: "funghi", n: "Funghi & Parmigiano", d: "Fior di latte, funghi trifolati, crema di Parmigiano 30 mesi.", p: 9, cat: "bianca", tag: "V" },
    { id: "verde", n: "Verde", d: "Spinacini saltati, ricotta di bufala, scorza di limone, pepe.", p: 9.5, cat: "bianca", tag: "V" },
    { id: "cavolonero", n: "Cavolo nero & noci", d: "Pesto di cavolo nero, stracchino, noci tostate, olio al rosmarino.", p: 9.8, cat: "bianca", tag: "V", nuova: 1 },
  ];
  const PZ = Object.fromEntries(PIZZE.map((p) => [p.id, p]));

  // hours: one string per day Mon..Sun, "" = closed; an end earlier than its start runs past midnight
  const parseH = (s) => !s ? [] : s.split(",").map((r) => { const [a, b] = r.split("-").map((t) => { const [h, m] = t.split(":"); return +h * 60 + +m; }); return [a, b <= a ? b + 1440 : b]; });
  const STD = ["12:00-14:30,18:30-23:00", "12:00-14:30,18:30-23:00", "12:00-14:30,18:30-23:00", "12:00-14:30,18:30-23:00", "12:00-14:30,18:30-00:30", "12:00-14:30,18:30-00:30", "12:00-23:00"];
  const mk = (id, name, tag, addr, lat, lon, h, mapDx = 0, mapDy = 0) => ({ id, name, tag, addr, lat, lon, h: h.map(parseH), mapDx, mapDy });
  const STORES = [
    mk("parma-centro", "Parma · Centro", "casa madre", "Borgo della Madia 3, 43121 Parma", 44.8022, 10.3283, ["12:00-14:30,18:30-23:00", "12:00-14:30,18:30-23:00", "12:00-14:30,18:30-23:00", "12:00-14:30,18:30-23:00", "12:00-14:30,18:30-00:30", "12:00-14:30,18:30-00:30", "12:00-23:30"], 6, -4),
    mk("parma-oltre", "Parma · Oltretorrente", "il primo forno", "Strada del Forno Vecchio 21, 43125 Parma", 44.7995, 10.3195, ["", "18:30-23:30", "18:30-23:30", "18:30-23:30", "18:30-01:00", "12:00-15:00,18:30-01:00", "12:00-15:00,18:30-23:30"], -10, 6),
    mk("fidenza", "Fidenza", "vicino al duomo", "Via dei Setacci 5, 43036 Fidenza", 44.8664, 10.0611, STD),
    mk("salso", "Salsomaggiore", "con dehors", "Viale della Crusca 12, 43039 Salsomaggiore Terme", 44.8146, 9.979, ["18:30-23:00", "18:30-23:00", "", "18:30-23:00", "18:30-23:30", "12:00-14:30,18:30-23:30", "12:00-14:30,18:30-23:00"]),
    mk("piacenza", "Piacenza", "sala riservata", "Via del Lievito 7, 29121 Piacenza", 45.0526, 9.693, ["", ...STD.slice(1)]),
    mk("reggio", "Reggio Emilia", "sala riservata", "Via dei Mugnai 30, 42121 Reggio Emilia", 44.6983, 10.6312, [...STD.slice(0, 4), "12:00-14:30,18:00-01:00", "12:00-14:30,18:00-01:00", "12:00-23:00"]),
    mk("modena", "Modena", "aperto a pranzo", "Via dei Fornai 18, 41121 Modena", 44.6471, 10.9252, ["12:00-15:00,18:30-23:30", "12:00-15:00,18:30-23:30", "12:00-15:00,18:30-23:30", "12:00-15:00,18:30-23:30", "12:00-15:00,18:30-00:30", "12:00-15:00,18:30-00:30", "12:00-23:30"]),
    mk("carpi", "Carpi", "in piazza", "Via Madia Lunga 2, 41012 Carpi", 44.7838, 10.885, ["18:30-23:00", "", "18:30-23:00", "18:30-23:00", "18:30-23:30", "12:00-14:30,18:30-23:30", "12:00-14:30,18:30-23:00"]),
    mk("sassuolo", "Sassuolo", "sala riservata", "Via della Pala 16, 41049 Sassuolo", 44.543, 10.784, ["", ...STD.slice(1)]),
    mk("bologna", "Bologna · San Vitale", "aperto fino a tardi", "Via del Mattarello 9, 40125 Bologna", 44.4949, 11.3426, ["12:00-00:00", "12:00-00:00", "12:00-00:00", "12:00-00:00", "12:00-01:30", "12:00-01:30", "12:00-00:00"]),
    mk("ferrara", "Ferrara", "sotto i portici", "Via delle Teglie 4, 44121 Ferrara", 44.8381, 11.6198, STD),
  ];
  const SBY = Object.fromEntries(STORES.map((s) => [s.id, s]));
  const PLACES = [
    ["Parma", 44.8015, 10.3279, "PR"], ["Fidenza", 44.8664, 10.0611, "PR"], ["Salsomaggiore Terme", 44.8146, 9.979, "PR"], ["Collecchio", 44.7526, 10.2163, "PR"], ["Langhirano", 44.615, 10.2664, "PR"],
    ["Fornovo di Taro", 44.6886, 10.1003, "PR"], ["Noceto", 44.8099, 10.177, "PR"], ["Fontanellato", 44.8818, 10.1749, "PR"], ["Busseto", 44.9795, 10.0429, "PR"], ["Colorno", 44.9297, 10.3755, "PR"],
    ["Sorbolo", 44.8463, 10.4473, "PR"], ["Piacenza", 45.0526, 9.693, "PC"], ["Fiorenzuola d'Arda", 44.927, 9.91, "PC"], ["Reggio Emilia", 44.6983, 10.6312, "RE"], ["Guastalla", 44.9213, 10.6553, "RE"],
    ["Correggio", 44.771, 10.7816, "RE"], ["Scandiano", 44.597, 10.69, "RE"], ["Modena", 44.6471, 10.9252, "MO"], ["Carpi", 44.7838, 10.885, "MO"], ["Sassuolo", 44.543, 10.784, "MO"],
    ["Mirandola", 44.8869, 11.0661, "MO"], ["Vignola", 44.481, 11.0071, "MO"], ["Bologna", 44.4949, 11.3426, "BO"], ["Imola", 44.3533, 11.7148, "BO"],
    ["Cento", 44.727, 11.288, "FE"], ["Ferrara", 44.8381, 11.6198, "FE"], ["Ravenna", 44.4184, 12.2035, "RA"], ["Rimini", 44.0678, 12.5695, "RN"], ["Cremona", 45.1333, 10.0227, "CR"],
    ["Mantova", 45.1564, 10.7914, "MN"], ["La Spezia", 44.1025, 9.8241, "SP"], ["Milano", 45.4642, 9.19, "MI"], ["Verona", 45.4384, 10.9916, "VR"], ["Brescia", 45.5416, 10.2118, "BS"],
    ["Firenze", 43.7696, 11.2558, "FI"], ["Genova", 44.4056, 8.9463, "GE"],
  ].map(([n, lat, lon, pr]) => ({ n, lat, lon, pr, k: norm(n) }));
  const ALIASES = { reggio: "Reggio Emilia", salso: "Salsomaggiore Terme", salsomaggiore: "Salsomaggiore Terme", fiorenzuola: "Fiorenzuola d'Arda" };
  const SIM = { lat: 44.8015, lon: 10.3279, label: "Parma, piazza Garibaldi", sim: true };

  /* ---------- opening status ---------- */
  function statusOf(s, now = romeNow()) {
    const today = s.h[now.dow], yest = s.h[(now.dow + 6) % 7];
    for (const r of yest) if (r[1] > 1440 && now.min < r[1] - 1440) return mkOpen(r[1] - 1440 - now.min, r[1]);
    for (const r of today) if (now.min >= r[0] && now.min < r[1]) return mkOpen(r[1] - now.min, r[1]);
    for (const r of today) if (r[0] > now.min) return { state: "closed", text: "Chiuso · apre alle " + hhmm(r[0]) };
    for (let d = 1; d <= 7; d++) {
      const rs = s.h[(now.dow + d) % 7];
      if (rs.length) return { state: "closed", text: "Chiuso · apre " + (d === 1 ? "domani" : DAYS[(now.dow + d) % 7]) + " alle " + hhmm(rs[0][0]) };
    }
    return { state: "closed", text: "Chiuso" };
  }
  function mkOpen(left, end) {
    if (left <= 30) return { state: "soon", text: "Chiude tra " + left + " min" };
    return { state: "open", text: "Aperto · chiude " + (end % 1440 === 0 ? "a mezzanotte" : "alle " + hhmm(end)) };
  }
  const hoursText = (rs) => rs.length ? rs.map((r) => hhmm(r[0]) + "–" + hhmm(r[1])).join(" · ") : "chiuso";

  /* ---------- distance ---------- */
  function km(a, b) {
    const R = 6371, toR = Math.PI / 180, dLat = (b.lat - a.lat) * toR, dLon = (b.lon - a.lon) * toR;
    const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * toR) * Math.cos(b.lat * toR) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(h));
  }
  const fmtKm = (d) => d < 10 ? d.toFixed(1).replace(".", ",") + " km" : Math.round(d) + " km";

  /* =========================================================
     1 · Hand-written headline, stroke by stroke (own SVG glyphs)
     ========================================================= */
  const GL = {
    "O": [72, ["M40 5C16 3 5 28 5 52c0 26 14 45 33 45 21 0 30-21 30-47C68 24 57 4 34 8"]],
    "0": [62, ["M33 5C13 4 6 30 6 52c0 26 11 45 26 45 18 0 24-23 24-47C56 24 48 4 29 8"]],
    "R": [62, ["M9 5V97", "M9 7c32-5 47 6 46 24-1 19-20 23-45 22", "M27 52l30 45"]],
    "E": [54, ["M50 5H9v91h43", "M9 50h34"]],
    "D": [66, ["M9 5v92", "M9 6c40-4 52 22 52 46 0 28-16 46-51 44"]],
    "I": [20, ["M10 5v92"]],
    "L": [52, ["M10 5l-1 91h41"]],
    "V": [68, ["M4 5l30 92 30-92"]],
    "T": [62, ["M4 7c18-2 36-3 54-2", "M31 6v91"]],
    ".": [20, ["M10 93l.6 .8"]],
    "4": [62, ["M38 5L6 68h52", "M44 34v63"]],
    "8": [60, ["M51 24C51 10 41 4 30 4 17 4 9 12 9 24c0 17 42 26 42 50 0 15-9 24-21 24C17 98 8 90 8 74 8 52 51 43 51 24"]],
    "9": [60, ["M52 30C52 13 42 4 30 4 16 4 8 15 8 29c0 15 10 25 22 25 13 0 22-9 22-24 0 24-1 45-3 67"]],
    "S": [58, ["M51 15C46 7 38 4 29 4 16 4 8 13 8 25c0 27 43 20 43 48 0 15-10 25-25 25-10 0-18-5-22-13"]],
    "C": [62, ["M56 17C50 8 42 4 33 4 15 4 6 27 6 51c0 26 11 47 28 47 10 0 18-6 23-16"]],
    "N": [68, ["M9 97V5l50 92V5"]],
    "F": [54, ["M50 5H9v92", "M9 50h32"]],
    " ": [30, []],
  };
  const NS = "http://www.w3.org/2000/svg";
  const hand = { svg: $("#handTitle"), paths: [], raf: 0, mode: "", done: false };
  function seeded(i) { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
  function buildHand(animate) {
    const svg = hand.svg; if (!svg) return;
    const narrow = innerWidth < 700;
    const mode = narrow ? "n" : "w";
    if (mode === hand.mode) return; hand.mode = mode;
    cancelAnimationFrame(hand.raf);
    const lines = narrow ? ["48 ORE", "DI LIEVITO.", "90 SECONDI", "DI FORNO."] : ["48 ORE DI LIEVITO.", "90 SECONDI DI FORNO."];
    const GAP = 13, LH = 136, SW = 16.5;
    const widths = lines.map((l) => [...l].reduce((a, c) => a + GL[c][0], 0) + GAP * (l.length - 1));
    const W = Math.max(...widths) + 24, H = 12 + (lines.length - 1) * LH + 100 + 14;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    svg.innerHTML = `<defs><filter id="chalk" x="-4%" y="-6%" width="108%" height="112%"><feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5" xChannelSelector="R" yChannelSelector="G" result="d"/><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="1" seed="2" result="g"/><feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -9 6.9" result="m"/><feComposite in="d" in2="m" operator="in"/></filter></defs>`;
    const root = document.createElementNS(NS, "g"); root.setAttribute("filter", "url(#chalk)"); root.setAttribute("stroke-width", SW); svg.appendChild(root);
    hand.paths = []; let gi = 0;
    lines.forEach((line, li) => {
      let x = (W - widths[li]) / 2; const y = 12 + li * LH;
      [...line].forEach((ch) => {
        const [w, strokes] = GL[ch]; gi++;
        if (strokes.length) {
          const r = (seeded(gi) - .5) * 6, dy = (seeded(gi + 50) - .5) * 6, sc = .97 + seeded(gi + 90) * .06;
          const g = document.createElementNS(NS, "g");
          g.setAttribute("transform", `translate(${(x).toFixed(1)} ${(y + dy).toFixed(1)}) rotate(${r.toFixed(2)} ${w / 2} 50) scale(${sc.toFixed(3)})`);
          strokes.forEach((d, si) => {
            const p = document.createElementNS(NS, "path"); p.setAttribute("d", d); g.appendChild(p);
            hand.paths.push({ p, first: si === 0 });
          });
          root.appendChild(g);
        }
        x += w + GAP;
      });
    });
    // measure, then either play or show
    hand.paths.forEach((o) => { o.len = o.p.getTotalLength(); });
    if (!animate || REDUCE || hand.done) { hand.paths.forEach((o) => { o.p.style.strokeDasharray = ""; o.p.style.strokeDashoffset = ""; o.p.style.opacity = 1; }); hand.done = true; return; }
    play();
  }
  function play() {
    const SPEED = 3.4, GAP_S = 20, GAP_G = 40; let t = 0;
    hand.paths.forEach((o) => {
      t += o.first ? GAP_G : GAP_S;
      o.t0 = t; o.dur = Math.max(70, o.len / SPEED); t += o.dur;
      o.p.style.strokeDasharray = `${o.len} ${o.len + 40}`; o.p.style.strokeDashoffset = o.len; o.p.style.opacity = 0;
    });
    hand.total = t;
    const start = performance.now() + 250;
    const pen = (u) => u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
    const tick = (now) => {
      const el = now - start;
      for (const o of hand.paths) {
        const u = clamp((el - o.t0) / o.dur, 0, 1);
        if (u <= 0) continue;
        o.p.style.opacity = 1;
        o.p.style.strokeDashoffset = (o.len * (1 - pen(u))).toFixed(2);
      }
      if (el < hand.total) hand.raf = requestAnimationFrame(tick);
      else { hand.done = true; hand.paths.forEach((o) => { o.p.style.strokeDasharray = ""; o.p.style.strokeDashoffset = ""; }); }
    };
    hand.raf = requestAnimationFrame(tick);
  }
  buildHand(true);
  let rzT = 0; addEventListener("resize", () => { clearTimeout(rzT); rzT = setTimeout(() => { buildHand(false); placeAllPills(); }, 120); });

  /* ---------- header, mobile menu, corner ---------- */
  const hd = $("#hd"), hero = $(".hero"), corner = $("#corner"), menuSec = $("#menu");
  let cornerOff = false, drawerOpen = false;
  function onScroll() {
    const y = scrollY, hh = hero.offsetHeight;
    hd.classList.toggle("is-solid", y > hh - 120);
    // the corner offer only rides along the opening screens, never over the menu, finder or forms
    const menuTop = menuSec.getBoundingClientRect().top;
    corner.classList.toggle("show", !cornerOff && y > hh * .8 && menuTop > innerHeight * .9 && !drawerOpen);
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  $("#cornerX").addEventListener("click", () => { cornerOff = true; corner.classList.remove("show"); });

  const burger = $("#burger"), mnav = $("#mnav");
  function setMnav(open) {
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Chiudi il menù" : "Apri il menù");
    if (open) { mnav.hidden = false; requestAnimationFrame(() => mnav.classList.add("open")); document.body.style.overflow = "hidden"; }
    else { mnav.classList.remove("open"); document.body.style.overflow = ""; setTimeout(() => { if (burger.getAttribute("aria-expanded") === "false") mnav.hidden = true; }, 260); }
  }
  burger.addEventListener("click", () => setMnav(burger.getAttribute("aria-expanded") !== "true"));
  $$("#mnav a, .mbar a").forEach((a) => a.addEventListener("click", () => setMnav(false)));

  /* ---------- hand strokes draw on scroll + madre age ---------- */
  $$(".draw").forEach((p) => p.setAttribute("pathLength", "1"));
  const BORN = Date.UTC(2015, 2, 21);
  const ageEl = $("#madreAge"); const ageTarget = Math.floor((Date.now() - BORN) / 86400000);
  // start from where the count-up begins, so entering the screen never shows the final number and then jumps back
  ageEl.textContent = (REDUCE || !("IntersectionObserver" in window) ? ageTarget : ageTarget - 120).toLocaleString("it-IT");
  function countAge() {
    if (REDUCE) return; const t0 = performance.now(), from = ageTarget - 120;
    const f = (now) => { const u = clamp((now - t0) / 900, 0, 1), e = 1 - Math.pow(1 - u, 3); ageEl.textContent = Math.round(from + (ageTarget - from) * e).toLocaleString("it-IT"); if (u < 1) requestAnimationFrame(f); };
    requestAnimationFrame(f);
  }
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-drawn");
      if (e.target.classList.contains("slow-txt")) countAge();
      io.unobserve(e.target);
    }), { rootMargin: "0px 0px -15% 0px" });
    $$(".promo .blob, .ann, .slow-txt").forEach((el) => io.observe(el));
  } else $$(".promo .blob, .ann").forEach((el) => el.classList.add("is-drawn"));

  /* =========================================================
     2 · Filter chips: highlight slides on two edges, results swap in turn
     ========================================================= */
  function placePill(group, btn, animate) {
    const pill = $(".chips-pill", group); if (!pill || !btn) return;
    const L = btn.offsetLeft, R = group.clientWidth - (btn.offsetLeft + btn.offsetWidth);
    const right = L > pill.offsetLeft;
    pill.style.transition = !animate || REDUCE ? "none" : right
      ? "right .22s cubic-bezier(.3,.7,.4,1), left .3s cubic-bezier(.5,0,.3,1) .04s"
      : "left .22s cubic-bezier(.3,.7,.4,1), right .3s cubic-bezier(.5,0,.3,1) .04s";
    pill.style.left = L + "px"; pill.style.right = R + "px";
  }
  function placeAllPills() { $$(".chips").forEach((g) => placePill(g, $('[aria-pressed="true"]', g), false)); }
  function chipGroup(group, onPick) {
    const btns = $$("button", group);
    btns.forEach((b) => b.addEventListener("click", () => {
      if (b.getAttribute("aria-pressed") === "true") return;
      btns.forEach((x) => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
      placePill(group, b, true); onPick(b.dataset.k);
    }));
  }

  /* ---------- cart state ---------- */
  const cart = { items: {}, store: null, slot: null, step: 1 };
  const cartQty = () => Object.values(cart.items).reduce((a, b) => a + b, 0);
  const cartTot = () => Object.entries(cart.items).reduce((a, [id, q]) => a + PZ[id].p * q, 0);
  const MAXQ = 12;
  function setQty(id, q) {
    const before = cartQty() - (cart.items[id] || 0);
    if (before + q > MAXQ) { toast("Al massimo " + MAXQ + " pizze per ordine online."); return false; }
    if (q <= 0) delete cart.items[id]; else cart.items[id] = q;
    syncCart(); return true;
  }

  /* ---------- menu grid ---------- */
  const pzGrid = $("#pzGrid"), menuCount = $("#menuCount");
  let menuCat = "tutte", swapT = [];
  const pzMatch = (p, k) => k === "tutte" || (k === "veg" ? !!p.tag : p.cat === k);
  function actHTML(p) {
    const q = cart.items[p.id] || 0;
    return q ? `<span class="step" aria-label="Quantità ${p.n}"><button type="button" data-dec="${p.id}" aria-label="Togli una ${p.n}">−</button><output>${q}</output><button type="button" data-inc="${p.id}" aria-label="Aggiungi una ${p.n}">+</button></span>`
      : `<button class="pill pill-outline-red" type="button" data-inc="${p.id}">+ Aggiungi</button>`;
  }
  function pzHTML(p) {
    const tags = (p.tag ? `<span class="tag tag-v">${p.tag}</span>` : "") + (p.nuova ? `<span class="tag">nuova</span>` : "") + `<span class="tag">${p.cat}</span>`;
    return `<article class="pz" data-id="${p.id}"><div class="pz-img"><img src="assets/p-${p.id}.webp" alt="Pizza ${p.n} vista dall'alto" loading="lazy" width="520" height="520" draggable="false"></div>
      <div class="pz-top"><h3>${p.n}</h3><span class="pz-price">${euro(p.p)}</span></div>
      <p class="mono">${p.d}</p><div class="tags">${tags}</div><div class="pz-act">${actHTML(p)}</div></article>`;
  }
  function renderMenu(animate) {
    const list = PIZZE.filter((p) => pzMatch(p, menuCat));
    menuCount.textContent = list.length + (list.length === 1 ? " pizza" : " pizze");
    swapT.forEach(clearTimeout); swapT = [];
    if (!animate || REDUCE) { pzGrid.innerHTML = list.map(pzHTML).join(""); return; }
    // old cards fade out (250 ms), then the new ones come in from a 6px blur, one after another
    $$(".pz", pzGrid).forEach((el) => { el.classList.remove("show", "enter"); el.classList.add("leave"); });
    swapT.push(setTimeout(() => {
      pzGrid.innerHTML = list.map(pzHTML).join("");
      const cards = $$(".pz", pzGrid); cards.forEach((c) => c.classList.add("enter"));
      cards.forEach((c, i) => swapT.push(setTimeout(() => { c.getBoundingClientRect(); c.classList.replace("enter", "show"); }, 16 + i * 70)));
    }, 270));
  }
  chipGroup($("#chips"), (k) => { menuCat = k; renderMenu(true); });
  renderMenu(false);
  function refreshMenuActs() { $$(".pz", pzGrid).forEach((el) => { const p = PZ[el.dataset.id]; $(".pz-act", el).innerHTML = actHTML(p); }); }
  pzGrid.addEventListener("click", (e) => {
    const inc = e.target.closest("[data-inc]"), dec = e.target.closest("[data-dec]");
    if (inc) { const id = inc.dataset.inc; if (setQty(id, (cart.items[id] || 0) + 1) && cart.items[id] === 1) toast(PZ[id].n + " nell'ordine · " + cartQty() + " in totale"); }
    if (dec) { const id = dec.dataset.dec; setQty(id, (cart.items[id] || 0) - 1); }
  });

  /* =========================================================
     3 · Store finder with arc reflow
     ========================================================= */
  const storesEl = $("#stores"), findMsg = $("#findMsg"), listInfo = $("#listInfo");
  let origin = null, onlyOpen = false;
  const cardEl = {};
  STORES.forEach((s) => {
    const li = document.createElement("li"); li.className = "st"; li.dataset.id = s.id;
    li.innerHTML = `<div class="st-top"><div><p class="st-tag">${s.tag}</p><h3>${s.name}</h3></div><span class="st-km"></span></div>
      <p class="st-status"></p><p class="st-hours"></p><p class="st-addr">${s.addr}</p>
      <div class="st-act"><button class="pill pill-red" type="button" data-order="${s.id}">Ordina qui</button><button class="pill pill-line" type="button" data-hours="${s.id}">Orari</button></div>`;
    cardEl[s.id] = li;
  });
  function paintStatus() {
    const now = romeNow();
    STORES.forEach((s) => {
      const el = cardEl[s.id], st = statusOf(s, now);
      const stEl = $(".st-status", el); stEl.className = "st-status " + st.state; stEl.textContent = st.text;
      $(".st-hours", el).textContent = "Oggi " + hoursText(s.h[now.dow]);
      $(".st-km", el).textContent = origin ? fmtKm(km(origin, s)) : "";
      el.classList.toggle("picked", cart.store === s.id);
      const pin = mapPins[s.id]; if (pin) pin.classList.toggle("closed", st.state === "closed");
    });
  }
  function orderedStores() {
    const arr = STORES.slice();
    if (origin) arr.sort((a, b) => km(origin, a) - km(origin, b));
    else arr.sort((a, b) => a.name.localeCompare(b.name, "it"));
    return arr;
  }
  // bezier ease (.22,.9,.3,1) solved numerically, as in the arc-reflow sample
  const ease = (t) => { let lo = 0, hi = 1; for (let i = 0; i < 14; i++) { const m = (lo + hi) / 2, x = 3 * .22 * m * (1 - m) * (1 - m) + 3 * .3 * m * m * (1 - m) + m * m * m; x < t ? lo = m : hi = m; } const u = (lo + hi) / 2; return 3 * .9 * u * (1 - u) * (1 - u) + 3 * u * u * (1 - u) + u * u * u; };
  let arcRaf = 0;
  const arcLog = [];
  function layoutStores(animate) {
    const now = romeNow();
    const first = new Map();
    $$(".st", storesEl).forEach((el) => { if (!el.hidden) first.set(el, el.getBoundingClientRect()); });
    cancelAnimationFrame(arcRaf);
    $$(".st", storesEl).forEach((el) => { el.style.transform = ""; el.style.opacity = ""; el.classList.remove("flying"); });
    // mutate: new order + visibility
    const order = orderedStores(); let shown = 0;
    order.forEach((s) => {
      const el = cardEl[s.id]; storesEl.appendChild(el);
      const vis = !onlyOpen || statusOf(s, now).state !== "closed";
      el.hidden = !vis; if (vis) shown++;
    });
    $("#storesEmpty").hidden = shown > 0;
    listInfo.textContent = shown + (shown === 1 ? " pizzeria" : " pizzerie") + (origin ? " · per distanza" : " · A–Z");
    paintStatus();
    if (!animate || REDUCE) return;
    const moves = []; let idx = 0;
    $$(".st", storesEl).forEach((el) => {
      if (el.hidden) return; const i = idx++;
      const a = first.get(el), b = el.getBoundingClientRect();
      if (!a) { moves.push({ el, i, enter: true }); return; }
      const dx = a.left - b.left, dy = a.top - b.top, len = Math.hypot(dx, dy);
      if (len < 1) return;
      // the arc: chord midpoint pushed out sideways — upward for horizontal hops, to the right for vertical ones
      let nx = -dy / len, ny = dx / len;
      if (ny > 1e-3 || (Math.abs(ny) <= 1e-3 && nx < 0)) { nx = -nx; ny = -ny; }
      const lift = Math.min(40 + len * .07, 120);
      moves.push({ el, i, x0: dx, y0: dy, cx: dx / 2 + nx * lift, cy: dy / 2 + ny * lift });
      el.style.transform = `translate(${dx}px, ${dy}px)`; el.classList.add("flying");
    });
    moves.forEach((m) => { if (m.enter) { m.el.style.opacity = 0; m.el.style.transform = "scale(.94)"; } });
    const DUR = 560, STEP = 28, t0 = performance.now();
    arcLog.length = 0;
    const tick = (now2) => {
      let busy = false;
      moves.forEach((m) => {
        const t = clamp((now2 - t0 - m.i * STEP) / DUR, 0, 1); if (t < 1) busy = true;
        const e = ease(t);
        if (m.enter) { m.el.style.opacity = e; m.el.style.transform = `scale(${.94 + .06 * e})`; return; }
        const x = (1 - e) * (1 - e) * m.x0 + 2 * (1 - e) * e * m.cx, y = (1 - e) * (1 - e) * m.y0 + 2 * (1 - e) * e * m.cy;
        m.el.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
        if (m.i === 0 || m === moves[0]) arcLog.push([+(now2 - t0).toFixed(1), +x.toFixed(2), +y.toFixed(2)]);
      });
      if (busy) arcRaf = requestAnimationFrame(tick);
      else moves.forEach((m) => { m.el.style.transform = ""; m.el.style.opacity = ""; m.el.classList.remove("flying"); });
    };
    arcRaf = requestAnimationFrame(tick);
  }
  chipGroup($("#openChips"), (k) => { onlyOpen = k === "open"; layoutStores(true); });

  function setOrigin(o, how) {
    origin = o; mapMe(o);
    const near = orderedStores()[0], d = km(o, near);
    const what = how === "sim" ? `Posizione simulata (demo): <b>${o.label}</b>.` : how === "geo" ? `Ti abbiamo trovato.` : `Vicino a <b>${o.label}</b>.`;
    findMsg.innerHTML = `${what} La più vicina è <b>${near.name}</b>, a ${fmtKm(d)}.` + (d > 120 ? " Un po' lontano, lo sappiamo." : "");
    layoutStores(true);
    hotStore(near.id, false);
  }

  /* search + suggestions */
  const q = $("#q"), sugg = $("#sugg");
  let suggIdx = -1, suggList = [];
  function findPlaces(text) {
    const k = norm(text); if (!k) return [];
    const ali = ALIASES[k]; const out = [];
    PLACES.forEach((p) => { if (p.k.startsWith(k) || (ali && p.n === ali)) out.push(p); });
    PLACES.forEach((p) => { if (!out.includes(p) && p.k.includes(k)) out.push(p); });
    STORES.forEach((s) => { if (norm(s.name).includes(k) && !out.some((o) => o.store === s.id)) { const name = s.name.replace(" · ", ", "); if (!out.some((o) => norm(o.n) === norm(name))) out.push({ n: name, lat: s.lat, lon: s.lon, pr: "Lenta", store: s.id }); } });
    return out.slice(0, 6);
  }
  function showSugg() {
    suggList = findPlaces(q.value); suggIdx = -1;
    if (!suggList.length || !q.value.trim()) { sugg.hidden = true; return; }
    sugg.innerHTML = suggList.map((p, i) => `<li role="option"><button type="button" data-i="${i}">${p.n}<span>${p.pr}</span></button></li>`).join("");
    sugg.hidden = false;
  }
  function pickPlace(p) { q.value = p.n; sugg.hidden = true; setOrigin({ lat: p.lat, lon: p.lon, label: p.n }, "search"); }
  q.addEventListener("input", showSugg);
  q.addEventListener("keydown", (e) => {
    if (sugg.hidden) return;
    const btns = $$("button", sugg);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); suggIdx = (suggIdx + (e.key === "ArrowDown" ? 1 : -1) + btns.length) % btns.length; btns.forEach((b, i) => b.classList.toggle("act", i === suggIdx)); }
    if (e.key === "Escape") sugg.hidden = true;
  });
  sugg.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) pickPlace(suggList[+b.dataset.i]); });
  document.addEventListener("click", (e) => { if (!e.target.closest(".search")) sugg.hidden = true; });
  $("#searchForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const list = findPlaces(q.value);
    if (suggIdx >= 0 && suggList[suggIdx]) return pickPlace(suggList[suggIdx]);
    if (!q.value.trim()) { findMsg.innerHTML = "Scrivi una città, per esempio <b>Reggio</b> o <b>Fidenza</b>."; q.focus(); return; }
    if (!list.length) { sugg.hidden = true; findMsg.innerHTML = `Non troviamo «<b>${q.value.replace(/[<>&]/g, "")}</b>». Prova con una città dell'Emilia o usa «Vicino a me».`; return; }
    pickPlace(list[0]);
  });
  const nearBtn = $("#nearBtn");
  nearBtn.addEventListener("click", () => {
    if (nearBtn.classList.contains("busy")) return;
    nearBtn.classList.add("busy"); $("span", nearBtn).textContent = "Ti cerco…";
    let done = false;
    const finish = (o, how) => { if (done) return; done = true; nearBtn.classList.remove("busy"); $("span", nearBtn).textContent = "Vicino a me"; q.value = ""; setOrigin(o, how); };
    const fallback = () => setTimeout(() => finish(SIM, "sim"), 500);
    try {
      // inside the preview iframe geolocation is blocked by policy (and Chrome logs it as an error): go straight to the demo spot
      let framed = true; try { framed = window.self !== window.top; } catch (err) { framed = true; }
      const allowed = !(document.featurePolicy && document.featurePolicy.allowsFeature && !document.featurePolicy.allowsFeature("geolocation"));
      if (navigator.geolocation && !framed && allowed) {
        navigator.geolocation.getCurrentPosition((p) => finish({ lat: p.coords.latitude, lon: p.coords.longitude, label: "la tua posizione" }, "geo"), fallback, { timeout: 5000, maximumAge: 600000 });
        setTimeout(() => finish(SIM, "sim"), 6000);
      } else fallback();
    } catch (err) { fallback(); }
  });

  /* hand-drawn map */
  const mapSvg = $("#map"), mapPins = {};
  const PX = (lon) => 26 + (lon - 9.6) * 238, PY = (lat) => 30 + (45.12 - lat) * 336;
  function smooth(pts) { let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`; for (let i = 1; i < pts.length; i++) { const p0 = pts[i - 1], p1 = pts[i]; const mx = (p0[0] + p1[0]) / 2, my = (p0[1] + p1[1]) / 2; d += ` Q${p0[0].toFixed(1)} ${p0[1].toFixed(1)} ${mx.toFixed(1)} ${my.toFixed(1)}`; } const l = pts[pts.length - 1]; return d + ` L${l[0].toFixed(1)} ${l[1].toFixed(1)}`; }
  function buildMap() {
    const po = [[9.55, 45.13], [9.7, 45.07], [9.86, 45.1], [10.02, 45.06], [10.2, 44.99], [10.38, 45.0], [10.55, 44.94], [10.72, 44.99], [10.92, 45.04], [11.1, 45.02], [11.3, 44.95], [11.5, 44.92], [11.62, 44.9], [11.78, 44.94]].map(([a, b]) => [PX(a), PY(b)]);
    const via = [[9.693, 45.0526], [9.91, 44.927], [10.0611, 44.8664], [10.3279, 44.8015], [10.6312, 44.6983], [10.9252, 44.6471], [11.05, 44.6], [11.3426, 44.4949], [11.72, 44.35]].map(([a, b]) => [PX(a), PY(b)]);
    let mnt = "";
    [[9.85, 44.62], [10.05, 44.55], [10.28, 44.5], [10.52, 44.45], [10.95, 44.38], [11.15, 44.3]].forEach(([a, b], i) => { const x = PX(a), y = PY(b), s = 13 + (i % 2) * 4; mnt += `<path class="mnt" d="M${x - s} ${y + 8}l${s * .55} ${-s * .9}l${s * .35} ${s * .45}l${s * .4} ${-s * .55}l${s * .7} ${s * 1}"/>`; });
    const labels = [["Piacenza", 9.693, 45.0526, 12, -14], ["Fidenza", 10.0611, 44.8664, -66, -12], ["Salsomaggiore", 9.979, 44.8146, -108, 22], ["Parma", 10.3279, 44.8015, -18, -24], ["Reggio E.", 10.6312, 44.6983, 14, 22], ["Modena", 10.9252, 44.6471, 14, 22], ["Carpi", 10.885, 44.7838, 14, -12], ["Sassuolo", 10.784, 44.543, -30, 28], ["Bologna", 11.3426, 44.4949, 14, 22], ["Ferrara", 11.6198, 44.8381, -32, -24]];
    let h = `<path class="po" d="${smooth(po)}"/><text class="lbl-po" x="${PX(10.45)}" y="${PY(45.05)}">Po</text>`;
    h += `<path class="via" d="${smooth(via)}"/><text class="lbl-via" x="${PX(10.72)}" y="${PY(44.585)}" transform="rotate(14 ${PX(10.72)} ${PY(44.585)})">via Emilia</text>`;
    h += mnt + `<text class="lbl-via" x="${PX(10.2)}" y="${PY(44.4)}">Appennino</text>`;
    labels.forEach(([n, lon, lat, dx, dy]) => { h += `<text x="${(PX(lon) + dx).toFixed(1)}" y="${(PY(lat) + dy).toFixed(1)}">${n}</text>`; });
    h += `<g id="mapMe"></g>`;
    STORES.forEach((s) => { const x = PX(s.lon) + s.mapDx, y = PY(s.lat) + s.mapDy; h += `<g class="pin" data-pin="${s.id}" tabindex="0" role="button" aria-label="${s.name}"><g class="pin-g" transform="translate(${(x - 9).toFixed(1)} ${(y - 24).toFixed(1)})"><path d="M9 0C4 0 0 3.8 0 8.8 0 15 9 24 9 24s9-9 9-15.2C18 3.8 14 0 9 0Z"/><circle cx="9" cy="8.6" r="3.3"/></g></g>`; });
    mapSvg.innerHTML = h;
    $$(".pin", mapSvg).forEach((p) => { mapPins[p.dataset.pin] = p; });
  }
  function mapMe(o) {
    const g = $("#mapMe"); if (!o) { g.innerHTML = ""; return; }
    const x = clamp(PX(o.lon), 8, 592), y = clamp(PY(o.lat), 8, 322);
    g.innerHTML = `<g class="me"><circle class="halo" cx="${x}" cy="${y}" r="16"/><circle cx="${x}" cy="${y}" r="7"/></g>`;
  }
  function hotStore(id, scroll) {
    Object.values(cardEl).forEach((el) => el.classList.toggle("hot", el.dataset.id === id));
    Object.entries(mapPins).forEach(([k, p]) => p.classList.toggle("hot", k === id));
    if (scroll) { const el = cardEl[id]; if (el.hidden) { toast(SBY[id].name + " adesso è chiusa"); return; } el.scrollIntoView({ block: "center", behavior: REDUCE ? "auto" : "smooth" }); }
    clearTimeout(hotStore.t); hotStore.t = setTimeout(() => Object.values(cardEl).forEach((el) => el.classList.remove("hot")), 2400);
  }
  buildMap();
  mapSvg.addEventListener("click", (e) => { const p = e.target.closest(".pin"); if (p) hotStore(p.dataset.pin, true); });
  mapSvg.addEventListener("keydown", (e) => { const p = e.target.closest(".pin"); if (p && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); hotStore(p.dataset.pin, true); } });
  storesEl.addEventListener("mouseover", (e) => { const c = e.target.closest(".st"); Object.entries(mapPins).forEach(([k, p]) => p.classList.toggle("hot", !!c && k === c.dataset.id)); });
  storesEl.addEventListener("mouseleave", () => Object.values(mapPins).forEach((p) => p.classList.remove("hot")));
  storesEl.addEventListener("click", (e) => {
    const o = e.target.closest("[data-order]"), h = e.target.closest("[data-hours]");
    if (o) { cart.store = o.dataset.order; cart.slot = null; openOrder(); }
    if (h) openHours(h.dataset.hours);
  });
  layoutStores(false);
  setInterval(() => { paintStatus(); if (drawerOpen) renderStore(); }, 30000);

  /* hours dialog */
  const hrs = $("#hrs"); let hrsBack = null;
  function openHours(id) {
    const s = SBY[id], now = romeNow(); hrsBack = document.activeElement;
    $("#hrsH").textContent = "Lenta " + s.name; $("#hrsAddr").textContent = s.addr + " · " + statusOf(s, now).text;
    $("#hrsT").innerHTML = s.h.map((rs, d) => `<tr class="${d === now.dow ? "today" : ""}"><td>${DAYS[d]}</td><td>${hoursText(rs)}</td></tr>`).join("");
    hrs.hidden = false; requestAnimationFrame(() => hrs.classList.add("on")); $("#hrsX").focus();
  }
  function closeHours() { hrs.classList.remove("on"); setTimeout(() => { hrs.hidden = true; }, 200); if (hrsBack) hrsBack.focus(); }
  $("#hrsX").addEventListener("click", closeHours);
  hrs.addEventListener("click", (e) => { if (e.target === hrs) closeHours(); });

  /* =========================================================
     4 · Order drawer: pizzas → pickup slot → done
     ========================================================= */
  const drawer = $("#drawer"), scrim = $("#scrim"), drNext = $("#drNext"), drBack = $("#drBack"), drErr = $("#drErr");
  let lastFocus = null;
  function openOrder() {
    lastFocus = document.activeElement; drawerOpen = true; setMnav(false);
    if (cart.step === 3) resetOrder();
    drawer.hidden = false; scrim.hidden = false;
    requestAnimationFrame(() => { drawer.classList.add("on"); scrim.classList.add("on"); });
    document.body.style.overflow = "hidden"; corner.classList.remove("show");
    renderDrawer(); setTimeout(() => $(".x", drawer).focus(), 60);
  }
  function closeOrder() {
    drawerOpen = false; drawer.classList.remove("on"); scrim.classList.remove("on"); document.body.style.overflow = "";
    setTimeout(() => { if (!drawerOpen) { drawer.hidden = true; scrim.hidden = true; } }, 380);
    if (lastFocus && lastFocus.focus) lastFocus.focus(); onScroll();
  }
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-open-order]"); if (t) { e.preventDefault(); openOrder(); }
    if (e.target.closest("[data-close-order]")) closeOrder();
  });
  scrim.addEventListener("click", closeOrder);
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!hrs.hidden) closeHours(); else if (drawerOpen) closeOrder(); else if (burger.getAttribute("aria-expanded") === "true") setMnav(false);
  });
  drawer.addEventListener("keydown", (e) => {
    if (e.key !== "Tab") return;
    const f = $$("button, input, select, textarea, [tabindex='0']", drawer).filter((x) => !x.disabled && x.offsetParent !== null);
    if (!f.length) return; const a = f[0], z = f[f.length - 1];
    if (e.shiftKey && document.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && document.activeElement === z) { e.preventDefault(); a.focus(); }
  });

  let changingStore = false;
  function renderStore() {
    const box = $("#drStore");
    if (cart.step === 3) { box.hidden = true; return; } box.hidden = false;
    const opts = orderedStores().map((s) => `<option value="${s.id}" ${cart.store === s.id ? "selected" : ""}>${s.name}${origin ? " · " + fmtKm(km(origin, s)) : ""}</option>`).join("");
    if (!cart.store || changingStore) {
      box.innerHTML = `<b>Da quale pizzeria ritiri?</b><span></span><select id="drSel" aria-label="Pizzeria di ritiro"><option value="">Scegli la pizzeria…</option>${opts}</select>`;
      $("#drSel").addEventListener("change", (e) => { cart.store = e.target.value || null; cart.slot = null; changingStore = false; drErr.textContent = ""; renderStore(); paintStatus(); if (cart.step === 2) renderSlots(); });
      return;
    }
    const s = SBY[cart.store], st = statusOf(s);
    box.innerHTML = `<b>Ritiro da Lenta ${s.name}</b><button class="lnk" type="button" id="drChange">Cambia</button><span class="st-status ${st.state}">${st.text}</span>`;
    $("#drChange").addEventListener("click", () => { changingStore = true; renderStore(); $("#drSel").focus(); });
  }
  function renderDrMenu() {
    $("#drMenu").innerHTML = PIZZE.map((p) => { const qn = cart.items[p.id] || 0; return `<li><img src="assets/p-${p.id}.webp" alt="" width="56" height="56" loading="lazy"><div><b>${p.n}</b><span class="mono">${euro(p.p)}${p.tag ? " · " + p.tag : ""}</span></div>
      <span class="step"><button type="button" data-dec="${p.id}" aria-label="Togli una ${p.n}" ${qn ? "" : "disabled"}>−</button><output>${qn}</output><button type="button" data-inc="${p.id}" aria-label="Aggiungi una ${p.n}">+</button></span></li>`; }).join("");
  }
  $("#drMenu").addEventListener("click", (e) => {
    const inc = e.target.closest("[data-inc]"), dec = e.target.closest("[data-dec]");
    if (inc) setQty(inc.dataset.inc, (cart.items[inc.dataset.inc] || 0) + 1);
    if (dec) setQty(dec.dataset.dec, (cart.items[dec.dataset.dec] || 0) - 1);
  });
  function slotHash(str) { let h = 2166136261; for (const c of str) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return Math.abs(h); }
  function slotsFor(s, now = romeNow()) {
    const LEAD = 20, list = [];
    const ranges = []; s.h[(now.dow + 6) % 7].forEach((r) => { if (r[1] > 1440) ranges.push([-1, r[1] - 1440]); }); s.h[now.dow].forEach((r) => ranges.push(r));
    const earliest = now.min + LEAD;
    ranges.forEach((r) => { let m = Math.ceil(Math.max(r[0] < 0 ? 0 : r[0] + 15, earliest) / 15) * 15; for (; m <= r[1] - 15; m += 15) list.push(m); });
    let off = 0;
    if (!list.length) {
      for (let d = 1; d <= 7; d++) { const rs = s.h[(now.dow + d) % 7]; if (rs.length) { off = d; rs.forEach((r) => { for (let m = r[0] + 15; m <= r[1] - 15; m += 15) list.push(m); }); break; } }
    }
    const day = (now.dow + off) % 7;
    const out = list.slice(0, 20).map((m) => ({ m, full: slotHash(s.id + day + ":" + m) % 6 === 0 }));
    if (out.length && out.every((x) => x.full)) out[0].full = false;
    return { off, day, list: out };
  }
  function renderSlots() {
    const box = $("#slots");
    if (!cart.store) { box.innerHTML = ""; $("#slotDay").textContent = "Prima scegli la pizzeria qui sopra."; return; }
    const r = slotsFor(SBY[cart.store]);
    $("#slotDay").textContent = r.off === 0 ? "Oggi · prima fascia tra almeno 20 minuti" : (r.off === 1 ? "Oggi è chiusa: ritiro domani" : "Ritiro " + DAYS[r.day]) + " · la pizzeria ora è chiusa";
    if (cart.slot && !r.list.some((x) => x.m === cart.slot.m && r.off === cart.slot.off && !x.full)) cart.slot = null;
    box.innerHTML = r.list.map((x) => `<button type="button" class="slot" role="radio" aria-checked="${cart.slot && cart.slot.m === x.m ? "true" : "false"}" data-m="${x.m}" ${x.full ? "disabled aria-label=\"" + hhmm(x.m) + " pieno\"" : ""}>${hhmm(x.m)}</button>`).join("");
    box.onclick = (e) => { const b = e.target.closest(".slot"); if (!b || b.disabled) return; cart.slot = { m: +b.dataset.m, off: r.off, day: r.day }; box.classList.remove("bad"); drErr.textContent = ""; $$(".slot", box).forEach((x) => x.setAttribute("aria-checked", x === b ? "true" : "false")); };
  }
  function renderDrawer() {
    $$(".dr-steps li").forEach((li) => li.classList.toggle("on", +li.dataset.s <= cart.step));
    $("#drBody1").hidden = cart.step !== 1; $("#drBody2").hidden = cart.step !== 2; $("#drBody3").hidden = cart.step !== 3;
    $("#drFoot").hidden = cart.step === 3;
    drBack.hidden = cart.step !== 2;
    drNext.textContent = cart.step === 1 ? "Scegli l'orario" : "Conferma ordine";
    renderStore();
    if (cart.step === 1) renderDrMenu();
    if (cart.step === 2) renderSlots();
    syncTotals();
  }
  function syncTotals() {
    const n = cartQty();
    $("#drQty").textContent = n + (n === 1 ? " pizza" : " pizze");
    $("#drTot").textContent = euro(cartTot());
  }
  function syncCart() {
    const n = cartQty();
    [$("#hdCount"), $("#mbCount")].forEach((c) => { const was = c.textContent; c.textContent = n; c.hidden = !n; if (was !== String(n) && n) { c.classList.remove("bump"); void c.offsetWidth; c.classList.add("bump"); } });
    refreshMenuActs();
    if (drawerOpen && cart.step === 1) renderDrMenu();
    syncTotals(); if (n) drErr.textContent = "";
  }
  drNext.addEventListener("click", () => {
    drErr.textContent = "";
    if (cart.step === 1) {
      if (!cartQty()) { drErr.textContent = "Aggiungi almeno una pizza."; return; }
      if (!cart.store) { drErr.textContent = "Scegli la pizzeria dove ritiri."; const sel = $("#drSel"); if (sel) { sel.classList.add("bad"); sel.focus(); } return; }
      cart.step = 2; renderDrawer(); $("#drBody2").scrollTop = 0; return;
    }
    if (cart.step === 2) {
      const name = $("#oName"), phone = $("#oPhone");
      [name, phone].forEach((x) => x.classList.remove("bad"));
      if (!cart.store) { drErr.textContent = "Scegli la pizzeria dove ritiri."; return; }
      if (!cart.slot) { drErr.textContent = "Scegli un orario di ritiro."; $("#slots").classList.add("bad"); return; }
      if (name.value.trim().length < 2) { drErr.textContent = "Scrivi il nome per il banco."; name.classList.add("bad"); name.focus(); return; }
      if (!/^\+?[\d\s]{8,16}$/.test(phone.value.trim())) { drErr.textContent = "Il telefono non sembra giusto (solo cifre, almeno 8)."; phone.classList.add("bad"); phone.focus(); return; }
      confirmOrder(name.value.trim());
    }
  });
  drBack.addEventListener("click", () => { cart.step = 1; drErr.textContent = ""; renderDrawer(); });
  function confirmOrder(name) {
    const s = SBY[cart.store], n = cartQty(), no = "L-" + (1000 + (slotHash(name + Date.now()) % 9000));
    const when = cart.slot.off === 0 ? "oggi" : cart.slot.off === 1 ? "domani" : DAYS[cart.slot.day];
    $("#doneNo").textContent = "Ordine " + no;
    $("#doneTxt").textContent = `${name}, ${n} ${n === 1 ? "pizza" : "pizze"} (${euro(cartTot())}) ti aspettano ${when} alle ${hhmm(cart.slot.m)} da Lenta ${s.name}, ${s.addr}. Paghi al banco.`;
    const before = stamps; addStamps(n);
    $("#doneStamps").textContent = stamps >= 10 && before < 10 ? "La tua tessera è piena: la prossima pizza è nostra." : `+${Math.min(n, 10 - before)} timbri sulla tessera (${stamps}/10).`;
    cart.step = 3; lastOrder = { no, store: s.id, slot: cart.slot.m, qty: n };
    cart.items = {}; syncCart(); renderDrawer(); $("#drBody3").focus();
    toast("Ordine " + no + " confermato");
  }
  let lastOrder = null;
  function resetOrder() { cart.step = 1; cart.slot = null; $("#oName").value = ""; $("#oPhone").value = ""; }
  $("#newOrder").addEventListener("click", () => { resetOrder(); renderDrawer(); });

  /* =========================================================
     5 · Loyalty card: progress is the background
     ========================================================= */
  const lcard = $("#lcard"), lcNum = $("#lcNum"), lcMsg = $("#lcMsg"), stampsEl = $("#stamps"), stampBtn = $("#stampBtn");
  let stamps = clamp(+store.get("stamps", 3) || 0, 0, 10), shownStamps = stamps, numRaf = 0;
  const PIZZA_ICON = `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9" fill="none" stroke="#fff" stroke-width="2"/><circle cx="9" cy="9.5" r="1.6" fill="#fff"/><circle cx="14.5" cy="10" r="1.3" fill="#fff"/><circle cx="11.5" cy="14.8" r="1.5" fill="#fff"/></svg>`;
  stampsEl.innerHTML = Array.from({ length: 10 }, (_, i) => `<span class="stamp" style="--r:${(seeded(i + 7) - .5) * 30}deg">${PIZZA_ICON}</span>`).join("");
  function paintLoyal(animate) {
    lcard.style.setProperty("--p", stamps * 10 + "%");
    $$(".stamp", stampsEl).forEach((s, i) => s.classList.toggle("on", i < stamps));
    lcard.classList.toggle("done", stamps >= 10);
    lcMsg.textContent = stamps >= 10 ? "Tessera piena: la prossima pizza la offriamo noi." : `Mancano ${10 - stamps} ${10 - stamps === 1 ? "pizza" : "pizze"} alla prossima offerta.`;
    stampBtn.textContent = stamps >= 10 ? "Usa la pizza offerta" : "Simula una visita";
    // number counts on the same 600ms clock as the fill
    cancelAnimationFrame(numRaf);
    const from = shownStamps, to = stamps;
    if (!animate || REDUCE || from === to) { shownStamps = to; lcNum.textContent = to; return; }
    const t0 = performance.now();
    const f = (now) => { const u = clamp((now - t0) / 600, 0, 1), e = 1 - Math.pow(1 - u, 3); shownStamps = from + (to - from) * e; lcNum.textContent = Math.round(shownStamps); if (u < 1) numRaf = requestAnimationFrame(f); else shownStamps = to; };
    numRaf = requestAnimationFrame(f);
  }
  function addStamps(n) { stamps = clamp(stamps + n, 0, 10); store.set("stamps", stamps); paintLoyal(true); }
  stampBtn.addEventListener("click", () => {
    if (stamps >= 10) { stamps = 0; store.set("stamps", 0); paintLoyal(true); toast("Pizza offerta usata. Si ricomincia da zero."); return; }
    addStamps(1);
  });
  $("#stampReset").addEventListener("click", () => { stamps = 0; store.set("stamps", 0); paintLoyal(true); });
  paintLoyal(false);

  /* =========================================================
     6 · Groups form
     ========================================================= */
  const gform = $("#gform"), gStore = $("#gStore"), gType = $("#gType"), gDate = $("#gDate"), gPpl = $("#gPpl"), gEmail = $("#gEmail"), gTel = $("#gTel"), gErr = $("#gErr");
  gStore.innerHTML += STORES.slice().sort((a, b) => a.name.localeCompare(b.name, "it")).map((s) => `<option value="${s.id}">${s.name}</option>`).join("");
  gDate.min = romeDateISO(1);
  $$("[data-group-type]").forEach((a) => a.addEventListener("click", () => { gType.value = a.dataset.groupType; syncPpl(); }));
  function syncPpl() { const corso = gType.value === "corso"; gPpl.min = corso ? 2 : 8; gPpl.max = corso ? 12 : 40; if (corso && +gPpl.value > 12) gPpl.value = 6; if (!corso && +gPpl.value < 8) gPpl.value = 10; }
  gType.addEventListener("change", syncPpl);
  gform.addEventListener("submit", (e) => {
    e.preventDefault();
    [gStore, gDate, gPpl, gEmail, gTel].forEach((x) => x.classList.remove("bad"));
    const fail = (el, msg) => { el.classList.add("bad"); el.focus(); gErr.textContent = msg; };
    const ppl = +gPpl.value, min = +gPpl.min, max = +gPpl.max;
    if (!gStore.value) return fail(gStore, "Scegli la pizzeria.");
    if (!gDate.value) return fail(gDate, "Scegli una data.");
    if (gDate.value < gDate.min) return fail(gDate, "Per i gruppi serve almeno un giorno di preavviso.");
    if (!Number.isInteger(ppl) || ppl < min || ppl > max) return fail(gPpl, gType.value === "corso" ? "Il corso è da 2 a 12 persone." : "Per i gruppi: da 8 a 40 persone.");
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(gEmail.value.trim())) return fail(gEmail, "Controlla l'email.");
    if (gTel.value.trim() && !/^\+?[\d\s]{8,16}$/.test(gTel.value.trim())) return fail(gTel, "Controlla il telefono (solo cifre).");
    gErr.textContent = "";
    const [y, m, d] = gDate.value.split("-");
    $("#gDoneTxt").textContent = `${gType.options[gType.selectedIndex].text} per ${ppl} il ${d}/${m}/${y} da Lenta ${SBY[gStore.value].name}. Ti scriviamo a ${gEmail.value.trim()} entro un giorno.`;
    $("#gDone").hidden = false; $("#gDone").focus();
  });
  $("#gAgain").addEventListener("click", () => { gform.reset(); syncPpl(); $("#gDone").hidden = true; gStore.focus(); });

  /* ---------- after fonts, put the chip highlights in place ---------- */
  placeAllPills();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeAllPills).catch(() => {});

  /* test hooks (verification only) */
  window.__lt = {
    setNow(dow, min) { FAKE = dow == null ? null : { dow, min }; paintStatus(); if (onlyOpen) layoutStores(false); },
    statusOf: (id) => statusOf(SBY[id]), slotsFor: (id) => slotsFor(SBY[id]), cart, arcLog, hand,
    get stamps() { return stamps; }, get origin() { return origin; }, get lastOrder() { return lastOrder; },
  };
})();
