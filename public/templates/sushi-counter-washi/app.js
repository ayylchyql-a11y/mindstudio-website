/* Sumi — banco di sushi, Firenze. Vanilla JS, no storage, sandbox-safe. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const PRICE = 180;

  /* ---------------- toast (alert() is swallowed in the sandbox) ---------------- */
  const toastEl = $("#toast");
  let toastT = 0;
  // inside the request sheet: whenever the action buttons sit where the toast would land, the toast shows at the top edge instead
  // (re-checked each frame while the toast is up, because validation messages and the scroll-to-field move the buttons)
  function placeToast() {
    const acts = [...document.querySelectorAll("#rq:not([hidden]) .rq-actions")].find((el) => el.offsetParent);
    const ar = acts && acts.getBoundingClientRect(), vh = window.innerHeight;
    toastEl.classList.toggle("is-top", !!ar && ar.top < vh - 20 && ar.bottom > vh - 90);
    if (toastEl.classList.contains("is-on")) requestAnimationFrame(placeToast);
  }
  function toast(msg) {
    toastEl.textContent = msg;
    const was = toastEl.classList.contains("is-on");
    toastEl.classList.add("is-on");
    if (!was) placeToast();
    clearTimeout(toastT);
    toastT = setTimeout(() => toastEl.classList.remove("is-on"), 2600);
  }

  /* ---------------- time in Florence ---------------- */
  const DOW_IT = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];
  const DOW_LONG = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  const MON_IT = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];
  const MON_LONG = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
  const fmt = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  function romeNow() {
    const p = Object.fromEntries(fmt.formatToParts(new Date()).map((x) => [x.type, x.value]));
    const y = +p.year, mo = +p.month, d = +p.day;
    const day = new Date(Date.UTC(y, mo - 1, d));
    return { y, mo, d, min: (+p.hour % 24) * 60 + +p.minute, dow: day.getUTCDay(), day };
  }
  // minutes from midnight; an end past 1440 spills into the next day
  const LUNCH = [750, 870], DIN = [1140, 1380], DIN_LATE = [1140, 1470];
  const SCHED = { 0: [], 1: [], 2: [LUNCH, DIN], 3: [LUNCH, DIN], 4: [LUNCH, DIN], 5: [LUNCH, DIN_LATE], 6: [LUNCH, DIN_LATE] };
  function holiday(day) { // day = UTC Date
    const m = day.getUTCMonth() + 1, d = day.getUTCDate();
    if ((m === 12 && d >= 24) || (m === 1 && d <= 7)) return "ferie";
    if (m === 8 && d >= 10 && d <= 23) return "ferie";
    return "";
  }
  const addDays = (day, n) => new Date(day.getTime() + n * 864e5);
  const hhmm = (m) => { m = ((m % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); };
  function intervals(day) { return holiday(day) ? [] : SCHED[day.getUTCDay()]; }

  function openState(now = romeNow()) {
    for (const [a, b] of intervals(now.day)) if (now.min >= a && now.min < b) return { open: true, until: b };
    const prev = addDays(now.day, -1);
    for (const [, b] of intervals(prev)) if (b > 1440 && now.min < b - 1440) return { open: true, until: b };
    for (let k = 0; k < 30; k++) {
      const day = addDays(now.day, k);
      for (const [a] of intervals(day)) {
        if (k === 0 && a <= now.min) continue;
        return { open: false, k, at: a, day };
      }
    }
    return { open: false };
  }
  function statusText(s) {
    if (s.open) return { short: "Aperto · fino alle " + hhmm(s.until), long: "Aperto ora · il servizio finisce alle " + hhmm(s.until) };
    if (s.day == null) return { short: "Chiuso", long: "Chiuso" };
    const when = s.k === 0 ? "oggi" : s.k === 1 ? "domani" : DOW_LONG[s.day.getUTCDay()] + " " + s.day.getUTCDate() + " " + MON_IT[s.day.getUTCMonth()];
    return { short: "Chiuso · riapre " + (s.k === 0 ? hhmm(s.at) : s.k === 1 ? "domani" : DOW_IT[s.day.getUTCDay()]), long: "Chiuso ora · riapre " + when + " alle " + hhmm(s.at) };
  }
  function renderStatus() {
    const s = openState();
    const t = statusText(s);
    $$(".js-status-short").forEach((el) => (el.textContent = t.short));
    $$(".js-status-long").forEach((el) => (el.textContent = t.long));
    $("#hdStatus").classList.toggle("is-open", s.open);
    $(".live-now").classList.toggle("is-open", s.open);
    // week table, today highlighted
    const now = romeNow();
    const rows = [];
    for (let i = 0; i < 7; i++) {
      const dow = (i + 1) % 7; // lun..dom
      const iv = SCHED[dow];
      const txt = iv.length ? iv.map(([a, b]) => hhmm(a) + "–" + hhmm(b)).join(" · ") : "chiuso";
      rows.push(`<tr class="${dow === now.dow ? "today" : ""}"><td>${DOW_LONG[dow]}</td><td>${txt}</td></tr>`);
    }
    $("#week").innerHTML = "<tbody>" + rows.join("") + "</tbody>";
    if (holiday(now.day)) $("#week").insertAdjacentHTML("beforeend", `<caption style="caption-side:bottom;text-align:left;font-size:15px;padding-top:6px">Oggi siamo in ferie.</caption>`);
  }
  renderStatus();
  setInterval(renderStatus, 30000);

  /* ---------------- header: band, scrollspy, mobile menu, to-top ---------------- */
  const hd = $("#hd"), hero = $(".hero"), toTop = $("#toTop");
  const spyLinks = $$(".hd-nav [data-spy]");
  const spyIds = ["top", "banco", "omakase", "stagioni", "avvisi", "domande", "dove"];
  const spyMap = { percorso: "omakase" };
  function onScroll() {
    const y = scrollY;
    hd.classList.toggle("is-band", y > hero.offsetHeight - hd.offsetHeight - 10);
    toTop.classList.toggle("is-on", y > 700);
    const probe = innerHeight * 0.4;
    let cur = "top";
    for (const sec of $$("main > section")) {
      const r = sec.getBoundingClientRect();
      if (r.top <= probe) cur = spyMap[sec.id] || sec.id;
    }
    if (!spyIds.includes(cur)) cur = "top";
    spyLinks.forEach((a) => {
      const on = a.dataset.spy === cur;
      a.classList.toggle("is-active", on);
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();
  toTop.addEventListener("click", () => scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }));

  const burger = $("#burger"), mnav = $("#mnav");
  function setMenu(open) {
    burger.setAttribute("aria-expanded", String(open));
    burger.textContent = open ? "Chiudi" : "Menu";
    if (open) { mnav.hidden = false; requestAnimationFrame(() => mnav.classList.add("is-in")); document.documentElement.style.overflow = "hidden"; }
    else { mnav.classList.remove("is-in"); mnav.hidden = true; if ($("#rq").hidden) document.documentElement.style.overflow = ""; }
  }
  burger.addEventListener("click", () => setMenu(burger.getAttribute("aria-expanded") !== "true"));
  $$("a", mnav).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  addEventListener("resize", () => { if (innerWidth > 960 && !mnav.hidden) setMenu(false); });

  /* ---------------- hero slideshow ---------------- */
  const slides = $$("#slides .hs");
  let slideI = 0, slideTimer = 0, heroVisible = true;
  function showSlide(i) {
    slideI = (i + slides.length) % slides.length;
    slides.forEach((s, k) => s.classList.toggle("is-on", k === slideI));
    $("#hCount").textContent = `${slideI + 1} / ${slides.length}`;
    // the label stays; nothing else moves — the original's restraint
  }
  function schedule() {
    clearTimeout(slideTimer);
    if (reduce || !heroVisible || document.hidden) return;
    slideTimer = setTimeout(() => { showSlide(slideI + 1); schedule(); }, slideI === 0 ? 7000 : 6000);
  }
  $("#hPrev").addEventListener("click", () => { showSlide(slideI - 1); schedule(); });
  $("#hNext").addEventListener("click", () => { showSlide(slideI + 1); schedule(); });
  new IntersectionObserver((es) => { heroVisible = es[0].isIntersecting; schedule(); }, { threshold: 0.25 }).observe(hero);
  document.addEventListener("visibilitychange", schedule);
  requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add("is-ready")));

  /* ---------------- vertical calligraphy: staggered character reveal ---------------- */
  $$(".js-split").forEach((el) => {
    const text = el.textContent;
    el.textContent = "";
    [...text].forEach((ch, i) => {
      const w = document.createElement("span"); w.className = "w"; w.setAttribute("aria-hidden", "true");
      const c = document.createElement("span"); c.className = "c"; c.style.setProperty("--i", i); c.textContent = ch;
      w.appendChild(c); el.appendChild(w);
    });
    if (reduce) { el.classList.add("go"); return; }
    const io = new IntersectionObserver((es) => {
      if (es.some((e) => e.isIntersecting)) { el.classList.add("go"); io.disconnect(); }
    }, { threshold: 0.5 });
    io.observe(el);
  });

  /* ---------------- creed: words brighten with scroll ---------------- */
  const creed = $("#creed");
  const words = [];
  {
    const parts = creed.textContent.split(/(\s+)/);
    creed.textContent = "";
    for (const w of parts) {
      if (/^\s+$/.test(w)) { creed.appendChild(document.createTextNode(w)); continue; }
      const i = document.createElement("i"); i.textContent = w; creed.appendChild(i); words.push(i);
    }
  }
  const SOFT = 6, FLOOR = 0.16;
  function creedUpdate() {
    if (reduce) return;
    const r = creed.getBoundingClientRect(), vh = innerHeight;
    // start lighting when the paragraph's top reaches 88% of the viewport, finish when its bottom reaches 50%
    const start = vh * 0.88, end = vh * 0.5;
    const total = (start - end) + r.height;
    const prog = clamp((start - r.top) / total);
    const head = prog * (words.length + SOFT) + 1;
    for (let i = 0; i < words.length; i++) {
      const t = clamp((head - i) / SOFT);
      words[i].style.opacity = (FLOOR + (1 - FLOOR) * t).toFixed(3);
    }
  }

  /* ---------------- il percorso: scroll-scrubbed sequence ---------------- */
  const PIECES = [
    { img: "n-branzino", f: 1, k: "鱸", no: "一", n: "Branzino", d: "Del Tirreno, preso all'amo. Una notte tra due fogli di alga kombu." },
    { img: "n-tonno", f: 1, k: "赤身", no: "二", n: "Tonno rosso, akami", d: "Il magro, frollato sei giorni. Un velo di salsa di soia stagionata." },
    { img: "n-salmone", f: .92, k: "鱒", no: "三", n: "Trota salmonata", d: "Dalle acque fredde del Trentino, leggermente salata e lasciata riposare." },
    { img: "n-gambero", f: 1.06, k: "海老", no: "四", n: "Gambero", d: "Cotto al momento in acqua e sale, servito ancora tiepido." },
    { img: "n-ikura", f: .62, k: "いくら", no: "五", n: "Uova di salmone", d: "Marinate una notte nel sake e nella soia, avvolte nella trota." },
    { img: "n-anguilla", f: .96, k: "穴子", no: "六", n: "Grongo, anago", d: "Cotto piano per un'ora, glassato con la sua salsa. L'ultimo pezzo." },
  ];
  const track = $("#pcTrack"), stage = $("#pcStage"), piecesEl = $("#pcPieces"), textEl = $("#pcText");
  const pEls = [], tEls = [], bEls = [];
  PIECES.forEach((p, i) => {
    const el = document.createElement("div");
    el.className = "pc-p";
    el.innerHTML = `<img src="assets/${p.img}.webp" alt="${p.n}" draggable="false"><p class="cap"><b>${p.no}</b>${p.n}</p>`;
    piecesEl.appendChild(el); pEls.push(el);
    const t = document.createElement("div");
    t.className = "pc-t";
    t.innerHTML = `<span class="k" aria-hidden="true">${p.k}</span><span class="n">${p.n}</span><span class="d">${p.d}</span>`;
    textEl.appendChild(t); tEls.push(t);
    const b = document.createElement("div");
    b.className = "pc-big"; b.setAttribute("aria-hidden", "true"); b.textContent = p.no;
    stage.appendChild(b); bEls.push(b);
  });
  const N = PIECES.length;
  let pcBase = 400, pcState = { p: -1 };
  function pcResize() {
    pcBase = Math.min(innerWidth * (innerWidth < 640 ? 0.72 : 0.36), 440, innerHeight * 0.6);
    pEls.forEach((el, i) => el.style.setProperty("--w", Math.round(pcBase * PIECES[i].f) + "px"));
    pcState.p = -1;
  }
  // rest at each piece for a while, travel between them in the middle of each step
  const step = (t) => { const x = clamp((t - 0.28) / 0.44); return x * x * (3 - 2 * x); };
  function pcUpdate() {
    if (reduce) return;
    const r = track.getBoundingClientRect(), vh = innerHeight, vw = innerWidth;
    const p = clamp(-r.top / (r.height - vh));
    if (p === pcState.p) return;
    pcState.p = p;
    const raw = p * (N - 1), i0 = Math.min(N - 2, Math.floor(raw));
    const f = i0 + step(raw - i0);
    pcState.f = f;
    const gap = Math.min(vw / (N + 1), 150), sy = vh * 0.38;
    for (let i = 0; i < N; i++) {
      const d = i - f, el = pEls[i];
      let x = 0, y = 0, s = 1, o = 1, rot = 0;
      if (d >= 1) { o = 0; y = -vh * 0.32; }
      else if (d > 0) { y = -d * vh * 0.32; o = 1 - d; rot = -d * 5; }
      else {
        const e = 1 - Math.pow(1 - Math.min(1, -d), 3);
        x = lerp(0, (i - (N - 1) / 2) * gap, e); y = lerp(0, sy, e); s = lerp(1, 0.3, e); o = lerp(1, 0.62, e);
      }
      el.style.opacity = o.toFixed(3);
      el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${s.toFixed(4)})`;
      const to = clamp(1 - Math.abs(f - i) * 2.4);
      tEls[i].style.opacity = to.toFixed(3);
      tEls[i].style.transform = `translateY(${((i - f) * 14).toFixed(1)}px)`;
      bEls[i].style.opacity = to.toFixed(3);
    }
    $("#pcRail").style.height = (p * 100).toFixed(2) + "%";
    $("#pcNum").textContent = String(Math.round(f) + 1).padStart(2, "0");
    $("#pcCue").style.opacity = p > 0.03 ? "0" : "1";
  }
  pcResize();

  let raf = 0;
  function frame() { raf = 0; creedUpdate(); pcUpdate(); }
  const kick = () => { if (!raf) raf = requestAnimationFrame(frame); };
  addEventListener("scroll", kick, { passive: true });
  addEventListener("resize", () => { pcResize(); kick(); });
  frame();
  // test hook: read the scrubbed state without poking internals
  window.__sumi = { pc: () => ({ ...pcState }), slide: () => slideI };

  /* ---------------- le stagioni: hover-tinted list ---------------- */
  const IMG = { branzino: "n-branzino", tonno: "n-tonno", trota: "n-salmone", gambero: "n-gambero", ikura: "n-ikura", anago: "n-anguilla" };
  const T = { white: "#e6e2d8", red: "#e8cfc6", pink: "#ecd6cc", orange: "#eed5c0", gold: "#ecdcb6", blue: "#d9dcd9", brown: "#e0d2bf", green: "#dfe0cd" };
  const SEASONS = {
    autunno: { label: "d'autunno", rows: [
      ["Branzino", "鱸", "suzuki", "Tirreno, all'amo", "Kobujime di una notte: l'alga gli presta sapidità e tiene la carne soda.", "branzino", T.white],
      ["Ricciola", "間八", "kanpachi", "Sicilia", "Grassa al punto giusto in autunno. Tagliata spessa, quasi un morso intero.", null, T.pink],
      ["Calamaro", "烏賊", "ika", "Mar Ligure", "Inciso fitto con il coltello perché si sciolga senza resistere.", null, T.white],
      ["Sgombro", "鯖", "saba", "Adriatico", "Tre ore di sale, venti minuti di aceto di riso. Il pezzo più antico del banco.", null, T.blue],
      ["Tonno rosso, akami", "赤身", "akami", "Isole Egadi", "Il magro, frollato sei giorni, passato nella soia per pochi secondi.", "tonno", T.red],
      ["Tonno, chūtoro", "中トロ", "chūtoro", "Isole Egadi", "La ventresca media: grasso e carne in parti uguali.", null, T.red],
      ["Trota salmonata", "鱒", "masu", "Trentino", "Leggermente salata, riposata un giorno. Al posto del salmone, che non serviamo.", "trota", T.orange],
      ["Gambero", "海老", "ebi", "Mazara del Vallo", "Cotto al momento, servito tiepido sul riso a temperatura corporea.", "gambero", T.orange],
      ["Mazzancolla", "車海老", "kuruma-ebi", "Tirreno", "Aperta a farfalla. La testa torna dopo, scottata alla piastra.", null, T.orange],
      ["Ricci di mare", "雲丹", "uni", "Sardegna", "Solo nei giorni in cui arrivano vivi. Altrimenti, niente.", null, T.gold],
      ["Uova di salmone", "いくら", "ikura", "Hokkaidō", "Marinate nel sake e nella soia, avvolte in una fetta di trota.", "ikura", T.orange],
      ["Grongo", "穴子", "anago", "Tirreno", "Cotto piano per un'ora, glassato con la sua salsa ridotta.", "anago", T.brown],
      ["Tamago", "玉子", "tamagoyaki", "—", "Frittata dolce cotta al forno con pasta di gambero. Si chiude così.", null, T.gold],
    ] },
    inverno: { label: "d'inverno", rows: [
      ["Rombo", "鮃", "hirame", "Adriatico", "Il pesce bianco dell'inverno, con un filo di sale e lime.", null, T.white],
      ["Seppia", "墨烏賊", "sumi-ika", "Chioggia", "Il nostro nome viene dal suo inchiostro. Incisa a rete, quasi croccante.", null, T.white],
      ["Sgombro", "鯖", "saba", "Adriatico", "Più grasso che in autunno: tre ore di sale bastano.", null, T.blue],
      ["Alice", "鰯", "iwashi", "Mar Ligure", "Marinata pochi minuti, con zenzero e cipollotto.", null, T.blue],
      ["Tonno rosso, akami", "赤身", "akami", "Isole Egadi", "Frollato fino a otto giorni quando il freddo lo permette.", "tonno", T.red],
      ["Tonno, ōtoro", "大トロ", "ōtoro", "Isole Egadi", "La ventresca grassa. Un pezzo solo, a metà percorso.", null, T.red],
      ["Gambero", "海老", "ebi", "Mazara del Vallo", "Cotto al momento, servito tiepido.", "gambero", T.orange],
      ["Capasanta", "帆立", "hotate", "Alto Adriatico", "Cruda, appena aperta, con un velo di salsa di soia.", null, T.white],
      ["Ricci di mare", "雲丹", "uni", "Puglia", "Il mese migliore. Gunkan con l'alga tostata sul fuoco.", null, T.gold],
      ["Uova di salmone", "いくら", "ikura", "Hokkaidō", "Marinate nel sake, avvolte nella trota.", "ikura", T.orange],
      ["Grongo", "穴子", "anago", "Tirreno", "Glassato con la sua salsa, il penultimo pezzo.", "anago", T.brown],
      ["Tamago", "玉子", "tamagoyaki", "—", "Frittata dolce con pasta di gambero.", null, T.gold],
    ] },
    primavera: { label: "di primavera", rows: [
      ["Pagello", "真鯛", "madai", "Tirreno", "La pelle scottata con acqua bollente, poi subito nel ghiaccio.", null, T.pink],
      ["Branzino", "鱸", "suzuki", "Tirreno, all'amo", "Kobujime, con le prime gemme di sanshō.", "branzino", T.white],
      ["Aguglia", "針魚", "sayori", "Adriatico", "Sottile e argentata, arriva solo per poche settimane.", null, T.blue],
      ["Calamaretto", "小烏賊", "ko-ika", "Mar Ligure", "Intero, ripieno di riso, cotto appena.", null, T.white],
      ["Tonno rosso, akami", "赤身", "akami", "Isole Egadi", "Più magro e più rosso in primavera.", "tonno", T.red],
      ["Trota salmonata", "鱒", "masu", "Trentino", "Leggermente salata, riposata un giorno.", "trota", T.orange],
      ["Gambero", "海老", "ebi", "Mazara del Vallo", "Cotto al momento.", "gambero", T.orange],
      ["Mazzancolla", "車海老", "kuruma-ebi", "Tirreno", "Aperta a farfalla davanti a voi.", null, T.orange],
      ["Vongola", "蛤", "hamaguri", "Goro", "Cotta nel suo brodo, glassata. Sa di mare e di primavera.", null, T.brown],
      ["Grongo", "穴子", "anago", "Tirreno", "Glassato con la sua salsa.", "anago", T.brown],
      ["Tamago", "玉子", "tamagoyaki", "—", "Frittata dolce con pasta di gambero.", null, T.gold],
    ] },
    estate: { label: "d'estate", rows: [
      ["Ricciola giovane", "鰤", "inada", "Sicilia", "Più magra che in autunno, servita con il suo grasso scottato.", null, T.pink],
      ["Polpo", "蛸", "tako", "Sardegna", "Massaggiato con sale, cotto in tè verde.", null, T.brown],
      ["Sgombro cavallo", "鯵", "aji", "Mar Ligure", "Con zenzero grattugiato e erba cipollina.", null, T.blue],
      ["Branzino", "鱸", "suzuki", "Tirreno, all'amo", "Il pesce dell'estate: tagliato sottile, quasi trasparente.", "branzino", T.white],
      ["Tonno rosso, akami", "赤身", "akami", "Isole Egadi", "Frollato quattro giorni, non di più con il caldo.", "tonno", T.red],
      ["Gambero", "海老", "ebi", "Mazara del Vallo", "Cotto al momento, servito tiepido.", "gambero", T.orange],
      ["Mazzancolla", "車海老", "kuruma-ebi", "Tirreno", "Aperta a farfalla.", null, T.orange],
      ["Ricci di mare", "雲丹", "uni", "Sardegna", "Fino a metà luglio, poi si ferma il fermo biologico.", null, T.gold],
      ["Uova di salmone", "いくら", "ikura", "Hokkaidō", "Marinate nel sake, avvolte nella trota.", "ikura", T.orange],
      ["Grongo", "穴子", "anago", "Tirreno", "Glassato con la sua salsa.", "anago", T.brown],
      ["Tamago", "玉子", "tamagoyaki", "—", "Frittata dolce con pasta di gambero.", null, T.gold],
    ] },
  };
  const NUMK = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二", "十三"];
  const stSec = $("#stagioni"), stList = $("#stList"), stSide = $(".st-side"), stCard = $("#stCard"), stCardIn = $("#stCardIn");
  let season = "autunno", stCur = -1, stSwapT = 0;
  const visual = (row) => row[5] ? `<img src="assets/${IMG[row[5]]}.webp" alt="" draggable="false">` : `<span class="kj">${row[1]}</span>`;
  function stRender() {
    const rows = SEASONS[season].rows;
    $("#stSub").textContent = `Esempio di percorso ${SEASONS[season].label} (cambia con il mercato)`;
    $$(".st-tabs [data-season]").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.season === season)));
    const tabId = "tab-" + season;
    $(`.st-tabs [data-season="${season}"]`).id = tabId;
    stList.setAttribute("aria-labelledby", tabId);
    stList.innerHTML = rows.map((r, i) => `<li><button type="button" class="st-row" data-i="${i}">
      <span class="no">${NUMK[i]}</span>
      <span class="nm">${r[0]}<small>${r[1]} · ${r[2]}</small></span>
      <span class="or">${r[3]}</span>
      <span class="thumb" aria-hidden="true">${visual(r)}</span>
    </button></li>`).join("");
    $$(".st-row", stList).forEach((b) => {
      const i = +b.dataset.i;
      b.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") stSelect(i); });
      b.addEventListener("focus", () => stSelect(i));
      b.addEventListener("click", () => stSelect(i));
    });
    stCur = -1;
    stSelect(0, true);
  }
  function stSelect(i, instant) {
    if (i === stCur) return;
    const dir = i > stCur ? 1 : -1;
    stCur = i;
    const row = SEASONS[season].rows[i];
    stSec.style.setProperty("--tint", row[6]);
    $$(".st-row", stList).forEach((b, k) => { b.classList.toggle("on", k === i); b.setAttribute("aria-pressed", String(k === i)); });
    const fill = () => {
      stCardIn.innerHTML = visual(row);
      $("#stJp").textContent = `${row[1]} · ${row[2]}`;
      $("#stNote").textContent = row[4];
      $("#stFrom").textContent = "Provenienza: " + row[3];
    };
    clearTimeout(stSwapT);
    if (instant || reduce) { fill(); stSide.classList.remove("swap"); return; }
    stCard.style.setProperty("--r", dir * 3 + "deg");
    setTimeout(() => stCard.style.setProperty("--r", "0deg"), 60);
    stSide.classList.add("swap");
    stSwapT = setTimeout(() => { fill(); stSide.classList.remove("swap"); }, 220);
  }
  $$(".st-tabs [data-season]").forEach((b) => b.addEventListener("click", () => { season = b.dataset.season; stRender(); }));
  $(".st-tabs").addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const tabs = $$(".st-tabs [data-season]"), k = tabs.findIndex((t) => t.dataset.season === season);
    const n = tabs[(k + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length];
    n.click(); n.focus();
  });
  {
    const m = romeNow().mo;
    season = m >= 9 && m <= 11 ? "autunno" : m === 12 || m <= 2 ? "inverno" : m <= 5 ? "primavera" : "estate";
  }
  stRender();

  /* ---------------- richiesta di prenotazione ---------------- */
  const rq = $("#rq"), sheet = $(".rq-sheet", rq), form = $("#rqForm");
  const formView = $("#rqFormView"), doneView = $("#rqDone");
  let opener = null, tried = false;
  const st = { date: null, slot: null, people: 2 };

  function openRq(e) {
    opener = e && e.currentTarget;
    if (!mnav.hidden) setMenu(false);
    if (!doneView.hidden) resetRq();
    buildCal();
    rq.hidden = false;
    document.documentElement.style.overflow = "hidden";
    sheet.scrollTop = 0;
    setTimeout(() => $(".rq-x", rq).focus(), 30);
  }
  function closeRq() {
    rq.hidden = true;
    document.documentElement.style.overflow = "";
    if (opener && document.contains(opener)) opener.focus();
  }
  $$(".js-open-rq").forEach((b) => b.addEventListener("click", openRq));
  rq.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeRq(); });
  addEventListener("keydown", (e) => {
    if (e.key === "Escape") { if (!rq.hidden) closeRq(); else if (!mnav.hidden) { setMenu(false); burger.focus(); } }
    if (e.key === "Tab" && !rq.hidden) {
      const f = $$("button:not(:disabled), input:not(:disabled), textarea, a[href]", sheet).filter((el) => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  // pseudo-random "completo" seatings so the calendar feels real but is deterministic
  const full = (day, slot) => { const n = day.getUTCDate() * 7 + day.getUTCMonth() * 13 + slot.length * 5; return n % 6 === 0; };
  const dayKey = (d) => d.toISOString().slice(0, 10);
  function buildCal() {
    const cal = $("#cal"), now = romeNow();
    const min = addDays(now.day, 1), max = addDays(now.day, 42);
    const first = addDays(min, -((min.getUTCDay() + 6) % 7)); // Monday of the week of the first bookable day (so a Sunday never opens on a fully greyed row)
    let html = ["lun", "mar", "mer", "gio", "ven", "sab", "dom"].map((d) => `<span class="cal-h" aria-hidden="true">${d}</span>`).join("");
    const lastMonthShown = addDays(first, 41);
    html = `<span class="cal-m">${MON_LONG[first.getUTCMonth()]}${first.getUTCMonth() !== lastMonthShown.getUTCMonth() ? " – " + MON_LONG[lastMonthShown.getUTCMonth()] : ""} ${lastMonthShown.getUTCFullYear()}</span>` + html;
    for (let k = 0; k < 42; k++) {
      const d = addDays(first, k), key = dayKey(d), dow = d.getUTCDay();
      const past = d < min || d > max, hol = holiday(d), closed = !SCHED[dow].length;
      const dis = past || hol || closed;
      const small = past ? "" : hol ? "ferie" : closed ? "chiuso" : (d.getUTCDate() === 1 || k === 0 ? MON_IT[d.getUTCMonth()] : "");
      const label = `${DOW_LONG[dow]} ${d.getUTCDate()} ${MON_LONG[d.getUTCMonth()]}${hol ? ", ferie" : closed ? ", chiuso" : past ? ", non disponibile" : ""}`;
      html += `<button type="button" class="cal-d" data-day="${key}" aria-label="${label}" aria-pressed="${st.date === key}" ${dis ? "disabled" : ""}>${d.getUTCDate()}${small ? `<small>${small}</small>` : ""}</button>`;
    }
    cal.innerHTML = html;
    if (st.date && $(`.cal-d[data-day="${st.date}"]`, cal)?.disabled) st.date = null;
    syncSlots();
  }
  $("#cal").addEventListener("click", (e) => {
    const b = e.target.closest(".cal-d");
    if (!b || b.disabled) return;
    st.date = b.dataset.day;
    $$(".cal-d", $("#cal")).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    syncSlots();
    if (tried) validate();
  });
  function syncSlots() {
    const day = st.date ? new Date(st.date + "T00:00:00Z") : null;
    $$("#slots input").forEach((inp) => {
      const isFull = !!day && full(day, inp.value);
      inp.disabled = isFull;
      const span = inp.nextElementSibling;
      span.title = isFull ? "Completo" : "";
      span.setAttribute("aria-label", isFull ? span.textContent + " — completo" : "");
      if (isFull && inp.checked) { inp.checked = false; st.slot = null; }
    });
  }
  $("#slots").addEventListener("change", (e) => { st.slot = e.target.value; if (tried) validate(); });

  const pOut = $("#pOut");
  function setPeople(n) {
    st.people = clamp(n, 1, 6);
    pOut.textContent = st.people;
    $("#pMinus").disabled = st.people <= 1;
    $("#pPlus").disabled = st.people >= 6;
    $("#pHint").textContent = `€ ${(PRICE * st.people).toLocaleString("it-IT")} in totale, bevande escluse. Oltre 6 persone: telefonateci.`;
  }
  $("#pMinus").addEventListener("click", () => setPeople(st.people - 1));
  $("#pPlus").addEventListener("click", () => { if (st.people >= 6) toast("Per più di 6 persone chiamateci: 055 271 8840"); setPeople(st.people + 1); });
  setPeople(2);

  form.addEventListener("change", (e) => {
    if (e.target.name === "allergy") $("#alMore").hidden = e.target.value !== "si";
    if (tried) validate();
  });
  form.addEventListener("input", () => { if (tried) validate(); });

  function setErr(key, msg) {
    const el = $(`[data-err="${key}"]`, form);
    if (el) el.textContent = msg || "";
    return msg ? key : null;
  }
  function validate() {
    const bad = [];
    const name = $("#fName").value.trim(), tel = $("#fTel").value.trim(), mail = $("#fMail").value.trim();
    const allergy = (form.querySelector('input[name="allergy"]:checked') || {}).value;
    const chips = $$('input[name="al"]:checked', form).map((x) => x.value), alText = $("#alText").value.trim();
    bad.push(setErr("date", st.date ? "" : "Scegliete un giorno: quelli in grigio sono chiusi o non ancora aperti alle richieste."));
    bad.push(setErr("slot", st.slot ? "" : "Scegliete pranzo o uno dei due turni di cena."));
    bad.push(setErr("allergy", !allergy ? "Diteci se ci sono allergie — anche solo «Nessuna»." : allergy === "si" && !chips.length && alText.length < 3 ? "Indicate almeno un'allergia, oppure scegliete «Nessuna»." : ""));
    bad.push(setErr("name", /\S{2,}\s+\S{2,}/.test(name) ? "" : "Nome e cognome di chi siede al banco."));
    const digits = tel.replace(/\D/g, "");
    bad.push(setErr("tel", /^[+\d\s().-]+$/.test(tel) && digits.length >= 8 && digits.length <= 15 ? "" : "Un numero valido: vi chiamiamo lì per confermare."));
    bad.push(setErr("mail", !mail || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(mail) ? "" : "Indirizzo e-mail non valido (oppure lasciatelo vuoto)."));
    bad.push(setErr("agree", $("#fAgree").checked ? "" : "Serve la vostra conferma per inviare la richiesta."));
    $("#fName").closest(".fld").classList.toggle("bad", bad.includes("name"));
    $("#fTel").closest(".fld").classList.toggle("bad", bad.includes("tel"));
    $("#fMail").closest(".fld").classList.toggle("bad", bad.includes("mail"));
    $("#cal").closest(".rq-f").classList.toggle("bad", bad.includes("date"));
    $("#slots").closest(".rq-f").classList.toggle("bad", bad.includes("slot"));
    return bad.filter(Boolean);
  }
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    tried = true;
    const bad = validate();
    if (bad.length) {
      toast(bad.length === 1 ? "Manca ancora un dettaglio." : `Mancano ancora ${bad.length} dettagli.`);
      const target = { date: ".cal-d:not(:disabled)", slot: "#slots input:not(:disabled)", allergy: 'input[name="allergy"]', name: "#fName", tel: "#fTel", mail: "#fMail", agree: "#fAgree" }[bad[0]];
      const el = $(target, form);
      if (el) { el.focus({ preventScroll: true }); el.closest(".rq-f, .fld, .agree")?.scrollIntoView({ block: "center", behavior: reduce ? "auto" : "smooth" }); }
      return;
    }
    printSlip();
  });

  function resetRq() {
    form.reset(); tried = false;
    st.date = null; st.slot = null; setPeople(2);
    $("#alMore").hidden = true;
    $$("[data-err]", form).forEach((x) => (x.textContent = ""));
    $$(".bad", form).forEach((x) => x.classList.remove("bad"));
    formView.hidden = false; doneView.hidden = true;
    $("#doneActs").classList.remove("is-on");
    buildCal();
  }
  $("#rqAgain").addEventListener("click", () => { resetRq(); sheet.scrollTop = 0; $(".rq-x", rq).focus(); });

  /* receipt-print-stamp: a washi slip feeds out of a lacquer slot, then the vermilion seal lands */
  const sleep = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));
  function tween(el, frames, o) {
    const a = el.animate(frames, { fill: "both", ...o, duration: reduce ? 1 : o.duration });
    return a.finished.then(() => {
      const last = frames[frames.length - 1];
      for (const k in last) if (k !== "offset" && k !== "easing") el.style[k] = last[k];
      a.cancel();
    }).catch(() => {});
  }
  const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  let busy = false;
  async function printSlip() {
    if (busy) return; busy = true;
    const day = new Date(st.date + "T00:00:00Z");
    const slotTxt = { pranzo: "Pranzo · 12:30", cena1: "Cena · 19:00", cena2: "Cena · 21:15" }[st.slot];
    const allergy = (form.querySelector('input[name="allergy"]:checked') || {}).value;
    const al = allergy === "si" ? [...$$('input[name="al"]:checked', form).map((x) => x.value), $("#alText").value.trim()].filter(Boolean).join(", ") : "Nessuna";
    const tel = $("#fTel").value.trim(), digits = tel.replace(/\D/g, "");
    const masked = "··· ··· " + digits.slice(-4, -2) + " " + digits.slice(-2);
    const no = `SM-${String(day.getUTCMonth() + 1).padStart(2, "0")}${String(day.getUTCDate()).padStart(2, "0")}-${String(100 + Math.floor(Math.random() * 900))}`;
    const today = romeNow();
    $("#slip").innerHTML = `
      <div class="slip-brand">鮨すみ<small>FIRENZE</small></div>
      <div class="slip-kick">RICHIESTA DI PRENOTAZIONE</div>
      <hr>
      <div class="slip-r"><span>GIORNO</span><span>${DOW_LONG[day.getUTCDay()]} ${day.getUTCDate()} ${MON_LONG[day.getUTCMonth()]}</span></div>
      <div class="slip-r"><span>SERVIZIO</span><span>${slotTxt}</span></div>
      <div class="slip-r"><span>PERSONE</span><span>${st.people}</span></div>
      <div class="slip-r"><span>ALLERGIE</span><span>${esc(al)}</span></div>
      <div class="slip-r"><span>NOME</span><span>${esc($("#fName").value.trim())}</span></div>
      <div class="slip-r"><span>TELEFONO</span><span>${masked}</span></div>
      <hr>
      <div class="slip-tot"><span>OMAKASE ${st.people} × € ${PRICE}</span><b>€ ${(PRICE * st.people).toLocaleString("it-IT")}</b></div>
      <p class="slip-st">In attesa della nostra telefonata. Bevande a parte.</p>
      <div class="slip-no">${no}</div>
      <svg class="slip-stamp" id="slipStamp" viewBox="0 0 104 104" aria-hidden="true">
        <defs><path id="sRing" d="M52 52 m-40 0 a40 40 0 1 1 80 0 a40 40 0 1 1 -80 0"/>
          <filter id="sInk" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="5" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.4"/><feComponentTransfer><feFuncA type="table" tableValues="0 .78 .93"/></feComponentTransfer></filter></defs>
        <g filter="url(#sInk)" fill="none" stroke="#b3322b" color="#b3322b">
          <circle cx="52" cy="52" r="49" stroke-width="3"/><circle cx="52" cy="52" r="33" stroke-width="1.3"/>
          <text fill="currentColor" stroke="none" font-family="Shippori Mincho, serif" font-size="7.6" font-weight="700" letter-spacing="1.4"><textPath href="#sRing">RICHIESTA RICEVUTA · SUMI · FIRENZE ·</textPath></text>
          <text x="52" y="60" text-anchor="middle" fill="currentColor" stroke="none" font-family="Yuji Boku, serif" font-size="25">受付</text>
          <text x="52" y="73" text-anchor="middle" fill="currentColor" stroke="none" font-family="Shippori Mincho, serif" font-size="6.6" letter-spacing=".8">${String(today.d).padStart(2, "0")}·${String(today.mo).padStart(2, "0")}·${today.y}</text>
        </g>
      </svg>`;
    formView.hidden = true; doneView.hidden = false;
    sheet.scrollTop = 0;
    const slip = $("#slip"), stamp = $("#slipStamp"), cap = $("#slipCap"), acts = $("#doneActs");
    acts.classList.remove("is-on");
    cap.textContent = "Stiamo registrando la richiesta…";
    const H = slip.offsetHeight;
    $(".slip-feed").style.setProperty("--fh", H + 12 + "px");
    slip.style.transform = "translateY(-101%)";
    await sleep(380);
    // speed-modulated feed: surges and hesitates like a print head, never backs up
    await new Promise((res) => {
      const dur = reduce ? 1 : 2100, t0 = performance.now(), n = 19, k = .7;
      const stepF = (now) => {
        const t = Math.min(1, (now - t0) / dur);
        const q = t - k * Math.sin(2 * Math.PI * n * t) / (2 * Math.PI * n);
        const p = 1 - Math.pow(1 - q, 1.25);
        slip.style.transform = `translate(${(t < 1 ? (Math.random() - .5) * .6 : 0).toFixed(2)}px, ${(-H * (1 - p)).toFixed(2)}px)`;
        t < 1 ? requestAnimationFrame(stepF) : res();
      };
      requestAnimationFrame(stepF);
    });
    await tween(slip, [{ transform: "translate(0,0) rotate(0)" }, { transform: "translate(0,4px) rotate(.7deg)", offset: .45 }, { transform: "translate(0,2px) rotate(-.25deg)", offset: .75 }, { transform: "translate(0,3px) rotate(0)" }], { duration: 480, easing: "ease-out" });
    await sleep(120);
    const land = tween(stamp, [
      { opacity: 0, transform: "scale(2.3) rotate(-30deg)", filter: "blur(4px)" },
      { opacity: .95, transform: "scale(.94) rotate(-10deg)", filter: "blur(0px)", offset: .72 },
      { opacity: .9, transform: "scale(1) rotate(-12deg)", filter: "blur(0px)" }], { duration: 280, easing: "cubic-bezier(.5,0,.75,0)" });
    setTimeout(() => tween(slip, [{ transform: "translate(0,3px)" }, { transform: "translate(0,6px)", offset: .35 }, { transform: "translate(0,3px)" }], { duration: 200, easing: "ease-out" }), reduce ? 0 : 200);
    await land;
    stamp.style.filter = "none";
    cap.textContent = `Richiesta ricevuta. Vi chiamiamo entro 24 ore al ${masked} per confermare.`;
    await sleep(200);
    acts.classList.add("is-on");
    busy = false;
    window.__sumi.lastRequest = { no, date: st.date, slot: st.slot, people: st.people, allergy: al };
  }
})();
