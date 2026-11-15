/* Storica Pizzeria Ruoppolo — template script. Fictional business; all data invented. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp01 = (v) => Math.min(1, Math.max(0, v));
  const slice = (t, a, b) => clamp01((t - a) / (b - a));
  const outCubic = (x) => 1 - Math.pow(1 - x, 3);
  const outBack = (x) => { const c = 1.70158; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* Storage: the sandboxed preview has no same-origin, so any storage access throws. */
  const mem = {};
  const store = {
    get(k) { try { const v = window.localStorage.getItem(k); return v == null ? mem[k] ?? null : v; } catch (e) { return mem[k] ?? null; } },
    set(k, v) { mem[k] = v; try { window.localStorage.setItem(k, v); } catch (e) { /* memory only */ } },
    del(k) { delete mem[k]; try { window.localStorage.removeItem(k); } catch (e) { /* memory only */ } },
  };

  let toastT = 0;
  function toast(msg) {
    const el = $("#toast"); el.textContent = msg; el.classList.add("show");
    clearTimeout(toastT); toastT = setTimeout(() => el.classList.remove("show"), 2800);
  }

  /* ---------------- time (Europe/Rome) ---------------- */
  const T = (h, m = 0) => h * 60 + m;
  const DOW = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  const DAYS = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
  const DAYS_LONG = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  // ?ora=2026-11-14T20:15 pins the clock (Rome local time) — handy for previews and tests.
  let fixed = null;
  try {
    const q = new URLSearchParams(location.search).get("ora");
    const m = q && q.match(/^(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)$/);
    if (m) fixed = { dow: new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])).getUTCDay(), min: +m[4] * 60 + +m[5] };
  } catch (e) { fixed = null; }
  const fmtRome = new Intl.DateTimeFormat("en-US", { timeZone: "Europe/Rome", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  function now() {
    if (fixed) return { ...fixed };
    const p = Object.fromEntries(fmtRome.formatToParts(new Date()).map((x) => [x.type, x.value]));
    return { dow: DOW[p.weekday], min: (+p.hour % 24) * 60 + +p.minute };
  }
  const hhmm = (m) => { m = ((m % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); };

  /* ---------------- data ---------------- */
  const wk = (fn) => Array.from({ length: 7 }, (_, d) => fn(d));
  const STORES = [
    { id: "napoli", city: "Napoli", dal: 1882, letter: "A", img: "sede-napoli", addr: ["Vico dei Cartari, 7", "80138 – Napoli"], tel: "+39 081 552 18 82", mult: 1.55, floor: 1,
      note: "La sede storica: due sale, un forno, la fila fuori dalla porta dal 1930.",
      hours: wk((d) => d === 0 ? [[T(18, 30), T(24, 30)]] : [[T(11), T(16)], [T(18, 30), T(24, 30)]]) },
    { id: "sorrento", city: "Sorrento", dal: 2019, letter: "S", img: "sede-sorrento", addr: ["Via dei Limoni, 41", "80067 – Sorrento"], tel: "+39 081 878 20 19", mult: 1.1, floor: 0,
      note: "Due passi dal porto, con il dehors sotto il pergolato.",
      hours: wk((d) => d === 2 ? [] : [[T(12), T(15)], [T(19), T(23, 30)]]) },
    { id: "pozzuoli", city: "Pozzuoli", dal: 2021, letter: "P", img: "sede-pozzuoli", addr: ["Largo dei Pescatori, 12", "80078 – Pozzuoli"], tel: "+39 081 526 20 21", mult: 1, floor: 0,
      note: "Solo la sera in settimana, anche a pranzo nel fine settimana.",
      hours: wk((d) => d === 1 ? [] : (d === 0 || d === 6) ? [[T(12, 30), T(15, 30)], [T(19), T(24, 30)]] : [[T(19), T(24)]]) },
    { id: "nola", city: "Nola", dal: 2023, letter: "L", img: "sede-nola", addr: ["Piazza delle Torri, 88", "80035 – Nola"], tel: "+39 081 823 20 23", mult: .9, floor: 0,
      note: "La sala più grande: tavolate fino a otto persone.",
      hours: wk((d) => d === 3 ? [] : [[T(12), T(15)], [T(19), T(23)]]) },
    { id: "benevento", city: "Benevento", dal: 2025, letter: "B", img: "sede-benevento", addr: ["Corso dei Sanniti, 150", "82100 – Benevento"], tel: "+39 0824 31 20 25", mult: .85, floor: 0,
      note: "L'ultima nata, a pochi chilometri dai campi dove cresce il nostro grano.",
      hours: wk((d) => [[T(12), T(14, 30)], [T(19), (d === 5 || d === 6) ? T(24, 30) : T(23, 30)]]) },
  ];
  const byId = Object.fromEntries(STORES.map((s) => [s.id, s]));

  const PIZZE = [
    { id: "marinara", n: "Marinara", d: "Pomodoro San Marzano, aglio dell'Ufita, origano selvatico, olio extravergine del Cilento.", p: [5.5, 9], img: "marinara-top", tag: "Dal 1882" },
    { id: "margherita", n: "Margherita", d: "Pomodoro, fiordilatte di Agerola, basilico, un filo di pecorino e olio extravergine.", p: [6.5, 11], img: "margherita-top", tag: "Dal 1882" },
    { id: "doppia", n: "Doppia", d: "La Margherita con il doppio del fiordilatte. Il nonno non voleva, i clienti sì.", p: [7.5, 12.5], img: "famiglia-top" },
    { id: "mezza", n: "Mezza e mezza", d: "Metà Marinara e metà Margherita, per chi alla porta non ha ancora deciso.", p: [7, 11.5], imgs: ["marinara-top", "margherita-top"], tag: "Per indecisi" },
  ];
  const BERE = [
    ["Acqua", "Naturale o frizzante, 0,5 l", 1.5], ["Gassosa al limone", "Di Sorrento, in vetro", 2.5], ["Bibita alla cola", "In vetro, 0,33 l", 3],
    ["Birra chiara alla spina", "0,4 l", 4], ["Birra artigianale campana", "Bionda non filtrata, 0,33 l", 5.5], ["Aglianico della casa", "Rosso, un quarto", 4],
    ["Falanghina della casa", "Bianco, un quarto", 4], ["Caffè", "Al banco, a fine pasto", 1.2],
  ];
  const STORIA = [
    { y: 1882, h: "Il primo forno", p: "Gaetano Ruoppolo, garzone di panettiere, accende un forno a legna in un basso dietro i Tribunali. In carta due pizze: marinara e margherita.", q: "«Due pizze bastano, se le fai bene.»" },
    { y: 1906, h: "Il bancone di marmo", p: "Arriva il bancone di marmo bianco su cui si stende ancora oggi ogni panetto. La pala è di faggio, fatta da un falegname del quartiere.", img: "pala" },
    { y: 1930, h: "Vico dei Cartari", p: "Il vecchio basso viene abbattuto. Gaetano si sposta di trecento metri, nel locale dove siamo ancora: due sale, un forno, la fila fuori.", img: "vicolo-1930", old: true },
    { y: 1943, h: "Il forno non si spegne", p: "Nei mesi più duri della guerra il forno cuoce pane per tutto il vicolo. Si paga quando si può; qualcuno salda il conto vent'anni dopo.", q: "«Il fuoco acceso è una promessa.»" },
    { y: 1977, h: "Nunzia al banco", p: "La nipote Nunzia prende in mano l'impasto: lievitazione lunga, ventiquattro ore, e niente più di quattro pizze in carta.", img: "spicchio" },
    { y: 1999, h: "Il numero di carta", p: "La coda arriva fino a via Duomo. Nasce l'eliminacode rosso alla porta: si prende il numero, si fa un giro, si torna. Diventa un rito.", q: "N° 001" },
    { y: 2019, h: "Fuori da Napoli", p: "Apre Sorrento, poi Pozzuoli e Nola. Stesso impasto, stessa farina, pizzaioli cresciuti al banco di Vico dei Cartari.", img: "golfo" },
    { y: 2025, h: "Benevento e il mondo", p: "Apre Benevento, vicino ai campi del nostro grano. Intanto la Margherita di famiglia attraversa il mare: Torino, Lisbona, New York, Osaka.", img: "sede-benevento" },
  ];
  const WORLD = [
    { city: "Torino", country: "Italia", area: "eu", addr: "Via dei Mercanti, 18", tel: "+39 011 812 18 82", lon: 7.69, lat: 45.07 },
    { city: "Lisbona", country: "Portogallo", area: "eu", addr: "Rua dos Fornos, 112", tel: "+351 21 342 18 82", lon: -9.14, lat: 38.71 },
    { city: "Berlino", country: "Germania", area: "eu", addr: "Bäckerstraße 41", tel: "+49 30 6128 1882", lon: 13.41, lat: 52.5 },
    { city: "New York", country: "Stati Uniti", area: "am", addr: "214 Baker Lane, Manhattan", tel: "+1 212 555 0182", lon: -74.0, lat: 40.72 },
    { city: "Buenos Aires", country: "Argentina", area: "am", addr: "Av. de los Hornos 1882", tel: "+54 11 4371 1882", lon: -58.38, lat: -34.6 },
    { city: "Osaka", country: "Giappone", area: "ap", addr: "2-4-11 Minami, Chuo-ku", tel: "+81 6 6245 1882", lon: 135.5, lat: 34.67 },
    { city: "Melbourne", country: "Australia", area: "ap", addr: "88 Oven St, Carlton", tel: "+61 3 9347 1882", lon: 144.97, lat: -37.8 },
  ];
  const HOME = { lon: 14.25, lat: 40.85 };

  /* ---------------- hours, status, queue model ---------------- */
  function openAt(s, dow, m) { return s.hours[dow].some(([a, b]) => m >= a && m < b); }
  function status(s, n = now()) {
    for (const [a, b] of s.hours[n.dow]) if (n.min >= a && n.min < b) return { state: "open", until: b };
    const y = (n.dow + 6) % 7;
    for (const [a, b] of s.hours[y]) if (b > 1440 && n.min < b - 1440) return { state: "open", until: b, spill: true };
    // next opening
    for (let d = 0; d < 8; d++) {
      const day = (n.dow + d) % 7;
      for (const [a] of s.hours[day]) {
        if (d === 0 && a <= n.min) continue;
        const inMin = d * 1440 + a - n.min;
        return { state: inMin <= 30 ? "soon" : "closed", at: a, d, day, inMin };
      }
    }
    return { state: "closed" };
  }
  function statusLabel(st) {
    if (st.state === "open") return "Aperto · chiude alle " + hhmm(st.until);
    if (!st.at && st.at !== 0) return "Chiuso";
    if (st.state === "soon") return "Apre alle " + hhmm(st.at) + " · numeri già attivi";
    const when = st.d === 0 ? "" : st.d === 1 ? "domani " : DAYS_LONG[st.day] + " ";
    return "Chiuso · riapre " + when + "alle " + hhmm(st.at);
  }
  const LEVELS = [
    { k: "Tranquillo", c: "#7fb08a" },
    { k: "Si aspetta", c: "#e0a25f" },
    { k: "Coda lunga", c: "#e0634f" },
  ];
  function level(s, dow, m) {
    let lv = 0;
    if (m >= T(12, 45) && m < T(14, 15)) lv = 2;
    else if ((m >= T(12) && m < T(12, 45)) || (m >= T(14, 15) && m < T(15))) lv = 1;
    else if (m >= T(20) && m < T(22, 15)) lv = 2;
    else if ((m >= T(19, 15) && m < T(20)) || (m >= T(22, 15) && m < T(23, 15))) lv = 1;
    const weekend = dow === 0 || dow === 6 || (dow === 5 && m >= T(18));
    if (weekend && m >= T(19) && lv === 0 && m < T(24)) lv = 1;
    return Math.max(lv, s.floor);
  }
  function estimate(s, ppl, n = now()) {
    const st = status(s, n);
    if (st.state === "closed") return null;
    let wait, ahead;
    if (st.state === "soon") { wait = st.inMin + 5; ahead = 3; }
    else {
      const m = st.spill ? n.min + 1440 : n.min;
      const dow = st.spill ? (n.dow + 6) % 7 : n.dow;
      const lv = level(s, dow, m);
      wait = [7, 18, 34][lv] * s.mult;
      if (ppl > 4) wait *= 1.3; else if (ppl === 1) wait *= .8;
      wait = Math.max(5, Math.round(wait / 5) * 5);
      ahead = Math.max(1, Math.round(wait / 3.2));
    }
    return { wait, ahead, at: n.min + wait, st };
  }

  /* ---------------- top bar: dropdown + mobile menu ---------------- */
  const ddBtn = $("#ddBtn"), ddList = $("#ddList");
  function renderDropdown() {
    ddList.innerHTML = STORES.map((s) => {
      const st = status(s);
      return `<button type="button" role="menuitem" data-goto="${s.id}"><span>${s.city}</span><small class="st-dot ${st.state === "open" ? "is-open" : st.state === "soon" ? "is-soon" : ""}">${st.state === "open" ? "aperto" : st.state === "soon" ? "a breve" : "chiuso"}</small></button>`;
    }).join("");
  }
  function setDd(open) { ddBtn.setAttribute("aria-expanded", open); ddList.classList.toggle("open", open); }
  ddBtn.addEventListener("click", (e) => { e.stopPropagation(); setDd(ddBtn.getAttribute("aria-expanded") !== "true"); });
  ddList.addEventListener("click", (e) => { const b = e.target.closest("[data-goto]"); if (!b) return; setDd(false); gotoStore(b.dataset.goto); });
  document.addEventListener("click", (e) => { if (!e.target.closest("#sediDd")) setDd(false); });

  const burger = $("#burger"), mnav = $("#mnav");
  function setMnav(open) {
    burger.setAttribute("aria-expanded", open);
    burger.setAttribute("aria-label", open ? "Chiudi il menu" : "Apri il menu");
    mnav.hidden = !open; mnav.classList.toggle("anim", open);
    document.documentElement.style.overflow = open ? "hidden" : "";
  }
  burger.addEventListener("click", () => setMnav(burger.getAttribute("aria-expanded") !== "true"));
  mnav.addEventListener("click", (e) => { if (e.target.closest("a, button")) setMnav(false); });
  matchMedia("(min-width: 901px)").addEventListener("change", (e) => { if (e.matches) setMnav(false); });

  /* ---------------- HERO: door strips (one clock per strip, rewinds from where it is) ---------------- */
  const hs = $("#hs");
  const mobileQ = matchMedia("(max-width: 900px)");
  const DUR = 620;
  hs.innerHTML = STORES.map((s, i) => `
    <article class="hs-p" tabindex="0" data-i="${i}" style="--i:${i}" aria-label="${s.city}, dal ${s.dal}">
      <img class="hs-img" src="assets/${s.img}.webp" alt="" width="720" height="960" draggable="false" ${i > 2 ? 'loading="lazy"' : ""}>
      <div class="hs-box">
        <div class="hs-head"><h2 class="hs-city">${s.city}</h2><p class="hs-dal">dal ${s.dal}</p></div>
        <p class="hs-addr hs-fold">${s.addr[0]}<br>${s.addr[1]}</p>
        <div class="hs-fold"><span class="st-dot hs-stat" data-stat="${s.id}"></span></div>
        <div class="hs-rest"><a class="btn btn-caramel hs-btn" href="#sedi" data-goto="${s.id}">Scopri</a></div>
        <div class="hs-more">
          <p data-more="${s.id}"></p>
          <div class="hs-btns"><a class="btn btn-caramel hs-btn m-only" href="#sedi" data-goto="${s.id}">Scopri</a><button type="button" class="btn hs-btn hs-go btn-peach" data-queue="${s.id}">Prendi il numero</button></div>
        </div>
      </div>
    </article>`).join("");
  const panels = $$(".hs-p", hs).map((el) => ({ el, t: 0, dir: 0 }));
  if (!reduce) panels.forEach((p) => { p.el.classList.add("enter"); p.el.addEventListener("animationend", () => p.el.classList.remove("enter"), { once: true }); });
  function renderPanel(p) {
    const s = p.el.style, t = p.t;
    s.setProperty("--g", outCubic(slice(t, 0, .6)).toFixed(4));
    s.setProperty("--z", outCubic(slice(t, 0, 1)).toFixed(4));
    s.setProperty("--a", outCubic(slice(t, .25, .8)).toFixed(4));
    s.setProperty("--b", outBack(slice(t, .45, 1)).toFixed(4));
  }
  let raf = 0, last = 0;
  function tick(ts) {
    const dt = last ? Math.min(64, ts - last) : 16; last = ts;
    let moving = false;
    for (const p of panels) {
      if (!p.dir) continue;
      p.t = clamp01(p.t + p.dir * dt / DUR);
      renderPanel(p);
      if ((p.dir > 0 && p.t >= 1) || (p.dir < 0 && p.t <= 0)) p.dir = 0; else moving = true;
    }
    if (moving) raf = requestAnimationFrame(tick); else { raf = 0; last = 0; }
  }
  function drive(i, d) {
    panels.forEach((p, k) => {
      const want = k === i ? d : -1;
      if ((want > 0 && p.t >= 1) || (want < 0 && p.t <= 0)) { p.dir = 0; return; }
      p.dir = want;
      if (reduce) { p.t = want > 0 ? 1 : 0; p.dir = 0; renderPanel(p); }
    });
    if (!reduce && !raf) { last = 0; raf = requestAnimationFrame(tick); }
  }
  window.__phbHero = panels; // exposed for the check scripts
  const hint = $("#hsHint");
  const hoverable = matchMedia("(hover: hover) and (pointer: fine)");
  hint.textContent = hoverable.matches ? "Passa sopra una porta" : "Tocca una porta";
  panels.forEach((p, i) => {
    p.el.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse" && !mobileQ.matches) { drive(i, 1); hint.classList.add("gone"); } });
    p.el.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse" && !mobileQ.matches) drive(i, -1); });
    p.el.addEventListener("focus", () => drive(i, 1));
    p.el.addEventListener("click", (e) => {
      if (e.target.closest("a, button")) return;
      hint.classList.add("gone");
      const opening = !(p.t > .5 && (p.dir >= 0));
      if (mobileQ.matches || !hoverable.matches) drive(i, opening ? 1 : -1);
    });
    p.el.addEventListener("keydown", (e) => { if (e.key === "Enter" && e.target === p.el) gotoStore(STORES[i].id); });
  });
  hs.addEventListener("focusout", (e) => { if (!hs.contains(e.relatedTarget) && !mobileQ.matches) drive(-1, -1); });
  function heroMode() {
    panels.forEach((p) => { p.t = 0; p.dir = 0; renderPanel(p); });
    if (mobileQ.matches) { panels[0].t = 1; renderPanel(panels[0]); }
  }
  mobileQ.addEventListener("change", heroMode);
  heroMode();
  hs.addEventListener("click", (e) => {
    const q = e.target.closest("[data-queue]"); if (q) { if (estimate(byId[q.dataset.queue], 2)) openQueue(q.dataset.queue); else gotoStore(q.dataset.queue); return; }
    const g = e.target.closest("[data-goto]"); if (g) { e.preventDefault(); gotoStore(g.dataset.goto); }
  });

  /* ---------------- SEGRETO: scroll-brightened paragraph ---------------- */
  const seg = $("#segCopy");
  const words = seg.textContent.trim().split(/(\s+)/);
  seg.textContent = "";
  const wspans = [];
  for (const w of words) {
    if (/^\s+$/.test(w)) { seg.appendChild(document.createTextNode(" ")); continue; }
    const i = document.createElement("i"); i.textContent = w; seg.appendChild(i); wspans.push(i);
  }
  const SOFT = 6, FLOOR = .16;
  function brighten() {
    if (reduce) return;
    const r = seg.getBoundingClientRect(), vh = innerHeight;
    // starts when the paragraph's top reaches 88% of the viewport, completes when its bottom reaches 58%
    const start = vh * .88, end = vh * .58 - r.height;
    const prog = clamp01((start - r.top) / (start - end));
    const head = prog * (wspans.length + SOFT) + 2;
    for (let i = 0; i < wspans.length; i++) {
      const t = clamp01((head - i) / SOFT);
      wspans[i].style.opacity = (FLOOR + (1 - FLOOR) * t).toFixed(3);
    }
  }

  /* ---------------- MENU ---------------- */
  const mnList = $("#mnList"), mnSize = $("#mnSize");
  let cat = "pizze", size = "n";
  const eur = (v) => "€ " + v.toFixed(2).replace(".", ",");
  function renderMenu() {
    mnList.classList.toggle("bere", cat === "bere");
    mnSize.classList.toggle("off", cat === "bere");
    mnList.setAttribute("aria-labelledby", "tab-" + cat);
    if (cat === "pizze") {
      mnList.innerHTML = PIZZE.map((z, i) => {
        const pie = z.imgs
          ? `<div class="mn-pie split"><img class="half" src="assets/${z.imgs[0]}.webp" alt="" loading="lazy" draggable="false"><img class="half" src="assets/${z.imgs[1]}.webp" alt="" loading="lazy" draggable="false"></div>`
          : `<div class="mn-pie"><img src="assets/${z.img}.webp" alt="Pizza ${z.n} vista dall'alto" width="560" height="560" loading="lazy" draggable="false"></div>`;
        return `<article class="mn-it" style="--i:${i}" data-pizza="${z.id}">${pie}<div class="mn-row"><h3>${z.n}</h3><span class="mn-price">${eur(z.p[size === "n" ? 0 : 1])}</span></div><p>${z.d}</p>${z.tag ? `<span class="mn-tag">${z.tag}</span>` : ""}</article>`;
      }).join("");
    } else {
      mnList.innerHTML = BERE.map(([n, d, p], i) => `<div class="mn-drink" style="--i:${i}"><div><h3>${n}</h3><p>${d}</p></div><span class="mn-price">${eur(p)}</span></div>`).join("");
    }
  }
  $$(".mn-tabs [data-cat]").forEach((b) => b.addEventListener("click", () => {
    cat = b.dataset.cat;
    $$(".mn-tabs [data-cat]").forEach((x) => x.setAttribute("aria-selected", x === b));
    renderMenu();
  }));
  $$("#mnSize [data-size]").forEach((b) => b.addEventListener("click", () => {
    size = b.dataset.size;
    $$("#mnSize [data-size]").forEach((x) => x.setAttribute("aria-checked", x === b));
    // only swap the prices, so the cards don't re-enter
    $$(".mn-it", mnList).forEach((el) => { const z = PIZZE.find((p) => p.id === el.dataset.pizza); $(".mn-price", el).textContent = eur(z.p[size === "n" ? 0 : 1]); });
  }));
  renderMenu();

  /* ---------------- STORIA: snap first, then draw ---------------- */
  const sc = $("#stScroller"), stYears = $("#stYears"), stFill = $("#stFill");
  sc.innerHTML = STORIA.map((s, i) => `
    <article class="st-card ${s.img ? "" : "text"}" data-i="${i}" aria-label="${s.y}: ${esc(s.h)}">
      <figure class="${s.old ? "old" : ""}">${s.img ? `<img src="assets/${s.img}.webp" alt="" loading="lazy" draggable="false">` : `<span>${s.q}</span>`}</figure>
      <div class="st-in"><div class="st-yr">${s.y}</div><h3>${s.h}</h3><p>${s.p}</p></div>
    </article>`).join("");
  stYears.innerHTML = STORIA.map((s, i) => `<button type="button" role="tab" aria-selected="false" data-i="${i}" aria-label="${s.y}"><i></i><span>${s.y}</span></button>`).join("");
  const cards = $$(".st-card", sc), ybtns = $$("button", stYears);
  let stActive = -1, stRaf = 0, stIdle = 0;
  function stMeasure() {
    const mid = sc.scrollLeft + sc.clientWidth / 2;
    let best = 0, bd = 1e9;
    cards.forEach((c, i) => {
      const cm = c.offsetLeft + c.offsetWidth / 2, d = Math.abs(cm - mid);
      c.style.setProperty("--k", (1 - clamp01(d / (c.offsetWidth + 28))).toFixed(3));
      if (d < bd) { bd = d; best = i; }
    });
    return best;
  }
  function stSettle() {
    const i = stMeasure();
    if (i === stActive) return;
    stActive = i;
    cards.forEach((c, k) => c.classList.toggle("on", k === i));
    ybtns.forEach((b, k) => { b.classList.toggle("on", k === i); b.classList.toggle("done", k < i); b.setAttribute("aria-selected", k === i); });
    // the line only draws once the card has come to rest
    const b = ybtns[i];
    stFill.style.width = (b.offsetLeft + b.offsetWidth / 2) + "px";
    $("#stCount").textContent = `${i + 1} / ${cards.length}`;
    $("#stPrev").disabled = i === 0; $("#stNext").disabled = i === cards.length - 1;
  }
  sc.addEventListener("scroll", () => {
    if (!stRaf) stRaf = requestAnimationFrame(() => { stRaf = 0; stMeasure(); });
    clearTimeout(stIdle); stIdle = setTimeout(stSettle, 140);
  }, { passive: true });
  if ("onscrollend" in window) sc.addEventListener("scrollend", () => { clearTimeout(stIdle); stSettle(); });
  function stGo(i) {
    i = Math.max(0, Math.min(cards.length - 1, i));
    const c = cards[i];
    sc.scrollTo({ left: c.offsetLeft - (sc.clientWidth - c.offsetWidth) / 2, behavior: reduce ? "auto" : "smooth" });
    if (reduce) stSettle();
  }
  ybtns.forEach((b, i) => b.addEventListener("click", () => stGo(i)));
  $("#stPrev").addEventListener("click", () => stGo(stActive - 1));
  $("#stNext").addEventListener("click", () => stGo(stActive + 1));
  sc.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); stGo(stActive + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); stGo(stActive - 1); }
  });
  window.__phbStoria = { go: stGo, get active() { return stActive; } };

  /* ---------------- SEDI ---------------- */
  const sdTabs = $("#sdTabs"), sdCard = $("#sdCard");
  let selStore = "napoli";
  function hoursText(ranges) { return ranges.length ? ranges.map(([a, b]) => hhmm(a) + "–" + hhmm(b)).join(" · ") : "Chiuso"; }
  function renderTabs() {
    sdTabs.innerHTML = STORES.map((s) => {
      const st = status(s);
      return `<button type="button" class="sd-tab" role="tab" aria-selected="${s.id === selStore}" data-store="${s.id}"><span><b>${s.city}</b><small>${s.addr[0]}</small></span><span class="st-dot ${st.state === "open" ? "is-open" : st.state === "soon" ? "is-soon" : ""}" aria-label="${statusLabel(st)}"></span></button>`;
    }).join("");
  }
  function renderCard() {
    const s = byId[selStore], n = now(), st = status(s, n);
    const order = [1, 2, 3, 4, 5, 6, 0];
    const est = estimate(s, 2, n);
    sdCard.innerHTML = `<img src="assets/${s.img}.webp" alt="L'ingresso della sede di ${s.city}" loading="lazy" draggable="false">
      <div class="sd-body">
        <h3>${s.city}</h3><p class="sd-dal">dal ${s.dal}</p>
        <span class="st-dot ${st.state === "open" ? "is-open" : st.state === "soon" ? "is-soon" : ""}" data-sdstat>${statusLabel(st)}${est && st.state === "open" ? ` · attesa ~${est.wait} min` : ""}</span>
        <p class="sd-rule">${s.note}</p>
        <div class="sd-meta">
          <div><h4>Indirizzo</h4><p>${s.addr[0]}<br>${s.addr[1]}<br>${s.tel}</p><p class="sd-rule">Non si accettano prenotazioni. Asporto al banco.</p></div>
          <div><h4>Orari</h4><ul class="sd-hours">${order.map((d) => `<li class="${d === n.dow ? "today" : ""}"><span>${DAYS[d]}</span><span>${hoursText(s.hours[d])}</span></li>`).join("")}</ul></div>
        </div>
        <button type="button" class="btn btn-dark" data-queue="${s.id}">Prendi il numero a ${s.city}</button>
      </div>`;
  }
  sdTabs.addEventListener("click", (e) => { const b = e.target.closest("[data-store]"); if (b) selectStore(b.dataset.store); });
  sdTabs.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp" && e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const i = STORES.findIndex((s) => s.id === selStore), d = (e.key === "ArrowDown" || e.key === "ArrowRight") ? 1 : -1;
    selectStore(STORES[(i + d + STORES.length) % STORES.length].id);
    $(`[data-store="${selStore}"]`, sdTabs).focus();
  });
  sdCard.addEventListener("click", (e) => { const q = e.target.closest("[data-queue]"); if (q) openQueue(q.dataset.queue); });
  function selectStore(id) {
    selStore = id; renderTabs(); renderCard(); qvRender();
  }
  function gotoStore(id) {
    selectStore(id);
    $("#sedi").scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  /* ---------------- QUANDO VENIRE: focus blocks ---------------- */
  const SPAN0 = T(11), SPAN1 = T(25), SPAN = SPAN1 - SPAN0, ROW = 44;
  const lanes = $("#qvLanes"), cursor = $("#qvCursor"), knob = $("#qvKnob");
  const qvDays = $("#qvDays");
  let qvDay = now().dow, qvBlocks = [], qvM = 0;
  qvDays.innerHTML = [1, 2, 3, 4, 5, 6, 0].map((d) => `<button type="button" role="radio" aria-checked="${d === qvDay}" data-day="${d}">${DAYS[d]}</button>`).join("");
  qvDays.addEventListener("click", (e) => {
    const b = e.target.closest("[data-day]"); if (!b) return;
    qvDay = +b.dataset.day;
    $$("[data-day]", qvDays).forEach((x) => x.setAttribute("aria-checked", x === b));
    qvRender();
  });
  function qvBuild(s, dow) {
    const out = [];
    for (let m = SPAN0; m < SPAN1; m += 15) {
      const lv = openAt(s, dow, m) ? level(s, dow, m) : -1;
      const prev = out[out.length - 1];
      if (prev && prev.lv === lv) prev.b = m + 15; else out.push({ lv, a: m, b: m + 15 });
    }
    return out;
  }
  function qvRender() {
    const s = byId[selStore], n = now();
    $("#qvTitle").textContent = `La coda a ${s.city}, ora per ora`;
    lanes.querySelectorAll(".qv-blk, .qv-step, .qv-closed, .qv-now").forEach((e) => e.remove());
    qvBlocks = qvBuild(s, qvDay);
    let d = 0;
    qvBlocks.forEach((bk, i) => {
      const left = (bk.a - SPAN0) / SPAN * 100, w = (bk.b - bk.a) / SPAN * 100;
      if (bk.lv < 0) {
        const c = document.createElement("div"); c.className = "qv-closed"; c.style.cssText = `left:${left}%;width:${w}%`; lanes.appendChild(c); return;
      }
      const row = 2 - bk.lv;
      const el = document.createElement("div"); el.className = "qv-blk";
      el.style.cssText = `left:${left}%;width:calc(${w}% - 2px);top:${row * ROW + 10}px;--c:${LEVELS[bk.lv].c};--d:${(d++) * 60}ms`;
      lanes.appendChild(el); bk.el = el;
      const nx = qvBlocks[i + 1];
      if (nx && nx.lv >= 0 && nx.lv !== bk.lv) {
        const r2 = 2 - nx.lv, top = Math.min(row, r2) * ROW + 22, h = Math.abs(row - r2) * ROW;
        const st = document.createElement("div"); st.className = "qv-step"; st.style.cssText = `left:${(bk.b - SPAN0) / SPAN * 100}%;top:${top}px;height:${h}px`; lanes.appendChild(st);
      }
    });
    if (qvDay === n.dow && n.min >= SPAN0) {
      const nm = document.createElement("div"); nm.className = "qv-now"; nm.style.left = ((n.min - SPAN0) / SPAN * 100) + "%"; lanes.appendChild(nm);
    }
    // summary: longest calm stretch and the stretch to avoid
    const longest = (lv) => qvBlocks.filter((b) => b.lv === lv).sort((x, y) => (y.b - y.a) - (x.b - x.a))[0];
    const calm = longest(0), busy = longest(2);
    const open = qvBlocks.some((b) => b.lv >= 0);
    $("#qvSum").innerHTML = !open ? `${s.city} il ${DAYS_LONG[qvDay]} è chiusa.`
      : `${calm ? `Il momento più tranquillo: <b>${hhmm(calm.a)}–${hhmm(calm.b)}</b>` : `A ${s.city} si aspetta sempre un po'`}${busy ? ` · Da evitare: <b>${hhmm(busy.a)}–${hhmm(busy.b)}</b>` : ""}`;
    const start = qvDay === n.dow && n.min >= SPAN0 ? n.min : T(20, 30);
    qvScrub(start);
  }
  function qvScrub(m) {
    m = Math.max(SPAN0, Math.min(SPAN1 - 1, Math.round(m / 5) * 5));
    qvM = m;
    const s = byId[selStore];
    const bk = qvBlocks.find((b) => m >= b.a && m < b.b);
    const x = (m - SPAN0) / SPAN * 100 + "%";
    cursor.style.left = x; knob.style.left = x;
    lanes.setAttribute("aria-valuenow", m); lanes.setAttribute("aria-valuetext", hhmm(m));
    $("#qvTime").textContent = hhmm(m);
    qvBlocks.forEach((b) => b.el && b.el.classList.toggle("dim", b !== bk));
    const pill = $("#qvPill");
    if (!bk || bk.lv < 0) {
      knob.classList.add("off");
      pill.textContent = "Chiuso"; pill.style.setProperty("--c", "#8a7a6c");
      $("#qvWait").textContent = "";
    } else {
      knob.classList.remove("off");
      knob.style.top = ((2 - bk.lv) * ROW + 22) + "px";
      pill.textContent = LEVELS[bk.lv].k; pill.style.setProperty("--c", LEVELS[bk.lv].c);
      const w = Math.max(5, Math.round([7, 18, 34][bk.lv] * s.mult / 5) * 5);
      $("#qvWait").textContent = `circa ${w} minuti per un tavolo da due`;
    }
  }
  const scrubFromEvent = (e) => { const r = lanes.getBoundingClientRect(); qvScrub(SPAN0 + clamp01((e.clientX - r.left) / r.width) * SPAN); };
  lanes.addEventListener("pointermove", (e) => { if (e.pointerType === "mouse" || e.buttons) scrubFromEvent(e); });
  lanes.addEventListener("pointerdown", scrubFromEvent);
  lanes.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); qvScrub(qvM + 15); }
    if (e.key === "ArrowLeft") { e.preventDefault(); qvScrub(qvM - 15); }
  });

  /* ---------------- NEL MONDO: dot map + list ---------------- */
  const W = window.PHB_WORLD;
  const CELL = 10;
  const px = (lon, lat) => [((lon - W.lon0) / W.step) * CELL + CELL / 2, ((W.lat0 - lat) / W.step) * CELL + CELL / 2];
  (function buildMap() {
    let d = "";
    W.data.forEach((hex, r) => {
      if (hex === "0") return;
      const nib = hex.length;
      for (let k = 0; k < nib; k++) {
        const v = parseInt(hex[nib - 1 - k], 16);
        for (let j = 0; j < 4; j++) if (v & (1 << j)) {
          const c = k * 4 + j; if (c >= W.cols) continue;
          const x = c * CELL + CELL / 2, y = r * CELL + CELL / 2;
          d += `M${x - 3} ${y}a3 3 0 1 0 6 0a3 3 0 1 0 -6 0`;
        }
      }
    });
    const [hx, hy] = px(HOME.lon, HOME.lat);
    const arcs = WORLD.map((w, i) => {
      const [x, y] = px(w.lon, w.lat);
      const dist = Math.hypot(x - hx, y - hy), cx = (x + hx) / 2, cy = (y + hy) / 2 - Math.max(30, dist * .32);
      return `<path class="mo-arc" data-w="${i}" pathLength="1" d="M${hx.toFixed(1)} ${hy.toFixed(1)} Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}" style="transition-delay:${i * 90}ms"/>`;
    }).join("");
    const pins = WORLD.map((w, i) => {
      const [x, y] = px(w.lon, w.lat);
      const right = x < W.cols * CELL - 160;
      return `<circle class="mo-pin" data-w="${i}" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7"><title>${w.city}</title></circle>
        <text class="mo-label" data-w="${i}" x="${(x + (right ? 12 : -12)).toFixed(1)}" y="${(y + 4).toFixed(1)}" text-anchor="${right ? "start" : "end"}">${w.city}</text>`;
    }).join("");
    $("#moMap").innerHTML = `<svg viewBox="0 0 ${W.cols * CELL} ${W.rows * CELL}" role="img" aria-label="Mappa delle pizzerie nel mondo">
      <path class="mo-dot" d="${d}"/>${arcs}
      <circle cx="${hx}" cy="${hy}" r="9" fill="none" stroke="#b8321f" stroke-width="2"><animate attributeName="r" values="9;22" dur="2.4s" repeatCount="indefinite"/><animate attributeName="opacity" values="1;0" dur="2.4s" repeatCount="indefinite"/></circle>
      <circle class="mo-pin home" cx="${hx}" cy="${hy}" r="8"/><text class="mo-label home" x="${hx + 12}" y="${hy + 22}">Napoli</text>${pins}</svg>`;
    if (reduce) $$("#moMap animate").forEach((a) => a.remove());
  })();
  const moList = $("#moList");
  moList.innerHTML = WORLD.map((w, i) => `<li class="mo-it" tabindex="0" data-w="${i}" data-area="${w.area}"><svg width="18" height="22" viewBox="0 0 18 22" aria-hidden="true"><path d="M9 21s7-7.2 7-12.2A7 7 0 0 0 2 8.8C2 13.8 9 21 9 21z" fill="currentColor"/><circle cx="9" cy="8.6" r="2.6" fill="#efdcc6"/></svg><div><b>${w.country}</b><span>${w.addr}</span><span>${w.city}</span><span>${w.tel}</span></div></li>`).join("");
  let moArea = "all", moHot = -1, arcsDrawn = false;
  function moPaint() {
    $$("#moMap .mo-arc").forEach((a) => {
      const w = WORLD[+a.dataset.w], inArea = moArea === "all" || w.area === moArea;
      a.classList.toggle("on", arcsDrawn && inArea && (moHot < 0 || moHot === +a.dataset.w));
      a.style.opacity = moHot >= 0 ? (moHot === +a.dataset.w ? 1 : 0) : inArea ? .55 : 0;
    });
    $$("#moMap .mo-pin:not(.home)").forEach((p) => p.classList.toggle("off", !(moArea === "all" || WORLD[+p.dataset.w].area === moArea)));
    $$("#moMap .mo-label:not(.home)").forEach((l) => l.classList.toggle("on", +l.dataset.w === moHot));
    $$(".mo-it", moList).forEach((li) => { li.classList.toggle("off", !(moArea === "all" || li.dataset.area === moArea)); li.classList.toggle("on", +li.dataset.w === moHot); });
  }
  const hot = (i) => { moHot = i; moPaint(); };
  moList.addEventListener("pointerover", (e) => { const li = e.target.closest(".mo-it"); if (li) hot(+li.dataset.w); });
  moList.addEventListener("pointerleave", () => hot(-1));
  moList.addEventListener("focusin", (e) => { const li = e.target.closest(".mo-it"); if (li) hot(+li.dataset.w); });
  moList.addEventListener("focusout", () => hot(-1));
  moList.addEventListener("click", (e) => { const li = e.target.closest(".mo-it"); if (li) hot(moHot === +li.dataset.w && e.pointerType !== "mouse" ? -1 : +li.dataset.w); });
  $("#moMap").addEventListener("click", (e) => { const p = e.target.closest(".mo-pin[data-w]"); if (p) hot(+p.dataset.w); });
  $$("#moChips [data-area]").forEach((b) => b.addEventListener("click", () => {
    moArea = b.dataset.area; moHot = -1;
    $$("#moChips [data-area]").forEach((x) => x.setAttribute("aria-checked", x === b));
    moPaint();
  }));
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver((es) => { if (es.some((x) => x.isIntersecting)) { arcsDrawn = true; moPaint(); io.disconnect(); } }, { threshold: .35 });
    io.observe($("#moMap"));
  } else { arcsDrawn = true; }
  moPaint();

  /* ---------------- live strings everywhere ---------------- */
  function renderLive() {
    const n = now();
    STORES.forEach((s) => {
      const st = status(s, n), est = estimate(s, 2, n);
      const cls = st.state === "open" ? "is-open" : st.state === "soon" ? "is-soon" : "";
      $$(`[data-stat="${s.id}"]`).forEach((el) => { el.className = "st-dot hs-stat " + cls; el.textContent = statusLabel(st); });
      const today = s.hours[n.dow];
      $$(`[data-more="${s.id}"]`).forEach((el) => {
        el.innerHTML = `Oggi: <b>${hoursText(today)}</b><br>${est ? `Attesa adesso: <b>~${est.wait} min</b> · ${est.ahead} tavoli` : "Numeri disponibili da mezz'ora prima dell'apertura"}`;
      });
      $$(`[data-queue="${s.id}"].hs-go`).forEach((b) => { b.textContent = est ? "Prendi il numero" : "Vedi gli orari"; });
    });
    $("#codaLive").innerHTML = STORES.map((s) => {
      const st = status(s, n), est = estimate(s, 2, n);
      return `<li><b>${s.city}</b><span>${est ? (st.state === "soon" ? `apre alle ${hhmm(st.at)}` : `~${est.wait} min · ${est.ahead} tavoli`) : statusLabel(st).replace("Chiuso · ", "chiuso · ")}</span></li>`;
    }).join("");
    $("#footSedi").innerHTML = STORES.map((s) => `<li><a href="#sedi" data-goto="${s.id}">${s.city}</a></li>`).join("");
    renderDropdown(); renderTabs(); renderCard();
  }
  $("#footSedi").addEventListener("click", (e) => { const a = e.target.closest("[data-goto]"); if (a) { e.preventDefault(); gotoStore(a.dataset.goto); } });

  /* ---------------- QUEUE DIALOG + ticket printer ---------------- */
  const qd = $("#qd"), scrim = $("#qdScrim");
  const qs = { store: null, ppl: 2, step: 1 };
  let lastFocus = null, issued = null, seq = 0;
  try { issued = JSON.parse(store.get("phb-ticket") || "null"); } catch (e) { issued = null; }

  function setStep(k) {
    qs.step = k;
    $$(".qd-step", qd).forEach((el) => { el.hidden = +el.dataset.step !== k; });
    $$("#qdSteps li").forEach((li, i) => { li.classList.toggle("on", i + 1 === k); li.classList.toggle("done", i + 1 < k); });
    $(".qd-body", qd).scrollTop = 0;
  }
  function renderStores() {
    const n = now();
    $("#qdStores").innerHTML = STORES.map((s) => {
      const st = status(s, n), est = estimate(s, qs.ppl, n), ok = !!est;
      return `<button type="button" class="qd-store" role="radio" aria-checked="${qs.store === s.id}" data-s="${s.id}" ${ok ? "" : "disabled"}>
        <img src="assets/${s.img}.webp" alt="" draggable="false"><span><b>${s.city}</b><small>${statusLabel(st)}</small></span>
        <span class="qd-wait">${ok ? `~${est.wait} min<small>${est.ahead} tavoli</small>` : "—"}</span></button>`;
    }).join("");
  }
  $("#qdStores").addEventListener("click", (e) => {
    const b = e.target.closest("[data-s]"); if (!b || b.disabled) return;
    qs.store = b.dataset.s; $("#qdErr1").textContent = "";
    $$("[data-s]", $("#qdStores")).forEach((x) => x.setAttribute("aria-checked", x === b));
  });
  $("#qdNext1").addEventListener("click", () => {
    if (!qs.store) { $("#qdErr1").textContent = STORES.some((s) => estimate(s, 2)) ? "Scegli una sede." : "Adesso sono tutte chiuse: torna mezz'ora prima dell'apertura."; return; }
    if (!estimate(byId[qs.store], qs.ppl)) { $("#qdErr1").textContent = "Questa sede ha appena chiuso. Scegline un'altra."; renderStores(); return; }
    toStep2();
  });
  function toStep2() {
    const s = byId[qs.store], st = status(s);
    $("#qdStoreLine").innerHTML = `Sede: <b>${s.city}</b> · ${statusLabel(st)}`;
    setStep(2); updPpl();
    setTimeout(() => $("#qName").focus({ preventScroll: true }), 50);
  }
  function updPpl() {
    $("#pplOut").textContent = qs.ppl;
    $("#pplMinus").disabled = qs.ppl <= 1; $("#pplPlus").disabled = qs.ppl >= 8;
    $("#pplHint").textContent = qs.ppl >= 8 ? "Otto è il massimo per tavolo. Per gruppi più grandi chiamaci." : qs.ppl > 4 ? "Per i tavoli grandi si aspetta un po' di più." : qs.ppl === 1 ? "Da soli si mangia al bancone: si fa prima." : "Tavoli da 1 a 8 persone.";
    const est = qs.store && estimate(byId[qs.store], qs.ppl);
    $("#qdEst").innerHTML = est ? `<div><b>${est.ahead}</b>tavoli davanti</div><div><b>~${est.wait} min</b>di attesa</div><div><b>${hhmm(est.at)}</b>presentati alla porta</div>` : "";
  }
  $("#pplMinus").addEventListener("click", () => { if (qs.ppl > 1) { qs.ppl--; updPpl(); } });
  $("#pplPlus").addEventListener("click", () => { if (qs.ppl < 8) { qs.ppl++; updPpl(); } else toast("Per più di 8 persone chiamaci in sede."); });
  $("#qdBack").addEventListener("click", () => { renderStores(); setStep(1); });

  function fieldErr(input, errEl, msg) {
    errEl.textContent = msg || ""; input.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }
  const vName = () => { const v = $("#qName").value.trim(); return fieldErr($("#qName"), $("#eName"), !v ? "Scrivi un nome: ti chiamiamo con quello." : !/^[\p{L}][\p{L}' .-]{1,23}$/u.test(v) ? "Solo lettere, almeno due." : ""); };
  const vTel = () => { const v = $("#qTel").value.replace(/[\s.-]/g, ""); return fieldErr($("#qTel"), $("#eTel"), !v ? "Serve il cellulare per avvisarti." : !/^\+?\d{9,13}$/.test(v) ? "Numero non valido (9–13 cifre)." : ""); };
  $("#qName").addEventListener("blur", () => { if ($("#qName").value) vName(); });
  $("#qTel").addEventListener("blur", () => { if ($("#qTel").value) vTel(); });
  $("#qName").addEventListener("input", () => { if ($("#qName").getAttribute("aria-invalid") === "true") vName(); });
  $("#qTel").addEventListener("input", () => { if ($("#qTel").getAttribute("aria-invalid") === "true") vTel(); });
  $("#qdForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const a = vName(), b = vTel();
    if (!a || !b) { (!a ? $("#qName") : $("#qTel")).focus(); return; }
    const s = byId[qs.store], n = now(), est = estimate(s, qs.ppl, n);
    if (!est) { toast("La sede ha appena chiuso."); renderStores(); setStep(1); return; }
    seq++;
    const num = 100 + ((Math.max(0, n.min - T(11)) / 3) | 0) % 800 + est.ahead + seq;
    issued = { no: `${s.letter}-${String(num).padStart(3, "0")}`, store: s.id, ppl: qs.ppl, name: $("#qName").value.trim(), ahead: est.ahead, wait: est.wait, at: est.at, issuedAt: n.min, dow: n.dow };
    store.set("phb-ticket", JSON.stringify(issued));
    setStep(3);
    printTicket(true);
  });

  // Code 128 (subset B) — same encoder as the receipt effect in our library.
  const C128 = "212222 222122 222221 121223 121322 131222 122213 122312 132212 221213 221312 231212 112232 122132 122231 113222 123122 123221 223211 221132 221231 213212 223112 312131 311222 321122 321221 312212 322112 322211 212123 212321 232121 111323 131123 131321 112313 132113 132311 211313 231113 231311 112133 112331 132131 113123 113321 133121 313121 211331 231131 213113 213311 213131 311123 311321 331121 312113 312311 332111 314111 221411 431111 111224 111422 121124 121421 141122 141221 112214 112412 122114 122411 142112 142211 241211 221114 413111 241112 134111 111242 121142 121241 114212 124112 124211 411212 421112 421211 212141 214121 412121 111143 111341 131141 114113 114311 411113 411311 113141 114131 311141 411131 211412 211214 211232 2331112".split(" ");
  function code128(text) {
    const vals = [104, ...[...text].map((ch) => ch.charCodeAt(0) - 32)];
    const check = vals.reduce((s, v, i) => s + v * (i || 1), 0) % 103;
    let x = 0, bars = "";
    [...[...vals, check, 106].map((v) => C128[v]).join("")].forEach((w, i) => { if (i % 2 === 0) bars += `<rect x="${x}" width="${w}" height="1"/>`; x += +w; });
    return `<svg class="tk-bars" viewBox="0 0 ${x} 1" preserveAspectRatio="none" fill="#1a0f08" aria-hidden="true">${bars}</svg>`;
  }
  function ticketHTML(t) {
    const s = byId[t.store];
    const code = `RP${t.no.replace("-", "")}${String(t.issuedAt).padStart(4, "0")}`;
    return `<div class="tk-h">RUOPPOLO</div><div class="tk-k">STORICA PIZZERIA · DAL 1882</div><hr>
      <div class="tk-lbl">IL TUO NUMERO</div><div class="tk-no" id="tkNo">${t.no}</div><hr>
      <div class="tk-m"><span>SEDE</span>${s.city.toUpperCase()}</div>
      <div class="tk-m"><span>NOME</span>${esc(t.name.toUpperCase())}</div>
      <div class="tk-m"><span>PERSONE</span>${t.ppl}</div>
      <div class="tk-m"><span>PRESO ALLE</span>${hhmm(t.issuedAt)} · ${DAYS[t.dow].toUpperCase()}</div>
      <div class="tk-m"><span>DAVANTI A TE</span>${t.ahead} TAVOLI</div>
      <div class="tk-big">ATTESA ~${t.wait} MIN <b>ore ${hhmm(t.at)}</b></div><hr>
      ${code128(code)}<div class="tk-code">${code}</div>
      <div class="tk-thx">Fatti un giro, ti scriviamo noi.</div>
      <svg class="tk-stamp" id="tkStamp" viewBox="0 0 96 96" aria-hidden="true">
        <defs><path id="tkRing" d="M48 48 m-37 0 a37 37 0 1 1 74 0 a37 37 0 1 1 -74 0"/>
          <filter id="tkInk" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.2"/><feComponentTransfer><feFuncA type="table" tableValues="0 .75 .92"/></feComponentTransfer></filter></defs>
        <g filter="url(#tkInk)" fill="none" stroke="#b8321f" color="#b8321f">
          <circle cx="48" cy="48" r="45" stroke-width="3"/><circle cx="48" cy="48" r="30" stroke-width="1.3"/>
          <text fill="currentColor" stroke="none" font-family="JetBrains Mono, monospace" font-size="7.2" font-weight="700" letter-spacing="1.5"><textPath href="#tkRing">BUON APPETITO · DAL 1882 · NAPOLI ·</textPath></text>
          <text x="48" y="51" text-anchor="middle" fill="currentColor" stroke="none" font-family="Zilla Slab, serif" font-size="17" font-weight="700" letter-spacing=".5">VALIDO</text>
          <text x="48" y="62" text-anchor="middle" fill="currentColor" stroke="none" font-family="JetBrains Mono, monospace" font-size="6.4" letter-spacing=".5">${s.city.toUpperCase()}</text>
        </g>
      </svg>`;
  }
  const sleep = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));
  function tween(el, frames, o) {
    const a = el.animate(frames, { fill: "both", ...o, duration: reduce ? 1 : o.duration });
    return a.finished.then(() => { const lastF = frames[frames.length - 1]; for (const k in lastF) if (k !== "offset" && k !== "easing") el.style[k] = lastF[k]; a.cancel(); }).catch(() => {});
  }
  let printing = 0;
  function feed(paper, shadow, dur, token) {
    const H = paper.offsetHeight, n = 17, k = .72, t0 = performance.now();
    return new Promise((res) => {
      const step = (ts) => {
        if (token !== printing) return res();
        const t = Math.min(1, (ts - t0) / (reduce ? 1 : dur));
        const q = t - k * Math.sin(2 * Math.PI * n * t) / (2 * Math.PI * n);
        const p = 1 - Math.pow(1 - q, 1.25);
        paper.style.transform = `translate(${(t < 1 ? (Math.random() - .5) * .7 : 0).toFixed(2)}px, ${(-H * (1 - p)).toFixed(2)}px)`;
        shadow.style.height = (H * p).toFixed(1) + "px";
        t < 1 ? requestAnimationFrame(step) : res();
      };
      requestAnimationFrame(step);
    });
  }
  async function printTicket(animate) {
    const token = ++printing;
    const paper = $("#tkPaper"), shadow = $("#tkShadow"), acts = $("#tkActions"), cap = $("#tkCap");
    paper.innerHTML = ticketHTML(issued);
    const stamp = $("#tkStamp");
    acts.classList.remove("show");
    if (!animate) {
      paper.style.transform = "translate(0,3px)"; shadow.style.height = paper.offsetHeight + "px";
      stamp.style.opacity = .92; stamp.style.transform = "rotate(-14deg)";
      cap.textContent = mineMeta(); acts.classList.add("show"); return;
    }
    paper.style.transform = "translateY(-110%)"; stamp.style.opacity = 0; shadow.style.height = "0px";
    cap.textContent = "Stampa in corso…";
    await sleep(380); if (token !== printing) return;
    await feed(paper, shadow, 2100, token); if (token !== printing) return;
    await tween(paper, [{ transform: "translate(0,0) rotate(0)" }, { transform: "translate(0,5px) rotate(.8deg)", offset: .45 }, { transform: "translate(0,2px) rotate(-.3deg)", offset: .75 }, { transform: "translate(0,3px) rotate(0)" }], { duration: 480, easing: "ease-out" });
    await sleep(100); if (token !== printing) return;
    await tween(stamp, [
      { opacity: 0, transform: "scale(2.4) rotate(-34deg)" },
      { opacity: .95, transform: "scale(.94) rotate(-12deg)", offset: .72 },
      { opacity: .92, transform: "scale(1) rotate(-14deg)" }], { duration: 280, easing: "cubic-bezier(.5,0,.75,0)" });
    if (token !== printing) return;
    cap.textContent = mineMeta();
    acts.classList.add("show");
    renderMine();
  }
  window.__phbPrinting = () => printing;

  function mineMeta() { return issued ? `${byId[issued.store].city} · ${issued.ahead} tavoli davanti · alla porta verso le ${hhmm(issued.at)}` : ""; }
  function renderMine() {
    const box = $("#mine");
    if (!issued) { box.hidden = true; return; }
    $("#mineNo").textContent = issued.no; $("#mineMeta").textContent = `${byId[issued.store].city} · ore ${hhmm(issued.at)}`;
    box.hidden = !qd.hidden;
  }
  $("#mineBtn").addEventListener("click", () => openQueue());
  $("#tkCancel").addEventListener("click", () => {
    const no = issued && issued.no;
    issued = null; store.del("phb-ticket"); printing++;
    toast(no ? `Numero ${no} annullato.` : "Numero annullato.");
    qs.store = null; renderStores(); setStep(1); $("#tkActions").classList.remove("show");
  });

  function openQueue(storeId) {
    lastFocus = document.activeElement;
    setMnav(false);
    qd.hidden = false; scrim.hidden = false; $("#mine").hidden = true;
    document.documentElement.style.overflow = "hidden";
    $("#qdErr1").textContent = "";
    if (issued) { setStep(3); printTicket(false); }
    else {
      const s = storeId && byId[storeId];
      qs.store = s && estimate(s, qs.ppl) ? s.id : null;
      renderStores(); setStep(1);
      if (s && !qs.store) $("#qdErr1").textContent = `${s.city}: ${statusLabel(status(s)).toLowerCase()}. Scegli un'altra sede.`;
      if (qs.store && storeId) toStep2();
    }
    setTimeout(() => { const f = qs.step === 2 ? $("#qName") : qd.querySelector(".qd-step:not([hidden]) button:not(:disabled), .qd-x"); f && f.focus({ preventScroll: true }); }, 30);
  }
  function closeQueue() {
    if (qd.hidden) return;
    qd.hidden = true; scrim.hidden = true;
    document.documentElement.style.overflow = "";
    if (qs.step === 3 && printing && !$("#tkActions").classList.contains("show")) printing++; // stop a print in flight
    renderMine();
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }
  document.addEventListener("click", (e) => {
    const o = e.target.closest("[data-open-queue]"); if (o) { e.preventDefault(); openQueue(); return; }
    if (e.target.closest("[data-close]")) closeQueue();
  });
  $("#qdClose").addEventListener("click", closeQueue);
  scrim.addEventListener("click", closeQueue);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") { if (!qd.hidden) closeQueue(); else { setDd(false); if (!mnav.hidden) setMnav(false); } }
    if (e.key === "Tab" && !qd.hidden) {
      const f = $$("button, input, [tabindex='0']", qd).filter((x) => !x.disabled && x.offsetParent !== null);
      if (!f.length) return;
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    }
  });

  /* ---------------- scroll loop + boot ---------------- */
  let sRaf = 0;
  addEventListener("scroll", () => { if (!sRaf) sRaf = requestAnimationFrame(() => { sRaf = 0; brighten(); }); }, { passive: true });
  addEventListener("resize", () => { brighten(); stActive = -1; stSettle(); });
  renderLive();
  qvRender();
  brighten();
  requestAnimationFrame(() => { stMeasure(); stSettle(); });
  renderMine();
  setInterval(() => { renderLive(); if (!qd.hidden && qs.step === 1) renderStores(); }, 60000);
})();
