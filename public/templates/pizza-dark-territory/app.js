/* Volta Antica — pizzeria con camere · template script
   Runs inside a sandboxed iframe (no same-origin): never touches storage/cookies,
   no alert/confirm, forms handled in JS. */
(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (t) => t * t * (3 - 2 * t);
  const easeOut = (t) => 1 - Math.pow(1 - t, 3);
  const mq = (q) => window.matchMedia(q);
  const reduceMQ = mq("(prefers-reduced-motion: reduce)");
  const mobileMQ = mq("(max-width: 1023px)");
  let reduce = reduceMQ.matches;
  const euro = (n) => n.toLocaleString("it-IT", { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  /* ---------------------------------------------------------------
     Toast
  --------------------------------------------------------------- */
  const toastEl = $(".toast");
  let toastT = 0;
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add("on");
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("on"), 2600);
  }

  /* ---------------------------------------------------------------
     Rome clock (Europe/Rome), with ?now=YYYY-MM-DDTHH:MM override for testing
  --------------------------------------------------------------- */
  const DAYS = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  const DAYS_S = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];
  const MONTHS = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
  let nowOverride = null;
  try {
    const q = new URLSearchParams(location.search).get("now");
    if (q && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(q)) nowOverride = q;
  } catch (e) { /* ignore */ }

  function romeNow() {
    if (nowOverride) {
      const [d, t] = nowOverride.split("T");
      const [y, mo, da] = d.split("-").map(Number);
      const [h, mi] = t.split(":").map(Number);
      const dow = new Date(Date.UTC(y, mo - 1, da)).getUTCDay();
      return { y, mo, d: da, h, mi, dow };
    }
    const parts = {};
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", hourCycle: "h23", weekday: "short",
    }).formatToParts(new Date()).forEach((p) => { parts[p.type] = p.value; });
    const y = +parts.year, mo = +parts.month, d = +parts.day;
    const dow = new Date(Date.UTC(y, mo - 1, d)).getUTCDay();
    return { y, mo, d, h: +parts.hour % 24, mi: +parts.minute, dow };
  }
  // a calendar day as a UTC date (no timezone drift when iterating)
  const dayUTC = (n) => new Date(Date.UTC(n.y, n.mo - 1, n.d));
  const addDays = (dt, k) => new Date(dt.getTime() + k * 864e5);
  const iso = (dt) => dt.toISOString().slice(0, 10);
  const fromIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
  const fmtLong = (dt) => `${DAYS[dt.getUTCDay()]} ${dt.getUTCDate()} ${MONTHS[dt.getUTCMonth()]}`;

  // Service: Tue–Sun 18:30 → 00:30 (closed Monday). After midnight belongs to the previous evening.
  const OPEN_M = 18 * 60 + 30, CLOSE_M = 30;
  function openState(n = romeNow()) {
    const m = n.h * 60 + n.mi;
    const eveningOpen = n.dow !== 1 && m >= OPEN_M;
    const lateOpen = m < CLOSE_M && n.dow !== 2; // yesterday wasn't Monday
    if (eveningOpen || lateOpen) {
      const left = eveningOpen ? 24 * 60 + CLOSE_M - m : CLOSE_M - m;
      return { open: true, text: left <= 30 ? `Aperto · chiude tra ${left} min` : "Aperto ora · fino alle 00:30" };
    }
    if (n.dow !== 1 && m < OPEN_M) return { open: false, text: "Chiuso · apre oggi alle 18:30" };
    for (let i = 1; i <= 7; i++) {
      const nd = (n.dow + i) % 7;
      if (nd !== 1) return { open: false, text: `Chiuso · apre ${i === 1 ? "domani" : DAYS[nd]} alle 18:30` };
    }
    return { open: false, text: "Chiuso" };
  }
  function paintStatus() {
    const s = openState();
    $$("[data-status]").forEach((el) => {
      el.dataset.open = s.open ? "1" : "0";
      const t = $(".status-txt", el);
      if (t) t.textContent = el.classList.contains("top-status") ? (s.open ? "Aperto ora" : "Chiuso") : s.text;
    });
  }
  paintStatus();
  setInterval(paintStatus, 30000);

  /* ---------------------------------------------------------------
     Character splitting (staggered reveal)
  --------------------------------------------------------------- */
  function splitChars(el, start = 0) {
    const text = el.textContent;
    el.textContent = "";
    let i = start;
    for (const ch of text) {
      const s = document.createElement("span");
      s.className = "ch";
      s.style.setProperty("--i", i++);
      s.textContent = ch;
      s.setAttribute("aria-hidden", "true");
      el.appendChild(s);
    }
    return i;
  }
  $$(".hs-word").forEach((w) => { let n = 0; $$("[data-split]", w).forEach((p) => { n = splitChars(p, 0); }); });
  const offWord = $(".off-word");
  if (offWord) {
    const wrap = document.createElement("span");
    wrap.className = "w";
    wrap.textContent = offWord.textContent;
    offWord.textContent = "";
    offWord.appendChild(wrap);
    splitChars(wrap);
  }

  /* ---------------------------------------------------------------
     DATA
  --------------------------------------------------------------- */
  const MENU = [
    { id: "inizio", name: "Per iniziare", items: [
      { n: "Fritto della Volta", d: "Frittatina di bucatini, crocchè di patate, montanarina al pomodoro: il fritto di casa per due.", p: 11, t: ["v"] },
      { n: "Montanarine al piennolo", d: "Pizzette fritte, pomodorino del piennolo scottato, basilico, grattugiata di caciocavallo.", p: 7, t: ["v"] },
      { n: "Crocchè e provola", d: "Patate schiacciate a mano, cuore di provola affumicata, prezzemolo.", p: 6, t: ["v"] },
      { n: "Tagliere dei colli", d: "Salumi di maiale nero casertano, conciato romano, papacelle sott'aceto, pane del forno.", p: 16, t: [] },
      { n: "Insalata d'inverno", d: "Finocchi, arance, olive nere, cipolla di Alife marinata, olio nuovo.", p: 8, t: ["v", "vg", "sl", "sg"] },
    ]},
    { id: "pizze", name: "Pizze", items: [
      { n: "Margherita della Volta", d: "Pomodoro San Marzano DOP, fior di latte di Agerola, basilico, olio extravergine.", p: 8, t: ["v", "sg"] },
      { n: "Marinara del borgo", d: "Pomodoro, aglio rosso, origano di montagna, capperi, olio a crudo.", p: 7, t: ["v", "vg", "sl", "sg"] },
      { n: "Bufala e piennolo", d: "Mozzarella di bufala campana DOP in uscita, pomodorino del piennolo, basilico.", p: 11, t: ["v", "sg"] },
      { n: "Bianca alle noci", d: "Fior di latte, crema di ricotta di bufala, noci tostate, scorza di limone, miele di castagno.", p: 12, t: ["v"] },
      { n: "Funghi e conciato", d: "Funghi cardoncelli saltati, fior di latte, scaglie di conciato romano, timo.", p: 13, t: ["v", "sg"] },
      { n: "Crudo e fichi", d: "Provola, prosciutto crudo stagionato 20 mesi, fichi secchi, rucola selvatica.", p: 14, t: [] },
      { n: "Salsiccia e friarielli", d: "Salsiccia di maiale nero casertano, friarielli ripassati, provola affumicata.", p: 12, t: ["sg"] },
      { n: "Ortolana d'inverno", d: "Zucca arrosto, cavolo nero, ceci croccanti, olio al rosmarino. Senza formaggio.", p: 11, t: ["v", "vg", "sl", "sg"] },
      { n: "Papacelle e alici", d: "Pomodoro giallo, papacelle, alici di Cetara, olive, origano. Senza formaggio.", p: 12, t: ["sl", "sg"] },
      { n: "Calzone al forno", d: "Ricotta di bufala, salame, provola, basilico, pomodoro sopra.", p: 12, t: [] },
    ]},
    { id: "fine", name: "Per concludere", items: [
      { n: "Fritta di mela annurca", d: "Trancio di pizza fritta, mela annurca cotta al forno, cannella, zucchero di canna.", p: 7, t: ["v", "sl"] },
      { n: "Ricotta, miele e noci", d: "Ricotta di bufala montata, miele di castagno, noci, biscotto al finocchietto.", p: 7, t: ["v"] },
      { n: "Sorbetto al limone", d: "Limoni della costiera, nient'altro.", p: 5, t: ["v", "vg", "sl", "sg"] },
    ]},
    { id: "bere", name: "Da bere", items: [
      { n: "Birra artigianale dei colli", d: "Bionda non filtrata, 33 cl.", p: 6, t: ["v", "vg", "sl"] },
      { n: "Pallagrello bianco", d: "Calice. Vitigno autoctono casertano, minerale e agrumato.", p: 7, t: ["v", "vg", "sl", "sg"] },
      { n: "Casavecchia", d: "Calice. Rosso di collina, tannino morbido, frutto scuro.", p: 8, t: ["v", "vg", "sl", "sg"] },
      { n: "Spuma all'alloro", d: "Analcolica, fatta in casa con alloro del cortile e agrumi.", p: 5, t: ["v", "vg", "sl", "sg"] },
      { n: "Acqua minerale", d: "Naturale o frizzante, 75 cl.", p: 2.5, t: ["v", "vg", "sl", "sg"] },
    ]},
  ];

  const PERCORSI = [
    { id: "volta", name: ["Per", "corso Volta"], sub: "Il classico di casa", price: 48, steps: ["Montanarina al piennolo", "Crocchè e provola", "Margherita della Volta, a spicchi", "Funghi e conciato", "Bianca alle noci", "Fritta di mela annurca"] },
    { id: "fuoco", name: ["Per", "corso Fuoco"], sub: "Sette uscite, le pizze del momento", price: 65, steps: ["Tagliere dei colli", "Fritto della Volta", "Bufala e piennolo", "Pizza fuori menu del giorno", "Crudo e fichi", "Salsiccia e friarielli", "Ricotta, miele e noci"] },
    { id: "orto", name: ["Per", "corso Orto"], sub: "Vegetariano, segue la stagione", price: 44, steps: ["Insalata d'inverno", "Montanarine al piennolo", "Marinara del borgo", "Ortolana d'inverno", "Sorbetto al limone"] },
  ];

  const EVIDENZA = [
    { n: "Margherita della Volta", d: "San Marzano DOP, fior di latte di Agerola, basilico.", p: 8, img: "assets/margherita-top.webp", t: ["v"] },
    { n: "Bianca alle noci", d: "Ricotta di bufala, noci tostate, limone, miele di castagno.", p: 12, img: "assets/bianca-top.webp", t: ["v"] },
    { n: "Funghi e conciato", d: "Cardoncelli, fior di latte, conciato romano, timo.", p: 13, img: "assets/funghi-top.webp", t: ["v"] },
    { n: "Crudo e fichi", d: "Provola, crudo 20 mesi, fichi secchi, rucola selvatica.", p: 14, img: "assets/crudo-top.webp", t: [] },
    { n: "Ortolana d'inverno", d: "Zucca, cavolo nero, ceci croccanti. Senza formaggio.", p: 11, img: "assets/ortolana-top.webp", t: ["vg"] },
    { n: "Fritto della Volta", d: "Frittatina, crocchè e montanarina: da dividere.", p: 11, img: "assets/mozzarelline.webp", t: ["v"] },
  ];

  const ROOMS = {
    lanterna: {
      name: "Camera della Lanterna", short: "Lanterna", img: "assets/camera-lanterna.webp", price: 140, max: 2,
      desc: "La più grande, sul lato del campanile. Letto in legno di castagno, due lanterne del fabbro del borgo, una finestra che la sera prende il suono delle campane.",
      kv: [["Superficie", "22 m²"], ["Letto", "Matrimoniale, castagno"], ["Bagno", "Doccia in pietra"], ["Vista", "Campanile del Duomo"], ["Ospiti", "2 adulti + 1 extra"], ["Piano", "Terzo, senza ascensore"]],
    },
    sottotetto: {
      name: "Camera del Sottotetto", short: "Sottotetto", img: "assets/camera-sottotetto.webp", price: 120, max: 2,
      desc: "Sotto le travi originali, con il letto basso e una finestra sui tetti. La mattina il profumo del forno sale dalle scale prima della colazione.",
      kv: [["Superficie", "18 m²"], ["Letto", "Matrimoniale, basso"], ["Bagno", "Doccia, finestra"], ["Vista", "Tetti e colli Tifatini"], ["Ospiti", "2 adulti + 1 extra"], ["Piano", "Mansarda"]],
    },
  };
  const EXTRA_NIGHT = 25;

  /* ---------------------------------------------------------------
     Scroll targets / rail
  --------------------------------------------------------------- */
  const sections = $$("[data-rail]");
  const railList = $(".rail-list");
  const rail = $(".rail");
  sections.forEach((s, i) => {
    const li = document.createElement("li");
    li.innerHTML = `<button type="button" class="rail-dot" data-i="${i}" aria-label="Vai a ${s.dataset.rail}"></button><span class="rail-lbl">${s.dataset.rail}</span>`;
    railList.appendChild(li);
  });
  const railDots = $$(".rail-dot");
  let starts = [], heights = [], vh = window.innerHeight;
  function measure() {
    vh = window.innerHeight;
    // sections are contiguous in flow; sticky offsets don't move flow positions
    let y = 0;
    starts = []; heights = [];
    sections.forEach((s) => { starts.push(y); const h = s.offsetHeight; heights.push(h); y += h; });
    // stacked sections taller than the viewport stick by their bottom edge
    $$(".stk").forEach((s) => s.style.setProperty("--stick", Math.min(0, vh - s.offsetHeight) + "px"));
  }
  function goTo(id, opts = {}) {
    const i = sections.findIndex((s) => s.id === id);
    if (i < 0) return;
    let top = starts[i];
    if (id === "home") top = 0;
    window.scrollTo({ top, behavior: reduce || opts.instant ? "auto" : "smooth" });
  }
  railDots.forEach((d) => d.addEventListener("click", () => goTo(sections[+d.dataset.i].id)));

  /* ---------------------------------------------------------------
     HERO — pinned, scroll-driven slides + recomposition
  --------------------------------------------------------------- */
  const hero = $(".hero");
  const heroImgs = $$(".hs-img");
  const heroWords = $$(".hs-word");
  const heroCur = $(".hs-cur");
  const pin = $(".hero-pin");
  let wordIdx = -1;
  function setWord(i) {
    if (i === wordIdx) return;
    heroWords.forEach((w, k) => {
      w.classList.toggle("is-in", k === i);
      w.classList.toggle("is-out", k === wordIdx && k !== i);
      w.setAttribute("aria-hidden", k === i ? "false" : "true");
    });
    wordIdx = i;
    heroCur.textContent = String(i + 1).padStart(2, "0");
  }
  // p (0–1 through the pin) → continuous slide index with holds between transitions
  function slideF(p) {
    if (p < 0.16) return 0;
    if (p < 0.29) return smooth((p - 0.16) / 0.13);
    if (p < 0.43) return 1;
    if (p < 0.56) return 1 + smooth((p - 0.43) / 0.13);
    return 2;
  }
  const heroState = { p: 0, f: 0, r: 0 };
  function updateHero() {
    if (reduce) return;
    const rect = hero.getBoundingClientRect();
    const range = hero.offsetHeight - vh;
    const p = clamp(-rect.top / range);
    const f = slideF(p);
    const r = smooth(clamp((p - 0.68) / 0.24));
    heroState.p = p; heroState.f = f; heroState.r = r;
    const mob = mobileMQ.matches;
    heroImgs.forEach((fig, i) => {
      const k = i === 0 ? 1 : clamp(f - (i - 1));
      const after = clamp(f - i); // how far the next slide has covered this one
      const z = (i === 0 ? 1 : 1.14 - 0.14 * easeOut(k)) + 0.05 * after;
      fig.style.setProperty("--z", z.toFixed(4));
      let top = (1 - k) * 100, right = 0, bottom = 0, left = 0;
      if (i === 2 && r > 0) {
        if (mob) { top = Math.max(top, r * 9); right = r * 6; bottom = r * 50; left = r * 6; }
        else { top = Math.max(top, r * 13); right = r * 7; bottom = r * 15; left = r * 47; }
      }
      if (i > 0 || r > 0) fig.style.clipPath = `inset(${top.toFixed(3)}% ${right.toFixed(3)}% ${bottom.toFixed(3)}% ${left.toFixed(3)}%)`;
      // once covered, earlier slides are hidden to save paint
      fig.style.visibility = (i < 2 && f >= i + 1) ? "hidden" : "visible";
    });
    setWord(f < 0.5 ? 0 : f < 1.5 ? 1 : 2);
    const W = pin.clientWidth;
    pin.style.setProperty("--bx", (-r * W * 0.22).toFixed(1) + "px");
    // on phones the recap text lands where the word was, so the word must be gone first
    pin.style.setProperty("--bo", clamp(1 - r * (mob ? 2.6 : 1.25)).toFixed(3));
    pin.style.setProperty("--tx", (r * W * 0.16).toFixed(1) + "px");
    pin.style.setProperty("--to", clamp(1 - r * (mob ? 3 : 1.5)).toFixed(3));
    pin.style.setProperty("--mo", (1 - r * 2).toFixed(3));
    pin.style.setProperty("--cue", clamp(1 - p * 10).toFixed(3));
    pin.style.setProperty("--shade", (1 - r * 0.7).toFixed(3));
    const ro = clamp((r - 0.4) / 0.6);
    pin.style.setProperty("--ro", ro.toFixed(3));
    pin.style.setProperty("--ry", ((1 - ro) * 24).toFixed(1) + "px");
    $(".hs-recap").setAttribute("aria-hidden", ro > 0.5 ? "false" : "true");
  }

  /* ---------------------------------------------------------------
     Section stacking — the next section climbs over the stuck one
  --------------------------------------------------------------- */
  const stks = $$(".stk");
  const afterStack = $("#menu");
  function updateStack() {
    if (reduce) return;
    stks.forEach((s, i) => {
      const next = stks[i + 1] || afterStack;
      const k = clamp(1 - next.getBoundingClientRect().top / vh);
      s.style.setProperty("--k", k.toFixed(3));
    });
  }

  /* ---------------------------------------------------------------
     Rail + nav active state
  --------------------------------------------------------------- */
  let railIdle = 0, activeId = "";
  const navLinks = $$("[data-go]");
  function updateRail(fromScroll) {
    const y = window.scrollY + vh * 0.45;
    let ai = 0;
    for (let i = 0; i < starts.length; i++) if (starts[i] <= y) ai = i;
    const frac = clamp((y - starts[ai]) / heights[ai]);
    const pr = clamp((ai + frac) / (sections.length - 1));
    rail.style.setProperty("--p", pr.toFixed(4));
    railDots.forEach((d, i) => {
      d.classList.toggle("on", i === ai);
      d.classList.toggle("done", i < ai);
      if (i === ai) d.setAttribute("aria-current", "true"); else d.removeAttribute("aria-current");
    });
    const id = sections[ai].id;
    if (id !== activeId) {
      activeId = id;
      navLinks.forEach((a) => a.classList.toggle("is-on", a.dataset.go === id && !a.dataset.tab && !a.closest(".side-logo") && !a.closest(".top-logo") && !a.classList.contains("link-cu")));
    }
    // on phones the rail only lives over the hero, like a slider pager
    rail.classList.toggle("away", mobileMQ.matches && ai > 0);
    if (fromScroll) {
      rail.classList.add("live");
      clearTimeout(railIdle);
      railIdle = setTimeout(() => rail.classList.remove("live"), 900);
    }
  }

  /* ---------------------------------------------------------------
     Officina parallax + reveal
  --------------------------------------------------------------- */
  const offHero = $(".off-hero");
  function updateOfficina() {
    if (reduce) return;
    const r = offHero.getBoundingClientRect();
    const t = clamp((vh - r.top) / (vh + r.height));
    offHero.style.setProperty("--op", t.toFixed(3));
  }
  if (offWord) {
    if (reduce || !("IntersectionObserver" in window)) offWord.classList.add("go");
    else {
      const io = new IntersectionObserver((es) => {
        if (es.some((e) => e.isIntersecting)) { offWord.classList.add("go"); io.disconnect(); }
      }, { threshold: 0.35 });
      io.observe(offHero);
    }
  }

  /* ---------------------------------------------------------------
     Scroll loop
  --------------------------------------------------------------- */
  let ticking = false;
  function frame(fromScroll) {
    ticking = false;
    updateHero();
    updateStack();
    updateRail(fromScroll);
    updateOfficina();
  }
  window.addEventListener("scroll", () => {
    if (!ticking) { ticking = true; requestAnimationFrame(() => frame(true)); }
  }, { passive: true });
  function relayout() { measure(); frame(false); segAll(); }
  window.addEventListener("resize", relayout);
  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(() => { measure(); frame(false); });
    sections.forEach((s) => ro.observe(s));
  }
  reduceMQ.addEventListener && reduceMQ.addEventListener("change", (e) => { reduce = e.matches; location.reload(); });

  /* ---------------------------------------------------------------
     Navigation (sidebar + mobile)
  --------------------------------------------------------------- */
  const burger = $(".burger");
  const mnav = $("#mnav");
  function setMnav(open) {
    mnav.classList.toggle("open", open);
    mnav.setAttribute("aria-hidden", open ? "false" : "true");
    burger.setAttribute("aria-expanded", open ? "true" : "false");
    burger.setAttribute("aria-label", open ? "Chiudi menu" : "Apri menu");
    document.documentElement.style.overflow = open ? "hidden" : "";
  }
  burger.addEventListener("click", () => setMnav(!mnav.classList.contains("open")));

  navLinks.forEach((a) => a.addEventListener("click", (e) => {
    e.preventDefault();
    const wasOpen = mnav.classList.contains("open");
    if (wasOpen) setMnav(false);
    if (a.dataset.tab) setMenuTab(a.dataset.tab);
    goTo(a.dataset.go, { instant: wasOpen });
  }));

  const subBtn = $(".sub-toggle");
  subBtn.addEventListener("click", () => {
    const li = subBtn.closest(".has-sub");
    const open = !li.classList.contains("open");
    li.classList.toggle("open", open);
    subBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });

  const lang = $(".lang");
  const langBtn = $(".lang-btn");
  langBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    const open = !lang.classList.contains("open");
    lang.classList.toggle("open", open);
    langBtn.setAttribute("aria-expanded", open ? "true" : "false");
  });
  $(".lang-pop button").addEventListener("click", () => {
    lang.classList.remove("open"); langBtn.setAttribute("aria-expanded", "false");
    toast("La versione inglese arriva a breve.");
  });
  document.addEventListener("click", (e) => {
    if (!lang.contains(e.target)) { lang.classList.remove("open"); langBtn.setAttribute("aria-expanded", "false"); }
  });

  /* ---------------------------------------------------------------
     In evidenza carousel
  --------------------------------------------------------------- */
  const tagHTML = (t) => t.map((x) => `<i class="tg tg-${x}" title="${({ v: "Vegetariano", vg: "Vegano", sl: "Senza lattosio", sg: "Senza glutine su richiesta" })[x]}">${x.toUpperCase()}</i>`).join("");
  const evTrack = $(".ev-track");
  evTrack.innerHTML = EVIDENZA.map((e) => `
    <article class="ev-card">
      <div class="ev-img"><img src="${e.img}" alt="${e.n}" loading="lazy" draggable="false"><span class="ev-tag">${tagHTML(e.t)}</span></div>
      <h3 class="ev-name">${e.n}</h3>
      <p class="ev-desc">${e.d}</p>
      <span class="ev-price">€ ${euro(e.p)}</span>
    </article>`).join("");
  $(".ev-count span").textContent = String(EVIDENZA.length).padStart(2, "0");
  const evBtns = $$(".ev-btn");
  function evStep() { const c = $(".ev-card", evTrack); return c ? c.getBoundingClientRect().width + parseFloat(getComputedStyle(evTrack).columnGap || 0) : 300; }
  function evPaint() {
    const step = evStep();
    const max = evTrack.scrollWidth - evTrack.clientWidth;
    const i = Math.round(evTrack.scrollLeft / step);
    $(".ev-count b").textContent = String(Math.min(EVIDENZA.length, i + 1)).padStart(2, "0");
    evBtns[0].disabled = evTrack.scrollLeft <= 2;
    evBtns[1].disabled = evTrack.scrollLeft >= max - 2;
  }
  evBtns.forEach((b) => b.addEventListener("click", () => {
    evTrack.scrollBy({ left: +b.dataset.dir * evStep(), behavior: reduce ? "auto" : "smooth" });
  }));
  evTrack.addEventListener("scroll", () => requestAnimationFrame(evPaint), { passive: true });
  evTrack.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); evTrack.scrollBy({ left: (e.key === "ArrowRight" ? 1 : -1) * evStep(), behavior: reduce ? "auto" : "smooth" }); }
  });

  /* ---------------------------------------------------------------
     Le sale — tap toggles colour on touch screens
  --------------------------------------------------------------- */
  $$(".sala").forEach((s) => s.addEventListener("click", () => {
    const on = !s.classList.contains("is-on");
    $$(".sala").forEach((x) => x.classList.remove("is-on"));
    s.classList.toggle("is-on", on);
  }));

  /* ---------------------------------------------------------------
     Menu: tabs, filters, accordion
  --------------------------------------------------------------- */
  function segPaint(seg) {
    const on = $('[aria-selected="true"]', seg);
    const ink = $(".seg-ink", seg);
    if (!on || !ink) return;
    ink.style.setProperty("--x", on.offsetLeft + "px");
    ink.style.setProperty("--w", on.offsetWidth + "px");
  }
  function segAll() { $$(".seg").forEach(segPaint); }

  const menuSeg = $(".menu .seg");
  function setMenuTab(tab) {
    $$("[role=tab]", menuSeg).forEach((b) => {
      const on = b.dataset.tab === tab;
      b.setAttribute("aria-selected", on ? "true" : "false");
      b.tabIndex = on ? 0 : -1;
    });
    $("#pane-classiche").hidden = tab !== "classiche";
    $("#pane-degustazione").hidden = tab !== "degustazione";
    segPaint(menuSeg);
  }
  $$("[role=tab]", menuSeg).forEach((b) => {
    b.addEventListener("click", () => setMenuTab(b.dataset.tab));
    b.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const next = b.dataset.tab === "classiche" ? "degustazione" : "classiche";
      setMenuTab(next); $(`[data-tab="${next}"]`, menuSeg).focus();
    });
  });

  const acc = $(".acc");
  acc.innerHTML = MENU.map((g) => `
    <div class="acc-row" data-g="${g.id}">
      <button class="acc-btn" type="button" aria-expanded="${g.id === "pizze"}" aria-controls="acc-${g.id}" id="accb-${g.id}">
        ${g.name} <span class="acc-n">(${g.items.length})</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </button>
      <div class="acc-body" id="acc-${g.id}" role="region" aria-labelledby="accb-${g.id}"><div>
        <ul class="dish-list">
          ${g.items.map((it) => `
            <li class="dish" data-t="${it.t.join(" ")}">
              <span class="dish-n">${it.n} ${tagHTML(it.t)}</span>
              <span class="dish-p">€ ${euro(it.p)}</span>
              <span class="dish-d">${it.d}</span>
            </li>`).join("")}
          <li class="dish-empty" hidden>Nessun piatto con questi filtri. Chiedete in sala: spesso si può adattare.</li>
        </ul>
      </div></div>
    </div>`).join("");
  $$(".acc-btn", acc).forEach((b) => b.addEventListener("click", () => {
    b.setAttribute("aria-expanded", b.getAttribute("aria-expanded") === "true" ? "false" : "true");
  }));
  const filters = new Set();
  const mfCount = $(".mf-count");
  function applyFilters() {
    let total = 0;
    $$(".acc-row", acc).forEach((row) => {
      let n = 0;
      $$(".dish", row).forEach((d) => {
        const tags = d.dataset.t.split(" ");
        const ok = [...filters].every((f) => tags.includes(f));
        d.hidden = !ok;
        if (ok) n++;
      });
      $(".acc-n", row).textContent = `(${n})`;
      $(".dish-empty", row).hidden = n > 0;
      total += n;
    });
    mfCount.textContent = filters.size ? `${total} ${total === 1 ? "piatto" : "piatti"} con ${[...filters].map((f) => f.toUpperCase()).join(" + ")}` : "";
  }
  $$(".mf-chip").forEach((c) => c.addEventListener("click", () => {
    const f = c.dataset.f;
    if (filters.has(f)) filters.delete(f); else filters.add(f);
    c.setAttribute("aria-pressed", filters.has(f) ? "true" : "false");
    applyFilters();
  }));

  $(".deg-grid").innerHTML = PERCORSI.map((p) => `
    <article class="deg">
      <div class="deg-top"><h3 class="deg-name"><b>${p.name[0]}</b>${p.name[1]}</h3><span class="deg-price">€ ${p.price}<small>a persona</small></span></div>
      <p class="deg-sub">${p.sub} · ${p.steps.length} uscite</p>
      <ol class="deg-steps">${p.steps.map((s) => `<li>${s}</li>`).join("")}</ol>
      <button class="btn btn-ghost" type="button" data-percorso="${p.id}">Prenota il percorso</button>
    </article>`).join("");
  $$("[data-percorso]").forEach((b) => b.addEventListener("click", () => openBooking("tavolo", { formula: b.dataset.percorso })));

  /* ---------------------------------------------------------------
     Officina evenings — next three Thursdays at least a week out
  --------------------------------------------------------------- */
  const OFF_TEMPL = [
    ["Il mare di Procida", "Un cuoco d'isola, sei uscite tra impasto e pescato del giorno."],
    ["Erbe del Matese", "Raccolta spontanea, formaggi di malga e una pizza in pala."],
    ["Dolce e lievito", "Una pasticceria del centro storico di Napoli al banco del forno."],
  ];
  const OFF_PRICE = 70;
  const officinaDates = [];
  (function buildOfficina() {
    let d = addDays(dayUTC(romeNow()), 7);
    while (d.getUTCDay() !== 4) d = addDays(d, 1);
    for (let i = 0; i < 3; i++) { officinaDates.push(iso(d)); d = addDays(d, 14); }
    $(".off-list").innerHTML = officinaDates.map((ds, i) => {
      const dt = fromIso(ds);
      return `<li class="off-ev">
        <span class="off-date">${String(dt.getUTCDate()).padStart(2, "0")}<small>${MONTHS[dt.getUTCMonth()].slice(0, 3)} · gio</small></span>
        <span class="off-what"><b>${OFF_TEMPL[i][0]}</b><span>${OFF_TEMPL[i][1]} 20:30 · € ${OFF_PRICE}</span></span>
        <button class="btn btn-ghost" type="button" data-officina="${ds}">Prenota</button>
      </li>`;
    }).join("");
    $$("[data-officina]").forEach((b) => b.addEventListener("click", () => openBooking("tavolo", { date: b.dataset.officina, formula: "officina" })));
  })();

  /* ---------------------------------------------------------------
     Focus trap helper
  --------------------------------------------------------------- */
  function trap(container, e) {
    if (e.key !== "Tab") return;
    const f = $$('button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])', container)
      .filter((el) => el.offsetParent !== null && !el.closest("[hidden]"));
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  let lockCount = 0;
  function lock(on) {
    lockCount = Math.max(0, lockCount + (on ? 1 : -1));
    document.documentElement.style.overflow = lockCount ? "hidden" : "";
  }

  /* ---------------------------------------------------------------
     Room drawer sheet (photo grows out of the card, drawer climbs over it)
  --------------------------------------------------------------- */
  const rd = $("#rd");
  const rdPhoto = $(".rd-photo", rd);
  const rdImg = $("img", rdPhoto);
  const rdDrawer = $(".rd-drawer", rd);
  const rdNum = $(".rd-num", rd);
  let rdCard = null, rdRoom = null, rdTimers = [], rdOpen = false, rdRaf = 0;
  const place = (r) => Object.assign(rdPhoto.style, { left: r.left + "px", top: r.top + "px", width: r.width + "px", height: r.height + "px" });
  const photoRect = (card) => $(".cam-photo", card).getBoundingClientRect();
  function rdClear() { rdTimers.forEach(clearTimeout); rdTimers = []; cancelAnimationFrame(rdRaf); }
  function countUp(el, to, dur, delay) {
    el.textContent = "0";
    if (reduce) { el.textContent = String(to); return; }
    rdTimers.push(setTimeout(() => {
      const t0 = performance.now();
      const tick = (now) => {
        const t = clamp((now - t0) / dur);
        el.textContent = String(Math.round(to * easeOut(t)));
        if (t < 1) rdRaf = requestAnimationFrame(tick);
      };
      rdRaf = requestAnimationFrame(tick);
    }, delay));
  }
  function openRoom(card) {
    if (rdOpen) return;
    rdOpen = true; rdClear();
    rdCard = card; rdRoom = card.dataset.room;
    const R = ROOMS[rdRoom];
    rdImg.src = R.img;
    $(".rd-ttl", rd).textContent = R.short;
    $(".rd-name", rd).textContent = R.name;
    $(".rd-desc", rd).textContent = R.desc;
    $(".rd-kv", rd).innerHTML = R.kv.map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
    rd.classList.add("on");
    rd.setAttribute("aria-hidden", "false");
    lock(true);
    // geometry: a panel centred in the viewport — photo on top, drawer overlapping it by 22px
    const vw = window.innerWidth, h = window.innerHeight;
    const W = Math.min(560, vw - (vw < 600 ? 24 : 48));
    const left = Math.round((vw - W) / 2);
    const PH = Math.round(Math.min(vw < 600 ? 230 : 320, h * 0.4));
    rdDrawer.style.width = W + "px";
    rdDrawer.style.left = left + "px";
    rdDrawer.style.maxHeight = "";
    const DH = rdDrawer.offsetHeight;
    const top = Math.max(12, Math.round((h - (PH + DH - 22)) / 2));
    const dTop = top + PH - 22;
    rdDrawer.style.top = dTop + "px";
    if (dTop + DH > h - 12) rdDrawer.style.maxHeight = (h - 12 - dTop) + "px";
    // start exactly on the card…
    rdPhoto.style.transition = "none";
    place(photoRect(card));
    rdPhoto.classList.add("on");
    rdPhoto.classList.remove("big");
    void rdPhoto.offsetWidth;
    rdPhoto.style.transition = "";
    card.classList.add("gone");
    // …then grow into the panel, and push the drawer up
    requestAnimationFrame(() => {
      place({ left, top, width: W, height: PH });
      rdPhoto.classList.add("big");
      rd.classList.add("open");
    });
    countUp(rdNum, R.price, 800, 1000);
    rdTimers.push(setTimeout(() => $(".x", rdDrawer).focus({ preventScroll: true }), reduce ? 0 : 450));
  }
  function closeRoom(then) {
    if (!rdOpen) return;
    rdOpen = false; rdClear();
    rd.classList.remove("open");
    const card = rdCard;
    rdTimers.push(setTimeout(() => { place(photoRect(card)); rdPhoto.classList.remove("big"); }, reduce ? 0 : 160));
    rdTimers.push(setTimeout(() => {
      rdPhoto.classList.remove("on");
      card.classList.remove("gone");
      rd.classList.remove("on");
      rd.setAttribute("aria-hidden", "true");
      lock(false);
      if (typeof then === "function") then(); else card.focus({ preventScroll: true });
    }, reduce ? 0 : 680));
  }
  $$(".cam-card").forEach((c) => c.addEventListener("click", () => openRoom(c)));
  $$("[data-rd-close]", rd).forEach((b) => b.addEventListener("click", () => closeRoom()));
  $(".rd-book", rd).addEventListener("click", () => {
    const room = rdRoom;
    closeRoom(() => openBooking("camera", { room }));
  });
  rd.addEventListener("keydown", (e) => trap(rdDrawer, e));

  /* ---------------------------------------------------------------
     Booking modal — Tavolo / Camera
  --------------------------------------------------------------- */
  const bk = $("#bk");
  const bkBox = $(".bk-box", bk);
  const bkSeg = $(".bk-head .seg", bk);
  const fT = $("#f-tavolo");
  const fC = $("#f-camera");
  const okBox = $(".bk-ok", bk);
  let bkKind = "tavolo", bkOpen = false, bkReturn = null;

  function setErr(form, key, msg) {
    const el = $(`[data-err="${key}"]`, form);
    if (el) el.textContent = msg || "";
    const fld = el && el.closest(".fld");
    if (fld) fld.classList.toggle("bad", !!msg);
  }
  function radio(group, form, items, cur, onPick) {
    const box = $(`[data-group="${group}"]`, form);
    box.innerHTML = items.map((it) => `<button type="button" class="chip" role="radio" data-v="${it.v}" aria-checked="${it.v === cur}" ${it.disabled ? "disabled" : ""}>${it.label}</button>`).join("");
    $$(".chip", box).forEach((c) => c.addEventListener("click", () => onPick(c.dataset.v)));
  }

  /* ----- Tavolo ----- */
  const T = { day: null, ppl: 2, sala: "any", slot: null, formula: "carta" };
  const SLOTS = ["18:30", "19:00", "19:30", "20:00", "20:30", "21:00", "21:30", "22:00", "22:30"];
  const SALE = [
    { v: "any", label: "Indifferente" },
    { v: "volte", label: "Sotto le volte" },
    { v: "banco", label: "Banco del forno <small>max 4</small>" },
    { v: "camino", label: "Sala del camino <small>da 6</small>" },
    { v: "terrazza", label: "Terrazza <small>apr–ott</small>" },
  ];
  const FORMULE = [
    { v: "carta", label: "Alla carta" },
    { v: "volta", label: "Percorso Volta · € 48" },
    { v: "fuoco", label: "Percorso Fuoco · € 65" },
    { v: "orto", label: "Percorso Orto · € 44" },
    { v: "officina", label: `Serata Officina · € ${OFF_PRICE}` },
  ];
  function nowMin() { const n = romeNow(); return n.h * 60 + n.mi; }
  function todayIso() { return iso(dayUTC(romeNow())); }
  // weekend peak slots are full (deterministic, keeps the demo honest)
  function slotFull(ds, s) { const dow = fromIso(ds).getUTCDay(); return (dow === 6 && (s === "20:30" || s === "21:00")) || (dow === 0 && s === "20:00"); }
  function slotState(ds, s) {
    if (!ds) return "off";
    if (T.formula === "officina") return s === "20:30" ? "ok" : "off";
    if (ds === todayIso()) {
      const [h, m] = s.split(":").map(Number);
      if (h * 60 + m < nowMin() + 45) return "past";
    }
    return slotFull(ds, s) ? "full" : "ok";
  }
  function dayList() {
    const out = [];
    const start = dayUTC(romeNow());
    for (let i = 0; i < 42; i++) {
      const d = addDays(start, i);
      const ds = iso(d);
      const closed = d.getUTCDay() === 1;
      const allPast = i === 0 && !closed && SLOTS.every((s) => slotState(ds, s) === "past");
      out.push({ ds, d, closed, allPast, today: i === 0 });
    }
    return out;
  }
  function renderDays() {
    const box = $(".days", fT);
    const list = dayList();
    box.innerHTML = list.map((x) => {
      const dis = x.closed || x.allPast || (T.formula === "officina" && !officinaDates.includes(x.ds));
      const note = x.closed ? "chiuso" : x.allPast ? "finito" : x.today ? "oggi" : officinaDates.includes(x.ds) ? "officina" : "";
      return `<button type="button" class="day" role="radio" data-d="${x.ds}" aria-checked="${T.day === x.ds}" ${dis ? "disabled" : ""} aria-label="${fmtLong(x.d)}${note ? ", " + note : ""}">
        <small>${DAYS_S[x.d.getUTCDay()]}</small><b>${x.d.getUTCDate()}</b><em>${note || "&nbsp;"}</em></button>`;
    }).join("");
    $$(".day", box).forEach((b) => b.addEventListener("click", () => { T.day = b.dataset.d; setErr(fT, "day"); renderTavolo(); }));
  }
  function terraceOpen(ds) { if (!ds) return true; const m = fromIso(ds).getUTCMonth() + 1; return m >= 4 && m <= 10; }
  function renderTavolo() {
    // keep state consistent
    if (T.formula === "officina" && T.day && !officinaDates.includes(T.day)) T.day = null;
    if (T.sala === "terrazza" && !terraceOpen(T.day)) T.sala = "any";
    if (T.slot && slotState(T.day, T.slot) !== "ok") T.slot = null;
    if (T.formula === "officina") { T.sala = "any"; if (T.day) T.slot = "20:30"; }
    renderDays();
    const ppl = $('[data-step="ppl"]', fT);
    $("output", ppl).textContent = T.ppl;
    $('[data-d="-1"]', ppl).disabled = T.ppl <= 1;
    $('[data-d="1"]', ppl).disabled = T.ppl >= 12;
    $('[data-hint="ppl"]', fT).textContent = T.ppl > 8 ? "Oltre 8 persone vi richiamiamo per confermare la disposizione." : "";
    radio("sala", fT, SALE.map((s) => ({ ...s, disabled: (s.v === "terrazza" && !terraceOpen(T.day)) || (T.formula === "officina" && s.v !== "any") })), T.sala, (v) => { T.sala = v; setErr(fT, "sala"); renderTavolo(); });
    radio("slot", fT, SLOTS.map((s) => {
      const st = slotState(T.day, s);
      return { v: s, label: st === "full" ? `${s} <small>pieno</small>` : s, disabled: st !== "ok" };
    }), T.slot, (v) => { T.slot = v; setErr(fT, "slot"); renderTavolo(); });
    radio("formula", fT, FORMULE, T.formula, (v) => {
      T.formula = v;
      if (v === "officina" && T.day && !officinaDates.includes(T.day)) T.day = null;
      renderTavolo();
    });
    const fh = $('[data-hint="formula"]', fT);
    if (T.formula === "officina") fh.textContent = "Serate Officina: giovedì segnati sul calendario, turno unico alle 20:30 al banco del forno.";
    else if (T.formula !== "carta") fh.textContent = "I percorsi sono per tutto il tavolo, minimo 2 persone.";
    else fh.textContent = "";
    const sum = $('[data-sum="tavolo"]', fT);
    sum.textContent = T.day && T.slot ? `${cap(fmtLong(fromIso(T.day)))} · ${T.slot} · ${T.ppl} ${T.ppl === 1 ? "persona" : "persone"}` : "Scegli giorno e orario.";
  }
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  $$('[data-step="ppl"] button', fT).forEach((b) => b.addEventListener("click", () => {
    T.ppl = clamp(T.ppl + +b.dataset.d, 1, 12); setErr(fT, "sala"); renderTavolo();
  }));
  fT.addEventListener("submit", (e) => {
    e.preventDefault();
    let ok = true;
    const fail = (k, m) => { setErr(fT, k, m); ok = false; };
    ["day", "slot", "sala", "nome", "tel", "privacy"].forEach((k) => setErr(fT, k));
    if (!T.day) fail("day", "Scegli un giorno.");
    if (!T.slot) fail("slot", T.day ? "Scegli un orario." : "Prima scegli il giorno.");
    if (T.sala === "banco" && T.ppl > 4) fail("sala", "Il banco del forno ha posto per massimo 4 persone.");
    if (T.sala === "camino" && T.ppl < 6) fail("sala", "La sala del camino si prenota da 6 persone in su.");
    if (T.formula !== "carta" && T.ppl < 2) fail("sala", "I percorsi sono per tutto il tavolo, minimo 2 persone.");
    const nome = fT.nome.value.trim(), tel = fT.tel.value.trim();
    if (nome.length < 2) fail("nome", "Inserisci nome e cognome.");
    if (!/^\+?[\d\s().-]{8,18}$/.test(tel) || tel.replace(/\D/g, "").length < 8) fail("tel", "Numero non valido: servono almeno 8 cifre.");
    if (!fT.privacy.checked) fail("privacy", "Serve il consenso per registrare la prenotazione.");
    if (!ok) {
      const first = $$(".err", fT).find((x) => x.textContent);
      if (first) first.closest(".fs, .fld, .chk, .err").scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" });
      return;
    }
    const sala = SALE.find((s) => s.v === T.sala).label.replace(/<small>.*<\/small>/, "").trim();
    const form = FORMULE.find((f) => f.v === T.formula).label;
    showOk("tavolo",
      `${cap(fmtLong(fromIso(T.day)))} alle ${T.slot}, ${T.ppl} ${T.ppl === 1 ? "persona" : "persone"} · ${sala.toLowerCase()} · ${form.toLowerCase()}. Vi mandiamo un SMS di conferma al ${tel}.`);
  });

  /* ----- Camera ----- */
  const C = { room: "lanterna", rooms: 1, adults: 2, extra: 0, step: 1 };
  function nightsOf(a, b) { if (!a || !b) return 0; return Math.round((fromIso(b) - fromIso(a)) / 864e5); }
  function camValidate(show) {
    const vin = fC.in.value, vout = fC.out.value, today = todayIso();
    let e1 = "", e2 = "";
    if (!vin) e1 = "Scegli la data di arrivo.";
    else if (vin < today) e1 = "La data di arrivo è già passata.";
    if (!vout) e2 = "Scegli la data di partenza.";
    else if (vin && vout <= vin) e2 = "La partenza deve essere dopo l'arrivo.";
    else if (vin && nightsOf(vin, vout) > 14) e2 = "Per soggiorni oltre 14 notti scriveteci.";
    if (show) { setErr(fC, "in", e1); setErr(fC, "out", e2); }
    return !e1 && !e2;
  }
  function camTotal() {
    const n = camValidate(false) ? nightsOf(fC.in.value, fC.out.value) : 0;
    const lines = [];
    let tot = 0;
    const list = C.rooms === 2 ? ["lanterna", "sottotetto"] : [C.room];
    list.forEach((k) => { const v = ROOMS[k].price * n; tot += v; lines.push([`${ROOMS[k].short} · ${n} ${n === 1 ? "notte" : "notti"} × € ${ROOMS[k].price}`, v]); });
    if (C.extra) { const v = C.extra * EXTRA_NIGHT * n; tot += v; lines.push([`Letto extra × ${C.extra} · € ${EXTRA_NIGHT}/notte`, v]); }
    if (fC.culla.checked) lines.push(["Culla", 0]);
    lines.push(["Colazione dal forno", 0]);
    return { n, tot, lines };
  }
  function renderCamera() {
    const step = (k, val, min, max) => {
      const box = $(`[data-step="${k}"]`, fC);
      $("output", box).textContent = val;
      $('[data-d="-1"]', box).disabled = val <= min;
      $('[data-d="1"]', box).disabled = val >= max;
    };
    C.adults = clamp(C.adults, 1, 2 * C.rooms);
    C.extra = clamp(C.extra, 0, C.rooms);
    step("rooms", C.rooms, 1, 2);
    step("adults", C.adults, 1, 2 * C.rooms);
    step("extra", C.extra, 0, C.rooms);
    radio("room", fC, Object.entries(ROOMS).map(([k, r]) => ({ v: k, label: `${r.short} <small>€ ${r.price}</small>`, disabled: C.rooms === 2 })), C.rooms === 2 ? "__both" : C.room, (v) => { C.room = v; renderCamera(); });
    if (C.rooms === 2) $$('[data-group="room"] .chip', fC).forEach((c) => c.setAttribute("aria-checked", "true"));
    const t = camTotal();
    $(".tot-lines", fC).innerHTML = t.n ? t.lines.map(([l, v]) => `<div><span>${l}</span><span>${v ? "€ " + euro(v) : "incluso"}</span></div>`).join("") : "<div><span>Scegli le date per vedere il prezzo.</span></div>";
    $(".tot-num", fC).textContent = euro(t.tot);
    setErr(fC, "guests", C.rooms === 2 && C.adults < 2 ? "Con due camere serve almeno un adulto per camera." : "");
  }
  ["rooms", "adults", "extra"].forEach((k) => $$(`[data-step="${k}"] button`, fC).forEach((b) => b.addEventListener("click", () => {
    C[k] = C[k] + +b.dataset.d; renderCamera();
  })));
  fC.in.addEventListener("change", () => {
    if (fC.in.value) {
      const minOut = iso(addDays(fromIso(fC.in.value), 1));
      fC.out.min = minOut;
      if (!fC.out.value || fC.out.value <= fC.in.value) fC.out.value = minOut;
    }
    camValidate(true); renderCamera();
  });
  fC.out.addEventListener("change", () => { camValidate(true); renderCamera(); });
  fC.culla.addEventListener("change", renderCamera);
  function camStep(n) {
    C.step = n;
    $$(".cstep", fC).forEach((s) => { s.hidden = +s.dataset.cstep !== n; });
    $$(".steps li", fC).forEach((li, i) => li.classList.toggle("on", i === n - 1));
    bkBox.scrollTop = 0;
  }
  $("[data-next]", fC).addEventListener("click", () => {
    const ok = camValidate(true);
    if (!ok) return;
    if (C.rooms === 2 && C.adults < 2) return;
    const t = camTotal();
    const rooms = C.rooms === 2 ? "Lanterna + Sottotetto" : ROOMS[C.room].name;
    $("[data-recap]", fC).innerHTML = `<b>${rooms}</b><br>${cap(fmtLong(fromIso(fC.in.value)))} → ${fmtLong(fromIso(fC.out.value))} · ${t.n} ${t.n === 1 ? "notte" : "notti"}<br>${C.adults} ${C.adults === 1 ? "adulto" : "adulti"}${C.extra ? ` + ${C.extra} extra` : ""}${fC.culla.checked ? " + culla" : ""} · <b>€ ${euro(t.tot)}</b>`;
    camStep(2);
    setTimeout(() => fC.cnome.focus({ preventScroll: true }), 30);
  });
  $("[data-back]", fC).addEventListener("click", () => camStep(1));
  fC.addEventListener("submit", (e) => {
    e.preventDefault();
    if (C.step !== 2) { $("[data-next]", fC).click(); return; }
    let ok = true;
    const fail = (k, m) => { setErr(fC, k, m); ok = false; };
    ["cnome", "cmail", "ctel", "cprivacy"].forEach((k) => setErr(fC, k));
    if (fC.cnome.value.trim().length < 2) fail("cnome", "Inserisci nome e cognome.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(fC.cmail.value.trim())) fail("cmail", "Email non valida.");
    if (fC.ctel.value.replace(/\D/g, "").length < 8) fail("ctel", "Numero non valido: servono almeno 8 cifre.");
    if (!fC.cprivacy.checked) fail("cprivacy", "Serve il consenso per registrare il soggiorno.");
    if (!ok) return;
    const t = camTotal();
    const rooms = C.rooms === 2 ? "Le due camere" : ROOMS[C.room].name;
    showOk("camera", `${rooms}, dal ${fmtLong(fromIso(fC.in.value))} al ${fmtLong(fromIso(fC.out.value))} (${t.n} ${t.n === 1 ? "notte" : "notti"}), totale € ${euro(t.tot)}.${fC.cena.checked ? " Tavolo in pizzeria tenuto per la prima sera alle 20:30." : ""} Riepilogo inviato a ${fC.cmail.value.trim()}.`);
  });

  /* ----- modal shell ----- */
  function setBkKind(kind) {
    bkKind = kind;
    $$("[role=tab]", bkSeg).forEach((b) => b.setAttribute("aria-selected", b.dataset.bk === kind ? "true" : "false"));
    fT.hidden = kind !== "tavolo";
    fC.hidden = kind !== "camera";
    okBox.hidden = true;
    $("#bk-title").innerHTML = `Prenota<span class="bk-what"> ${kind === "tavolo" ? "un tavolo" : "una camera"}</span>`;
    segPaint(bkSeg);
  }
  $$("[role=tab]", bkSeg).forEach((b) => b.addEventListener("click", () => { setBkKind(b.dataset.bk); bkBox.scrollTop = 0; }));
  function resetForms() {
    fT.reset(); fC.reset();
    Object.assign(T, { day: null, ppl: 2, sala: "any", slot: null, formula: "carta" });
    Object.assign(C, { room: "lanterna", rooms: 1, adults: 2, extra: 0 });
    $$(".err", bk).forEach((x) => { x.textContent = ""; });
    $$(".fld.bad", bk).forEach((x) => x.classList.remove("bad"));
    // default stay: next Friday → Sunday
    let d = addDays(dayUTC(romeNow()), 1);
    while (d.getUTCDay() !== 5) d = addDays(d, 1);
    const today = todayIso();
    fC.in.min = today;
    fC.in.value = iso(d);
    fC.out.min = iso(addDays(d, 1));
    fC.out.value = iso(addDays(d, 2));
    camStep(1);
  }
  function openBooking(kind = "tavolo", opts = {}) {
    if (mnav.classList.contains("open")) setMnav(false);
    bkReturn = document.activeElement;
    if (!bkOpen || !okBox.hidden) resetForms();
    if (opts.formula) T.formula = opts.formula;
    if (opts.date) T.day = opts.date;
    if (opts.room) { C.room = opts.room; C.rooms = 1; }
    setBkKind(kind);
    renderTavolo(); renderCamera();
    if (!bkOpen) {
      bkOpen = true;
      bk.classList.add("on");
      bk.setAttribute("aria-hidden", "false");
      lock(true);
      requestAnimationFrame(() => { bk.classList.add("open"); segPaint(bkSeg); });
    }
    bkBox.scrollTop = 0;
    setTimeout(() => { const t = $('[role=tab][aria-selected="true"]', bkSeg); t && t.focus({ preventScroll: true }); }, reduce ? 0 : 80);
  }
  function closeBooking() {
    if (!bkOpen) return;
    bkOpen = false;
    bk.classList.remove("open");
    setTimeout(() => {
      bk.classList.remove("on");
      bk.setAttribute("aria-hidden", "true");
      lock(false);
      if (!okBox.hidden) resetForms();
      if (bkReturn && bkReturn.focus) bkReturn.focus({ preventScroll: true });
    }, reduce ? 0 : 300);
  }
  function showOk(kind, text) {
    fT.hidden = true; fC.hidden = true; okBox.hidden = false;
    const code = "VA-" + Math.random().toString(36).slice(2, 6).toUpperCase();
    $(".ok-t", okBox).textContent = kind === "tavolo" ? "Tavolo prenotato." : "Camera prenotata.";
    $(".ok-s", okBox).textContent = text;
    $(".ok-code", okBox).textContent = "CODICE " + code;
    bkBox.scrollTop = 0;
    $("button", okBox).focus({ preventScroll: true });
  }
  $$("[data-book]").forEach((b) => b.addEventListener("click", () => openBooking(b.dataset.book)));
  $$("[data-bk-close]", bk).forEach((b) => b.addEventListener("click", closeBooking));
  bk.addEventListener("keydown", (e) => trap(bkBox, e));

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (bkOpen) closeBooking();
    else if (rdOpen) closeRoom();
    else if (mnav.classList.contains("open")) { setMnav(false); burger.focus(); }
    else if (lang.classList.contains("open")) { lang.classList.remove("open"); langBtn.setAttribute("aria-expanded", "false"); }
  });

  /* ---------------------------------------------------------------
     Boot
  --------------------------------------------------------------- */
  resetForms();
  renderTavolo(); renderCamera();
  applyFilters();
  measure();
  frame(false);
  segAll();
  evPaint();
  if (reduce) { setWord(0); heroWords[0].classList.add("is-in"); }
  else {
    // first word rises once the fonts are in, so the glyphs don't swap mid-animation
    const go = () => { wordIdx = -1; setWord(heroState.f < 0.5 ? 0 : heroState.f < 1.5 ? 1 : 2); };
    heroWords.forEach((w) => w.classList.remove("is-in"));
    if (document.fonts && document.fonts.ready) {
      let done = false;
      const fire = () => { if (!done) { done = true; requestAnimationFrame(go); } };
      document.fonts.ready.then(fire);
      setTimeout(fire, 900);
    } else setTimeout(go, 100);
  }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { measure(); segAll(); frame(false); });
  window.addEventListener("load", () => { measure(); frame(false); segAll(); });

  // test hooks (read-only)
  window.__va = { openState, romeNow, heroState, starts: () => starts.slice(), openBooking, closeBooking };
})();
