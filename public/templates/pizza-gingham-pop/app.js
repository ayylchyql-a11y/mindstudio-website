/* Quadretti · Pizza Club — app.js (vanilla, nessuna dipendenza)
   Effetti dalla libreria MindStudio, riadattati qui:
   - adesivi trascinabili: molla + presa ispirate a "dragging-ball" (block logic MIT © 2026 Lorenzo Cabra) e all'ombra che si stringe di "tilt-card"
   - "flip-stack-carousel" per le pizze del mese
   - "done-burst-button" per Aggiungi al carrello
   - "filter-chips-results" per le pizzerie per città
   - fascia inclinata che cambia verso con lo scroll: scritta qui */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia("(prefers-reduced-motion: reduce)");
  const reduce = () => RM.matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const eur = (n) => n.toFixed(2).replace(".", ",") + " €";
  const later = (ms, f) => setTimeout(f, reduce() ? 0 : ms);

  /* ---------- storage that survives a sandbox without allow-same-origin ---------- */
  const kv = (() => {
    let ls = null;
    try { ls = window.localStorage; ls.setItem("__qd", "1"); ls.removeItem("__qd"); } catch (e) { ls = null; }
    const mem = {};
    return {
      get(k) { try { if (ls) { const v = ls.getItem(k); return v == null ? null : JSON.parse(v); } } catch (e) {} return k in mem ? mem[k] : null; },
      set(k, v) { mem[k] = v; try { if (ls) ls.setItem(k, JSON.stringify(v)); } catch (e) {} },
    };
  })();

  /* ---------- toast ---------- */
  const toastEl = $("#toast");
  let toastT = 0;
  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add("on");
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("on"), 2800);
  }

  /* =====================================================================
     DATA
     ===================================================================== */
  const DAYS = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  const DSH = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];
  const MESI = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
  const toMin = (t) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const fmt = (m) => { m = ((m % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); };
  // "12:00-14:30,18:30-01:00" → [[720,870],[1110,1500]]  (closing after midnight → +1440)
  const iv = (s) => !s ? [] : s.split(",").map((r) => { const [a, b] = r.split("-").map(toMin); return [a, b <= a ? b + 1440 : b]; });
  // week order: dom, lun, mar, mer, gio, ven, sab
  const week = (o) => [o.dom, o.lun, o.mar, o.mer, o.gio, o.ven, o.sab].map(iv);

  const STORES = [
    { id: "carmine", city: "brescia", name: "Brescia Carmine", short: "Carmine", addr: "Via San Faustino 38, 25122 Brescia", img: "pizzeria-a.webp", r: -1.6,
      h: week({ dom: "12:00-23:00", lun: "12:00-14:30,18:30-23:30", mar: "12:00-14:30,18:30-23:30", mer: "12:00-14:30,18:30-23:30", gio: "12:00-14:30,18:30-23:30", ven: "12:00-15:00,18:30-01:00", sab: "12:00-15:00,18:30-01:00" }) },
    { id: "loggia", city: "brescia", name: "Brescia Loggia", short: "Loggia", addr: "Corso Zanardelli 21, 25121 Brescia", img: "pizzeria-b.webp", r: 1.3,
      h: week({ dom: "12:00-15:00,18:30-23:00", lun: "", mar: "18:30-23:30", mer: "18:30-23:30", gio: "18:30-23:30", ven: "18:30-00:30", sab: "12:00-15:00,18:30-00:30" }) },
    { id: "desenzano", city: "garda", name: "Desenzano del Garda", short: "Desenzano", addr: "Lungolago Cesare Battisti 70, 25015 Desenzano del Garda (BS)", img: "pizzeria-c.webp", r: -0.9,
      h: week({ dom: "12:00-15:00,18:30-00:00", lun: "12:00-15:00,18:30-00:00", mar: "12:00-15:00,18:30-00:00", mer: "12:00-15:00,18:30-00:00", gio: "12:00-15:00,18:30-00:00", ven: "12:00-15:00,18:30-00:00", sab: "12:00-15:00,18:30-00:00" }) },
    { id: "mantova", city: "mantova", name: "Mantova", short: "Mantova", addr: "Via Pier Fortunato Calvi 15, 46100 Mantova", img: "pizzeria-d.webp", r: 1.7,
      h: week({ dom: "12:00-14:30,19:00-23:30", lun: "12:00-14:30,19:00-23:30", mar: "", mer: "12:00-14:30,19:00-23:30", gio: "12:00-14:30,19:00-23:30", ven: "12:00-14:30,19:00-00:30", sab: "12:00-14:30,19:00-00:30" }) },
    { id: "cremona", city: "cremona", name: "Cremona", short: "Cremona", addr: "Corso Garibaldi 44, 26100 Cremona", img: "pizzeria-e.webp", r: -1.2,
      h: week({ dom: "12:00-15:00,19:00-23:30", lun: "", mar: "19:00-23:30", mer: "19:00-23:30", gio: "19:00-23:30", ven: "19:00-00:30", sab: "12:00-15:00,19:00-00:30" }) },
    { id: "trento", city: "trento", name: "Trento", short: "Trento", addr: "Via Belenzani 12, 38122 Trento", img: "pizzeria-f.webp", r: 1.1,
      h: week({ dom: "12:00-14:30,18:30-23:00", lun: "12:00-14:30,18:30-23:00", mar: "12:00-14:30,18:30-23:00", mer: "", gio: "12:00-14:30,18:30-23:00", ven: "12:00-14:30,18:30-23:30", sab: "12:00-14:30,18:30-23:30" }) },
  ];
  const storeById = (id) => STORES.find((s) => s.id === id) || STORES[0];
  const CITIES = [["all", "Tutte"], ["brescia", "Brescia"], ["garda", "Garda"], ["mantova", "Mantova"], ["cremona", "Cremona"], ["trento", "Trento"]];

  const CATS = [
    { id: "rosse", label: "Pizze rosse", note: "Base pomodoro San Marzano. Tutte anche con impasto senza glutine (+2 €)." },
    { id: "bianche", label: "Pizze bianche", note: "Niente pomodoro: fior di latte, creme e tanta roba buona sopra." },
    { id: "fritti", label: "Fritti & insalate", note: "Da mettere al centro del tavolo mentre la pizza è in forno." },
    { id: "bimbi", label: "Bimbi", note: "Per chi ha meno di 12 anni. Pastelli e tovaglietta da colorare compresi." },
    { id: "dolci", label: "Dopo la pizza", note: "Un posticino si trova sempre." },
    { id: "bere", label: "Da bere", note: "Birre di birrifici bresciani, Franciacorta al calice, bibite italiane." },
  ];
  const MENU = [
    { id: "margherita", cat: "rosse", name: "Margherita", desc: "Pomodoro San Marzano, fior di latte della Val Camonica, basilico, olio extravergine.", price: 7.5, img: "pz-margherita.webp", diet: ["V", "SG"] },
    { id: "quadretti", cat: "rosse", name: "La Quadretti", desc: "Salame di Monte Isola, fior di latte, cipolla rossa caramellata, Silter grattugiato.", price: 12, img: "pz-salame-rucola.webp", feat: "sky", tag: "La più amata" },
    { id: "marinara", cat: "rosse", name: "Marinara del forno", desc: "Pomodoro, pomodorini gialli, aglio in camicia, origano selvatico, olio al basilico.", price: 6.5, img: "pz-marinara.webp", diet: ["VE", "SG"] },
    { id: "capricciosa", cat: "rosse", name: "Capricciosa", desc: "Cotto alla brace, champignon, carciofini, olive taggiasche, fior di latte.", price: 11, img: "pz-capricciosa.webp" },
    { id: "diavola", cat: "rosse", name: "Diavola pop", desc: "Spianata piccante calabrese, fior di latte, miele al peperoncino, basilico fritto.", price: 10, img: "pz-diavola.webp", feat: "pink", tag: "Piccante" },
    { id: "peperonata", cat: "rosse", name: "Peperonata", desc: "Peperoni arrostiti nel forno a legna, provola affumicata, olive, origano.", price: 10, img: "pz-peperoni.webp", diet: ["V"] },
    { id: "bianca", cat: "bianche", name: "Bianca al limone", desc: "Ricotta, fior di latte, rucola, scorza di limone del Garda, pepe nero.", price: 9, img: "pz-bianca.webp", diet: ["V"] },
    { id: "funghi", cat: "bianche", name: "Funghi & tartufo", desc: "Crema di porcini, fior di latte, champignon saltati, olio al tartufo nero.", price: 11.5, img: "pz-funghi.webp", diet: ["V"], feat: "sky", tag: "Novità" },
    { id: "crudo", cat: "bianche", name: "Crudo & burrata", desc: "Burrata intera, prosciutto crudo stagionato 18 mesi, rucola, olio a crudo.", price: 13, img: "pz-crudo.webp" },
    { id: "formaggi", cat: "bianche", name: "Quattro formaggi", desc: "Fior di latte, gorgonzola dolce, Taleggio, Grana Padano, noci tostate.", price: 11, img: "pz-formaggi.webp", diet: ["V"] },
    { id: "orto", cat: "bianche", name: "Orto bianco", desc: "Friarielli, zucchine grigliate, mozzarella vegetale, pinoli tostati.", price: 10.5, img: "pz-ortolana.webp", diet: ["VE"] },
    { id: "arancini", cat: "fritti", name: "Arancini al ragù", desc: "Tre arancini con ragù e piselli, maionese al basilico.", price: 5.5, img: "sd-arancini.webp", sq: true },
    { id: "mozzarelline", cat: "fritti", name: "Mozzarelline", desc: "Fior di latte in panatura croccante, salsa di pomodoro piccante.", price: 5.5, img: "sd-mozzarelline.webp", sq: true, diet: ["V"] },
    { id: "patatine", cat: "fritti", name: "Patatine", desc: "Patate tagliate a mano, sale al rosmarino.", price: 4, img: "sd-patatine.webp", sq: true, diet: ["VE"] },
    { id: "focaccia", cat: "fritti", name: "Focaccia del forno", desc: "Impasto della pizza, rosmarino, sale grosso, olio buono.", price: 4.5, img: "sd-focaccia.webp", sq: true, diet: ["VE"] },
    { id: "insalatona", cat: "fritti", name: "Insalatona", desc: "Misticanza, pollo alla piastra, uovo, mais, pomodorini, cavolo viola.", price: 9, img: "sd-insalata.webp", sq: true },
    { id: "bimbo", cat: "bimbi", name: "Menu bimbo", desc: "Margherita piccola o pizza al cotto, una bibita e una pallina di gelato.", price: 9, img: "pz-margherita.webp", feat: "pink", tag: "Under 12", diet: ["V"] },
    { id: "minimarg", cat: "bimbi", name: "Mini margherita", desc: "La margherita in formato piccolo.", price: 5, diet: ["V"] },
    { id: "minicotto", cat: "bimbi", name: "Mini cotto", desc: "Pomodoro, fior di latte, prosciutto cotto.", price: 6 },
    { id: "patatinebimbi", cat: "bimbi", name: "Patatine piccole", desc: "Mezza porzione, stesso sale al rosmarino.", price: 2.5, diet: ["VE"] },
    { id: "nutella", cat: "dolci", name: "Pizza alla nocciola", desc: "Impasto fritto, crema di nocciole, granella e zucchero a velo. Da dividere in due (o no).", price: 7, img: "sd-nutella.webp", sq: true, diet: ["V"] },
    { id: "tiramisu", cat: "dolci", name: "Tiramisù della casa", desc: "Savoiardi, caffè della moka, mascarpone.", price: 5.5, diet: ["V"] },
    { id: "gelato", cat: "dolci", name: "Gelato fiordilatte", desc: "Due palline, con olio e sale o con amarene.", price: 4.5, diet: ["V", "SG"] },
    { id: "affogato", cat: "dolci", name: "Affogato", desc: "Fiordilatte e un espresso bollente sopra.", price: 5, diet: ["V", "SG"] },
    { id: "birra", cat: "bere", name: "Birra chiara alla spina", desc: "Birrificio di Brescia, 40 cl.", price: 5.5, diet: ["VE"] },
    { id: "ipa", cat: "bere", name: "IPA artigianale", desc: "Bottiglia 33 cl, luppoli agrumati.", price: 6, diet: ["VE"] },
    { id: "franciacorta", cat: "bere", name: "Franciacorta brut", desc: "Al calice.", price: 7, diet: ["VE"] },
    { id: "spritz", cat: "bere", name: "Spritz al bitter", desc: "Bitter, prosecco, soda, arancia.", price: 7, diet: ["VE"] },
    { id: "chinotto", cat: "bere", name: "Chinotto", desc: "Bottiglietta di vetro, 27,5 cl.", price: 3.5, diet: ["VE"] },
    { id: "acqua", cat: "bere", name: "Acqua", desc: "Naturale o frizzante, 50 cl.", price: 2, diet: ["VE"] },
  ];
  const itemById = (id) => MENU.find((m) => m.id === id);
  const FLIP = [["quadretti", "La più amata"], ["diavola", "Piccante"], ["margherita", "Classica"], ["funghi", "Novità"], ["crudo", "Del mese"]];

  const EVENTS = [
    { tag: "Brescia Carmine", title: "DJ & pizza", when: "Ogni venerdì · 21:00", desc: "Vinili dal 1977 in poi e forno acceso fino all'una. Ingresso libero.", img: "pizzeria-c.webp", r: -2, store: "carmine" },
    { tag: "Tutte le pizzerie", title: "Corso di pizza", when: "Sabato · 10:00 · 35 €", desc: "Impasti, stendi, condisci, inforni. A fine corso ti porti a casa il panetto.", img: "sticker-impasto.webp", r: 1.5, note: "Corso di pizza" },
    { tag: "Mantova", title: "Pizza senza fondo", when: "Ogni martedì sera · 19 €", desc: "Gli spicchi girano finché non alzi bandiera bianca. Da tutto il menu.", img: "pz-diavola.webp", r: -1, store: "mantova", note: "Pizza senza fondo" },
    { tag: "Cremona", title: "Pizzaioli in erba", when: "Domenica · 16:00", desc: "Compleanni per bimbi dai 5 ai 12 anni, grembiule e cappello inclusi.", img: "sd-patatine.webp", r: 2, store: "cremona", note: "Festa bimbi" },
    { tag: "Gruppi 8+", title: "Tavolate", when: "Tutti i giorni", desc: "Menu condiviso da 22 € a testa: fritti, quattro pizze a giro e dolce.", img: "pizzeria-b.webp", r: -1.5, party: 8 },
  ];

  /* =====================================================================
     TIME · Europe/Rome, handles closings after midnight
     ===================================================================== */
  const romeFmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", weekday: "short", hourCycle: "h23" });
  function romeNow(d = new Date()) {
    const p = {}; romeFmt.formatToParts(d).forEach((x) => (p[x.type] = x.value));
    return { y: +p.year, mo: +p.month, d: +p.day, wd: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday), min: (+p.hour % 24) * 60 + +p.minute };
  }
  function status(st, now = romeNow()) {
    const yest = st.h[(now.wd + 6) % 7], today = st.h[now.wd];
    for (const [, c] of yest) if (c > 1440 && now.min < c - 1440) return { open: true, until: c - 1440 };
    for (const [o, c] of today) if (now.min >= o && now.min < c) return { open: true, until: c };
    for (const [o] of today) if (o > now.min) return { open: false, next: o, day: 0 };
    for (let i = 1; i <= 7; i++) { const ds = st.h[(now.wd + i) % 7]; if (ds.length) return { open: false, next: ds[0][0], day: i, wd: (now.wd + i) % 7 }; }
    return { open: false };
  }
  function statusText(s) {
    if (s.open) return "Aperto ora · chiude alle " + fmt(s.until);
    if (s.next == null) return "Chiuso";
    if (s.day === 0) return "Chiuso · apre alle " + fmt(s.next);
    if (s.day === 1) return "Chiuso · apre domani alle " + fmt(s.next);
    return "Chiuso · apre " + DAYS[s.wd] + " alle " + fmt(s.next);
  }
  const hoursText = (st, wd) => { const d = st.h[wd]; return d.length ? d.map(([a, b]) => fmt(a) + "–" + fmt(b)).join(" · ") : "chiuso"; };

  /* =====================================================================
     HEADER · grab panel + full screen nav
     ===================================================================== */
  const grabBtn = $("#grabBtn"), grabPanel = $("#grabPanel"), menuBtn = $("#menuBtn"), nav = $("#qdNav");
  let lockN = 0;
  const lock = (on) => { lockN = Math.max(0, lockN + (on ? 1 : -1)); document.documentElement.style.overflow = lockN ? "hidden" : ""; };
  function setGrab(open) {
    if (open === grabPanel.classList.contains("open")) return;
    grabPanel.classList.toggle("open", open); grabBtn.setAttribute("aria-expanded", open);
    if (open) grabPanel.removeAttribute("inert"); else grabPanel.setAttribute("inert", "");
  }
  grabBtn.addEventListener("click", (e) => { e.stopPropagation(); setGrab(!grabPanel.classList.contains("open")); });
  document.addEventListener("click", (e) => { if (grabPanel.classList.contains("open") && !grabPanel.contains(e.target) && !grabBtn.contains(e.target)) setGrab(false); });
  let navOpener = null;
  function setNav(open) {
    if (open === nav.classList.contains("open")) return;
    nav.classList.toggle("open", open); menuBtn.setAttribute("aria-expanded", open); lock(open);
    if (open) { navOpener = document.activeElement; nav.removeAttribute("inert"); setGrab(false); setTimeout(() => $(".qd-nav-x", nav).focus(), 60); }
    else { nav.setAttribute("inert", ""); }
  }
  menuBtn.addEventListener("click", () => setNav(true));

  /* =====================================================================
     DIALOGS
     ===================================================================== */
  const openers = new Map();
  function openDlg(d) {
    if (d.classList.contains("open")) return;
    openers.set(d, document.activeElement);
    d.classList.add("open"); d.removeAttribute("inert"); lock(true);
    setTimeout(() => { const f = $(".dlg-x", d); f && f.focus({ preventScroll: true }); }, 50);
  }
  function closeDlg(d) {
    if (!d.classList.contains("open")) return;
    d.classList.remove("open"); d.setAttribute("inert", ""); lock(false);
    const o = openers.get(d); if (o && o.focus && document.contains(o)) o.focus({ preventScroll: true });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const d = $$(".dlg.open").pop();
    if (d) return closeDlg(d);
    if (nav.classList.contains("open")) { setNav(false); navOpener && navOpener.focus(); return; }
    if (grabPanel.classList.contains("open")) { setGrab(false); grabBtn.focus(); }
  });

  /* global delegation */
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-book],[data-open-cart],[data-close-nav],[data-close-dlg],[data-close-grab],[data-add]");
    if (!t) return;
    if (t.hasAttribute("data-add")) { e.stopPropagation(); return addFlow(t); }
    if (t.hasAttribute("data-close-dlg")) return closeDlg(t.closest(".dlg"));
    if (t.hasAttribute("data-close-nav")) setNav(false);
    if (t.hasAttribute("data-close-grab")) setGrab(false);
    if (t.hasAttribute("data-book")) { setGrab(false); setNav(false); openBooking({ party: +t.dataset.party || 0, store: t.dataset.store, note: t.dataset.note }); }
    if (t.hasAttribute("data-open-cart")) { setGrab(false); setNav(false); openCart(); }
  });

  /* =====================================================================
     TILTED MARQUEES · direction follows the scroll
     ===================================================================== */
  const BASE = 70; // px/s
  const bands = $$("[data-mq]").map((el) => ({ el, vis: true, tracks: $$(".mq-track", el).map((t) => ({ t, dir: +t.dataset.dir || 1, unit: t.innerHTML, u: 0, x: 0 })) }));
  function buildBands() {
    bands.forEach((b) => b.tracks.forEach((tr) => {
      tr.t.innerHTML = tr.unit;
      const u = tr.t.getBoundingClientRect().width || 1;
      const k = Math.ceil(b.el.getBoundingClientRect().width / u) + 2;
      tr.t.innerHTML = tr.unit.repeat(k); tr.u = u;
      tr.x = -u * (tr.dir > 0 ? 0.15 : 0.55);
      tr.t.style.transform = `translate3d(${tr.x.toFixed(2)}px,0,0)`;
    }));
  }
  const mq = { v: BASE, target: 1, boost: 0, lastY: window.scrollY, lastT: performance.now() };
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((en) => { const b = bands.find((x) => x.el === en.target); if (b) b.vis = en.isIntersecting; }), { rootMargin: "120px 0px" });
    bands.forEach((b) => io.observe(b.el));
  }
  window.addEventListener("scroll", () => {
    const y = window.scrollY, t = performance.now(), dy = y - mq.lastY, dt = Math.max(16, t - mq.lastT);
    if (Math.abs(dy) > 0.5) { mq.target = dy > 0 ? 1 : -1; mq.boost = Math.min(320, mq.boost * 0.6 + (Math.abs(dy) / dt) * 1000 * 0.22); }
    mq.lastY = y; mq.lastT = t;
  }, { passive: true });
  let mqPrev = performance.now();
  function mqLoop(now) {
    const dt = Math.min(0.05, (now - mqPrev) / 1000); mqPrev = now;
    if (!reduce()) {
      mq.boost *= Math.exp(-dt * 2.6);
      const goal = mq.target * (BASE + mq.boost);
      mq.v += (goal - mq.v) * (1 - Math.exp(-dt * 3.2));   // eases through zero: slows, stops, reverses
      for (const b of bands) {
        if (!b.vis) continue;
        for (const tr of b.tracks) {
          if (!tr.u) continue;
          tr.x -= mq.v * tr.dir * dt;
          tr.x %= tr.u; if (tr.x > 0) tr.x -= tr.u;
          tr.t.style.transform = `translate3d(${tr.x.toFixed(2)}px,0,0)`;
        }
      }
    }
    requestAnimationFrame(mqLoop);
  }

  /* =====================================================================
     STICKERS · drag, let go, spring home
     ===================================================================== */
  function sticker(el) {
    const r0 = parseFloat(el.style.getPropertyValue("--r")) || 0;
    let x = 0, y = 0, vx = 0, vy = 0, tx = 0, ty = 0, held = false, hover = false, gx = 0, gy = 0;
    let rot = 0, s = 1, sv = 0, lift = 0, running = false, last = 0, pid = null;
    const zBase = getComputedStyle(el).zIndex;
    const start = () => { if (!running) { running = true; last = performance.now(); requestAnimationFrame(step); } };
    el.addEventListener("pointerenter", () => { hover = true; start(); });
    el.addEventListener("pointerleave", () => { hover = false; start(); });
    el.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      held = true; pid = e.pointerId; el.classList.add("held");
      try { el.setPointerCapture(pid); } catch (er) {}
      gx = e.clientX - x; gy = e.clientY - y; tx = x; ty = y; start();
    });
    el.addEventListener("pointermove", (e) => { if (held && e.pointerId === pid) { tx = e.clientX - gx; ty = e.clientY - gy; } });
    const drop = () => { if (!held) return; held = false; el.classList.remove("held"); tx = 0; ty = 0; el.style.zIndex = "6"; setTimeout(() => { if (!held) el.style.zIndex = zBase; }, 900); start(); };
    el.addEventListener("pointerup", drop); el.addEventListener("pointercancel", drop); el.addEventListener("lostpointercapture", drop);
    function step(now) {
      let dt = Math.min(0.05, (now - last) / 1000); last = now;
      const h = 1 / 240;
      const k = held ? 900 : 190, c = 2 * Math.sqrt(k) * (held || reduce() ? 0.95 : 0.42);
      const sT = held ? 1.05 : hover ? 1.02 : 1, lT = held ? 1 : 0;
      while (dt > 0) {
        const st = Math.min(h, dt); dt -= st;
        vx += (-k * (x - tx) - c * vx) * st; x += vx * st;
        vy += (-k * (y - ty) - c * vy) * st; y += vy * st;
        sv += (-600 * (s - sT) - 30 * sv) * st; s += sv * st;
      }
      rot += (clamp(vx * 0.018, -14, 14) - rot) * 0.18;     // swings with the throw
      lift += (lT - lift) * 0.2;
      el.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${(r0 + rot).toFixed(2)}deg) scale(${s.toFixed(3)})`;
      const sh = 9 + lift * 10;
      el.style.boxShadow = `${sh.toFixed(1)}px ${(sh + lift * 6).toFixed(1)}px 0 var(--ink)`;
      const rest = !held && Math.abs(x) < 0.2 && Math.abs(y) < 0.2 && Math.hypot(vx, vy) < 4 && Math.abs(s - sT) < 0.001 && Math.abs(rot) < 0.05 && lift < 0.01;
      if (rest) { x = y = vx = vy = 0; rot = 0; el.style.transform = ""; el.style.boxShadow = ""; running = false; return; }
      requestAnimationFrame(step);
    }
    el._state = () => ({ x, y, held, running });
  }
  $$(".stk").forEach(sticker);

  /* =====================================================================
     MENU · tabs + cards
     ===================================================================== */
  const addBtn = (id, name, small) => `<button class="add${small ? " add-s" : ""}" type="button" data-add="${id}" aria-label="Aggiungi ${name} al carrello"><span>Aggiungi</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12.5l4 4L18 8.5"/></svg></button>`;
  const dietHtml = (d) => `<span class="diet">${(d || []).map((x) => `<b>${x}</b>`).join("")}</span>`;
  const mnCats = $("#mnCats"), mnGrid = $("#mnGrid"), mnTitle = $("#mnTitle"), mnNote = $("#mnNote");
  let curCat = "rosse";
  mnCats.innerHTML = CATS.map((c) => `<button class="pill mn-cat" type="button" role="tab" id="tab-${c.id}" aria-selected="${c.id === curCat}" tabindex="${c.id === curCat ? 0 : -1}" data-cat="${c.id}">${c.label}</button>`).join("");
  function renderMenu(cat) {
    const c = CATS.find((x) => x.id === cat);
    const items = MENU.filter((m) => m.cat === cat);
    const cards = items.filter((m) => m.img), list = items.filter((m) => !m.img);
    mnTitle.textContent = c.label; mnNote.textContent = c.note;
    mnGrid.setAttribute("aria-labelledby", "tab-" + cat);
    mnGrid.innerHTML = cards.map((m, i) => `
      <article class="mi${m.feat ? " mi-feat " + m.feat : ""}" style="--k:${i}">
        ${m.tag ? `<span class="tag">${m.tag}</span>` : ""}
        <div class="mi-img${m.sq ? " sq" : ""}"><img src="assets/${m.img}" alt="${m.name}" loading="lazy" draggable="false"></div>
        <h4>${m.name}</h4>
        <p>${m.desc}</p>
        ${dietHtml(m.diet)}
        <div class="mi-row"><span class="mi-price">${eur(m.price)}</span>${addBtn(m.id, m.name)}</div>
      </article>`).join("") + (list.length ? `<div class="mi-list">${list.map((m, i) => `
      <div class="mi-li" style="--k:${cards.length + i}"><div><h4>${m.name}</h4><p>${m.desc}${m.diet ? " · " + m.diet.join(" ") : ""}</p></div><span class="mi-price">${eur(m.price)}</span>${addBtn(m.id, m.name, true)}</div>`).join("")}</div>` : "");
  }
  function pickCat(id, focus) {
    if (id === curCat) return;
    curCat = id;
    $$(".mn-cat", mnCats).forEach((b) => { const on = b.dataset.cat === id; b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1; if (on) { focus && b.focus(); b.scrollIntoView({ block: "nearest", inline: "center", behavior: reduce() ? "auto" : "smooth" }); } });
    mnGrid.classList.add("swap");
    later(160, () => {
      renderMenu(id); mnGrid.classList.remove("swap");
      const top = $(".mn").getBoundingClientRect().top;
      if (top < 0) window.scrollTo({ top: window.scrollY + top - 70, behavior: reduce() ? "auto" : "smooth" });
    });
  }
  mnCats.addEventListener("click", (e) => { const b = e.target.closest("[data-cat]"); if (b) pickCat(b.dataset.cat); });
  mnCats.addEventListener("keydown", (e) => {
    const i = CATS.findIndex((c) => c.id === curCat);
    const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!d) return; e.preventDefault(); pickCat(CATS[(i + d + CATS.length) % CATS.length].id, true);
  });
  renderMenu(curCat);

  /* =====================================================================
     FLIP-STACK · the month's five
     ===================================================================== */
  const fsStack = $("#fsStack");
  let fsOrder = FLIP.map(([id, tag], i) => {
    const m = itemById(id), el = document.createElement("article");
    el.className = "fs-card fs-c" + i; el.dataset.id = id;
    el.innerHTML = `<span class="tag">${tag}</span><div class="fs-img"><img src="assets/${m.img}" alt="${m.name}" draggable="false"></div><h4>${m.name}</h4><p>${m.desc}</p><div class="fs-row"><span class="fs-price">${eur(m.price)}</span>${addBtn(m.id, m.name)}</div>`;
    fsStack.appendChild(el); return el;
  });
  const fsLayout = () => fsOrder.forEach((el, i) => { el.style.setProperty("--i", i); el.style.zIndex = 10 - i; el.setAttribute("aria-hidden", i ? "true" : "false"); el.inert = i !== 0; });
  fsLayout();
  let fsBusy = false, fsHover = false, fsVis = false, fsFlips = 0;
  function flip() {
    if (fsBusy) return;
    fsBusy = true; fsFlips++;
    const front = fsOrder[0];
    const done = () => {
      front.classList.add("reset"); front.classList.remove("open");
      fsOrder = fsOrder.slice(1).concat(front); fsLayout();
      front.style.opacity = 0;
      requestAnimationFrame(() => requestAnimationFrame(() => { front.classList.remove("reset"); front.style.opacity = 1; fsBusy = false; }));
    };
    if (reduce()) return done();
    front.classList.add("open");
    setTimeout(done, 620);   // past 90° nobody sees its face: send it to the back
  }
  fsStack.addEventListener("click", (e) => { if (!e.target.closest(".add")) flip(); });
  fsStack.addEventListener("pointerenter", () => (fsHover = true));
  fsStack.addEventListener("pointerleave", () => (fsHover = false));
  $("#flipNext").addEventListener("click", flip);
  if ("IntersectionObserver" in window) new IntersectionObserver((es) => (fsVis = es[0].isIntersecting), { threshold: 0.4 }).observe(fsStack);
  setInterval(() => { if (fsVis && !fsHover && !reduce() && !document.hidden && !$(".dlg.open")) flip(); }, 2800);

  /* =====================================================================
     DONE-BURST · Aggiungi → squeeze → tick → particles
     ===================================================================== */
  const cv = $("#burst"), cx = cv.getContext("2d");
  const BCOL = ["#00c800", "#fb80b7", "#7cc8ff", "#e3262e", "#ffd25a"];
  let parts = [], burstOn = false, bLast = 0;
  function burstAt(ox, oy) {
    if (reduce()) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    if (cv.width !== innerWidth * dpr || cv.height !== innerHeight * dpr) { cv.width = innerWidth * dpr; cv.height = innerHeight * dpr; }
    for (let i = 0; i < 24; i++) {
      const a = (i / 24) * Math.PI * 2 + (Math.random() - 0.5) * 0.5, sp = 160 + Math.random() * 170;
      parts.push({ x: ox + Math.cos(a) * 8, y: oy + Math.sin(a) * 8, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 50, r: 3.4 + Math.random() * 4.2, c: BCOL[i % BCOL.length], t0: performance.now() });
    }
    if (!burstOn) { burstOn = true; bLast = performance.now(); requestAnimationFrame(burstStep); }
  }
  function burstStep(now) {
    const dt = Math.min(0.05, (now - bLast) / 1000); bLast = now;
    const dpr = cv.width / innerWidth;
    cx.setTransform(dpr, 0, 0, dpr, 0, 0); cx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter((q) => now - q.t0 < 800);
    for (const q of parts) {
      const t = (now - q.t0) / 800;
      q.vy += 380 * dt; q.vx *= 1 - 2.6 * dt; q.vy *= 1 - 1.6 * dt; q.x += q.vx * dt; q.y += q.vy * dt;
      cx.globalAlpha = t < 0.45 ? 1 : 1 - (t - 0.45) / 0.55; cx.fillStyle = q.c;
      cx.beginPath(); cx.arc(q.x, q.y, q.r * (1 - t * 0.35), 0, Math.PI * 2); cx.fill();
    }
    if (parts.length) requestAnimationFrame(burstStep); else { burstOn = false; cx.clearRect(0, 0, innerWidth, innerHeight); }
  }
  function addFlow(btn) {
    const id = btn.dataset.add; addToCart(id, 1);
    if (btn._busy) return;
    if (reduce()) { const m = itemById(id); toast(m.name + " nel carrello"); return; }
    btn._busy = true;
    btn.classList.add("press");                                   // label fades
    setTimeout(() => btn.classList.add("round"), 110);           // pill → circle (260 ms)
    setTimeout(() => btn.classList.add("tick"), 380);            // tick draws (240 ms)
    setTimeout(() => { const r = btn.getBoundingClientRect(); burstAt(r.left + r.width / 2, r.top + r.height / 2); }, 560);
    setTimeout(() => { btn.classList.remove("tick"); }, 1350);
    setTimeout(() => { btn.classList.remove("round", "press"); btn._busy = false; }, 1500);
  }

  /* =====================================================================
     CART
     ===================================================================== */
  const FREE = 25, FEE = 2.5, MIN = 15;
  let cart = kv.get("qd-cart") || {};
  let mode = kv.get("qd-mode") || "delivery";
  Object.keys(cart).forEach((k) => { if (!itemById(k) || !(cart[k] > 0)) delete cart[k]; });
  const cartDlg = $("#cartDlg"), ctLines = $("#ctLines"), ctEmpty = $("#ctEmpty");
  const count = () => Object.values(cart).reduce((a, b) => a + b, 0);
  const subtotal = () => Object.entries(cart).reduce((a, [k, q]) => a + itemById(k).price * q, 0);
  function addToCart(id, d) {
    cart[id] = (cart[id] || 0) + d; if (cart[id] <= 0) delete cart[id];
    kv.set("qd-cart", cart); renderCart();
    if (d > 0) $$("[data-cart-n]").forEach((n) => { n.classList.remove("bump"); void n.offsetWidth; n.classList.add("bump"); setTimeout(() => n.classList.remove("bump"), 260); });
  }
  const ctStore = $("#ctStore"), ctTime = $("#ctTime"), ctAddr = $("#ctAddr");
  ctStore.innerHTML = STORES.map((s) => `<option value="${s.id}">${s.name}</option>`).join("");
  function timeOptions() {
    const st = mode === "pickup" ? storeById(ctStore.value) : STORES[0];
    const now = romeNow(), s = status(st, now), out = [];
    if (s.open) out.push(["asap", mode === "pickup" ? "Prima possibile (~20 min)" : "Prima possibile (35–45 min)"]);
    const lead = mode === "pickup" ? 20 : 45;
    for (let day = 0; day < 2 && out.length < 14; day++) {
      const wd = (now.wd + day) % 7;
      for (const [o, c] of st.h[wd]) {
        for (let t = Math.ceil(o / 15) * 15 + 15; t <= c - 15; t += 15) {
          if (day === 0 && t < now.min + lead) continue;
          out.push([day + "-" + t, (day ? "Domani " : "Oggi ") + fmt(t)]);
          if (out.length >= 14) break;
        }
        if (out.length >= 14) break;
      }
    }
    const keep = ctTime.value;
    ctTime.innerHTML = out.map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
    if (out.some(([v]) => v === keep)) ctTime.value = keep;
  }
  function renderCart() {
    const n = count(), sub = subtotal();
    $$("[data-cart-n]").forEach((el) => (el.textContent = n));
    const fab = $("#cartFab"); fab.hidden = n === 0; document.body.classList.toggle("has-fab", n > 0);
    $("#fabTotal").textContent = eur(sub);
    ctLines.innerHTML = Object.entries(cart).map(([k, q]) => {
      const m = itemById(k);
      return `<li class="ct-line" data-line="${k}">${m.img ? `<img src="assets/${m.img}" alt="">` : `<span class="ct-ph"><svg><use href="#${m.cat === "bere" ? "i-beer" : "i-slice"}"/></svg></span>`}
        <div><h4>${m.name}</h4><span>${eur(m.price)} · ${eur(m.price * q)}</span></div>
        <div class="ct-qty"><button type="button" data-q="-1" aria-label="Togli una ${m.name}">−</button><output>${q}</output><button type="button" data-q="1" aria-label="Aggiungi una ${m.name}">+</button></div></li>`;
    }).join("");
    ctEmpty.hidden = n > 0;
    $(".ct-where", cartDlg).hidden = n === 0;
    const del = mode === "delivery";
    $$(".ct-mode button").forEach((b) => b.setAttribute("aria-checked", b.dataset.mode === mode));
    $(".ct-del").hidden = !del; $(".ct-pick").hidden = del;
    const fee = del && sub > 0 && sub < FREE ? FEE : 0;
    $("#ctSub").textContent = eur(sub);
    $("#ctFeeRow").hidden = !del;
    const feeEl = $("#ctFee"); feeEl.textContent = del && sub >= FREE ? "Gratis" : eur(sub > 0 ? FEE : 0); feeEl.classList.toggle("free", del && sub >= FREE);
    $("#ctTot").textContent = eur(sub + fee);
    const free = $("#ctFree"); free.hidden = !del || n === 0;
    $("#ctFreeFill").style.width = clamp((sub / FREE) * 100, 0, 100) + "%";
    $("#ctFreeTxt").textContent = sub >= FREE ? "Consegna gratis sbloccata!" : "Mancano " + eur(FREE - sub) + " alla consegna gratis.";
    const short = del && n > 0 && sub < MIN;
    $("#ctMin").textContent = short ? "Ordine minimo per la consegna: " + eur(MIN) + ". Mancano " + eur(MIN - sub) + "." : "";
    $("#ctGo").disabled = n === 0 || short;
  }
  ctLines.addEventListener("click", (e) => { const b = e.target.closest("[data-q]"); if (!b) return; addToCart(b.closest("[data-line]").dataset.line, +b.dataset.q); });
  $(".ct-mode").addEventListener("click", (e) => { const b = e.target.closest("[data-mode]"); if (!b) return; mode = b.dataset.mode; kv.set("qd-mode", mode); renderCart(); timeOptions(); });
  ctStore.addEventListener("change", timeOptions);
  function openCart() {
    $("#ctOk").hidden = true; $("#ctBody").hidden = false; $(".ct-foot", cartDlg).hidden = false;
    renderCart(); timeOptions(); openDlg(cartDlg);
  }
  $("#ctGo").addEventListener("click", () => {
    const errA = $('[data-err="addr"]', cartDlg); errA.textContent = ""; ctAddr.classList.remove("bad");
    if (mode === "delivery") {
      const a = ctAddr.value.trim();
      if (a.length < 6 || !/\d/.test(a)) { errA.textContent = "Scrivi via e numero civico."; ctAddr.classList.add("bad"); ctAddr.focus(); ctAddr.classList.remove("shake"); void ctAddr.offsetWidth; ctAddr.classList.add("shake"); return; }
    }
    const code = "QD-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    const when = ctTime.options[ctTime.selectedIndex] ? ctTime.options[ctTime.selectedIndex].text.toLowerCase() : "";
    const tot = subtotal() + (mode === "delivery" && subtotal() < FREE ? FEE : 0);
    $("#ctOkTxt").textContent = mode === "delivery"
      ? `Totale ${eur(tot)}, paghi alla consegna. Arriviamo in ${ctAddr.value.trim()} · ${when}.`
      : `Totale ${eur(tot)}. Ritiri da Quadretti ${storeById(ctStore.value).name} · ${when}.`;
    $("#ctCode").textContent = code;
    cart = {}; kv.set("qd-cart", cart); renderCart();
    $("#ctBody").hidden = true; $(".ct-foot", cartDlg).hidden = true; $("#ctOk").hidden = false;
    setTimeout(() => $("#ctOk .pill").focus(), 50);
  });

  /* =====================================================================
     BOOKING · Prendi un tavolo
     ===================================================================== */
  const bookDlg = $("#bookDlg"), bkForm = $("#bkForm"), bkStore = $("#bkStore"), bkDays = $("#bkDays"), bkSlots = $("#bkSlots");
  const pplOut = $("#pplOut"), pplNote = $("#pplNote");
  const bk = { store: "carmine", day: null, slot: null, ppl: 2, days: [] };
  bkStore.innerHTML = STORES.map((s) => `<option value="${s.id}">${s.name}</option>`).join("");
  function slotsFor(st, d, now) {
    const out = [];
    for (const [o, c] of st.h[d.wd]) for (let t = o; t <= c - 60; t += 30) out.push({ t, off: d.i === 0 && t < now.min + 30 });
    return out;
  }
  function buildDays() {
    const now = romeNow(), st = storeById(bk.store);
    bk.days = [];
    for (let i = 0; i < 14; i++) {
      const dt = new Date(Date.UTC(now.y, now.mo - 1, now.d + i, 12));
      const d = { i, wd: dt.getUTCDay(), dd: dt.getUTCDate(), mm: dt.getUTCMonth() };
      d.slots = slotsFor(st, d, now); d.ok = d.slots.some((s) => !s.off);
      bk.days.push(d);
    }
    if (bk.day == null || !bk.days[bk.day].ok) { const f = bk.days.find((d) => d.ok); bk.day = f ? f.i : 0; bk.slot = null; }
    bkDays.innerHTML = bk.days.map((d) => `<button type="button" class="bk-day" role="radio" aria-checked="${d.i === bk.day}" data-day="${d.i}" ${d.ok ? "" : "disabled"} aria-label="${d.i === 0 ? "Oggi" : d.i === 1 ? "Domani" : DAYS[d.wd]} ${d.dd} ${MESI[d.mm]}${d.ok ? "" : ", chiuso"}"><small>${d.i === 0 ? "oggi" : DSH[d.wd]}</small><b>${d.dd}</b><small>${MESI[d.mm]}</small></button>`).join("");
    buildSlots();
  }
  function buildSlots() {
    const d = bk.days[bk.day];
    if (bk.slot != null && !d.slots.some((s) => s.t === bk.slot && !s.off)) bk.slot = null;
    bkSlots.innerHTML = d.slots.length && d.ok
      ? d.slots.map((s) => `<button type="button" class="bk-slot" role="radio" aria-checked="${s.t === bk.slot}" data-slot="${s.t}" ${s.off ? "disabled" : ""}>${fmt(s.t)}</button>`).join("")
      : `<p class="bk-none">Nessun orario libero questo giorno: prova un altro giorno.</p>`;
  }
  function setPpl(n) {
    bk.ppl = clamp(n, 1, 12); pplOut.textContent = bk.ppl;
    $("#pplMinus").disabled = bk.ppl <= 1; $("#pplPlus").disabled = bk.ppl >= 12;
    pplNote.classList.toggle("warn", bk.ppl >= 8);
    pplNote.textContent = bk.ppl >= 12 ? "Siete più di 12? Scrivici a ciao@quadretti.pizza: vi chiudiamo una sala."
      : bk.ppl >= 8 ? "Da 8 in su è una tavolata: ti richiamiamo entro un'ora per il menu gruppi (da 22 € a testa)."
      : "Bimbi compresi: contali anche loro, così il tavolo è giusto.";
  }
  bkStore.addEventListener("change", () => { bk.store = bkStore.value; buildDays(); });
  bkDays.addEventListener("click", (e) => { const b = e.target.closest("[data-day]"); if (!b || b.disabled) return; bk.day = +b.dataset.day; $$(".bk-day", bkDays).forEach((x) => x.setAttribute("aria-checked", x === b)); buildSlots(); });
  bkSlots.addEventListener("click", (e) => { const b = e.target.closest("[data-slot]"); if (!b || b.disabled) return; bk.slot = +b.dataset.slot; $$(".bk-slot", bkSlots).forEach((x) => x.setAttribute("aria-checked", x === b)); $('[data-err="slot"]', bookDlg).textContent = ""; });
  $("#pplMinus").addEventListener("click", () => setPpl(bk.ppl - 1));
  $("#pplPlus").addEventListener("click", () => setPpl(bk.ppl + 1));
  function openBooking(o = {}) {
    bkForm.hidden = false; $("#bkOk").hidden = true;
    if (o.store) bk.store = o.store;
    bkStore.value = bk.store;
    bk.day = null; bk.slot = null;
    setPpl(o.party || (bk.ppl >= 8 ? 2 : bk.ppl));
    $("#bkNote").value = o.note || "";
    $$(".bk-err", bkForm).forEach((x) => (x.textContent = "")); $$(".bad", bkForm).forEach((x) => x.classList.remove("bad"));
    buildDays(); openDlg(bookDlg);
  }
  const bad = (el, key, msg) => { $(`[data-err="${key}"]`, bookDlg).textContent = msg; if (el) { el.classList.add("bad"); el.classList.remove("shake"); void el.offsetWidth; el.classList.add("shake"); } return false; };
  bkForm.addEventListener("submit", (e) => {
    e.preventDefault();
    $$(".bk-err", bkForm).forEach((x) => (x.textContent = "")); $$(".bad", bkForm).forEach((x) => x.classList.remove("bad"));
    const name = $("#bkName"), tel = $("#bkTel");
    let ok = true, first = null;
    if (bk.slot == null) { ok = bad(bkSlots, "slot", "Scegli un orario."); first = first || bkSlots.querySelector("button:not(:disabled)"); }
    if (name.value.trim().length < 2) { ok = bad(name, "name", "Ci serve un nome per il tavolo."); first = first || name; }
    const digits = tel.value.replace(/[^\d]/g, "");
    if (digits.length < 8 || digits.length > 13 || /[^\d\s+().-]/.test(tel.value)) { ok = bad(tel, "tel", "Numero non valido: ti scriviamo lì la conferma."); first = first || tel; }
    if (!ok) { first && first.focus(); return; }
    const st = storeById(bk.store), d = bk.days[bk.day];
    const dayTxt = d.i === 0 ? "oggi" : d.i === 1 ? "domani" : DAYS[d.wd] + " " + d.dd + " " + MESI[d.mm];
    $("#bkOkTxt").textContent = `${name.value.trim()}, ti aspettiamo da Quadretti ${st.name} ${dayTxt} alle ${fmt(bk.slot)}: tavolo per ${bk.ppl}. ${bk.ppl >= 8 ? "Ti chiamiamo entro un'ora per il menu gruppi." : "Conferma via SMS al " + tel.value.trim() + "."}`;
    $("#bkCode").textContent = "QD-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    bkForm.hidden = true; $("#bkOk").hidden = false;
    setTimeout(() => $("#bkOk .pill").focus(), 50);
  });

  /* =====================================================================
     EVENTS row
     ===================================================================== */
  $("#evRow").innerHTML = EVENTS.map((ev) => `
    <article class="evc" style="--r:${ev.r}deg">
      <span class="tag">${ev.tag}</span>
      <div class="evc-img"><img src="assets/${ev.img}" alt="" loading="lazy" draggable="false"></div>
      <h3 class="xt xt-s">${ev.title}</h3>
      <span class="evc-when">${ev.when}</span>
      <p>${ev.desc}</p>
      <button class="pill" type="button" data-book ${ev.store ? `data-store="${ev.store}"` : ""} ${ev.party ? `data-party="${ev.party}"` : ""} ${ev.note ? `data-note="${ev.note}"` : ""}>Prenota</button>
    </article>`).join("");

  /* =====================================================================
     PIZZERIE · filter chips (highlight slides, cards swap in turn)
     ===================================================================== */
  const prChips = $("#prChips"), chipPill = $(".chips-pill", prChips), prGrid = $("#prGrid");
  prChips.insertAdjacentHTML("beforeend", CITIES.map(([k, l], i) => `<button type="button" aria-pressed="${i === 0}" data-city="${k}">${l}</button>`).join(""));
  let city = "all", shownCity = "", prTimers = [];
  function placePill(btn, animate) {
    const L = btn.offsetLeft, W = btn.offsetWidth, R = prChips.clientWidth - (L + W), T = btn.offsetTop;
    const right = L > chipPill.offsetLeft, sameRow = Math.abs(T - chipPill.offsetTop) < 2;
    chipPill.style.transition = !animate || reduce() || !sameRow ? "none" : right
      ? "right .22s cubic-bezier(.3,.7,.4,1), left .3s cubic-bezier(.5,0,.3,1) .04s"
      : "left .22s cubic-bezier(.3,.7,.4,1), right .3s cubic-bezier(.5,0,.3,1) .04s";
    chipPill.style.left = L + "px"; chipPill.style.right = R + "px"; chipPill.style.top = T + "px";
  }
  function storeCard(s, now) {
    const st = status(s, now);
    return `<article class="sc" style="--r:${s.r}deg" data-store="${s.id}">
      <div class="sc-img"><img src="assets/${s.img}" alt="" loading="lazy" draggable="false"><span class="sc-status"><i class="st-dot${st.open ? " is-open" : ""}"></i><span data-status="${s.id}">${statusText(st)}</span></span></div>
      <h3 class="xt xt-s">${s.name}</h3>
      <address>${s.addr}</address>
      <p class="sc-hours">Oggi: <span data-hours="${s.id}">${hoursText(s, now.wd)}</span></p>
      <div class="sc-btns"><button class="pill" type="button" data-book data-store="${s.id}">Prenota</button><a class="pill pill-ghost" href="#" data-dir>Indicazioni</a></div>
    </article>`;
  }
  const later2 = (ms, f) => prTimers.push(setTimeout(f, reduce() ? 0 : ms));
  function renderStores(k, animate) {
    if (k === shownCity) return;
    prTimers.forEach(clearTimeout); prTimers = [];
    const list = STORES.filter((s) => k === "all" || s.city === k), now = romeNow();
    const put = (enter) => {
      prGrid.innerHTML = list.map((s) => storeCard(s, now)).join("") || `<p class="pr-empty">Nessuna pizzeria qui, per ora.</p>`;
      if (!enter) return;
      $$(".sc", prGrid).forEach((c, i) => { c.classList.add("enter"); later2(70 * i + 16, () => { c.getBoundingClientRect(); c.classList.remove("enter"); }); });
    };
    if (!animate || !prGrid.children.length) put(false);
    else { $$(".sc", prGrid).forEach((c) => c.classList.add("leave")); later2(230, () => put(true)); }
    shownCity = k;
  }
  prChips.addEventListener("click", (e) => {
    const b = e.target.closest("[data-city]"); if (!b || b.dataset.city === city) return;
    $$("[data-city]", prChips).forEach((c) => c.setAttribute("aria-pressed", c === b));
    placePill(b, true); city = b.dataset.city; renderStores(city, true);
  });
  prGrid.addEventListener("click", (e) => { if (e.target.closest("[data-dir]")) { e.preventDefault(); toast("Qui si aprirebbero le indicazioni stradali."); } });
  renderStores("all", false);

  /* hero status + live refresh */
  function refreshStatus() {
    const now = romeNow();
    const hs = status(STORES[0], now), hero = $("#heroStatus");
    hero.classList.toggle("is-open", hs.open);
    $("span", hero).textContent = "Brescia Carmine · " + statusText(hs).replace(/^Aperto ora/, "aperto ora").replace(/^Chiuso/, "chiuso");
    STORES.forEach((s) => {
      const st = status(s, now);
      $$(`[data-status="${s.id}"]`).forEach((el) => { el.textContent = statusText(st); el.previousElementSibling.classList.toggle("is-open", st.open); });
      $$(`[data-hours="${s.id}"]`).forEach((el) => (el.textContent = hoursText(s, now.wd)));
    });
  }
  refreshStatus(); setInterval(refreshStatus, 30000);

  /* =====================================================================
     NEWSLETTER + JOBS
     ===================================================================== */
  const nlStore = $("#nlStore");
  nlStore.insertAdjacentHTML("beforeend", STORES.map((s) => `<option value="${s.id}">${s.name}</option>`).join(""));
  $("#nlForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const em = $("#nlEmail"), err = $("#nlErr");
    err.textContent = "";
    if (!nlStore.value) { err.textContent = "Scegli la tua pizzeria."; return nlStore.focus(); }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em.value.trim())) { err.textContent = "Questa email non sembra giusta."; return em.focus(); }
    if (!$("#nlPrivacy").checked) { err.textContent = "Spunta la casella della privacy per iscriverti."; return $("#nlPrivacy").focus(); }
    toast("Benvenuto nel Pizza Club! Controlla la tua email.");
    e.target.reset();
  });
  $("#jobBtn").addEventListener("click", () => toast("Mandaci due righe a lavora@quadretti.pizza: rispondiamo a tutti."));

  /* =====================================================================
     BOOT
     ===================================================================== */
  renderCart();
  const boot = () => { buildBands(); placePill($('[aria-pressed="true"]', prChips), false); };
  boot();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(boot).catch(() => {});
  let rT = 0; window.addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(boot, 150); });
  requestAnimationFrame(mqLoop);

  /* test hooks (used by _check scripts) */
  window.__qd = { mq, bands, status, romeNow, STORES, flips: () => fsFlips, fs: () => ({ fsVis, fsHover, fsBusy }), cart: () => ({ ...cart }), subtotal };
})();
