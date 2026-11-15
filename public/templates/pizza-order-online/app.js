/* Bertacchi · Pizzeria di famiglia — template pubblico. Nomi, indirizzi e prezzi sono di fantasia. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reduced = () => RM.matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const eur = (n) => "€" + (Math.round(n * 100) / 100).toFixed(2).replace(".", ",");
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* storage: nell'iframe sandbox senza same-origin localStorage lancia → memoria */
  const mem = {};
  let LS = null;
  try { LS = window.localStorage; LS.getItem("bt"); } catch (e) { LS = null; }
  const saved = {
    get(k) { try { if (LS) { const v = LS.getItem("bt-" + k); if (v != null) return JSON.parse(v); } } catch (e) { /* memoria */ } return k in mem ? mem[k] : null; },
    set(k, v) { mem[k] = v; try { if (LS) LS.setItem("bt-" + k, JSON.stringify(v)); } catch (e) { /* memoria */ } },
  };

  /* ---------------- ora di Roma ---------------- */
  const DAYS = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  const DAYS_SHORT = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
  function romeNow() {
    const m = location.search.match(/[?&]ora=(\d{4})-(\d\d)-(\d\d)T(\d\d):(\d\d)/);
    if (m) {
      const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
      return { dow: d.getUTCDay(), min: +m[4] * 60 + +m[5] };
    }
    try {
      const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
      const g = (t) => (parts.find((p) => p.type === t) || {}).value;
      return { dow: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(g("weekday")), min: (+g("hour") % 24) * 60 + +g("minute") };
    } catch (e) {
      const d = new Date();
      return { dow: d.getDay(), min: d.getHours() * 60 + d.getMinutes() };
    }
  }
  const hm = (min) => { const m = ((min % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); };
  const T = (h, m = 0) => h * 60 + m;

  /* ---------------- sedi ---------------- */
  const PRANZO = [T(11, 30), T(14, 30)];
  const STORES = [
    { id: "centro", name: "Modena Centro", addr: "Via Emilia Centro 212", city: "41121 Modena", tel: "059 210 1931", caps: ["41121", "41122", "41123", "41124"], xy: [352, 452],
      hours: { 0: [PRANZO, [T(18, 30), T(23)]], 1: [], 2: [PRANZO, [T(18, 30), T(23)]], 3: [PRANZO, [T(18, 30), T(23)]], 4: [PRANZO, [T(18, 30), T(23)]], 5: [PRANZO, [T(18, 30), T(24, 30)]], 6: [PRANZO, [T(18, 30), T(24, 30)]] } },
    { id: "sacca", name: "Modena Sacca", addr: "Via Canaletto Sud 48", city: "41122 Modena", tel: "059 210 1946", caps: ["41122", "41125", "41126"], xy: [404, 372],
      hours: { 0: [[T(12), T(14, 30)], [T(18), T(23, 30)]], 1: [[T(18), T(23, 30)]], 2: [[T(18), T(23, 30)]], 3: [[T(18), T(23, 30)]], 4: [[T(18), T(23, 30)]], 5: [[T(18), T(23, 30)]], 6: [[T(12), T(14, 30)], [T(18), T(23, 30)]] } },
    { id: "carpi", name: "Carpi", addr: "Corso Alberto Pio 15", city: "41012 Carpi (MO)", tel: "059 210 1996", caps: ["41012"], xy: [250, 118],
      hours: { 0: [[T(12), T(14, 30)], [T(18, 30), T(23)]], 1: [[T(12), T(14, 30)], [T(18, 30), T(23)]], 2: [], 3: [[T(12), T(14, 30)], [T(18, 30), T(23)]], 4: [[T(12), T(14, 30)], [T(18, 30), T(23)]], 5: [[T(12), T(14, 30)], [T(18, 30), T(23, 30)]], 6: [[T(12), T(14, 30)], [T(18, 30), T(23, 30)]] } },
  ];
  const storeById = (id) => STORES.find((s) => s.id === id) || STORES[0];

  function status(st, now = romeNow()) {
    const today = st.hours[now.dow] || [], yday = st.hours[(now.dow + 6) % 7] || [];
    for (const [, b] of yday) if (b > 1440 && now.min < b - 1440) return { open: true, until: b - 1440 + 1440, left: b - 1440 - now.min };
    for (const [a, b] of today) if (now.min >= a && now.min < b) return { open: true, until: b, left: b - now.min };
    for (const [a] of today) if (a > now.min) return { open: false, next: a, day: 0, wait: a - now.min };
    for (let i = 1; i <= 7; i++) { const w = st.hours[(now.dow + i) % 7]; if (w && w.length) return { open: false, next: w[0][0], day: i, wait: Infinity }; }
    return { open: false, next: 0, day: 7, wait: Infinity };
  }
  function statusText(st, now) {
    const s = status(st, now);
    if (s.open) return s.left <= 30 ? { cls: "soon", t: `Chiude tra ${s.left} min · ultimo ordine adesso` } : { cls: "open", t: `Aperto ora · chiude alle ${hm(s.until)}` };
    if (s.day === 0) return { cls: s.wait <= 60 ? "soon" : "", t: s.wait <= 60 ? `Apre tra ${s.wait} min, alle ${hm(s.next)}` : `Chiuso · apre alle ${hm(s.next)}` };
    if (s.day === 1) return { cls: "", t: `Chiuso · apre domani alle ${hm(s.next)}` };
    return { cls: "", t: `Chiuso · apre ${DAYS[(now.dow + s.day) % 7]} alle ${hm(s.next)}` };
  }

  /* fasce orarie: ogni 15 minuti, dalla prima disponibile fino a 15 min prima della chiusura */
  function slotsFor(st, mode, now = romeNow()) {
    const prep = mode === "consegna" ? 40 : 20;
    for (let d = 0; d < 8; d++) {
      const dow = (now.dow + d) % 7;
      const wins = (st.hours[dow] || []).map((w) => w.slice());
      if (d === 0) for (const [, b] of st.hours[(now.dow + 6) % 7] || []) if (b > 1440) wins.unshift([0, b - 1440]);
      const out = [];
      for (const [a, b] of wins) {
        let t = d === 0 ? Math.max(a + 15, now.min + prep) : a + 15;
        t = Math.ceil(t / 15) * 15;
        for (; t <= b - 15 && out.length < 16; t += 15) out.push(t);
      }
      if (out.length) return { d, dow, times: out };
    }
    return { d: 0, dow: now.dow, times: [] };
  }

  /* ---------------- menù ---------------- */
  const SIZES = [
    { id: "p", name: "Piccola", cm: 30, add: 0, d: "32px" },
    { id: "m", name: "Media", cm: 35, add: 3, d: "40px" },
    { id: "f", name: "Famiglia", cm: 45, add: 7, d: "50px" },
  ];
  const DOUGHS = [
    { id: "classico", name: "Classico 48 ore", add: 0 },
    { id: "integrale", name: "Integrale", add: 1 },
    { id: "sg", name: "Senza glutine", add: 3 },
  ];
  const BASES = [
    { id: "pomodoro", name: "Pomodoro", d: "San Marzano DOP", add: 0, c: "#c63a22" },
    { id: "bianca", name: "Bianca", d: "Fior di latte e olio", add: 0, c: "#f1e9d2" },
    { id: "zucca", name: "Crema di zucca", d: "Zucca mantovana", add: 1, c: "#e08a2c" },
    { id: "pesto", name: "Pesto", d: "Basilico e pinoli", add: 1.5, c: "#5f8c2f" },
  ];
  const EXTRAS = [
    ["Formaggi", [["bufala", "Mozzarella di bufala", 2.5], ["parmigiano", "Parmigiano 30 mesi", 2], ["gorgonzola", "Gorgonzola", 1.5]]],
    ["Salumi", [["crudo", "Crudo di Parma", 3], ["salame", "Salame piccante", 2], ["salsiccia", "Salsiccia", 2.5], ["mortadella", "Mortadella", 2.5]]],
    ["Verdure", [["funghi", "Funghi", 1.5], ["rucola", "Rucola", 1], ["cipolla", "Cipolla di Tropea", 1], ["olive", "Olive taggiasche", 1.5], ["peperoncino", "Peperoncino", 0.5]]],
    ["Per finire", [["balsamico", "Balsamico tradizionale", 2], ["basilico", "Olio al basilico", 0.5]]],
  ];
  const EXTRA = Object.fromEntries(EXTRAS.flatMap(([, l]) => l.map(([id, name, p]) => [id, { id, name, p }])));
  const MAX_EXTRAS = 6;

  const CATS = [
    { id: "specialita", name: "Le Specialità", sub: "Le pizze della casa, cotte nel forno a legna. Prezzi per la piccola da 30 cm." },
    { id: "preferiti", name: "I Preferiti", sub: "Ordine veloce · misura media, senza modifiche." },
    { id: "componi", name: "Componi la tua", sub: "Parti da pomodoro e mozzarella, oppure dal solo impasto." },
    { id: "famiglia", name: "Menù famiglia", sub: "Comodi e convenienti.", tag: "Solo online" },
    { id: "sfizi", name: "Insalate e fritti", sub: "Per cominciare o da dividere." },
    { id: "bibite", name: "Bibite", sub: "Gazzose di bottega e vini del territorio." },
    { id: "dolci", name: "Dolci", sub: "Fatti in casa ogni mattina." },
  ];
  const V = ["veg"];
  const ITEMS = [
    { id: "balsamica", cat: "specialita", name: "La Balsamica", d: "Fior di latte, rucola, Parmigiano 30 mesi e aceto balsamico tradizionale a crudo.", p: 10.5, img: "bianca", base: "bianca", tags: ["veg", "new"], badge: "Solo d'autunno", custom: true },
    { id: "margherita", cat: "specialita", name: "Margherita", d: "Pomodoro San Marzano, fior di latte, basilico fresco e olio extravergine.", p: 7.5, img: "margherita", base: "pomodoro", tags: V, custom: true },
    { id: "marinara", cat: "specialita", name: "Marinara", d: "Pomodoro, aglio, origano di montagna e olio. Niente formaggio, da sempre.", p: 6.5, img: "marinara", base: "pomodoro", tags: V, custom: true },
    { id: "diavola", cat: "specialita", name: "Diavola", d: "Pomodoro, fior di latte, salame piccante e peperoncino calabrese.", p: 9, img: "diavola", base: "pomodoro", tags: ["hot"], custom: true },
    { id: "ortolana", cat: "specialita", name: "Ortolana", d: "Fior di latte, spinaci saltati, ricotta di pecora e scorza di limone.", p: 9.5, img: "ortolana", base: "bianca", tags: V, custom: true },
    { id: "capricciosa", cat: "specialita", name: "Capricciosa", d: "Pomodoro, fior di latte, prosciutto cotto, funghi, carciofi e olive.", p: 10, img: "capricciosa", base: "pomodoro", custom: true },
    { id: "crudo", cat: "specialita", name: "Crudo e rucola", d: "Fior di latte, crudo di Parma 24 mesi e rucola, messi all'uscita dal forno.", p: 11, img: "crudo", base: "bianca", custom: true },
    { id: "venerdi", cat: "specialita", name: "Del venerdì", d: "Pomodoro, cozze, vongole, calamari e prezzemolo. Il venerdì da novant'anni.", p: 12.5, img: "fruttidimare", base: "pomodoro", custom: true },

    { id: "quattro", cat: "preferiti", name: "Quattro formaggi", d: "Fior di latte, gorgonzola, taleggio e Parmigiano Reggiano.", p: 11, img: "formaggi", tags: V, fixed: "Media 35 cm" },
    { id: "cottofunghi", cat: "preferiti", name: "Cotto e funghi", d: "Pomodoro, fior di latte, cotto alla brace e champignon.", p: 11.5, img: "prosciutto-funghi", fixed: "Media 35 cm" },
    { id: "salamino", cat: "preferiti", name: "Salamino", d: "Pomodoro, fior di latte e salamino piccante tagliato sottile.", p: 11, img: "salame", tags: ["hot"], fixed: "Media 35 cm" },
    { id: "boscaiola", cat: "preferiti", name: "Boscaiola", d: "Fior di latte, funghi misti, salsiccia di mora romagnola e timo.", p: 12, img: "funghi", fixed: "Media 35 cm" },
    { id: "peperonata", cat: "preferiti", name: "Peperonata", d: "Pomodoro, peperoni arrostiti, cipolla e friggitelli piccanti.", p: 10.5, img: "peperoni", tags: ["veg", "hot"], fixed: "Media 35 cm" },
    { id: "pescatore", cat: "preferiti", name: "Del pescatore", d: "Pomodoro, gamberi, olive nere e capperi di Pantelleria.", p: 13.5, img: "mare", fixed: "Media 35 cm" },
    { id: "salamerucola", cat: "preferiti", name: "Salame e rucola", d: "Pomodoro, fior di latte, salame nostrano, rucola e pomodorini.", p: 11.5, img: "salame-rucola", fixed: "Media 35 cm" },

    { id: "byo", cat: "componi", name: "Pomodoro e mozzarella", d: "La base di sempre, San Marzano e fior di latte: il resto lo scegli tu, aggiunta per aggiunta.", p: 7, img: "famiglia", base: "pomodoro", custom: true, wide: true },
    { id: "dazero", cat: "componi", name: "Da zero", d: "Solo impasto: scegli misura, base, formaggi e ogni aggiunta. Olio e origano sono compresi.", p: 6, img: "impasto", base: "bianca", custom: true, wide: true, tags: V },

    { id: "fam4", cat: "famiglia", name: "Famiglia per 4", d: "Due pizze famiglia a scelta tra le classiche, un'insalata grande e quattro bibite.", p: 44.9, img: "famiglia", badge: "Solo online", fixed: "2 pizze famiglia · insalata · 4 bibite" },
    { id: "indue", cat: "famiglia", name: "Serata in due", d: "Due pizze medie, due bibite e un tiramisù da dividere.", p: 26.9, img: "diavola", badge: "Solo online", fixed: "2 pizze medie · 2 bibite · tiramisù" },
    { id: "pranzo", cat: "famiglia", name: "Pranzo veloce", d: "Pizza piccola, due arancini al ragù e una bibita. Dal martedì al venerdì, a pranzo.", p: 12.9, img: "arancini", badge: "Solo online", fixed: "Pizza piccola · arancini · bibita" },

    { id: "insalata", cat: "sfizi", name: "Insalata della casa", d: "Misticanza, pollo alla piastra, uovo, mais, cavolo viola e pomodorini.", p: 9.5, img: "insalata" },
    { id: "caprese", cat: "sfizi", name: "Caprese di bufala", d: "Mozzarella di bufala, cuore di bue, basilico e olio dei colli.", p: 9, tile: "Caprese", tags: V },
    { id: "arancini", cat: "sfizi", name: "Arancini al ragù", d: "Due arancini con ragù bianco di maiale e piselli.", p: 6.5, img: "arancini" },
    { id: "carrozza", cat: "sfizi", name: "Mozzarella in carrozza", d: "Quattro bastoncini fritti con salsa di pomodoro piccante.", p: 6, img: "mozzarelline", tags: V },
    { id: "gnocco", cat: "sfizi", name: "Gnocco fritto e mortadella", d: "Sei gnocchi appena fritti con mortadella e squacquerone.", p: 7.5, tile: "Gnocco fritto" },

    { id: "gazzosa", cat: "bibite", name: "Gazzosa di bottega", d: "Al limone, in vetro da 27,5 cl.", p: 3.5, bottle: "#e7eed8", tags: V },
    { id: "chinotto", cat: "bibite", name: "Chinotto", d: "Amaro e scuro, in vetro da 27,5 cl.", p: 3.5, bottle: "#3a1c10", tags: V },
    { id: "aranciata", cat: "bibite", name: "Aranciata amara", d: "Arance di Sicilia, in vetro da 27,5 cl.", p: 3.5, bottle: "#e3741e", tags: V },
    { id: "lambrusco", cat: "bibite", name: "Lambrusco Grasparossa", d: "Rosso frizzante secco dei colli di Castelvetro, 75 cl.", p: 14, bottle: "#5a0d27", tags: V, wine: true },
    { id: "acqua", cat: "bibite", name: "Acqua minerale", d: "Naturale o frizzante, 50 cl.", p: 2, bottle: "#d5e7f0", tags: V },
    { id: "birra", cat: "bibite", name: "Birra artigianale", d: "Bionda non filtrata di un birrificio di Modena, 33 cl.", p: 5, bottle: "#d79a2c", tags: V },

    { id: "crespella", cat: "dolci", name: "Crespella alla Nutella", d: "Piegata in quattro, con nocciole tostate.", p: 6.5, img: "nutella", tags: V },
    { id: "tiramisu", cat: "dolci", name: "Tiramisù", d: "Savoiardi, caffè della moka e mascarpone montato a mano.", p: 6, tile: "Tiramisù", tags: V },
    { id: "bensone", cat: "dolci", name: "Bensone con amarene", d: "Il dolce da colazione modenese, con confettura di amarene.", p: 5, tile: "Bensone", tags: V },
    { id: "zuppa", cat: "dolci", name: "Zuppa inglese", d: "Crema, cioccolato e pan di Spagna bagnato nell'alchermes.", p: 5.5, tile: "Zuppa inglese", tags: V },
  ];
  ITEMS.forEach((it) => { it.tags = it.tags || []; });
  const itemById = (id) => ITEMS.find((i) => i.id === id);
  const imgSrc = (it) => (it.img ? `assets/${it.img}.webp` : "");

  const bottleSvg = (c, wine) => `<svg viewBox="0 0 60 160" aria-hidden="true"><path d="M24 6h12v${wine ? 34 : 24}c0 8 12 14 12 30v86a6 6 0 0 1-6 6H18a6 6 0 0 1-6-6V${wine ? 70 : 60}c0-16 12-22 12-30Z" fill="${c}" stroke="#0002" stroke-width="1.2"/><rect x="22" y="2" width="16" height="9" rx="2" fill="#b49a62"/><rect x="12" y="${wine ? 92 : 84}" width="36" height="34" fill="#f6f2e7" opacity=".92"/><text x="30" y="${wine ? 112 : 104}" text-anchor="middle" font-family="EB Garamond, serif" font-size="8" letter-spacing="1" fill="#741800">BERTACCHI</text><path d="M18 ${wine ? 118 : 110}h24" stroke="#741800" stroke-width=".6"/></svg>`;

  function cardHTML(it) {
    const media = it.img
      ? `<img src="${imgSrc(it)}" width="520" height="520" alt="${esc(it.name)}" loading="lazy" draggable="false">`
      : it.bottle ? `<div class="bt-it__tile">${bottleSvg(it.bottle, it.wine)}</div>`
      : `<div class="bt-it__tile"><span>Bertacchi<b>${esc(it.tile)}</b>dal 1931</span></div>`;
    const marks = (it.tags.includes("veg") && ["specialita", "preferiti", "componi", "sfizi"].includes(it.cat) ? `<i class="bt-it__veg" title="Vegetariana"></i>` : "") + (it.tags.includes("hot") ? `<span class="bt-it__hot" title="Piccante">●●</span>` : "");
    const price = it.custom ? `<small>Da</small>${eur(it.p)}` : eur(it.p);
    const addBtn = `<button class="bt-btn bt-btn--solid bt-done" type="button" data-add="${it.id}"><span class="bt-done__t">Aggiungi</span><svg class="bt-done__ck" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 12.5l4 4 8-9"/></svg></button>`;
    const custBtn = `<button class="bt-btn bt-btn--outline" type="button" data-customize="${it.id}">Personalizza</button>`;
    const btns = it.wide ? `<div class="bt-it__btns one">${custBtn.replace("bt-btn--outline", "bt-btn--solid")}</div>`
      : it.custom ? `<div class="bt-it__btns">${custBtn}${addBtn}</div>` : `<div class="bt-it__btns one">${addBtn}</div>`;
    const badge = it.badge ? `<span class="bt-tag">${esc(it.badge)}</span>` : "";
    if (it.wide) {
      return `<article class="bt-it bt-it--wide" data-id="${it.id}"><div class="bt-it__img">${media}</div><div class="bt-it__body"><h3>${esc(it.name)}${marks}</h3><p class="bt-it__d">${esc(it.d)}</p><p class="bt-it__p">${price}</p>${btns}</div></article>`;
    }
    return `<article class="bt-it" data-id="${it.id}"><div class="bt-it__img">${badge}${media}</div><h3>${esc(it.name)}${marks}</h3><p class="bt-it__d">${esc(it.d)}</p><p class="bt-it__p">${price}</p>${btns}</article>`;
  }

  const secWrap = $("#menuSections");
  secWrap.innerHTML = CATS.map((c) => `<section class="bt-sec" id="cat-${c.id}" aria-labelledby="h-${c.id}"><h2 id="h-${c.id}">${esc(c.name)}</h2><p class="bt-sec__sub">${esc(c.sub)}${c.tag ? ` <span class="bt-tag">${esc(c.tag)}</span>` : ""}</p><div class="bt-grid${c.id === "componi" ? " bt-grid--wide" : ""}">${ITEMS.filter((i) => i.cat === c.id).map(cardHTML).join("")}</div></section>`).join("");

  /* ---------------- tab categorie + scrollspy ---------------- */
  const tabs = $("#tabs"), tabsBar = $("#tabsBar");
  tabs.innerHTML = CATS.map((c, i) => `<button type="button" data-cat="${c.id}" aria-current="${i === 0}">${esc(c.name)}</button>`).join("");
  const topH = () => $(".bt-top").offsetHeight;
  const offsetTop = (el) => el.getBoundingClientRect().top + window.scrollY;
  let spyLock = 0;
  function setTab(id) {
    $$("button", tabs).forEach((b) => b.setAttribute("aria-current", String(b.dataset.cat === id)));
    const b = tabs.querySelector(`[data-cat="${id}"]`);
    if (b) {
      const want = b.offsetLeft - (tabs.clientWidth - b.offsetWidth) / 2;
      if (Math.abs(tabs.scrollLeft - want) > 4) tabs.scrollTo({ left: want, behavior: reduced() ? "auto" : "smooth" });
    }
  }
  tabs.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-cat]"); if (!b) return;
    const sec = $("#cat-" + b.dataset.cat); if (!sec || sec.hidden) return;
    setTab(b.dataset.cat);
    spyLock = Date.now() + 900;
    window.scrollTo({ top: offsetTop(sec) - topH() - tabsBar.offsetHeight - 4, behavior: reduced() ? "auto" : "smooth" });
  });
  $$(".bt-tabs__arr").forEach((a) => a.addEventListener("click", () => tabs.scrollBy({ left: (a.classList.contains("bt-tabs__arr--l") ? -1 : 1) * tabs.clientWidth * 0.6, behavior: reduced() ? "auto" : "smooth" })));
  let spyRaf = 0;
  function spy() {
    spyRaf = 0;
    const r = tabsBar.getBoundingClientRect();
    tabsBar.classList.toggle("stuck", r.top <= topH() + 1 && window.scrollY > 200);
    if (Date.now() < spyLock) return;
    const line = topH() + tabsBar.offsetHeight + 60;
    let cur = null;
    for (const c of CATS) { const s = $("#cat-" + c.id); if (!s.hidden && s.getBoundingClientRect().top <= line) cur = c.id; }
    if (!cur) cur = (CATS.find((c) => !$("#cat-" + c.id).hidden) || CATS[0]).id;
    const now = tabs.querySelector('[aria-current="true"]');
    if (!now || now.dataset.cat !== cur) setTab(cur);
  }
  window.addEventListener("scroll", () => { if (!spyRaf) spyRaf = requestAnimationFrame(spy); }, { passive: true });

  /* ---------------- filtri (chips + risultati) ---------------- */
  const chips = $("#chips"), pill = $(".bt-chips__pill", chips);
  let filter = "all", fTimers = [];
  function placePill(btn, animate) {
    const L = btn.offsetLeft, W = btn.offsetWidth;
    const prevL = parseFloat(pill.style.left) || 0;
    if (!animate || reduced()) pill.style.transition = "none";
    else pill.style.transition = L > prevL ? "width .3s cubic-bezier(.5,0,.3,1), left .3s cubic-bezier(.5,0,.3,1) .04s" : "left .22s cubic-bezier(.3,.7,.4,1), width .3s cubic-bezier(.5,0,.3,1) .04s";
    pill.style.left = L + "px"; pill.style.width = W + "px";
  }
  const matches = (it, f) => f === "all" || (f === "cheap" ? it.p < 10 : it.tags.includes(f));
  function applyFilter(f, animate = true) {
    filter = f;
    fTimers.forEach(clearTimeout); fTimers = [];
    const cards = $$(".bt-it", secWrap);
    const showing = (el) => !el.classList.contains("gone") && !el.classList.contains("out");
    const fast = !animate || reduced();
    cards.forEach((el) => { const ok = matches(itemById(el.dataset.id), f); if (!ok && showing(el)) el.classList.add("out"); });
    const swap = () => {
      let n = 0;
      cards.forEach((el) => {
        const ok = matches(itemById(el.dataset.id), f);
        if (!ok) { el.classList.add("gone"); el.classList.remove("out", "enter"); return; }
        n++;
        if (el.classList.contains("gone")) { el.classList.remove("gone"); if (!fast) { el.classList.add("enter"); } }
      });
      CATS.forEach((c) => {
        const sec = $("#cat-" + c.id);
        const any = $$(".bt-it", sec).some((el) => !el.classList.contains("gone"));
        sec.hidden = !any;
        tabs.querySelector(`[data-cat="${c.id}"]`).classList.toggle("dim", !any);
      });
      $("#menuEmpty").hidden = n > 0;
      $("#filterCount").textContent = n === 1 ? "1 piatto" : `${n} piatti`;
      const entering = cards.filter((el) => el.classList.contains("enter"));
      requestAnimationFrame(() => entering.forEach((el, i) => fTimers.push(setTimeout(() => el.classList.remove("enter"), 16 + Math.min(i, 10) * 35))));
      spy();
    };
    if (fast) swap(); else fTimers.push(setTimeout(swap, 230));
  }
  chips.addEventListener("click", (e) => {
    const b = e.target.closest("button[data-f]"); if (!b || b.dataset.f === filter) return;
    $$("button", chips).forEach((c) => c.setAttribute("aria-pressed", String(c === b)));
    placePill(b, true);
    applyFilter(b.dataset.f);
  });

  /* ---------------- stato ordine ---------------- */
  const S = Object.assign({ lines: [], mode: "ritiro", store: "centro" }, saved.get("cart") || {});
  S.slot = null;
  const persist = () => saved.set("cart", { lines: S.lines, mode: S.mode, store: S.store });
  const count = () => S.lines.reduce((a, l) => a + l.qty, 0);
  const subtotal = () => S.lines.reduce((a, l) => a + l.unit * l.qty, 0);
  const FREE_AT = 30, MIN_DEL = 15, DEL_FEE = 2.9;
  const delivery = () => (S.mode === "consegna" ? (subtotal() >= FREE_AT ? 0 : DEL_FEE) : 0);

  function cfgOf(it, c) {
    if (!it.custom) return { key: it.id, unit: it.p, opts: it.fixed || "" };
    const size = SIZES.find((s) => s.id === c.size), dough = DOUGHS.find((d) => d.id === c.dough), base = BASES.find((b) => b.id === c.base);
    const ex = [...c.extras];
    const unit = it.p + size.add + dough.add + (c.base !== it.base ? base.add : 0) + ex.reduce((a, id) => a + EXTRA[id].p, 0);
    const parts = [`${size.name} ${size.cm} cm`];
    if (dough.id !== "classico") parts.push(dough.name);
    if (c.base !== it.base) parts.push("base " + base.name.toLowerCase());
    if (ex.length) parts.push("+ " + ex.map((id) => EXTRA[id].name).join(", "));
    if (c.note) parts.push(`«${c.note}»`);
    return { key: [it.id, c.size, c.dough, c.base, ex.slice().sort().join("+"), c.note || ""].join("|"), unit, opts: parts.join(" · ") };
  }
  const defaultCfg = (it) => ({ size: "p", dough: "classico", base: it.base || "pomodoro", extras: new Set(), note: "" });

  function addLine(it, cfg, qty) {
    const c = cfgOf(it, cfg || defaultCfg(it));
    const ex = S.lines.find((l) => l.key === c.key);
    if (ex) ex.qty = clamp(ex.qty + qty, 1, 30);
    else S.lines.push({ key: c.key, id: it.id, name: it.name, img: it.img || "", unit: c.unit, opts: c.opts, qty });
    persist(); renderCart(true);
  }

  /* ---------------- drag stepper: tocco = ±1, tieni premuto 260 ms = trascina ---------------- */
  function stepper(el, { value, min, max, span, onChange, small, label }) {
    el.classList.add("bt-ds"); if (small) el.classList.add("bt-ds--sm");
    el.innerHTML = `<button type="button" data-d="-1" aria-label="Diminuisci ${esc(label || "")}">−</button><output aria-live="polite">${value}</output><button type="button" data-d="1" aria-label="Aumenta ${esc(label || "")}">+</button>`;
    const out = $("output", el);
    let v = value, press = null;
    const set = (n) => { n = clamp(Math.round(n), min, max); if (n === v) return; v = n; out.textContent = v; onChange(v); };
    el.addEventListener("pointerdown", (e) => {
      const b = e.target.closest("button"); if (!b || e.button > 0) return;
      e.preventDefault();
      try { b.setPointerCapture(e.pointerId); } catch (er) { /* ok */ }
      press = { b, x: e.clientX, v, d: +b.dataset.d, sweep: false };
      press.t = setTimeout(() => { if (press) { press.sweep = true; el.classList.add("sweep"); b.classList.add("held"); } }, 260);
    });
    el.addEventListener("pointermove", (e) => { if (press && press.sweep) set(press.v + ((e.clientX - press.x) / el.offsetWidth) * span); });
    const end = (cancel) => { if (!press) return; clearTimeout(press.t); const p = press; press = null; el.classList.remove("sweep"); p.b.classList.remove("held"); if (!p.sweep && !cancel) set(v + p.d); };
    el.addEventListener("pointerup", () => end(false));
    el.addEventListener("pointercancel", () => end(true));
    el.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b && e.detail === 0) set(v + +b.dataset.d); });
    return { get: () => v, set: (n) => { v = n; out.textContent = n; } };
  }

  /* ---------------- burst + volo nel carrello ---------------- */
  const cv = $("#burst"), cx = cv.getContext("2d");
  let parts = [], burstRaf = 0, lastT = 0;
  function sizeCanvas() { const d = Math.min(window.devicePixelRatio || 1, 2); cv.width = innerWidth * d; cv.height = innerHeight * d; cx.setTransform(d, 0, 0, d, 0, 0); }
  sizeCanvas();
  const COLORS = ["#194f42", "#741800", "#e2b04a", "#7aa35a", "#d9542b"];
  function burst(x, y) {
    if (reduced()) return;
    for (let i = 0; i < 22; i++) {
      const a = (i / 22) * Math.PI * 2 + Math.random() * 0.25, sp = 150 + Math.random() * 170;
      parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, r: 1.8 + Math.random() * 2.2, c: COLORS[i % COLORS.length], t: 0 });
    }
    if (!burstRaf) { lastT = performance.now(); burstRaf = requestAnimationFrame(tickBurst); }
  }
  function tickBurst(now) {
    const dt = Math.min(0.05, (now - lastT) / 1000); lastT = now;
    cx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter((p) => p.t < 0.85);
    for (const p of parts) {
      p.t += dt; p.vx *= 1 - 2.2 * dt; p.vy = p.vy * (1 - 2.2 * dt) + 420 * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      cx.globalAlpha = p.t < 0.4 ? 1 : Math.max(0, 1 - (p.t - 0.4) / 0.45);
      cx.fillStyle = p.c; cx.beginPath(); cx.arc(p.x, p.y, p.r, 0, Math.PI * 2); cx.fill();
    }
    cx.globalAlpha = 1;
    burstRaf = parts.length ? requestAnimationFrame(tickBurst) : 0;
    if (!parts.length) cx.clearRect(0, 0, innerWidth, innerHeight);
  }
  const badge = $("#cartCount");
  function bump() { badge.classList.remove("bump"); void badge.offsetWidth; badge.classList.add("bump"); }
  function flyTarget() {
    const bar = $("#cartBar");
    if (!bar.hidden && getComputedStyle(bar).display !== "none") return bar.getBoundingClientRect();
    return $("#cartBtn").getBoundingClientRect();
  }
  function fly(fromEl, src) {
    if (reduced() || !src || !fromEl || typeof document.body.animate !== "function") { bump(); return; }
    const a = fromEl.getBoundingClientRect(), b = flyTarget();
    const img = document.createElement("img");
    img.src = src; img.alt = ""; img.className = "bt-fly";
    document.body.appendChild(img);
    const s0 = Math.max(0.6, Math.min(a.width, a.height) / 64);
    const x0 = a.left + a.width / 2 - 32, y0 = a.top + a.height / 2 - 32, x1 = b.left + b.width / 2 - 32, y1 = b.top + b.height / 2 - 32;
    const qx = x0 + (x1 - x0) * 0.35, qy = Math.min(y0, y1) - 140;
    const frames = [];
    for (let i = 0; i <= 18; i++) {
      const t = i / 18, e = t * t * (3 - 2 * t), u = 1 - e;
      const x = u * u * x0 + 2 * u * e * qx + e * e * x1, y = u * u * y0 + 2 * u * e * qy + e * e * y1;
      frames.push({ transform: `translate(${x}px, ${y}px) scale(${s0 + (0.32 - s0) * e}) rotate(${e * 200}deg)`, opacity: i === 18 ? 0.6 : 1 });
    }
    const an = img.animate(frames, { duration: 700, easing: "linear" });
    an.onfinish = () => { img.remove(); bump(); };
  }
  function doneButton(btn, onBurst) {
    if (btn.classList.contains("is-done")) return false;
    const w = btn.offsetWidth, h = btn.offsetHeight;
    btn.style.width = w + "px"; void btn.offsetWidth;
    btn.classList.add("is-done"); btn.style.width = h + "px";
    btn.setAttribute("aria-busy", "true");
    setTimeout(() => { const r = btn.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2); if (onBurst) onBurst(); }, reduced() ? 0 : 580);
    setTimeout(() => {
      btn.classList.remove("is-done"); btn.style.width = w + "px"; btn.removeAttribute("aria-busy");
      setTimeout(() => { btn.style.width = ""; }, 360);
    }, reduced() ? 700 : 1300);
    return true;
  }

  /* ---------------- toast ---------------- */
  const toast = $("#toast"), toastBtn = $("#toastBtn");
  let toastT = 0, toastUndo = null;
  function say(msg, undo) {
    $("#toastTxt").textContent = msg; toastUndo = undo || null; toastBtn.hidden = !undo;
    toast.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => toast.classList.remove("on"), undo ? 4200 : 2600);
  }
  toastBtn.addEventListener("click", () => { if (toastUndo) toastUndo(); toastUndo = null; toast.classList.remove("on"); });

  /* ---------------- overlay: gestione apertura/chiusura ---------------- */
  const stack = [];
  const lockScroll = () => { document.documentElement.style.overflow = stack.length ? "hidden" : ""; updateBar(); };
  function openLayer(name, el, shade, opener, onClose) {
    stack.push({ name, el, shade, opener, onClose });
    shade.hidden = false; void shade.offsetWidth; shade.classList.add("on");
    el.classList.add("open"); el.setAttribute("aria-hidden", "false");
    lockScroll();
  }
  function closeLayer(name) {
    const i = stack.findIndex((l) => l.name === name); if (i < 0) return;
    const [l] = stack.splice(i, 1);
    l.el.classList.remove("open"); l.el.setAttribute("aria-hidden", "true");
    if (!stack.some((s) => s.shade === l.shade)) { l.shade.classList.remove("on"); setTimeout(() => { if (!l.shade.classList.contains("on")) l.shade.hidden = true; }, 300); }
    lockScroll();
    if (l.onClose) l.onClose();
    if (l.opener && document.contains(l.opener)) { try { l.opener.focus({ preventScroll: true }); } catch (e) { /* ok */ } }
  }
  const isOpen = (name) => stack.some((l) => l.name === name);
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && stack.length) closeLayer(stack[stack.length - 1].name); });

  /* drawer menu */
  const drawer = $("#navDrawer"), scrim = $("#scrim"), burger = $("#burger");
  burger.addEventListener("click", () => {
    if (isOpen("drawer")) { closeLayer("drawer"); return; }
    renderDrawerStore();
    openLayer("drawer", drawer, scrim, burger, () => burger.setAttribute("aria-expanded", "false"));
    burger.setAttribute("aria-expanded", "true");
    setTimeout(() => $(".bt-x", drawer).focus({ preventScroll: true }), 50);
  });
  drawer.addEventListener("click", (e) => { if (e.target.closest("[data-close-drawer]")) closeLayer("drawer"); });
  scrim.addEventListener("click", () => { if (isOpen("cart")) closeLayer("cart"); if (isOpen("drawer")) closeLayer("drawer"); });
  function renderDrawerStore() {
    const st = storeById(S.store), t = statusText(st);
    $("#drawerStore").innerHTML = `<span>La tua sede</span><b>${esc(st.name)}</b>${esc(t.t)}`;
  }

  /* ---------------- step sheet: Personalizza ---------------- */
  const sheet = $("#sheet"), shade = $("#sheetShade"), view = $("#shView"), panes = $$(".bt-pane", view);
  const shNext = $("#shNext"), shBack = $("#shBack");
  let C = null, priceShown = 0, priceRaf = 0;
  const qty = stepper($("#shQty"), { value: 1, min: 1, max: 20, span: 10, label: "quantità", onChange: (v) => { C.qty = v; refreshSheet(); } });

  $("#shSizes").innerHTML = SIZES.map((s) => `<button type="button" class="bt-size" role="radio" data-size="${s.id}" style="--d:${s.d}"><i></i><b>${s.name}</b><span>${s.cm} cm · ${s.add ? "+" + eur(s.add) : "incluso"}</span></button>`).join("");
  $("#shDough").innerHTML = DOUGHS.map((d) => `<button type="button" class="bt-opt" role="radio" data-dough="${d.id}">${d.name}${d.add ? ` <small>+${eur(d.add)}</small>` : ""}</button>`).join("");
  $("#shBases").innerHTML = BASES.map((b) => `<button type="button" class="bt-base" role="radio" data-base="${b.id}" style="--c:${b.c}"><i></i><b>${b.name}</b><span>${b.d}</span></button>`).join("");
  $("#shExtras").innerHTML = EXTRAS.map(([g, l]) => `<div class="bt-xg"><p>${g}</p><div>${l.map(([id, n, p]) => `<button type="button" class="bt-xt" data-x="${id}" aria-pressed="false">${n} <small>+${eur(p)}</small></button>`).join("")}</div></div>`).join("");

  function openSheet(id, opener) {
    const it = itemById(id); if (!it) return;
    C = Object.assign(defaultCfg(it), { it, qty: 1, step: 0 });
    $("#shImg").src = imgSrc(it) || "assets/margherita.webp";
    $("#shName").textContent = it.name;
    $("#shNote").value = "";
    qty.set(1);
    shNext.classList.remove("is-done"); shNext.style.width = "";
    panes.forEach((p, i) => { p.classList.toggle("cur", i === 0); p.classList.remove("past"); p.scrollTop = 0; });
    priceShown = 0;
    refreshSheet(true);
    view.style.transition = "none"; fitView(); void view.offsetHeight; view.style.transition = "";
    openLayer("sheet", sheet, shade, opener);
    setTimeout(() => $("#shClose").focus({ preventScroll: true }), 60);
  }
  function fitView() {
    const pane = panes[C ? C.step : 0];
    const chrome = $(".bt-sheet__head").offsetHeight + $(".bt-sheet__foot").offsetHeight + ($(".bt-sheet__grab").offsetHeight ? 13 : 0);
    const maxH = (window.innerHeight - (window.innerWidth <= 760 ? 24 : 32)) - chrome;
    view.style.height = Math.max(120, Math.min(pane.scrollHeight, maxH)) + "px";
  }
  function goStep(n) {
    if (!C) return;
    const prev = C.step; C.step = n;
    panes.forEach((p, i) => { p.classList.toggle("cur", i === n); p.classList.toggle("past", i < n); });
    if (prev !== n) panes[n].scrollTop = 0;
    refreshSheet(); fitView();
    const f = panes[n].querySelector("button,input"); if (f) setTimeout(() => f.focus({ preventScroll: true }), 30);
  }
  function refreshSheet(instant) {
    if (!C) return;
    const { it } = C;
    $$(".bt-size", sheet).forEach((b) => b.setAttribute("aria-checked", String(b.dataset.size === C.size)));
    $$(".bt-opt", sheet).forEach((b) => b.setAttribute("aria-checked", String(b.dataset.dough === C.dough)));
    $$(".bt-base", sheet).forEach((b) => {
      b.setAttribute("aria-checked", String(b.dataset.base === C.base));
      const bs = BASES.find((x) => x.id === b.dataset.base);
      $("span", b).textContent = bs.d + (b.dataset.base === it.base ? " · della ricetta" : bs.add ? ` · +${eur(bs.add)}` : "");
    });
    const full = C.extras.size >= MAX_EXTRAS;
    $$(".bt-xt", sheet).forEach((b) => { const on = C.extras.has(b.dataset.x); b.setAttribute("aria-pressed", String(on)); b.disabled = full && !on; });
    $("#shExtraN").textContent = `${C.extras.size} di ${MAX_EXTRAS}`;
    $("#shStep").textContent = `Passo ${C.step + 1} di 3 · ${["Misura e impasto", "Base", "Aggiunte"][C.step]}`;
    $$(".bt-sheet__dots i", sheet).forEach((d, i) => d.classList.toggle("on", i === C.step));
    shBack.classList.toggle("hide", C.step === 0);
    shBack.tabIndex = C.step === 0 ? -1 : 0;
    $(".bt-done__t", shNext).textContent = C.step < 2 ? "Avanti" : "Aggiungi";
    const c = cfgOf(it, C);
    $("#shSum").textContent = `${C.qty} × ${it.name} · ${c.opts}`;
    tickPrice(c.unit * C.qty, instant);
  }
  function tickPrice(target, instant) {
    cancelAnimationFrame(priceRaf);
    const el = $("#shPrice");
    if (instant || reduced()) { priceShown = target; el.textContent = eur(target); return; }
    const from = priceShown, t0 = performance.now();
    const step = (now) => {
      const k = Math.min(1, (now - t0) / 260), e = 1 - Math.pow(1 - k, 3);
      priceShown = from + (target - from) * e; el.textContent = eur(priceShown);
      if (k < 1) priceRaf = requestAnimationFrame(step); else priceShown = target;
    };
    priceRaf = requestAnimationFrame(step);
  }
  sheet.addEventListener("click", (e) => {
    if (!C) return;
    const s = e.target.closest("[data-size]"), d = e.target.closest("[data-dough]"), b = e.target.closest("[data-base]"), x = e.target.closest("[data-x]");
    if (s) { C.size = s.dataset.size; refreshSheet(); }
    else if (d) { C.dough = d.dataset.dough; refreshSheet(); }
    else if (b) { C.base = b.dataset.base; refreshSheet(); }
    else if (x && !x.disabled) {
      if (C.extras.has(x.dataset.x)) C.extras.delete(x.dataset.x); else if (C.extras.size < MAX_EXTRAS) C.extras.add(x.dataset.x);
      refreshSheet(); fitView();
    }
  });
  $("#shNote").addEventListener("input", (e) => { C.note = e.target.value.trim().slice(0, 80); refreshSheet(); });
  shBack.addEventListener("click", () => { if (C && C.step > 0) goStep(C.step - 1); });
  shNext.addEventListener("click", () => {
    if (!C) return;
    if (C.step < 2) { goStep(C.step + 1); return; }
    const snap = Object.assign({}, C, { extras: new Set(C.extras) });
    const started = doneButton(shNext, () => {
      addLine(snap.it, snap, snap.qty);
      const imgEl = $("#shImg");
      fly(imgEl, imgEl.src);
      closeLayer("sheet");
      say(`Aggiunta: ${snap.qty} × ${snap.it.name}`);
    });
    if (!started) return;
  });
  $("#shClose").addEventListener("click", () => closeLayer("sheet"));
  shade.addEventListener("click", () => closeLayer("sheet"));

  /* click su menù / hero */
  document.addEventListener("click", (e) => {
    const cb = e.target.closest("[data-customize]");
    if (cb) { openSheet(cb.dataset.customize, cb); return; }
    const ab = e.target.closest("[data-add]");
    if (ab) {
      const it = itemById(ab.dataset.add);
      const card = ab.closest(".bt-it");
      const imgEl = card && $(".bt-it__img img", card);
      if (!doneButton(ab)) return;
      addLine(it, null, 1);
      if (imgEl) fly(imgEl, imgEl.currentSrc || imgEl.src); else bump();
      say(`Aggiunto: ${it.name}${it.custom ? " (piccola)" : ""}`);
    }
  });

  /* ---------------- carrello ---------------- */
  const cart = $("#cart"), cartBtn = $("#cartBtn"), cartBar = $("#cartBar");
  let cartView = 0;
  const selStore = $("#cartStore");
  function fillStoreSelect() {
    const now = romeNow();
    selStore.innerHTML = STORES.map((s) => `<option value="${s.id}"${s.id === S.store ? " selected" : ""}>${esc(s.name)} — ${status(s, now).open ? "aperto ora" : "chiuso ora"}</option>`).join("");
  }
  function openCart(opener) {
    if (isOpen("drawer")) closeLayer("drawer");
    showView(0, true); renderCart();
    openLayer("cart", cart, scrim, opener || cartBtn);
    setTimeout(() => $("#cartClose").focus({ preventScroll: true }), 60);
  }
  cartBtn.addEventListener("click", () => openCart(cartBtn));
  cartBar.addEventListener("click", () => openCart(cartBar));
  $("#cartClose").addEventListener("click", () => closeLayer("cart"));
  $("#cartBrowse").addEventListener("click", () => { closeLayer("cart"); document.getElementById("menu").scrollIntoView({ behavior: reduced() ? "auto" : "smooth" }); });

  const seg = $("#modeSeg");
  seg.addEventListener("click", (e) => { const b = e.target.closest("[data-mode]"); if (b) setMode(b.dataset.mode); });
  seg.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft" || e.key === "ArrowRight") { setMode(S.mode === "ritiro" ? "consegna" : "ritiro"); $(`[data-mode="${S.mode}"]`, seg).focus(); } });
  function setMode(m) { if (S.mode === m) return; S.mode = m; S.slot = null; persist(); renderCart(); }
  selStore.addEventListener("change", () => { setStore(selStore.value, false); });
  function setStore(id, announce) {
    S.store = id; S.slot = null; persist();
    renderStores(); renderHeroStatus(); renderCart(); checkCap();
    if (announce) say(`Ordini da ${storeById(id).name}`);
  }
  const addr = $("#addr"), cap = $("#cap"), capHint = $("#capHint");
  function checkCap() {
    const v = cap.value.trim(), st = storeById(S.store);
    capHint.classList.remove("ok", "bad"); cap.removeAttribute("aria-invalid");
    if (!v) { capHint.textContent = `${st.name} consegna nei CAP ${st.caps.join(", ")}.`; return false; }
    if (!/^\d{5}$/.test(v)) { if (v.length >= 5) { capHint.textContent = "Il CAP ha 5 cifre."; capHint.classList.add("bad"); } else capHint.textContent = "Il CAP ha 5 cifre."; return false; }
    if (st.caps.includes(v)) { capHint.textContent = `✓ ${v} è nella zona di ${st.name}.`; capHint.classList.add("ok"); return true; }
    const other = STORES.find((s) => s.caps.includes(v));
    capHint.textContent = other ? `${v} è servito da ${other.name}: cambia sede qui sopra.` : `Non consegniamo ancora al ${v}. Puoi scegliere il ritiro.`;
    capHint.classList.add("bad"); cap.setAttribute("aria-invalid", "true");
    return false;
  }
  cap.addEventListener("input", () => { cap.value = cap.value.replace(/\D/g, "").slice(0, 5); checkCap(); });
  addr.addEventListener("input", () => addr.removeAttribute("aria-invalid"));

  const linesEl = $("#cartLines");
  function renderLines() {
    linesEl.innerHTML = S.lines.map((l) => `<li class="bt-line" data-key="${esc(l.key)}">${l.img ? `<img src="assets/${l.img}.webp" alt="">` : `<span class="bt-line__ph">${esc(l.name[0])}</span>`}<div class="bt-line__info"><b>${esc(l.name)}</b><small>${esc(l.opts || "")}</small><small>${eur(l.unit)} cad.</small></div><span class="bt-line__p">${eur(l.unit * l.qty)}</span><div class="bt-ds-host"></div></li>`).join("");
    $$(".bt-line", linesEl).forEach((li) => {
      const l = S.lines.find((x) => x.key === li.dataset.key);
      const host = $(".bt-ds-host", li);
      host.style.gridColumn = "3"; host.style.justifySelf = "end";
      const d = document.createElement("div"); host.appendChild(d);
      stepper(d, { value: l.qty, min: 0, max: 30, span: 10, small: true, label: l.name, onChange: (v) => {
        if (v === 0) { removeLine(l, li); return; }
        l.qty = v; persist();
        $(".bt-line__p", li).textContent = eur(l.unit * l.qty);
        renderCart();
      } });
    });
  }
  function removeLine(l, li) {
    const idx = S.lines.indexOf(l), old = Object.assign({}, l, { qty: 1 });
    li.classList.add("bye");
    setTimeout(() => {
      S.lines = S.lines.filter((x) => x !== l); persist(); renderCart(true);
      say(`Rimosso: ${l.name}`, () => { S.lines.splice(Math.min(idx, S.lines.length), 0, old); persist(); renderCart(true); });
    }, reduced() ? 0 : 200);
  }
  function renderCart(rebuild) {
    const n = count(), sub = subtotal(), del = delivery(), tot = sub + del;
    badge.textContent = n; badge.classList.toggle("on", n > 0);
    cartBtn.setAttribute("aria-label", `Apri il carrello, ${n} articoli`);
    $("#cartBarN").textContent = n; $("#cartBarT").textContent = eur(tot);
    updateBar();
    if (rebuild || linesEl.children.length !== S.lines.length) renderLines();
    $("#cartEmpty").hidden = n > 0;
    $("#cartTotals").hidden = n === 0;
    $$("[data-mode]", seg).forEach((b) => b.setAttribute("aria-checked", String(b.dataset.mode === S.mode)));
    seg.classList.toggle("r", S.mode === "consegna");
    fillStoreSelect();
    const st = storeById(S.store), t = statusText(st);
    const stEl = $("#cartStoreSt"); stEl.className = "bt-cart__st " + t.cls; stEl.innerHTML = `<i></i>${esc(t.t)}`;
    $("#cartAddrBox").hidden = S.mode !== "consegna";
    $("#tSub").textContent = eur(sub);
    $("#tDelRow").hidden = S.mode !== "consegna";
    $("#tDel").textContent = del === 0 ? "Gratis" : eur(del);
    $("#tTot").textContent = eur(tot);
    const fb = $("#freeBox"); fb.hidden = S.mode !== "consegna";
    $("#freeTxt").textContent = sub >= FREE_AT ? "✓ Consegna gratuita" : `Ancora ${eur(FREE_AT - sub)} per la consegna gratuita`;
    $("#freeBar").style.width = Math.min(100, (sub / FREE_AT) * 100) + "%";
    const pts = points();
    $("#ptsRing").style.strokeDashoffset = String(113.1 * (1 - Math.min(1, pts.n / 100)));
    $("#ptsTxt").innerHTML = `Con questo ordine <b>+${pts.n} punti</b>${pts.double ? " (martedì: punti doppi)" : ""}<br>${pts.n >= 100 ? "Abbastanza per 5 € di sconto sul prossimo ordine." : `Ne mancano ${100 - pts.n} per 5 € di sconto.`}`;
    const mw = $("#minWarn");
    const under = S.mode === "consegna" && sub < MIN_DEL;
    mw.hidden = !under || n === 0; if (under) mw.textContent = `Ordine minimo per la consegna ${eur(MIN_DEL)}: mancano ${eur(MIN_DEL - sub)}. Oppure scegli il ritiro.`;
    $("#payCash").textContent = S.mode === "consegna" ? "Contanti alla consegna" : "Contanti al ritiro";
    $("#payCard").textContent = S.mode === "consegna" ? "Carta alla consegna (POS)" : "Carta al ritiro (POS)";
    renderCta();
    if (cartView === 1) renderSlots();
  }
  function points() {
    const now = romeNow();
    const dow = S.slotDow != null && S.slot != null ? S.slotDow : now.dow;
    const double = dow === 2;
    return { n: Math.floor(subtotal()) * (double ? 2 : 1), double };
  }
  const cta = $("#cartCta");
  function renderCta() {
    const n = count();
    if (cartView === 0) { cta.textContent = "Scegli l'orario"; cta.disabled = n === 0 || (S.mode === "consegna" && subtotal() < MIN_DEL); }
    else if (cartView === 1) { cta.textContent = `Conferma ordine · ${eur(subtotal() + delivery())}`; cta.disabled = n === 0; }
    else { cta.textContent = "Torna al menù"; cta.disabled = false; }
  }
  function updateBar() {
    const show = count() > 0 && !stack.length;
    cartBar.hidden = !show;
    document.body.classList.toggle("has-bar", show);
  }
  function showView(n, instant) {
    cartView = n;
    $$(".bt-cv", cart).forEach((v) => {
      const i = +v.dataset.v;
      if (instant) { v.style.transition = "none"; }
      v.classList.toggle("cur", i === n); v.classList.toggle("past", i < n);
      if (instant) { void v.offsetWidth; v.style.transition = ""; }
    });
    $("#cartBack").hidden = n !== 1;
    $("#cartTitle").textContent = ["Il tuo ordine", "Orario e dati", "Grazie!"][n];
    renderCta();
    const cur = $(`.bt-cv[data-v="${n}"]`, cart); cur.scrollTop = 0;
  }
  $("#cartBack").addEventListener("click", () => showView(0));

  function renderSlots() {
    const st = storeById(S.store), now = romeNow(), r = slotsFor(st, S.mode, now);
    const dayLbl = r.d === 0 ? "oggi" : r.d === 1 ? "domani" : DAYS[r.dow];
    $("#slotDay").textContent = r.times.length ? `· ${dayLbl}${r.d > 0 ? " (oggi è chiuso o troppo tardi)" : ""}` : "";
    if (S.slot != null && !r.times.includes(S.slot)) S.slot = null;
    S.slotDow = r.dow;
    $("#slots").innerHTML = r.times.length ? r.times.map((t) => `<button type="button" class="bt-slot" role="radio" data-t="${t}" aria-checked="${S.slot === t}">${hm(t)}</button>`).join("") : `<p class="bt-hint">Nessun orario disponibile.</p>`;
    S.slotDay = dayLbl;
    const coA = $("#coAddr");
    coA.innerHTML = S.mode === "consegna" ? `<p class="bt-recap">Consegna a: <b>${esc(addr.value.trim())}, ${esc(cap.value.trim())}</b></p>` : `<p class="bt-recap">Ritiro al banco di <b>${esc(st.name)}</b>, ${esc(st.addr)}.</p>`;
    $("#coRecap").textContent = `${count()} articoli · ${S.mode === "consegna" ? "consegna" : "ritiro"} · totale ${eur(subtotal() + delivery())}`;
  }
  $("#slots").addEventListener("click", (e) => {
    const b = e.target.closest("[data-t]"); if (!b) return;
    S.slot = +b.dataset.t;
    $$(".bt-slot", cart).forEach((x) => x.setAttribute("aria-checked", String(x === b)));
    $("#errSlot").textContent = "";
    renderCart();
  });
  const cName = $("#cName"), cTel = $("#cTel");
  [cName, cTel].forEach((i) => i.addEventListener("input", () => { i.removeAttribute("aria-invalid"); $(i === cName ? "#errName" : "#errTel").textContent = ""; }));
  function validCheckout() {
    let first = null;
    const err = (el, box, msg) => { $(box).textContent = msg; if (el) el.setAttribute("aria-invalid", "true"); if (!first) first = el || $("#slots button"); };
    $("#errSlot").textContent = ""; $("#errName").textContent = ""; $("#errTel").textContent = "";
    if (S.slot == null) err(null, "#errSlot", "Scegli un orario.");
    if (!/\p{L}.*\p{L}/u.test(cName.value.trim())) err(cName, "#errName", "Scrivi il nome per il ritiro.");
    const tel = cTel.value.replace(/[\s.\-/]/g, "").replace(/^(\+|00)39/, "");
    if (!/^[03]\d{8,10}$/.test(tel)) err(cTel, "#errTel", "Numero non valido: es. 333 123 4567.");
    if (first) { try { first.focus(); } catch (e) { /* ok */ } return false; }
    return true;
  }
  cta.addEventListener("click", () => {
    if (cartView === 0) {
      if (S.mode === "consegna") {
        let bad = false;
        if (addr.value.trim().length < 5) { addr.setAttribute("aria-invalid", "true"); bad = true; addr.focus(); }
        if (!checkCap()) { if (!cap.value) { capHint.textContent = "Inserisci il CAP per la consegna."; } capHint.classList.add("bad"); cap.setAttribute("aria-invalid", "true"); if (!bad) cap.focus(); bad = true; }
        if (bad) { say("Completa l'indirizzo di consegna"); return; }
      }
      showView(1); renderSlots(); return;
    }
    if (cartView === 1) {
      if (!validCheckout()) return;
      const st = storeById(S.store), pts = points(), tot = subtotal() + delivery();
      const no = "B-" + String(1000 + Math.floor(Math.random() * 9000));
      const r = cta.getBoundingClientRect(); burst(r.left + r.width / 2, r.top + r.height / 2);
      $("#okTitle").textContent = S.mode === "consegna" ? "Ordine confermato, arriva caldo" : "Ordine confermato, ti aspettiamo";
      $("#okNo").textContent = `Ordine ${no}`;
      const pay = ($('input[name="pay"]:checked', cart) || {}).value === "carta" ? "Carta (POS)" : "Contanti";
      $("#okDl").innerHTML = [["Sede", st.name], [S.mode === "consegna" ? "Consegna" : "Ritiro", `${S.slotDay} alle ${hm(S.slot)}`], ...(S.mode === "consegna" ? [["Indirizzo", `${addr.value.trim()}, ${cap.value}`]] : []), ["Nome", cName.value.trim()], ["Pagamento", pay], ["Totale", eur(tot)]].map(([a, b]) => `<div><dt>${esc(a)}</dt><dd>${esc(b)}</dd></div>`).join("");
      $("#okPts").innerHTML = `Hai guadagnato <b>${pts.n} punti</b> Bertacchi${pts.double ? " (martedì ×2)" : ""}.`;
      S.lines = []; S.slot = null; persist();
      renderCart(true); showView(2);
      return;
    }
    closeLayer("cart");
    document.getElementById("menu").scrollIntoView({ behavior: reduced() ? "auto" : "smooth" });
  });

  /* ---------------- sedi: elenco, ricerca, mappa ---------------- */
  const listEl = $("#storeList");
  function hoursTable(st, now) {
    return [1, 2, 3, 4, 5, 6, 0].map((d) => `<tr${d === now.dow ? ' class="today"' : ""}><td>${DAYS[d][0].toUpperCase() + DAYS[d].slice(1)}</td><td>${(st.hours[d] || []).length ? st.hours[d].map(([a, b]) => hm(a) + "–" + hm(b)).join(", ") : "Chiuso"}</td></tr>`).join("");
  }
  function renderStores() {
    const now = romeNow(), q = $("#storeSearch").value.trim().toLowerCase();
    const list = STORES.filter((s) => !q || [s.name, s.addr, s.city, ...s.caps].join(" ").toLowerCase().includes(q));
    $("#storeCount").textContent = list.length ? `${list.length} ${list.length === 1 ? "sede" : "sedi"}` : `Nessuna sede per «${q}». Prova Modena, Carpi o un CAP 411xx.`;
    listEl.innerHTML = list.map((s) => {
      const t = statusText(s, now);
      const todayW = (s.hours[now.dow] || []).map(([a, b]) => hm(a) + "–" + hm(b)).join(", ") || "Chiuso";
      return `<li class="bt-store${s.id === S.store ? " sel" : ""}" data-store="${s.id}"><span class="bt-store__st ${t.cls}"><i></i>${esc(t.t)}</span><h3>${esc(s.name)}</h3><p class="bt-store__a">${esc(s.addr)}, ${esc(s.city)} · ${esc(s.tel)}</p><details><summary>Oggi ${esc(todayW)}</summary><table>${hoursTable(s, now)}</table></details><div class="bt-store__btns"><button class="bt-btn bt-btn--solid" type="button" data-order-from="${s.id}">${s.id === S.store ? "Ordina da qui ✓" : "Ordina da qui"}</button><button class="bt-btn bt-btn--outline" type="button" data-pin="${s.id}">Sulla mappa</button></div></li>`;
    }).join("");
    renderPins(list);
  }
  function renderPins(list) {
    const now = romeNow();
    $("#mapPins").innerHTML = STORES.map((s) => {
      const vis = list.includes(s), open = status(s, now).open;
      return `<g class="bt-pin${s.id === S.store ? " sel" : ""}${open ? "" : " closed"}" data-store="${s.id}" transform="translate(${s.xy[0]} ${s.xy[1]})" opacity="${vis ? 1 : 0.25}"><circle class="halo" r="30" cy="-20"/><path d="M0 0C-9-11-15-17-15-25a15 15 0 1 1 30 0C15-17 9-11 0 0Z"/><circle r="5" cy="-25" fill="#fff"/><text x="20" y="-20">${esc(s.name)}</text></g>`;
    }).join("");
  }
  $("#storeSearch").addEventListener("input", renderStores);
  listEl.addEventListener("click", (e) => {
    const o = e.target.closest("[data-order-from]");
    if (o) { setStore(o.dataset.orderFrom, true); document.getElementById("menu").scrollIntoView({ behavior: reduced() ? "auto" : "smooth" }); return; }
    const p = e.target.closest("[data-pin]");
    if (p) {
      const g = $(`#mapPins [data-store="${p.dataset.pin}"]`);
      $$("#mapPins .bt-pin").forEach((x) => x.classList.toggle("sel", x === g));
      const map = $(".bt-map"); if (map.getBoundingClientRect().bottom < 80 || map.getBoundingClientRect().top > innerHeight) map.scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "center" });
    }
  });
  $("#mapPins").addEventListener("click", (e) => { const g = e.target.closest("[data-store]"); if (g) setStore(g.dataset.store, true); });

  function renderHeroStatus() {
    const st = storeById(S.store), t = statusText(st);
    const el = $("#heroStatus"); el.className = "bt-status " + t.cls;
    $("span", el).textContent = `${st.name}: ${t.t}`;
  }
  $("#heroStatus").addEventListener("click", () => document.getElementById("sedi").scrollIntoView({ behavior: reduced() ? "auto" : "smooth" }));

  /* ---------------- premi: iscrizione ---------------- */
  $("#joinForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const i = $("#joinMail"), m = $("#joinMsg"), v = i.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { i.setAttribute("aria-invalid", "true"); m.className = "bt-join__msg err"; m.textContent = "Controlla l'indirizzo email."; i.focus(); return; }
    i.removeAttribute("aria-invalid"); m.className = "bt-join__msg"; m.textContent = `Benvenuto! Ti abbiamo regalato 10 punti: li trovi al primo ordine (${v}).`;
    i.value = "";
  });

  /* ---------------- storia: schede che si agganciano, poi la linea ---------------- */
  const TL = [
    { y: 1931, t: "Un forno in Via Emilia", d: "Nonno Ettore prende in affitto una bottega con il forno a legna: pane al mattino, pizza la sera per chi esce dalla fabbrica.", img: "hero-forno" },
    { y: 1946, t: "La volta rifatta a mano", d: "Dopo la guerra la volta del forno è crepata. Ettore e Adele la rifanno mattone per mattone, con lo stesso refrattario.", img: "fiamma" },
    { y: 1958, t: "La pala di faggio", d: "Arriva la pala lunga che usiamo ancora. Sul manico ci sono le tacche di tre generazioni di pizzaioli.", img: "pala" },
    { y: 1974, t: "L'impasto di 48 ore", d: "Il figlio Franco allunga la lievitazione a due giorni. La pizza diventa più leggera e la fila arriva sul marciapiede.", img: "impasto" },
    { y: 1996, t: "Apre Carpi", d: "La nipote Lidia porta il forno in Corso Alberto Pio, in una vecchia merceria con il soffitto a cassettoni.", img: "" },
    { y: 2012, t: "Le prime consegne", d: "Nasce la sede della Sacca con tre motorini: la pizza arriva a casa in venti minuti, ancora fumante.", img: "" },
    { y: 2026, t: "Si ordina anche da qui", d: "Stessa pala, stesso forno, stessa famiglia. Adesso scegli dal telefono e la ritiri calda al banco.", img: "bianca" },
  ];
  const sc = $("#tlScroller"), dotsEl = $("#tlDots"), fill = $("#tlFill");
  sc.innerHTML = TL.map((e, i) => `<article class="bt-tc" data-i="${i}">${e.img ? `<div class="bt-tc__img"><img src="assets/${e.img}.webp" alt="" loading="lazy" draggable="false"></div>` : `<div class="bt-tc__img bt-tc__img--type" aria-hidden="true">${String(e.y).slice(2)}</div>`}<p class="bt-tc__y">${e.y}</p><h3>${esc(e.t)}</h3><p>${esc(e.d)}</p></article>`).join("");
  dotsEl.innerHTML = TL.map((e, i) => `<span class="bt-tl__dot" style="left:${(i / (TL.length - 1)) * 100}%"><i></i><span>${e.y}</span></span>`).join("");
  const tcs = $$(".bt-tc", sc), dots = $$(".bt-tl__dot", dotsEl);
  let tlIdx = -1, tlRaf = 0, settleT = 0, drawT = 0, dragging = null;
  const nearest = () => {
    const mid = sc.scrollLeft + sc.clientWidth / 2;
    let best = 0, bd = Infinity;
    tcs.forEach((c, i) => { const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = i; } });
    return best;
  };
  function tlFrame() {
    tlRaf = 0;
    const mid = sc.scrollLeft + sc.clientWidth / 2;
    const pitch = tcs.length > 1 ? tcs[1].offsetLeft - tcs[0].offsetLeft : 360;
    tcs.forEach((c) => { const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); c.style.setProperty("--k", (clamp(1 - d / pitch, 0, 1)).toFixed(3)); });
  }
  function drawLine(i) {
    tlIdx = i;
    const W = dotsEl.clientWidth;
    fill.style.left = "24px";
    fill.style.width = (i / (TL.length - 1)) * W + "px";
    dots.forEach((d, j) => { d.classList.toggle("on", j <= i); d.classList.toggle("cur", j === i); });
    $("#tlCount").textContent = String(i + 1).padStart(2, "0") + " / " + String(TL.length).padStart(2, "0");
    $("#tlPrev").disabled = i === 0; $("#tlNext").disabled = i === TL.length - 1;
  }
  function settle() {
    if (dragging) return;
    const i = nearest();
    clearTimeout(drawT);
    drawT = setTimeout(() => drawLine(i), reduced() ? 0 : 120);
  }
  sc.addEventListener("scroll", () => {
    if (!tlRaf) tlRaf = requestAnimationFrame(tlFrame);
    clearTimeout(settleT); settleT = setTimeout(settle, 140);
  }, { passive: true });
  function goCard(i) {
    i = clamp(i, 0, TL.length - 1);
    const c = tcs[i];
    sc.scrollTo({ left: c.offsetLeft + c.offsetWidth / 2 - sc.clientWidth / 2, behavior: reduced() ? "auto" : "smooth" });
    if (reduced()) { tlFrame(); settle(); }
  }
  $("#tlPrev").addEventListener("click", () => goCard(nearest() - 1));
  $("#tlNext").addEventListener("click", () => goCard(nearest() + 1));
  sc.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") { e.preventDefault(); goCard(nearest() + 1); } if (e.key === "ArrowLeft") { e.preventDefault(); goCard(nearest() - 1); } });
  sc.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    dragging = { x: e.clientX, sl: sc.scrollLeft, start: nearest(), t: performance.now(), lastX: e.clientX, v: 0, moved: false };
    sc.classList.add("drag");
    try { sc.setPointerCapture(e.pointerId); } catch (er) { /* ok */ }
  });
  sc.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const now = performance.now(), dt = Math.max(1, now - dragging.t);
    dragging.v = (e.clientX - dragging.lastX) / dt; dragging.lastX = e.clientX; dragging.t = now;
    if (Math.abs(e.clientX - dragging.x) > 3) dragging.moved = true;
    let sl = dragging.sl - (e.clientX - dragging.x);
    const max = sc.scrollWidth - sc.clientWidth;
    if (sl < 0) sl = sl / 3; else if (sl > max) sl = max + (sl - max) / 3;
    sc.scrollLeft = sl;
  });
  const dragEnd = () => {
    if (!dragging) return;
    const d = dragging; dragging = null;
    const proj = sc.scrollLeft - d.v * 250;
    const mid = proj + sc.clientWidth / 2;
    let best = 0, bd = Infinity;
    tcs.forEach((c, i) => { const dd = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid); if (dd < bd) { bd = dd; best = i; } });
    best = clamp(best, d.start - 1, d.start + 1);
    goCard(best);
    setTimeout(() => sc.classList.remove("drag"), reduced() ? 0 : 480);
  };
  sc.addEventListener("pointerup", dragEnd);
  sc.addEventListener("pointercancel", dragEnd);

  /* ---------------- avvio ---------------- */
  function layout() {
    sizeCanvas();
    const on = $('button[aria-pressed="true"]', chips); if (on) placePill(on, false);
    if (tlIdx >= 0) drawLine(tlIdx);
    tlFrame();
    if (isOpen("sheet")) fitView();
  }
  window.addEventListener("resize", () => { clearTimeout(layout.t); layout.t = setTimeout(layout, 80); });
  if (!STORES.some((s) => s.id === S.store)) S.store = "centro";
  renderHeroStatus(); renderStores(); renderCart(true); checkCap();
  placePill($('button[aria-pressed="true"]', chips), false);
  applyFilter("all", false);
  tlFrame(); drawLine(0);
  spy();
  setInterval(() => { renderHeroStatus(); renderStores(); if (isOpen("cart")) renderCart(); }, 30000);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout).catch(() => {});

  /* gancio per i test */
  window.__bt = { S, status: (id) => status(storeById(id)), slots: (id, m) => slotsFor(storeById(id), m), subtotal, delivery, points, tl: () => tlIdx, filter: () => filter };
})();
