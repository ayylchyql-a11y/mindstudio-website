/* Marumaru · sushi a nastro — all data and behaviour, no libraries.
   Runs inside a sandboxed iframe (no same-origin): never touches storage, never alerts. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const RM = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const mobileMQ = matchMedia("(max-width: 899px)");
  const eur = (v) => v.toFixed(2).replace(".", ",");
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const quart = (p) => 1 - Math.pow(1 - p, 4);
  const hash = (s) => { let h = 2166136261; for (const c of s) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; };
  const rng = (seed) => () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  const hhmm = (m) => { m = ((m % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ================= DATA ================= */
  const PLATES = {
    r: { k: "r", name: "rosso", price: 1.9, c: "var(--p1)" },
    g: { k: "g", name: "giallo", price: 2.9, c: "var(--p2)" },
    b: { k: "b", name: "blu", price: 3.9, c: "var(--p3)" },
    n: { k: "n", name: "nero", price: 4.9, c: "var(--p4)" },
  };
  const PLURAL = { r: "rossi", g: "gialli", b: "blu", n: "neri" };
  const CATS = [["nigiri", "Nigiri"], ["gunkan", "Gunkan e temaki"], ["maki", "Maki"], ["sashimi", "Sashimi e tartare"], ["caldi", "Caldi"], ["dolci", "Dolci"]];
  const A = (n) => "assets/" + n + ".webp";
  const MENU = [
    ["salmone", "Nigiri di salmone", "Salmone norvegese su riso tiepido, due pezzi.", "r", "nigiri", "p-nigiri-salmone"],
    ["aburi", "Nigiri di salmone scottato", "Scottato alla fiamma, maionese al lime e cipollotto.", "r", "nigiri", "r-nigiri-salmone-2"],
    ["branzino", "Nigiri di branzino", "Branzino dell'Adriatico con una goccia di yuzu.", "r", "nigiri", "p-nigiri-branzino"],
    ["gamberocotto", "Nigiri di gambero cotto", "Gambero bollito e aperto a farfalla, due pezzi.", "r", "nigiri", "p-gambero-cotto"],
    ["cetriolo", "Hosomaki al cetriolo", "Sei pezzi, cetriolo croccante e sesamo tostato.", "r", "maki", "p-hoso-cetriolo"],
    ["edamame", "Edamame", "Fagioli di soia al vapore con sale di Cervia.", "r", "caldi", "p-edamame"],
    ["gyoza", "Gyoza di maiale", "Tre ravioli piastrati, salsa ponzu a parte.", "r", "caldi", "p-gyoza"],
    ["miso", "Zuppa di miso", "Miso bianco, tofu e alga wakame.", "r", "caldi", "p-miso"],
    ["mochi", "Mochi assortiti", "Tre mochi: vaniglia, tè matcha e sesamo nero.", "r", "dolci", "p-mochi"],
    ["tonno", "Nigiri di tonno", "Tonno pinna gialla, taglio akami, due pezzi.", "g", "nigiri", "p-nigiri-tonno"],
    ["anguilla", "Nigiri di anguilla", "Anguilla glassata con salsa kabayaki.", "g", "nigiri", "p-nigiri-anguilla"],
    ["gunkansalmone", "Gunkan salmone e ikura", "Salmone a cubetti e uova di salmone.", "g", "gunkan", "p-gunkan-salmon-ikura"],
    ["temaki", "Temaki di salmone", "Cono di alga con salmone, avocado e asparago.", "g", "gunkan", "p-temaki-salmone"],
    ["urasalmone", "Uramaki salmone e avocado", "Otto pezzi, sesamo e maionese leggera.", "g", "maki", "p-ura-salmone"],
    ["tempura", "Tempura mista", "Gamberi e verdure in pastella, fritti al momento.", "g", "caldi", "p-tempura", 1],
    ["xiaolong", "Xiao long bao", "Tre ravioli in brodo, da mangiare caldi.", "g", "caldi", "p-xiao-long-bao"],
    ["dorayaki", "Dorayaki", "Due pancake con crema di fagioli azuki.", "g", "dolci", "p-dorayaki"],
    ["gamberorosso", "Nigiri di gambero rosso", "Gambero rosso crudo di Mazara, testa fritta a parte.", "b", "nigiri", "p-nigiri-gambero-rosso", 1],
    ["tartufo", "Ricciola al tartufo", "Ricciola scottata e lamelle di tartufo nero.", "b", "nigiri", "p-nigiri-tartufo"],
    ["tartare", "Tartare di tonno in coppa", "Tonno al coltello, avocado e salsa ponzu.", "b", "sashimi", "r-tartare-coppe"],
    ["tristartare", "Tris di tartare", "Salmone, tonno e ricciola su ardesia.", "b", "sashimi", "r-tartare-ardesia", 1],
    ["tiger", "Tiger roll", "Gambero in tempura, salmone scottato, teriyaki.", "b", "maki", "p-tiger-maki"],
    ["crispy", "Uramaki crispy tuna", "Tonno piccante e granella croccante.", "b", "maki", "p-ura-crispy-tuna"],
    ["sashsalmone", "Sashimi di salmone", "Cinque fette, limone e daikon.", "b", "sashimi", "p-sashimi-salmone"],
    ["kataifi", "Ebi kataifi", "Gamberi avvolti nella pasta kataifi, fritti.", "b", "caldi", "p-ebi-kataifi"],
    ["sashtonno", "Sashimi di tonno", "Cinque fette di tonno akami tagliato al banco.", "n", "sashimi", "p-sashimi-tonno"],
    ["sashvetro", "Sashimi nel ghiaccio", "Ricciola, tonno e capasanta su ghiaccio tritato.", "n", "sashimi", "r-sashimi-vetro", 1],
    ["sashmisto", "Sashimi misto del giorno", "Il pesce che arriva la mattina, sette fette.", "n", "sashimi", "r-sashimi-piatto"],
    ["tataki", "Tataki di salmone", "Salmone scottato in crosta di sesamo.", "n", "sashimi", "p-tataki-salmone"],
    ["rainbow", "Rainbow roll", "Granchio e avocado, sopra pesce misto.", "n", "maki", "p-rainbow-maki"],
    ["dragon", "Dragon roll", "Anguilla e avocado a scaglie, salsa unagi.", "n", "maki", "p-dragon-maki"],
    ["capesante", "Uramaki alle capesante", "Capasanta scottata e maionese al lime.", "n", "maki", "p-capesante-maki", 1],
    ["ikura", "Gunkan di ikura", "Uova di salmone marinate nella soia.", "n", "gunkan", "p-gunkan-ikura", 1],
    ["ramen", "Ramen ai gamberi", "Brodo di gamberi, uovo marinato e noodles.", "n", "caldi", "p-ramen-gamberi"],
  ].map(([id, n, d, p, c, img, lim]) => ({ id, n, d, p, c, img: A(img), lim: !!lim }));
  const BY = Object.fromEntries(MENU.map((m) => [m.id, m]));

  const BANNERS = [
    { brush: "鮭まつり", kick: "Fino al 23 novembre", h: "Settimana del salmone", p: "Il nigiri di salmone torna su piatto rosso: due pezzi, tutta la settimana, in tutti i ristoranti.", price: "1,90", plate: "r", img: "b-salmone", go: { plate: "r", cat: "nigiri" } },
    { brush: "天ぷら祭", kick: "Tutti i giorni dalle 18:30", h: "Festa della tempura", p: "Gamberi e verdure in pastella leggera, fritti al momento e mandati sul nastro ogni dieci minuti.", price: "2,90", plate: "g", img: "b-tempura", go: { plate: "g", cat: "caldi" } },
    { brush: "赤海老", kick: "Fino a esaurimento", h: "Gambero rosso di Mazara", p: "Crudo, due pezzi per piatto. Al massimo due piatti a persona, finché ce n'è.", price: "3,90", plate: "b", img: "b-gambero", go: { plate: "b", cat: "nigiri" } },
    { brush: "本鮪", kick: "Dal 17 al 30 novembre", h: "Il tonno della settimana", p: "Sashimi di tonno akami tagliato al banco davanti a te: cinque fette su piatto nero.", price: "4,90", plate: "n", img: "b-sashimi", go: { plate: "n", cat: "sashimi" } },
  ];
  const RECS = [
    ["urasalmone", "裏巻", "r-uramaki", "Il più preso sul nastro"],
    ["ikura", "いくら", "r-gunkan-ikura", "Solo il fine settimana"],
    ["sashvetro", "氷の刺身", "r-sashimi-vetro", "Nuovo, a tempo"],
    ["tristartare", "三色", "r-tartare-ardesia", "Da dividere in due"],
    ["tartare", "鮪", "r-tartare-coppe", "Tagliato al coltello"],
    ["aburi", "炙り", "r-nigiri-salmone-2", "Scottato al momento"],
    ["sashmisto", "刺身盛", "r-sashimi-piatto", "Il pesce di stamattina"],
  ];

  // hours per weekday (0 = domenica) as [open, close] minutes; close > 1440 runs past midnight
  const D = (...a) => a;
  const wk = (sun, mon, tue, wed, thu, fri, sat) => [sun, mon, tue, wed, thu, fri, sat];
  const SPLIT = [[690, 900], [1110, 1410]];
  const STORES = [
    { id: "pd-centro", name: "Padova Centro", city: "Padova", addr: "Via San Fermo 41, 35137 Padova", tel: "049 870 4412", load: 1.3, fac: ["accessibile", "bambini"],
      h: wk([[720, 1410]], SPLIT, SPLIT, SPLIT, SPLIT, [[690, 900], [1110, 1470]], [[690, 900], [1110, 1470]]) },
    { id: "pd-arcella", name: "Padova Arcella", city: "Padova", addr: "Via Tiziano Aspetti 118, 35133 Padova", tel: "049 870 5530", load: 1.0, fac: ["parcheggio", "accessibile", "bambini", "armadietti"],
      h: wk(...Array(7).fill([[690, 1380]])) },
    { id: "abano", name: "Abano Terme", city: "Abano Terme", addr: "Viale delle Terme 64, 35031 Abano Terme", tel: "049 866 2209", load: 0.7, fac: ["parcheggio", "bambini"],
      h: wk([[720, 870], [1140, 1380]], [], [[720, 870], [1140, 1380]], [[720, 870], [1140, 1380]], [[720, 870], [1140, 1380]], [[720, 870], [1140, 1380]], [[720, 870], [1140, 1380]]) },
    { id: "vicenza", name: "Vicenza Stadio", city: "Vicenza", addr: "Viale dello Stadio 9, 36100 Vicenza", tel: "0444 512 870", load: 1.1, fac: ["parcheggio", "accessibile", "armadietti"],
      h: wk(SPLIT, SPLIT, SPLIT, SPLIT, SPLIT, SPLIT, [[690, 900], [1110, 1440]]) },
    { id: "treviso", name: "Treviso Fiera", city: "Treviso", addr: "Viale della Repubblica 205, 31100 Treviso", tel: "0422 330 615", load: 1.0, fac: ["parcheggio", "accessibile", "bambini"],
      h: wk([[690, 1410]], [[690, 1410]], [[690, 1410]], [[690, 1410]], [[690, 1410]], [[690, 1500]], [[690, 1500]]) },
    { id: "mestre", name: "Mestre", city: "Venezia Mestre", addr: "Via Piave 72, 30171 Venezia Mestre", tel: "041 950 2271", load: 1.2, fac: ["accessibile", "armadietti"],
      h: wk(...Array(7).fill([[660, 1380]])) },
  ];
  const SBY = Object.fromEntries(STORES.map((s) => [s.id, s]));
  const FACETS = [["aperto", "Aperto adesso"], ["parcheggio", "Parcheggio"], ["accessibile", "Accesso senza gradini"], ["bambini", "Seggiolone e fasciatoio"], ["armadietti", "Armadietti per l'asporto"]];
  const DAYS = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  const DAYS_SHORT = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

  const NEWS = [
    ["2026.11.12", "Ristoranti", "Treviso Fiera: il venerdì e il sabato restiamo aperti fino all'una.", "#ristoranti"],
    ["2026.11.11", "Menu", "Arriva il gambero rosso di Mazara: €3,90 a piatto, fino a esaurimento.", "#consigliati"],
    ["2026.11.10", "Promo", "Settimana del salmone: il nigiri torna a €1,90 fino al 23 novembre.", "#consigliati"],
    ["2026.11.05", "Ristoranti", "Vicenza Stadio: nuovi armadietti per ritirare l'asporto senza fare la fila.", "#ristoranti"],
    ["2026.10.28", "Lavora con noi", "Cerchiamo personale di sala e di cucina a Padova e a Mestre.", "job"],
  ];

  /* ================= TIME (Europe/Rome) ================= */
  let nowOverride = null;
  const fmtRome = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  function romeNow() {
    const parts = Object.fromEntries(fmtRome.formatToParts(nowOverride || new Date()).map((p) => [p.type, p.value]));
    return { dow: WD[parts.weekday], min: (+parts.hour % 24) * 60 + +parts.minute };
  }
  function statusAt(store, dow, min) {
    for (const [s, e] of store.h[dow]) if (min >= s && min < e) return { open: true, until: e, text: "Aperto fino alle " + hhmm(e) };
    const y = (dow + 6) % 7;
    for (const [, e] of store.h[y]) if (e > 1440 && min < e - 1440) return { open: true, until: e - 1440, text: "Aperto fino alle " + hhmm(e) };
    for (const [s] of store.h[dow]) if (s > min) return { open: false, next: { d: 0, m: s }, text: "Chiuso · apre alle " + hhmm(s), short: "apre alle " + hhmm(s) };
    for (let k = 1; k <= 7; k++) {
      const d = (dow + k) % 7;
      if (store.h[d].length) {
        const s = store.h[d][0][0];
        const when = k === 1 ? "domani" : DAYS[d];
        return { open: false, next: { d: k, m: s }, text: "Chiuso · apre " + when + " alle " + hhmm(s), short: "apre " + when + " alle " + hhmm(s) };
      }
    }
    return { open: false, text: "Chiuso" };
  }
  const status = (store) => { const n = romeNow(); return statusAt(store, n.dow, n.min); };
  const hoursText = (store, dow) => store.h[dow].length ? store.h[dow].map(([s, e]) => hhmm(s) + "–" + hhmm(e)).join(" · ") : "chiuso";

  // simulated queue: two peaks (13:15 and 20:30), scaled by how busy the store is
  function queueAt(store, min, open) {
    if (!open) return { groups: Math.round(store.load * 3), banco: 0, box: 0 };
    const pk = Math.max(Math.exp(-(((min - 795) / 55) ** 2)), Math.exp(-(((min - 1230) / 70) ** 2)));
    const groups = Math.round(store.load * (1.5 + 9 * pk));
    return { groups, banco: Math.round(groups * 1.6 + 2), box: Math.round(groups * 3.2 + 4) };
  }
  const queue = (store) => { const n = romeNow(); return queueAt(store, n.min, status(store).open); };
  const soldOut = (storeId, itemId) => storeId ? (hash(storeId + "/" + itemId) % 100) < (BY[itemId].lim ? 34 : 8) : false;

  /* ================= ODOMETER (one clock per figure) ================= */
  const odoAnims = new WeakMap();
  const STRIP = Array.from({ length: 20 }, (_, i) => "<b>" + (i % 10) + "</b>").join("");
  function odo(el, text, { spin = false, dur = 900, stagger = 70 } = {}) {
    const prev = el.dataset.value || "";
    el.dataset.value = text;
    el.setAttribute("aria-label", text);
    const chars = [...text];
    el.innerHTML = chars.map((ch) => /\d/.test(ch) ? '<span class="mm-odo-col" aria-hidden="true"><span class="mm-odo-strip">' + STRIP + "</span></span>" : '<span class="mm-odo-ch" aria-hidden="true">' + esc(ch) + "</span>").join("");
    const strips = $$(".mm-odo-strip", el);
    const digitsIdx = chars.map((c, i) => /\d/.test(c) ? i : -1).filter((i) => i >= 0);
    const plan = digitsIdx.map((ci, k) => {
      const d = +chars[ci];
      const fromRight = chars.length - 1 - ci;
      const pc = prev[prev.length - 1 - fromRight];
      let start = /\d/.test(pc || "") ? +pc : 0;
      let end = d >= start ? d : d + 10;
      if (spin) end += 10;
      if (!spin && pc === chars[ci]) start = end = d;
      return { s: strips[k], start, end };
    });
    const apply = (pos, s) => { s.style.transform = "translateY(" + (-pos).toFixed(3) + "em)"; };
    cancelAnimationFrame(odoAnims.get(el) || 0);
    if (RM || !plan.some((p) => p.start !== p.end)) { plan.forEach((p) => apply(p.end % 10 === p.end ? p.end : p.end, p.s)); el.dataset.done = "1"; return; }
    el.dataset.done = "0";
    const n = plan.length, total = dur + stagger * (n - 1);
    plan.forEach((p) => apply(p.start, p.s));
    const t0 = performance.now();
    const f = (now) => {
      const t = now - t0;
      // columns further right start later and travel the same window: the figure settles left → right
      plan.forEach((p, k) => apply(p.start + (p.end - p.start) * quart(clamp((t - k * stagger) / dur, 0, 1)), p.s));
      if (t < total) odoAnims.set(el, requestAnimationFrame(f)); else el.dataset.done = "1";
    };
    odoAnims.set(el, requestAnimationFrame(f));
  }

  /* ================= TOAST ================= */
  const toastEl = $("#toast"); let toastT = 0;
  // with a dialog open the toast sits just above the dialog's footer (never over its title or its buttons)
  function placeToast() {
    const m = document.querySelector(".mm-modal:not([hidden])"), st = toastEl.style;
    if (!m) { st.bottom = st.left = ""; return; }
    const card = m.querySelector(".mm-modal-card, .mm-cart-panel"), foot = m.querySelector(".mm-modal-foot, .mm-cart-foot");
    if (!card) { st.bottom = st.left = ""; return; }
    const cr = card.getBoundingClientRect(), vh = window.innerHeight;
    const edge = foot && foot.offsetParent ? foot.getBoundingClientRect().top : (vh - cr.bottom >= 64 ? cr.bottom + 58 : cr.bottom);
    st.bottom = Math.max(12, vh - edge + 10) + "px";
    st.left = (cr.left + cr.width / 2) + "px";
  }
  function toast(msg) { toastEl.textContent = msg; placeToast(); toastEl.classList.add("is-on"); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("is-on"), 2800); }

  /* ================= HERO · FLIP STACK ================= */
  const stack = $("#stack"), heroDots = $("#heroDots"), heroCount = $("#heroCount"), heroPlay = $("#heroPlay");
  const banners = BANNERS.map((b, i) => {
    const el = document.createElement("article");
    el.className = "mm-bn"; el.dataset.idx = i;
    el.setAttribute("aria-roledescription", "promozione");
    el.setAttribute("aria-label", (i + 1) + " di " + BANNERS.length + ": " + b.h);
    el.innerHTML = '<img class="mm-bn-img" src="' + A(b.img) + '" alt="" ' + (i ? 'loading="lazy"' : 'fetchpriority="high"') + ' draggable="false">' +
      '<div class="mm-bn-shade"></div>' +
      '<p class="mm-bn-brush" aria-hidden="true">' + b.brush + "</p>" +
      '<div class="mm-bn-price" style="--pc:' + PLATES[b.plate].c + '"><i class="mm-pl" aria-hidden="true"></i><small>UN PIATTO · ' + PLATES[b.plate].name.toUpperCase() + '</small><strong><em>€</em><span class="mm-odo" data-price>' + b.price + "</span></strong></div>" +
      '<div class="mm-bn-copy"><span class="mm-bn-kick">' + b.kick + "</span><h3>" + b.h + "</h3><p>" + b.p + '</p><button class="mm-bn-cta" type="button" data-bn-go="' + i + '">Vedi nel menu<i aria-hidden="true"></i></button></div>';
    stack.appendChild(el);
    return el;
  });
  heroDots.innerHTML = BANNERS.map((b, i) => '<button type="button" role="tab" aria-label="' + esc(b.h) + '" aria-selected="' + (i ? "false" : "true") + '" data-i="' + i + '"></button>').join("");
  let order = banners.slice(), flipping = false, heroAuto = !RM, heroTimer = 0;
  function layoutStack() {
    order.forEach((el, i) => { el.style.setProperty("--i", i); el.style.zIndex = 10 - i; el.inert = i !== 0; el.setAttribute("aria-hidden", i ? "true" : "false"); });
    const front = +order[0].dataset.idx;
    $$("button", heroDots).forEach((b, i) => b.setAttribute("aria-selected", i === front ? "true" : "false"));
    heroCount.textContent = String(front + 1).padStart(2, "0") + " / " + String(BANNERS.length).padStart(2, "0");
  }
  function frontPrice() { const el = $("[data-price]", order[0]); odo(el, BANNERS[+order[0].dataset.idx].price, { spin: true, dur: 950, stagger: 90 }); }
  // the front n cards swing open on their left hinge; once past 90° nobody sees their face, so they go to the back
  function flipForward(n = 1) {
    if (flipping || n < 1) return;
    flipping = true;
    const fronts = order.slice(0, n);
    fronts.forEach((el) => el.classList.add("is-open"));
    setTimeout(() => {
      fronts.forEach((el) => { el.classList.add("is-reset"); el.classList.remove("is-open"); el.style.opacity = "0"; });
      order = order.slice(n).concat(fronts); layoutStack(); frontPrice();
      requestAnimationFrame(() => requestAnimationFrame(() => { fronts.forEach((el) => { el.classList.remove("is-reset"); el.style.opacity = ""; }); flipping = false; }));
    }, RM ? 0 : 420);
  }
  function flipBack() {
    if (flipping) return;
    flipping = true;
    const last = order[order.length - 1];
    last.classList.add("is-reset", "is-open");
    order = [last].concat(order.slice(0, -1)); layoutStack();
    last.getBoundingClientRect();
    requestAnimationFrame(() => { last.classList.remove("is-reset"); requestAnimationFrame(() => { last.classList.remove("is-open"); frontPrice(); setTimeout(() => { flipping = false; }, RM ? 0 : 600); }); });
  }
  function heroGo(target) { const pos = order.findIndex((el) => +el.dataset.idx === target); if (pos > 0) flipForward(pos); }
  function heroArm() { clearTimeout(heroTimer); if (heroAuto) heroTimer = setTimeout(() => { if (heroVisible && !document.hidden) flipForward(1); heroArm(); }, 5200); }
  let heroVisible = true;
  new IntersectionObserver((es) => { heroVisible = es[0].isIntersecting; }).observe($("#heroStage"));
  heroDots.addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; heroGo(+b.dataset.i); heroArm(); });
  heroPlay.addEventListener("click", () => {
    heroAuto = !heroAuto;
    heroPlay.dataset.state = heroAuto ? "play" : "pause";
    heroPlay.setAttribute("aria-label", heroAuto ? "Metti in pausa" : "Riprendi");
    heroArm();
  });
  if (!heroAuto) { heroPlay.dataset.state = "pause"; heroPlay.setAttribute("aria-label", "Riprendi"); }
  // tap the front card to turn the page; swipe left/right on touch
  let hx = null, hy = 0, hMoved = false;
  stack.addEventListener("pointerdown", (e) => { hx = e.clientX; hy = e.clientY; hMoved = false; });
  stack.addEventListener("pointermove", (e) => { if (hx !== null && Math.abs(e.clientX - hx) > 8) hMoved = true; });
  stack.addEventListener("pointerup", (e) => {
    if (hx === null) return;
    const dx = e.clientX - hx, dy = e.clientY - hy; hx = null;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy)) { dx < 0 ? flipForward(1) : flipBack(); heroArm(); }
  });
  stack.addEventListener("pointercancel", () => { hx = null; });
  stack.addEventListener("click", (e) => {
    const go = e.target.closest("[data-bn-go]");
    if (go) { const b = BANNERS[+go.dataset.bnGo]; setFilters(b.go.plate, b.go.cat); scrollToEl($("#menu")); return; }
    if (hMoved) return;
    if (e.target.closest(".mm-bn")) { flipForward(1); heroArm(); }
  });
  layoutStack(); frontPrice(); heroArm();

  /* ================= CONSIGLIATI · peeking carousel ================= */
  const recTrack = $("#recTrack"), recDots = $("#recDots"), recPlay = $("#recPlay");
  const recCards = RECS.map(([id, brush, img, note], i) => {
    const m = BY[id], pl = PLATES[m.p];
    const el = document.createElement("article");
    el.className = "mm-rc"; el.dataset.i = i;
    el.innerHTML = '<img src="' + A(img) + '" alt="' + esc(m.n) + '" loading="lazy" draggable="false">' +
      '<p class="mm-rc-brush" aria-hidden="true">' + brush + "</p>" +
      '<div class="mm-rc-tag" style="--pc:' + pl.c + '"><small><i></i>1 PIATTO</small><strong><em>€</em>' + eur(pl.price) + "</strong></div>" +
      (m.lim ? '<span class="mm-rc-lim">A TEMPO</span>' : "") +
      '<div class="mm-rc-name"><b>' + esc(m.n) + "</b><span>" + esc(note) + "</span></div>" +
      '<button class="mm-rc-add" type="button" data-add="' + id + '">+ Asporto</button>';
    recTrack.appendChild(el);
    return el;
  });
  recDots.innerHTML = RECS.map(([id], i) => '<button type="button" role="tab" aria-label="' + esc(BY[id].n) + '" data-i="' + i + '"></button>').join("");
  let recCur = 0, recAuto = !RM, recTimer = 0;
  const NR = recCards.length, HALF = Math.floor(NR / 2);
  const relOf = (i, cur) => ((i - cur) % NR + NR + HALF) % NR - HALF;
  function recLayout(animate = true) {
    recCards.forEach((el, i) => {
      const r = relOf(i, recCur), old = +el.style.getPropertyValue("--rel") || 0;
      el.classList.toggle("is-jump", !animate || Math.abs(r - old) > 1);
      el.style.setProperty("--rel", r);
      el.setAttribute("aria-hidden", r ? "true" : "false");
      $(".mm-rc-add", el).tabIndex = r ? -1 : 0;
    });
    $$("button", recDots).forEach((b, i) => b.setAttribute("aria-selected", i === recCur ? "true" : "false"));
  }
  function recGo(i) { recCur = ((i % NR) + NR) % NR; recLayout(); recArm(); }
  function recArm() { clearTimeout(recTimer); if (recAuto) recTimer = setTimeout(() => { if (!document.hidden) recGo(recCur + 1); }, 4600); }
  $("#recPrev").addEventListener("click", () => recGo(recCur - 1));
  $("#recNext").addEventListener("click", () => recGo(recCur + 1));
  recDots.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) recGo(+b.dataset.i); });
  recPlay.addEventListener("click", () => { recAuto = !recAuto; recPlay.dataset.state = recAuto ? "play" : "pause"; recPlay.setAttribute("aria-label", recAuto ? "Metti in pausa" : "Riprendi"); recArm(); });
  if (!recAuto) { recPlay.dataset.state = "pause"; recPlay.setAttribute("aria-label", "Riprendi"); }
  let rx = null, rMoved = false;
  recTrack.addEventListener("pointerdown", (e) => { rx = e.clientX; rMoved = false; });
  recTrack.addEventListener("pointerup", (e) => { if (rx === null) return; const dx = e.clientX - rx; rx = null; if (Math.abs(dx) > 40) { rMoved = true; recGo(recCur + (dx < 0 ? 1 : -1)); } });
  recTrack.addEventListener("pointercancel", () => { rx = null; });
  recTrack.addEventListener("click", (e) => {
    if (rMoved) { rMoved = false; return; }
    const add = e.target.closest("[data-add]");
    const card = e.target.closest(".mm-rc");
    if (!card) return;
    const r = relOf(+card.dataset.i, recCur);
    if (r !== 0) { recGo(+card.dataset.i); return; }
    if (add) addToCart(add.dataset.add);
  });
  recLayout(false); recArm();

  /* ================= BELT · plates going round ================= */
  const belt = $("#belt"), beltSvg = $("#beltSvg"), beltPlates = $("#beltPlates");
  $("#legend").innerHTML = Object.values(PLATES).map((p) => '<li style="--pc:' + p.c + '"><i></i><b><em>€</em>' + eur(p.price) + "</b><span>" + p.name + "</span></li>").join("");
  const BELT_ORDER = (() => { const r = rng(7); const a = MENU.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; })();
  const B = { W: 0, H: 0, d: 78, m: 52, P: 0, off: 0, vel: 0, plates: [], vertical: false, pause: false, visible: false, last: 0, drag: null };
  const SPEED = 38;
  function beltPoint(s) {
    const { m, vertical } = B;
    const A_ = vertical ? B.H : B.W, B_ = vertical ? B.W : B.H;
    const r = (B_ - 2 * m) / 2, L = A_ - 2 * m - 2 * r, P = 2 * L + 2 * Math.PI * r;
    s = ((s % P) + P) % P;
    let x, y;
    if (s < L) { x = m + r + s; y = m; }
    else if (s < L + Math.PI * r) { const t = -Math.PI / 2 + (s - L) / r; x = A_ - m - r + r * Math.cos(t); y = m + r + r * Math.sin(t); }
    else if (s < 2 * L + Math.PI * r) { x = A_ - m - r - (s - L - Math.PI * r); y = B_ - m; }
    else { const t = Math.PI / 2 + (s - 2 * L - Math.PI * r) / r; x = m + r + r * Math.cos(t); y = m + r + r * Math.sin(t); }
    return vertical ? [B_ - y, x] : [x, y];
  }
  function beltBuild() {
    const r = belt.getBoundingClientRect();
    B.W = r.width; B.H = r.height; B.vertical = B.W < B.H * 1.15;
    const mob = mobileMQ.matches;
    B.d = mob ? 54 : 78; B.m = mob ? 38 : 52;
    const A_ = B.vertical ? B.H : B.W, B_ = B.vertical ? B.W : B.H;
    const rad = (B_ - 2 * B.m) / 2, L = A_ - 2 * B.m - 2 * rad;
    B.P = 2 * L + 2 * Math.PI * rad;
    const pts = []; for (let s = 0; s <= B.P + 0.5; s += 4) pts.push(beltPoint(s).map((v) => v.toFixed(1)).join(","));
    const d = "M" + pts.join("L") + "Z";
    beltSvg.setAttribute("viewBox", "0 0 " + B.W + " " + B.H);
    beltSvg.innerHTML = '<path d="' + d + '" fill="none" stroke="#c9bfb1" stroke-width="' + (B.d + 30) + '" stroke-linejoin="round"/>' +
      '<path d="' + d + '" fill="none" stroke="#e6dfd4" stroke-width="' + (B.d + 24) + '" stroke-linejoin="round"/>' +
      '<path id="slats" d="' + d + '" fill="none" stroke="#d3cabd" stroke-width="' + (B.d + 22) + '" stroke-dasharray="2 22"/>';
    const n = Math.max(6, Math.floor(B.P / (B.d * 1.85)));
    beltPlates.innerHTML = "";
    B.plates = [];
    for (let i = 0; i < n; i++) {
      const m = BELT_ORDER[i % BELT_ORDER.length];
      const el = document.createElement("button");
      el.type = "button"; el.className = "mm-bp"; el.dataset.id = m.id;
      el.style.setProperty("--pc", PLATES[m.p].c); el.style.setProperty("--d", B.d + "px");
      el.setAttribute("aria-label", m.n + ", €" + eur(PLATES[m.p].price));
      el.innerHTML = '<img src="' + m.img + '" alt="" loading="lazy" draggable="false">';
      beltPlates.appendChild(el);
      B.plates.push({ el, s0: (i * B.P) / n });
    }
    beltDraw();
  }
  function beltDraw() {
    for (const p of B.plates) { const [x, y] = beltPoint(p.s0 + B.off); p.el.style.transform = "translate(" + x.toFixed(2) + "px," + y.toFixed(2) + "px)"; }
    const sl = $("#slats", beltSvg); if (sl) sl.setAttribute("stroke-dashoffset", (-B.off).toFixed(2));
  }
  function beltTick(now) {
    const dt = Math.min(0.05, (now - (B.last || now)) / 1000); B.last = now;
    if (!B.drag) {
      const target = B.pause || RM ? 0 : SPEED;
      B.vel += (target - B.vel) * Math.min(1, dt * 3);   // coast back to the belt's own speed after a fling
      B.off += B.vel * dt;
      beltDraw();
    }
    if (B.visible) requestAnimationFrame(beltTick); else B.last = 0;
  }
  new IntersectionObserver((es) => { const v = es[0].isIntersecting; if (v && !B.visible) { B.visible = true; requestAnimationFrame(beltTick); } B.visible = v; }).observe(belt);
  // drag along the belt: on the top run moving right is forward, on the bottom run moving left is
  belt.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".mm-bpop")) return;
    const r = belt.getBoundingClientRect();
    B.drag = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, lt: performance.now(), moved: false, top: B.vertical ? e.clientX - r.left > r.width / 2 : e.clientY - r.top < r.height / 2, id: e.pointerId, target: e.target.closest(".mm-bp") };
  });
  belt.addEventListener("pointermove", (e) => {
    const g = B.drag; if (!g || g.id !== e.pointerId) return;
    if (!g.moved && Math.hypot(e.clientX - g.x, e.clientY - g.y) > 6) { g.moved = true; belt.classList.add("is-drag"); try { belt.setPointerCapture(e.pointerId); } catch (_) {} closePop(); }
    if (!g.moved) return;
    const delta = B.vertical ? (g.top ? e.clientY - g.ly : -(e.clientY - g.ly)) : (g.top ? e.clientX - g.lx : -(e.clientX - g.lx));
    const now = performance.now(), dt = Math.max(1, now - g.lt) / 1000;
    B.off += delta; B.vel = clamp(delta / dt, -1600, 1600);
    g.lx = e.clientX; g.ly = e.clientY; g.lt = now;
    beltDraw();
  });
  const endDrag = (e) => {
    const g = B.drag; if (!g || g.id !== e.pointerId) return;
    B.drag = null; belt.classList.remove("is-drag");
    if (!g.moved && g.target && e.type === "pointerup") openPop(g.target);
    B.last = 0;
  };
  belt.addEventListener("pointerup", endDrag);
  belt.addEventListener("pointercancel", endDrag);
  belt.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target.closest(".mm-bp")) { e.preventDefault(); openPop(e.target.closest(".mm-bp")); } });
  let pop = null;
  function openPop(plateEl) {
    closePop();
    const m = BY[plateEl.dataset.id], pl = PLATES[m.p];
    B.pause = true; B.vel = 0;
    pop = document.createElement("div");
    pop.className = "mm-bpop"; pop.setAttribute("role", "dialog"); pop.setAttribute("aria-label", m.n);
    pop.innerHTML = '<button class="mm-bpop-x" type="button" aria-label="Chiudi"><svg><use href="#i-x"/></svg></button><b>' + esc(m.n) + "</b><p>" + esc(m.d) + '</p><div class="mm-bpop-row"><span class="mm-price"><em>€</em>' + eur(pl.price) + '</span><button class="mm-btn-red" type="button" data-add="' + m.id + '">Aggiungi</button></div>';
    belt.appendChild(pop);
    const br = belt.getBoundingClientRect(), pr = plateEl.getBoundingClientRect();
    const cx = pr.left + pr.width / 2 - br.left, cy = pr.top + pr.height / 2 - br.top;
    const w = pop.offsetWidth, h = pop.offsetHeight;
    let left = clamp(cx - w / 2, 10, br.width - w - 10);
    let top = cy < br.height / 2 ? cy + pr.height / 2 + 10 : cy - pr.height / 2 - h - 10;
    pop.style.left = left + "px"; pop.style.top = clamp(top, 10, br.height - h - 10) + "px";
    pop.addEventListener("click", (e) => {
      if (e.target.closest(".mm-bpop-x")) { closePop(); plateEl.focus(); return; }
      const a = e.target.closest("[data-add]"); if (a) { addToCart(a.dataset.add); closePop(); }
    });
    $("[data-add]", pop).focus({ preventScroll: true });
  }
  function closePop() { if (pop) { pop.remove(); pop = null; } B.pause = false; }
  document.addEventListener("pointerdown", (e) => { if (pop && !e.target.closest(".mm-bpop") && !e.target.closest(".mm-bp")) closePop(); });

  /* ================= MENU · filter chips ================= */
  const chipsPlate = $("#chipsPlate"), chipsCat = $("#chipsCat"), grid = $("#menuGrid"), menuEmpty = $("#menuEmpty");
  chipsPlate.insertAdjacentHTML("beforeend", '<button type="button" aria-pressed="true" data-k="">Tutti i piatti</button>' + Object.values(PLATES).map((p) => '<button type="button" aria-pressed="false" data-k="' + p.k + '" style="--pc:' + p.c + '"><i></i>€' + eur(p.price) + "</button>").join(""));
  chipsCat.insertAdjacentHTML("beforeend", '<button type="button" aria-pressed="true" data-k="">Tutto</button>' + CATS.map(([k, n]) => '<button type="button" aria-pressed="false" data-k="' + k + '">' + n + "</button>").join("") + '<button type="button" aria-pressed="false" data-k="lim">A tempo</button>');
  const F = { plate: "", cat: "", store: "" };
  let shown = [], swapTimers = [];
  // the highlight's leading edge leaves first and the trailing edge follows, so it stretches on the way
  function placePill(row, btn, animate) {
    const pill = $(".mm-chip-pill", row);
    const L = btn.offsetLeft, R = row.clientWidth - (btn.offsetLeft + btn.offsetWidth); // abs box is laid out against the visible width, not scrollWidth
    const right = L > pill.offsetLeft;
    pill.style.transition = !animate || RM ? "none" : right
      ? "right .22s cubic-bezier(.3,.7,.4,1), left .3s cubic-bezier(.5,0,.3,1) .04s"
      : "left .22s cubic-bezier(.3,.7,.4,1), right .3s cubic-bezier(.5,0,.3,1) .04s";
    pill.style.left = L + "px"; pill.style.right = R + "px";
    if (animate) { const bl = btn.offsetLeft - 12, br = btn.offsetLeft + btn.offsetWidth + 12; if (bl < row.scrollLeft || br > row.scrollLeft + row.clientWidth) row.scrollTo({ left: bl - (row.clientWidth - btn.offsetWidth) / 2, behavior: RM ? "auto" : "smooth" }); }
  }
  function syncChips(animate) {
    [[chipsPlate, F.plate], [chipsCat, F.cat]].forEach(([row, v]) => {
      const btns = $$("button", row); let on = btns[0];
      btns.forEach((b) => { const sel = b.dataset.k === v; b.setAttribute("aria-pressed", sel ? "true" : "false"); if (sel) on = b; });
      placePill(row, on, animate);
    });
  }
  const results = () => MENU.filter((m) => (!F.plate || m.p === F.plate) && (!F.cat || (F.cat === "lim" ? m.lim : m.c === F.cat)));
  function dishHTML(m) {
    const pl = PLATES[m.p], out = soldOut(F.store, m.id);
    return '<li class="mm-dish' + (out ? " is-out" : "") + '" style="--pc:' + pl.c + '" data-id="' + m.id + '">' +
      '<div class="mm-dish-plate"><span><img src="' + m.img + '" alt="" loading="lazy" draggable="false"></span>' + (m.lim ? '<em class="mm-dish-lim">A TEMPO</em>' : "") + (out ? '<em class="mm-dish-out">ESAURITO</em>' : "") + "</div>" +
      '<div class="mm-dish-body"><h3>' + esc(m.n) + "</h3><p>" + esc(m.d) + '</p><div class="mm-dish-foot"><span class="mm-price"><em>€</em>' + eur(pl.price) + "<small>piatto " + pl.name + '</small></span><button class="mm-add" type="button" data-add="' + m.id + '" aria-label="Aggiungi ' + esc(m.n) + ' all\'asporto"' + (out ? " disabled" : "") + ">+</button></div></div></li>";
  }
  function renderMenu(force) {
    const list = results();
    const key = list.map((m) => m.id).join() + "|" + F.store;
    $("#menuCount").textContent = list.length;
    const outN = F.store ? list.filter((m) => soldOut(F.store, m.id)).length : 0;
    $("#menuStoreNote").textContent = F.store ? "· a " + SBY[F.store].name + (outN ? ", " + outN + " esauriti oggi" : ", niente di esaurito") : "· prezzi uguali in tutti i ristoranti";
    if (!force && key === shown.key) return;
    swapTimers.forEach(clearTimeout); swapTimers = [];
    const later = (ms, f) => swapTimers.push(setTimeout(f, ms));
    const first = !shown.key;
    shown = { key };
    const paint = () => {
      grid.innerHTML = list.map(dishHTML).join("");
      menuEmpty.hidden = list.length > 0;
      if (first || RM) return;
      const cards = $$(".mm-dish", grid);
      cards.forEach((c) => c.classList.add("is-enter"));
      cards.forEach((c, i) => later(Math.min(i, 11) * 35 + 16, () => { c.getBoundingClientRect(); c.classList.replace("is-enter", "is-show"); }));
      later(Math.min(cards.length, 12) * 35 + 320, () => cards.forEach((c) => c.classList.remove("is-show")));
    };
    if (first || RM) { paint(); return; }
    // old cards fade out first; 220 ms later the new ones come in from a 6 px blur, 35 ms apart
    $$(".mm-dish", grid).forEach((c) => c.classList.add("is-leave"));
    later(220, paint);
  }
  function setFilters(plate, cat, animate = true) { if (plate !== undefined) F.plate = plate; if (cat !== undefined) F.cat = cat; syncChips(animate); renderMenu(); }
  chipsPlate.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b && b.dataset.k !== F.plate) setFilters(b.dataset.k, undefined); });
  chipsCat.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b && b.dataset.k !== F.cat) setFilters(undefined, b.dataset.k); });
  $("#menuReset").addEventListener("click", () => setFilters("", ""));
  grid.addEventListener("click", (e) => { const a = e.target.closest("[data-add]"); if (a && !a.disabled) addToCart(a.dataset.add, a); });
  function setMenuStore(id) {
    F.store = id || "";
    $("#menuStore span").textContent = F.store ? SBY[F.store].name : "Tutti i ristoranti";
    renderMenu();
  }
  syncChips(false); renderMenu();
  addEventListener("resize", () => syncChips(false));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => syncChips(false));

  /* ================= STORE PICKER ================= */
  const picker = $("#picker"), pickList = $("#pickList");
  let pickThen = null;
  function openPicker(then) {
    pickThen = then;
    const cur = F.store;
    pickList.innerHTML = '<li><button type="button" data-id=""' + (cur ? "" : ' aria-current="true"') + '><span>Tutti i ristoranti<small>Prezzi e piatti di catena</small></span></button></li>' +
      STORES.map((s) => { const st = status(s); return '<li><button type="button" data-id="' + s.id + '"' + (cur === s.id ? ' aria-current="true"' : "") + "><span>" + s.name + "<small>" + s.city + "</small></span>" + pillHTML(st) + "</button></li>"; }).join("");
    openModal(picker);
  }
  pickList.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    setMenuStore(b.dataset.id); closeModal(picker);
    if (pickThen) pickThen(b.dataset.id);
  });
  const toMenuWithStore = (id) => { scrollToEl($("#menu")); if (id) { const n = MENU.filter((m) => soldOut(id, m.id)).length; toast("Menu di " + SBY[id].name + ": " + (n ? n + " piatti esauriti oggi" : "c'è tutto")); } };
  $("#capsule").addEventListener("click", () => openPicker(toMenuWithStore));
  $("#soldoutLink").addEventListener("click", (e) => { e.preventDefault(); openPicker(toMenuWithStore); });
  $("#menuStore").addEventListener("click", () => openPicker(null));

  /* ================= STORES ================= */
  const pillHTML = (st) => '<span class="mm-pill' + (st.open ? " is-open" : "") + '"><i></i>' + (st.open ? "Aperto" : "Chiuso") + "</span>";
  const storeCity = $("#storeCity"), facetsEl = $("#facets"), storeList = $("#storeList");
  storeCity.insertAdjacentHTML("beforeend", [...new Set(STORES.map((s) => s.city))].map((c) => '<option value="' + c + '">' + c + "</option>").join(""));
  facetsEl.innerHTML = FACETS.map(([k, n]) => '<button type="button" class="mm-facet" aria-pressed="false" data-f="' + k + '">' + n + "</button>").join("");
  const SF = { city: "", fac: new Set() };
  function renderStores() {
    const n = romeNow();
    const list = STORES.filter((s) => (!SF.city || s.city === SF.city) && [...SF.fac].every((f) => f === "aperto" ? status(s).open : s.fac.includes(f)));
    $("#storeCount").textContent = list.length;
    storeList.innerHTML = list.length ? list.map((s) => {
      const st = statusAt(s, n.dow, n.min), q = queueAt(s, n.min, st.open);
      return '<li class="mm-st" data-store="' + s.id + '"><div class="mm-st-head"><h3>' + s.name + "</h3>" + pillHTML(st) + "</div>" +
        '<p class="mm-st-addr">' + s.addr + " · Tel. " + s.tel + "</p>" +
        '<p class="mm-st-hours"><b>Oggi</b> ' + hoursText(s, n.dow) + " — " + (st.open ? st.text.toLowerCase() : st.short) + "</p>" +
        '<p class="mm-st-wait">' + (st.open ? "Attesa adesso ≈ <strong>" + Math.min(q.banco, q.box) + "</strong> min · " + q.groups + " gruppi in lista" : "Numero online per l'apertura · " + q.groups + " gruppi già in lista") + "</p>" +
        '<div class="mm-st-tags">' + s.fac.map((f) => "<span>" + FACETS.find((x) => x[0] === f)[1] + "</span>").join("") + "</div>" +
        '<div class="mm-st-act"><button type="button" class="mm-btn-red" data-q-store="' + s.id + '">Prendi il numero</button><button type="button" class="mm-btn-ghost" data-menu-store="' + s.id + '">Vedi il menu</button></div></li>';
    }).join("") : '<li class="mm-store-none">Nessun ristorante con questi servizi. Prova a togliere un filtro.</li>';
  }
  storeCity.addEventListener("change", () => { SF.city = storeCity.value; renderStores(); });
  facetsEl.addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; const k = b.dataset.f; SF.fac.has(k) ? SF.fac.delete(k) : SF.fac.add(k); b.setAttribute("aria-pressed", SF.fac.has(k) ? "true" : "false"); renderStores(); });
  storeList.addEventListener("click", (e) => {
    const q = e.target.closest("[data-q-store]"); if (q) { openQueue(q.dataset.qStore, q); return; }
    const m = e.target.closest("[data-menu-store]"); if (m) { setMenuStore(m.dataset.menuStore); toMenuWithStore(m.dataset.menuStore); }
  });

  /* ================= NEWS ================= */
  $("#newsList").innerHTML = NEWS.map(([d, lab, t, href]) => '<li><a href="' + (href === "job" ? "#notizie" : href) + '"' + (href === "job" ? ' data-job' : "") + "><time>" + d + '</time><span class="mm-lab">' + lab + "</span><span>" + esc(t) + '</span><svg aria-hidden="true"><use href="#i-chev"/></svg></a></li>').join("");
  $("#newsList").addEventListener("click", (e) => { const j = e.target.closest("[data-job]"); if (j) { e.preventDefault(); toast("Candidature a lavora@marumaru.example · rispondiamo entro una settimana"); } });

  /* ================= LIVE STATUS ================= */
  const MAIN = SBY["pd-centro"];
  function paintStatus() {
    const st = status(MAIN), q = queue(MAIN);
    const hs = $("#headStatus"); hs.dataset.open = st.open ? "1" : "0";
    $("b", hs).textContent = st.open ? "Aperto fino alle " + hhmm(st.until) : "Chiuso · " + st.short;
    $("#drawerStatus").textContent = "Padova Centro · " + st.text;
    $("#cvWait").textContent = st.open ? "Attesa adesso ≈ " + Math.min(q.banco, q.box) + " min" : "Padova Centro " + st.short;
    renderStores();
  }
  $("#headStatus").addEventListener("click", () => scrollToEl($("#ristoranti")));
  paintStatus();
  setInterval(paintStatus, 30000);

  /* ================= MODALS (shared) ================= */
  let lastFocus = null; const openStack = [];
  function openModal(m, opener) {
    lastFocus = opener || document.activeElement;
    m.hidden = false; openStack.push(m);
    document.documentElement.style.overflow = "hidden";
    closeDrawer();
    const f = m.querySelector("[aria-checked='true'], input:not([type=checkbox]), .mm-modal-card button:not(.mm-x), .mm-cart-panel button:not(.mm-x)");
    (f || m.querySelector(".mm-x")).focus({ preventScroll: true });
  }
  function closeModal(m) {
    if (m.hidden) return;
    m.hidden = true; openStack.splice(openStack.indexOf(m), 1);
    if (!openStack.length) document.documentElement.style.overflow = "";
    if (lastFocus && lastFocus.focus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
  }
  $$(".mm-modal").forEach((m) => m.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) { if (m === $("#queue")) closeQueue(); else closeModal(m); } }));
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (pop) { closePop(); return; }
    const top = openStack[openStack.length - 1];
    if (top) { top === $("#queue") ? closeQueue() : closeModal(top); return; }
    closeDrawer();
  });
  // keep Tab inside the open dialog
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Tab" || !openStack.length) return;
    const m = openStack[openStack.length - 1];
    const f = $$("button:not([disabled]), input, select, a[href], [tabindex='0']", m).filter((x) => x.offsetParent !== null);
    if (!f.length) return;
    const first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  function scrollToEl(el) { const y = el.getBoundingClientRect().top + scrollY - (mobileMQ.matches ? 66 : 12); scrollTo({ top: y, behavior: RM ? "auto" : "smooth" }); }

  /* ================= QUEUE · prendi il numero ================= */
  const qm = $("#queue"), qNext = $("#qNext"), qBack = $("#qBack"), qForm = $("#qForm");
  const Q = { step: 0, store: "", ad: 2, kd: 0, seat: "", ticket: null, counter: {} };
  const SEAT_ART = {
    banco: '<svg viewBox="0 0 56 40" aria-hidden="true"><rect x="4" y="8" width="48" height="8" rx="2" fill="#f2b51d" stroke="#1d1a17" stroke-width="2"/><circle cx="16" cy="30" r="5" fill="#fff" stroke="#c4161c" stroke-width="2.4"/><circle cx="40" cy="30" r="5" fill="#fff" stroke="#c4161c" stroke-width="2.4"/></svg>',
    box: '<svg viewBox="0 0 56 40" aria-hidden="true"><rect x="4" y="6" width="9" height="28" rx="3" fill="#fff" stroke="#c4161c" stroke-width="2.4"/><rect x="43" y="6" width="9" height="28" rx="3" fill="#fff" stroke="#c4161c" stroke-width="2.4"/><rect x="16" y="14" width="24" height="8" rx="2" fill="#f2b51d" stroke="#1d1a17" stroke-width="2"/><path d="M28 22v12" stroke="#1d1a17" stroke-width="2.4"/></svg>',
    libero: '<svg viewBox="0 0 56 40" aria-hidden="true"><circle cx="28" cy="20" r="14" fill="none" stroke="#c4161c" stroke-width="2.6"/><path d="M28 11v9l6 4" fill="none" stroke="#1d1a17" stroke-width="2.6" stroke-linecap="round"/></svg>',
  };
  function seatOptions() {
    const s = SBY[Q.store], st = status(s), q = queueAt(s, romeNow().min, st.open), ppl = Q.ad + Q.kd;
    const big = ppl > 6 ? 10 : ppl > 4 ? 5 : 0;
    const box = q.box + big;
    const banco = ppl <= 2 ? q.banco : null;
    const libero = Math.max(2, Math.round((banco === null ? box : Math.min(banco, box)) * 0.85));
    return [
      { k: "banco", n: "Al banco", d: ppl <= 2 ? "Davanti al nastro, si vede passare tutto" : "Solo per 1 o 2 persone", w: banco, pre: "B" },
      { k: "box", n: ppl > 6 ? "Due box vicini" : "Box", d: ppl > 6 ? "Per gruppi oltre 6 uniamo due box" : "Tavolo con divanetti, fino a 6 persone", w: box, pre: "T" },
      { k: "libero", n: "Il primo libero", d: "Banco o box, quello che si libera prima", w: libero, pre: "L" },
    ];
  }
  function qRender() {
    const steps = $$(".mm-q-step", qm);
    steps.forEach((s) => { s.hidden = +s.dataset.q !== Q.step; });
    $$("#qSteps li").forEach((li, i) => { li.classList.toggle("is-done", i < Q.step); li.classList.toggle("is-now", i === Q.step); });
    $("#qSteps").hidden = Q.step === 4;
    $("#queueTtl").textContent = Q.step === 4 ? "Il tuo numero" : "Prendi il numero";
    qBack.textContent = Q.step === 4 ? "Annulla il numero" : "Indietro";
    qBack.hidden = Q.step === 0;
    qNext.textContent = Q.step === 3 ? "Prendi il numero" : Q.step === 4 ? "Fatto" : "Avanti";
    if (Q.step === 0) {
      const n = romeNow();
      $("#qStores").innerHTML = STORES.map((s) => {
        const st = statusAt(s, n.dow, n.min), q = queueAt(s, n.min, st.open);
        return '<li><button type="button" class="mm-qs" role="radio" aria-checked="' + (Q.store === s.id) + '" data-id="' + s.id + '"><b>' + s.name + "</b>" + pillHTML(st) + "<small>" + (st.open ? "≈ " + Math.min(q.banco, q.box) + " min · " + q.groups + " gruppi prima di te" : "Numero per l'apertura · " + st.short) + "</small></button></li>";
      }).join("");
    }
    if (Q.step === 1) {
      $("#adOut").textContent = Q.ad; $("#kdOut").textContent = Q.kd;
      $("#adMinus").disabled = Q.ad <= 1; $("#kdMinus").disabled = Q.kd <= 0;
      $("#adPlus").disabled = Q.ad >= 8 || Q.ad + Q.kd >= 10; $("#kdPlus").disabled = Q.kd >= 6 || Q.ad + Q.kd >= 10;
      $("#pplNote").textContent = Q.ad + Q.kd >= 10 ? "Siete in 10: è il massimo per un numero. Per gruppi più grandi chiama il ristorante." : "Al massimo 10 persone per numero. Per gruppi più grandi chiama il ristorante.";
    }
    if (Q.step === 2) {
      const opts = seatOptions();
      if (Q.seat && opts.find((o) => o.k === Q.seat).w === null) Q.seat = "";
      const qst = status(SBY[Q.store]), opening = qst.open ? "" : hhmm(qst.next ? qst.next.m : 0);
      $("#qSeats").innerHTML = opts.map((o) => '<button type="button" class="mm-seat" role="radio" aria-checked="' + (Q.seat === o.k) + '" data-k="' + o.k + '"' + (o.w === null ? " disabled" : "") + ">" + SEAT_ART[o.k] + "<b>" + o.n + "</b><small>" + o.d + "</small><strong>" + (o.w === null ? "—" : opening || "≈ " + o.w + "'") + "<small>" + (o.w === null ? "non disponibile" : opening ? "all'apertura" : "di attesa") + "</small></strong></button>").join("");
    }
    if (Q.step === 3) {
      const s = SBY[Q.store], o = seatOptions().find((x) => x.k === Q.seat), st = status(s);
      $("#qSum").innerHTML = "<b>" + s.name + "</b> · " + (Q.ad + Q.kd) + " persone (" + Q.ad + " adulti" + (Q.kd ? ", " + Q.kd + " bambini" : "") + ") · " + o.n.toLowerCase() + "<br>" + (st.open ? "Attesa stimata ≈ " + o.w + " minuti" : "Il numero vale per l'apertura: " + st.short);
    }
    qNext.disabled = (Q.step === 0 && !Q.store) || (Q.step === 2 && !Q.seat);
  }
  $("#qStores").addEventListener("click", (e) => { const b = e.target.closest(".mm-qs"); if (!b) return; Q.store = b.dataset.id; qRender(); $(".mm-qs[aria-checked='true']", qm).focus(); });
  const stepBtn = (id, f) => $(id).addEventListener("click", () => { f(); qRender(); });
  stepBtn("#adMinus", () => { Q.ad = Math.max(1, Q.ad - 1); });
  stepBtn("#adPlus", () => { if (Q.ad < 8 && Q.ad + Q.kd < 10) Q.ad++; });
  stepBtn("#kdMinus", () => { Q.kd = Math.max(0, Q.kd - 1); });
  stepBtn("#kdPlus", () => { if (Q.kd < 6 && Q.ad + Q.kd < 10) Q.kd++; });
  $("#qSeats").addEventListener("click", (e) => { const b = e.target.closest(".mm-seat"); if (!b || b.disabled) return; Q.seat = b.dataset.k; qRender(); $(".mm-seat[aria-checked='true']", qm).focus(); });
  const fieldErr = (input, msg) => { const f = input.closest(".mm-field"); f.classList.toggle("is-bad", !!msg); $(".mm-err", f).textContent = msg || ""; return !msg; };
  const phoneOk = (v) => /^\+?[\d\s.-]{8,18}$/.test(v.trim()) && v.replace(/\D/g, "").length >= 9;
  function qValidate() {
    const name = qForm.elements.name, phone = qForm.elements.phone;
    const a = fieldErr(name, name.value.trim().length < 2 ? "Scrivi il nome con cui ti chiamiamo" : "");
    const b = fieldErr(phone, !phone.value.trim() ? "Serve per avvisarti quando tocca a te" : !phoneOk(phone.value) ? "Controlla il numero: es. +39 333 123 4567" : "");
    if (!a) name.focus(); else if (!b) phone.focus();
    return a && b;
  }
  function issueTicket() {
    const s = SBY[Q.store], st = status(s), o = seatOptions().find((x) => x.k === Q.seat), q = queueAt(s, romeNow().min, st.open);
    const base = Q.counter[s.id] || (30 + (hash(s.id) % 40) + q.groups * 2);
    Q.counter[s.id] = base + 1;
    const num = String(base + 1).padStart(3, "0");
    Q.ticket = { store: s.id, pre: o.pre, num, wait: st.open ? o.w : 0, ahead: q.groups, open: st.open, short: st.short, ppl: Q.ad + Q.kd, seat: o.n, name: qForm.elements.name.value.trim() };
  }
  function paintTicket(animate) {
    const t = Q.ticket, s = SBY[t.store];
    $("#tkStore").textContent = s.name;
    $("#tkPre").textContent = t.pre;
    $("#tkMeta").textContent = t.name + " · " + t.ppl + (t.ppl === 1 ? " persona" : " persone") + " · " + t.seat.toLowerCase();
    $("#tkAhead").textContent = t.open ? t.ahead + (t.ahead === 1 ? " gruppo" : " gruppi") + " prima di te" : "Si parte all'apertura: " + t.short;
    odo($("#tkNum"), t.num, { spin: animate, dur: 1100, stagger: 120 });
    odo($("#tkWait"), String(t.wait).padStart(2, "0"), { spin: animate, dur: 1000, stagger: 120 });
    const n = romeNow();
    $("#tkNote").textContent = t.open ? "Presentati all'accoglienza verso le " + hhmm(n.min + Math.max(0, t.wait - 5)) + ". Se arrivi dopo che il numero è passato, ti diamo il primo posto libero." : "Il ristorante è chiuso adesso: il numero entra in lista all'apertura e ti avvisiamo con un SMS.";
    qr($("#tkQr"), t.store + t.pre + t.num);
    paintTicketBadges();
  }
  function qr(svg, code) {
    const N = 25, r = rng(hash(code)); let d = "";
    const finder = (x, y) => (i, j) => i >= x && i < x + 7 && j >= y && j < y + 7;
    const fs = [finder(0, 0), finder(18, 0), finder(0, 18)];
    const inF = (i, j) => fs.some((f) => f(i, j));
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) { if (inF(i, j) || (i === 7 || j === 7 || i === 17 || j === 17) && (i < 8 || i > 16) && (j < 8 || j > 16)) continue; if (r() > 0.52) d += "M" + i + " " + j + "h1v1h-1z"; }
    const fp = (x, y) => "M" + x + " " + y + "h7v7h-7z M" + (x + 1) + " " + (y + 1) + "v5h5v-5z M" + (x + 2) + " " + (y + 2) + "h3v3h-3z";
    svg.innerHTML = '<rect width="25" height="25" fill="#fff"/><path d="' + d + '" fill="#1d1a17"/><path d="' + fp(0, 0) + fp(18, 0) + fp(0, 18) + '" fill="#1d1a17" fill-rule="evenodd"/>';
  }
  function paintTicketBadges() {
    const t = Q.ticket;
    $$("[data-ticket-label]").forEach((el) => { el.innerHTML = t ? "Il tuo numero<br><b>" + t.pre + " " + t.num + "</b>" : "Prendi il<br>numero"; el.closest(".mm-rail-it").classList.toggle("has-ticket", !!t); });
    $$("[data-ticket-label-short]").forEach((el) => { el.textContent = t ? t.pre + " " + t.num : "Numero"; el.closest(".mm-tab").classList.toggle("has-ticket", !!t); });
  }
  qNext.addEventListener("click", () => {
    if (qNext.disabled) return;
    if (Q.step === 3) { if (!qValidate()) return; issueTicket(); Q.step = 4; qRender(); paintTicket(true); toast("Numero " + Q.ticket.pre + " " + Q.ticket.num + " a " + SBY[Q.ticket.store].name); qNext.focus(); return; }
    if (Q.step === 4) { closeQueue(); return; }
    Q.step++; qRender();
    if (Q.step === 3) qForm.elements.name.focus();
  });
  qBack.addEventListener("click", () => {
    if (Q.step === 4) { const t = Q.ticket; Q.ticket = null; paintTicketBadges(); toast("Numero " + t.pre + " " + t.num + " annullato"); qReset(); qRender(); return; }
    if (Q.step > 0) { Q.step--; qRender(); }
  });
  qForm.addEventListener("submit", (e) => { e.preventDefault(); qNext.click(); });
  qForm.addEventListener("input", (e) => { const f = e.target.closest(".mm-field"); if (f && f.classList.contains("is-bad")) { f.classList.remove("is-bad"); $(".mm-err", f).textContent = ""; } });
  function qReset() { Q.step = 0; Q.store = ""; Q.ad = 2; Q.kd = 0; Q.seat = ""; qForm.reset(); $$(".mm-field", qForm).forEach((f) => { f.classList.remove("is-bad"); $(".mm-err", f).textContent = ""; }); }
  function openQueue(storeId, opener) {
    if (Q.ticket) { Q.step = 4; qRender(); paintTicket(false); }
    else { qReset(); if (storeId) { Q.store = storeId; Q.step = 1; } qRender(); }
    openModal(qm, opener);
  }
  function closeQueue() { closeModal(qm); }

  /* ================= CART · asporto ================= */
  const cartM = $("#cart"), cartList = $("#cartList"), cartForm = $("#cartForm"), cartGo = $("#cartGo");
  const C = { items: new Map(), mode: "ritiro", done: false };
  const MAX_ITEM = 20, MAX_TOTAL = 60, DELIVERY = { fee: 2.9, free: 35, min: 15, store: "pd-centro" };
  const cartStore = $("#cartStore"), cartSlot = $("#cartSlot"), cartDSlot = $("#cartDSlot");
  cartStore.innerHTML = STORES.map((s) => '<option value="' + s.id + '">' + s.name + "</option>").join("");
  const count = () => [...C.items.values()].reduce((a, b) => a + b, 0);
  const subtotal = () => [...C.items].reduce((a, [id, q]) => a + PLATES[BY[id].p].price * q, 0);
  function addToCart(id, from) {
    if (count() >= MAX_TOTAL) { toast("Massimo " + MAX_TOTAL + " piatti per ordine online"); return; }
    const q = C.items.get(id) || 0;
    if (q >= MAX_ITEM) { toast("Massimo " + MAX_ITEM + " piatti uguali per ordine"); return; }
    if (C.done) { C.done = false; }
    C.items.set(id, q + 1);
    if (F.store && !C.touchedStore) cartStore.value = F.store;
    paintCart();
    $$("[data-cart-count]").forEach((b) => { b.classList.remove("is-bump"); b.getBoundingClientRect(); b.classList.add("is-bump"); });
    toast(BY[id].n + " nel vassoio · " + count() + (count() === 1 ? " piatto" : " piatti"));
  }
  // pickup slots every 15 min inside opening hours, at least `lead` minutes from now, last one 30 min before closing
  function slots(store, lead) {
    const n = romeNow(), out = [];
    for (let k = 0; k < 7 && out.length < 14; k++) {
      const d = (n.dow + k) % 7;
      for (const [s, e] of store.h[d]) {
        let t = Math.max(s + 15, k === 0 ? Math.ceil((n.min + lead) / 15) * 15 : s + 15);
        for (; t <= Math.min(e - 30, 1425) && out.length < 14; t += 15) out.push({ v: k + "-" + t, l: (k === 0 ? "Oggi " : k === 1 ? "Domani " : DAYS_SHORT[d] + " ") + hhmm(t) });
      }
    }
    return out;
  }
  const fillSlots = (sel, store, lead) => { const keep = sel.value; const s = slots(store, lead); sel.innerHTML = s.map((o) => '<option value="' + o.v + '">' + o.l + "</option>").join(""); if (s.some((o) => o.v === keep)) sel.value = keep; };
  function paintCart() {
    const n = count();
    $$("[data-cart-count]").forEach((b) => { b.hidden = !n; b.textContent = n; });
    $("#cartEmpty").hidden = n > 0 || C.done;
    cartList.innerHTML = [...C.items].map(([id, q]) => {
      const m = BY[id], pl = PLATES[m.p];
      return '<li class="mm-ci" style="--pc:' + pl.c + '" data-id="' + id + '"><span class="mm-ci-pl"><img src="' + m.img + '" alt=""></span><span><b>' + esc(m.n) + "</b><small>piatto " + pl.name + " · €" + eur(pl.price) + " × " + q + " = €" + eur(pl.price * q) + '</small></span><span class="mm-ci-q"><button type="button" data-dec aria-label="Togli un ' + esc(m.n) + '">−</button><output>' + q + '</output><button type="button" data-inc aria-label="Aggiungi un ' + esc(m.n) + '"' + (q >= MAX_ITEM ? " disabled" : "") + ">+</button></span></li>";
    }).join("");
    const byPlate = {}; for (const [id, q] of C.items) byPlate[BY[id].p] = (byPlate[BY[id].p] || 0) + q;
    $("#cartPlates").innerHTML = Object.values(PLATES).filter((p) => byPlate[p.k]).map((p) => '<span style="--pc:' + p.c + '"><i></i>' + byPlate[p.k] + " " + (byPlate[p.k] === 1 ? "piatto " + p.name : "piatti " + PLURAL[p.k]) + "</span>").join("");
    const sub = subtotal(), deliv = C.mode === "consegna";
    const fee = deliv && n ? (sub >= DELIVERY.free ? 0 : DELIVERY.fee) : 0;
    $("#cartSub").textContent = "€" + eur(sub);
    $("#cartFeeRow").hidden = !deliv;
    $("#cartFee").textContent = fee ? "€" + eur(fee) : "gratis";
    let hint = "";
    if (deliv && n && sub < DELIVERY.min) hint = "Minimo €" + eur(DELIVERY.min) + " per la consegna: mancano €" + eur(DELIVERY.min - sub);
    else if (deliv && n && sub < DELIVERY.free) hint = "Aggiungi €" + eur(DELIVERY.free - sub) + " e la consegna è gratis";
    $("#cartHint").textContent = hint;
    const totalEl = $("#cartTotal"), tot = eur(sub + fee);
    if (totalEl.dataset.value !== tot) odo(totalEl, tot, { dur: 600, stagger: 50 });
    $(".mm-cart-ritiro", cartM).hidden = deliv; $(".mm-cart-consegna", cartM).hidden = !deliv;
    cartForm.hidden = !n || C.done; $("#cartPlates").hidden = C.done; cartList.hidden = C.done; $("#cartMode").hidden = C.done;
    $("#cartDone").hidden = !C.done;
    cartGo.textContent = C.done ? "Chiudi" : deliv ? "Ordina la consegna" : "Ordina da ritirare";
    cartGo.disabled = !C.done && (!n || (deliv && sub < DELIVERY.min));
    $$("#cartMode button").forEach((b) => b.setAttribute("aria-checked", b.dataset.mode === C.mode ? "true" : "false"));
  }
  cartList.addEventListener("click", (e) => {
    const li = e.target.closest(".mm-ci"); if (!li) return; const id = li.dataset.id, q = C.items.get(id);
    if (e.target.closest("[data-inc]")) { if (q < MAX_ITEM && count() < MAX_TOTAL) C.items.set(id, q + 1); }
    else if (e.target.closest("[data-dec]")) { q <= 1 ? C.items.delete(id) : C.items.set(id, q - 1); }
    else return;
    paintCart();
    const again = cartList.querySelector('[data-id="' + id + '"] ' + (e.target.closest("[data-inc]") ? "[data-inc]" : "[data-dec]"));
    (again || cartGo).focus({ preventScroll: true });
  });
  $("#cartMode").addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b) return; C.mode = b.dataset.mode; paintCart(); });
  cartStore.addEventListener("change", () => { C.touchedStore = true; fillSlots(cartSlot, SBY[cartStore.value], 30); });
  cartForm.addEventListener("input", (e) => { const f = e.target.closest(".mm-field"); if (f && f.classList.contains("is-bad")) { f.classList.remove("is-bad"); $(".mm-err", f).textContent = ""; } });
  cartForm.addEventListener("submit", (e) => { e.preventDefault(); cartGo.click(); });
  function cartValidate() {
    const el = cartForm.elements, deliv = C.mode === "consegna", bad = [];
    const chk = (input, msg) => { if (!fieldErr(input, msg)) bad.push(input); };
    if (deliv) {
      chk(el.addr, el.addr.value.trim().length < 5 ? "Scrivi via e numero civico" : "");
      chk(el.cap, !/^\d{5}$/.test(el.cap.value.trim()) ? "Il CAP ha 5 cifre" : !/^351/.test(el.cap.value.trim()) ? "Consegniamo solo a Padova (CAP 351xx): scegli il ritiro" : "");
      chk(el.dslot, !el.dslot.value ? "Nessun orario disponibile" : "");
    } else {
      chk(el.slot, !el.slot.value ? "Nessun orario disponibile" : "");
      const outs = [...C.items.keys()].filter((id) => soldOut(el.store.value, id));
      chk(el.store, outs.length ? BY[outs[0]].n + (outs.length > 1 ? " e altri " + (outs.length - 1) : "") + " oggi è esaurito qui: toglilo o scegli un altro ristorante" : "");
    }
    chk(el.name, el.name.value.trim().length < 2 ? "Scrivi il tuo nome" : "");
    chk(el.phone, !el.phone.value.trim() ? "Ci serve per avvisarti" : !phoneOk(el.phone.value) ? "Controlla il numero: es. +39 333 123 4567" : "");
    if (bad.length) bad[0].focus();
    return !bad.length;
  }
  cartGo.addEventListener("click", () => {
    if (C.done) { closeModal(cartM); C.done = false; paintCart(); return; }
    if (cartGo.disabled || !cartValidate()) return;
    const el = cartForm.elements, deliv = C.mode === "consegna";
    const slotSel = deliv ? cartDSlot : cartSlot, when = slotSel.options[slotSel.selectedIndex].text;
    const code = "MM-" + String(1000 + (hash(String(Date.now())) % 9000));
    const sub = subtotal(), fee = deliv ? (sub >= DELIVERY.free ? 0 : DELIVERY.fee) : 0, n = count();
    $("#cartDone").innerHTML = "<p>Ordine ricevuto</p><strong>" + code + "</strong><p>" + n + " piatti · €" + eur(sub + fee) + "<br>" + (deliv ? "Consegna in " + esc(el.addr.value.trim()) + ", " + el.cap.value.trim() + " · " + when.toLowerCase() : "Ritiro a " + SBY[el.store.value].name + " · " + when.toLowerCase()) + "</p><p>Paghi al ritiro o al rider, anche con carta. Ti scriviamo un SMS quando è pronto.</p>";
    C.items.clear(); C.done = true;
    paintCart();
    toast("Ordine " + code + " confermato");
    cartGo.focus();
  });
  function openCart(mode, opener) {
    if (mode) C.mode = mode;
    fillSlots(cartSlot, SBY[cartStore.value], 30);
    fillSlots(cartDSlot, SBY[DELIVERY.store], 45);
    paintCart();
    openModal(cartM, opener);
  }
  paintCart();

  /* ================= OPENERS / NAV ================= */
  document.addEventListener("click", (e) => {
    const q = e.target.closest("[data-open-queue]");
    if (q) { e.preventDefault(); openQueue("", q); return; }
    const c = e.target.closest("[data-open-cart]");
    if (c) { e.preventDefault(); openCart(c.dataset.openCart || "", c); return; }
    const fq = e.target.closest("[data-faq]");
    if (fq) { e.preventDefault(); const d = $$("#faqList details")[+fq.dataset.faq]; d.open = true; scrollToEl(d); return; }
    const lim = e.target.closest("[data-filter-limited]");
    if (lim) { e.preventDefault(); setFilters("", "lim"); scrollToEl($("#menu")); return; }
    const a = e.target.closest('a[href^="#"]');
    if (a && a.getAttribute("href").length > 1 && !a.closest(".mm-modal")) {
      const t = document.querySelector(a.getAttribute("href"));
      if (t) { e.preventDefault(); closeDrawer(); scrollToEl(t); }
    }
    if (e.target.closest(".mm-cart-empty a")) { e.preventDefault(); closeModal(cartM); scrollToEl($("#menu")); }
  });
  // mobile drawer
  const burger = $("#burger"), drawer = $("#drawer");
  function closeDrawer() { if (drawer.hidden) return; drawer.hidden = true; burger.setAttribute("aria-expanded", "false"); burger.setAttribute("aria-label", "Apri il menu"); if (!openStack.length) document.documentElement.style.overflow = ""; }
  burger.addEventListener("click", () => {
    if (!drawer.hidden) { closeDrawer(); return; }
    drawer.hidden = false; burger.setAttribute("aria-expanded", "true"); burger.setAttribute("aria-label", "Chiudi il menu");
    document.documentElement.style.overflow = "hidden";
  });
  drawer.addEventListener("click", (e) => { if (e.target === drawer) closeDrawer(); });
  mobileMQ.addEventListener("change", () => { closeDrawer(); beltBuild(); syncChips(false); });

  /* ================= MAGNIFY · right rail (desktop) ================= */
  const rail = $("#rail"), railItems = $$(".mm-rail-it", rail);
  // gaussian of the pointer's distance to each item's centre: the one under it grows to 1.38×, neighbours a little
  function railMagnify(y) {
    railItems.forEach((it) => {
      const d = Math.abs(y - (it.offsetTop + rail.getBoundingClientRect().top + it.offsetHeight / 2));
      const s = 1 + 0.38 * Math.exp(-((d / 46) ** 2));
      it.style.setProperty("--s", s.toFixed(3));
      it.classList.toggle("is-hot", d < it.offsetHeight / 2);
    });
  }
  rail.addEventListener("pointermove", (e) => { if (e.pointerType !== "mouse" || RM) return; rail.classList.add("is-live"); railMagnify(e.clientY); });
  rail.addEventListener("pointerleave", () => { rail.classList.remove("is-live"); railItems.forEach((it) => { it.style.setProperty("--s", 1); it.classList.remove("is-hot"); }); });

  /* ================= MAGNIFY · mobile tab bar (hold and slide) ================= */
  const tabbar = $("#tabbar"), tabs = $$(".mm-tab", tabbar), tabTag = $("#tabTag");
  let tLive = null, tCur = -1, suppressClick = false;
  function tabMagnify(x) {
    const br = tabbar.getBoundingClientRect(); let best = 0, bd = 1e9;
    tabs.forEach((t, i) => { const c = t.offsetLeft + t.offsetWidth / 2, d = Math.abs(x - br.left - c); const s = 1 + 0.42 * Math.exp(-((d / 44) ** 2)) - (d > 110 ? 0.05 : 0); t.style.setProperty("--s", s.toFixed(3)); if (d < bd) { bd = d; best = i; } });
    tCur = best;
    tabTag.textContent = $("span", tabs[best]).textContent;
    tabTag.style.setProperty("--x", tabs[best].offsetLeft + tabs[best].offsetWidth / 2 + "px");
  }
  function tabReset() { tabbar.classList.remove("is-live"); tabs.forEach((t) => t.style.setProperty("--s", 1)); }
  function tabGo(i) {
    const g = tabs[i].dataset.go;
    if (g === "queue") openQueue("", tabs[i]);
    else if (g === "cart") openCart("", tabs[i]);
    else scrollToEl($(g));
  }
  tabbar.addEventListener("pointerdown", (e) => { tLive = { x: e.clientX, id: e.pointerId, live: false }; });
  tabbar.addEventListener("pointermove", (e) => {
    if (!tLive || tLive.id !== e.pointerId) return;
    if (!tLive.live && Math.abs(e.clientX - tLive.x) > 8) { tLive.live = true; tabbar.classList.add("is-live"); try { tabbar.setPointerCapture(e.pointerId); } catch (_) {} }
    if (tLive.live && !RM) tabMagnify(e.clientX);
    else if (tLive.live) tabMagnify(e.clientX);
  });
  const tabEnd = (e) => {
    if (!tLive || tLive.id !== e.pointerId) return;
    const was = tLive.live; tLive = null;
    if (was) { tabReset(); suppressClick = true; setTimeout(() => { suppressClick = false; }, 0); if (e.type === "pointerup" && tCur >= 0) tabGo(tCur); }
  };
  tabbar.addEventListener("pointerup", tabEnd);
  tabbar.addEventListener("pointercancel", tabEnd);
  tabbar.addEventListener("click", (e) => { if (suppressClick) { suppressClick = false; return; } const b = e.target.closest(".mm-tab"); if (b) tabGo(tabs.indexOf(b)); });

  /* ================= INIT ================= */
  beltBuild();
  let rT = 0; addEventListener("resize", () => { clearTimeout(rT); rT = setTimeout(beltBuild, 150); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { const el = $("[data-price]", order[0]); if (el) odo(el, el.dataset.value, { spin: false }); });

  // hooks for the acceptance scripts
  window.__mm = {
    statusAt: (id, dow, min) => statusAt(SBY[id], dow, min),
    setNow: (iso) => { nowOverride = iso ? new Date(iso) : null; paintStatus(); },
    slots: (id, lead) => slots(SBY[id], lead),
    belt: () => ({ off: B.off, vel: B.vel, n: B.plates.length, vertical: B.vertical, P: B.P }),
    heroFront: () => +order[0].dataset.idx,
    flip: (n) => flipForward(n),
    soldOut,
    cart: () => ({ n: count(), sub: subtotal(), items: [...C.items] }),
    q: Q,
  };
})();
