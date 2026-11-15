/* Hiko · sushi delivery, Verona — all interactions. No libraries. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const eur = (n) => (Math.round(n * 100) / 100).toFixed(2).replace(".", ",") + " €";
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const norm = (s) => String(s).toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9 ]/g, " ").replace(/\s+/g, " ").trim();
  const wait = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));
  const mqMobile = matchMedia("(max-width: 760px)");
  const mqNarrow = matchMedia("(max-width: 980px)");

  /* storage: the sandboxed preview throws on any access, so everything falls back to memory */
  const store = (() => {
    const mem = {}; let ls = null;
    try { ls = window.localStorage; ls.setItem("hk-t", "1"); ls.removeItem("hk-t"); } catch (e) { ls = null; }
    return {
      get(k) { try { if (ls) { const v = ls.getItem(k); return v ? JSON.parse(v) : null; } } catch (e) { /* ignore */ } return k in mem ? mem[k] : null; },
      set(k, v) { mem[k] = v; try { if (ls) ls.setItem(k, JSON.stringify(v)); } catch (e) { /* ignore */ } },
    };
  })();

  /* ================= DATA ================= */
  const L = [690, 870], D = [1110, 1380], DL = [1110, 1470];
  const SHOPS = [
    { id: "centro", n: 1, name: "Hiko Centro", addr: "Via Stella 14, 37121 Verona", area: "Centro storico", tel: "045 000 1188", pos: [262, 262],
      h: [[L, D], [L, D], [L, D], [L, D], [L, D], [L, DL], [L, DL]] },
    { id: "veronetta", n: 2, name: "Hiko Veronetta", addr: "Via XX Settembre 52, 37129 Verona", area: "Veronetta", tel: "045 000 1189", pos: [384, 262],
      h: [[[1110, 1410]], [], [[720, 870], [1110, 1410]], [[720, 870], [1110, 1410]], [[720, 870], [1110, 1410]], [[720, 870], [1110, 1410]], [[720, 870], [1110, 1500]]] },
    { id: "borgo", n: 3, name: "Hiko Borgo Trento", addr: "Via IV Novembre 8, 37126 Verona", area: "Borgo Trento", tel: "045 000 1190", pos: [196, 176],
      h: [[L, [1080, 1380]], [[1080, 1380]], [], [[1080, 1380]], [[1080, 1380]], [[1080, 1410]], [[1080, 1410]]] },
  ];
  const ZONES = [
    { id: "A", caps: ["37121", "37122", "37123", "37126", "37129"], fee: 1.9, min: 15, free: 30, eta: [20, 30], areas: "Centro storico, Cittadella, Borgo Trento, Veronetta" },
    { id: "B", caps: ["37124", "37125", "37127", "37128", "37131", "37132", "37133", "37134", "37135", "37136", "37137", "37138"], fee: 2.9, min: 20, free: 40, eta: [30, 40], areas: "Borgo Venezia, Borgo Roma, Borgo Milano, Valdonega, San Michele, Golosine" },
    { id: "C", caps: ["37139", "37142", "37057", "37036", "37060"], fee: 3.9, min: 25, free: 50, eta: [40, 55], areas: "San Massimo, Mizzole, San Giovanni Lupatoto, San Martino B.A., Lugagnano" },
  ];
  const CAP_SHOP = { centro: ["37121", "37122", "37123", "37124", "37125"], veronetta: ["37129", "37131", "37132", "37133", "37134", "37135", "37136", "37036", "37142"], borgo: ["37126", "37127", "37128", "37137", "37138", "37139", "37057", "37060"] };
  const STREETS = [
    ["Via Mazzini", "37121"], ["Piazza Bra", "37121"], ["Via Cappello", "37121"], ["Corso Cavour", "37121"], ["Via Stella", "37121"], ["Via Roma", "37121"],
    ["Stradone San Fermo", "37121"], ["Corso Porta Nuova", "37122"], ["Via San Paolo", "37129"], ["Via XX Settembre", "37129"], ["Via San Nazaro", "37129"],
    ["Via IV Novembre", "37126"], ["Via Mameli", "37126"], ["Via Marsala", "37128"], ["Via Valdonega", "37127"], ["Via Ca' di Cozzi", "37124"],
    ["Corso Venezia", "37131"], ["Via Fincato", "37131"], ["Via Unità d'Italia", "37132"], ["Via Città di Nimes", "37135"], ["Via Golosine", "37136"],
    ["Via Mantovana", "37137"], ["Corso Milano", "37138"], ["Via Bresciana", "37139"], ["Via Garofoli", "37057", "San Giovanni Lupatoto"],
    ["Via Nazionale", "37036", "San Martino Buon Albergo"], ["Corso Vittorio Emanuele II", "37069", "Villafranca di Verona"],
    ["Via Gardesana", "37019", "Peschiera del Garda"], ["Piazza Mercato", "37012", "Bussolengo"], ["Via Valpolicella", "37024", "Negrar"],
  ].map(([name, cap, city]) => ({ name, cap, city: city || "Verona" }));

  const CATS = [
    { id: "box", name: "Box da condividere", note: "Per due, tre o quattro persone. Con il codice BOX10 ne togli 10 € da 40 € di spesa." },
    { id: "roll", name: "Roll & uramaki", note: "Tagliati al momento, otto pezzi a porzione; molti si possono raddoppiare." },
    { id: "nigiri", name: "Nigiri & gunkan", note: "Due pezzi a porzione, riso tiepido e pesce tagliato al banco." },
    { id: "sashimi", name: "Sashimi & tartare", note: "Solo pesce, niente riso. Tagli spessi." },
    { id: "caldi", name: "Piatti caldi", note: "Viaggiano in contenitori separati, così arrivano caldi." },
    { id: "contorni", name: "Contorni & zuppe", note: "" },
    { id: "dolci", name: "Dolci", note: "" },
  ];
  const ING = { box: "Riso, salmone, tonno, branzino, gambero, avocado, cetriolo, alga nori, sesamo, uova di salmone.", roll: "Riso, alga nori, sesamo, pesce del giorno, avocado, salse della casa.", nigiri: "Riso, aceto di riso, pesce tagliato al banco, un tocco di wasabi.", sashimi: "Pesce crudo abbattuto, daikon, limone, foglia di shiso.", caldi: "Preparati in cucina al momento dell'ordine.", contorni: "Ricetta vegetale.", dolci: "Preparati dal nostro laboratorio." };
  const ALL = { box: "Pesce, crostacei, soia, sesamo, glutine (salsa di soia), latte (philadelphia).", roll: "Pesce, soia, sesamo; può contenere crostacei e latte.", nigiri: "Pesce, soia; può contenere crostacei.", sashimi: "Pesce, soia.", caldi: "Glutine, soia, crostacei, sesamo.", contorni: "Soia.", dolci: "Glutine, latte, uova, soia." };
  // id, cat, name, pieces, price, image, description, {tags, badge:[text, tone], size:[small, large, delta]}
  const P = (id, cat, name, pcs, price, img, desc, o = {}) => ({ id, cat, name, pcs, price, img: img.startsWith("assets/") ? img : "assets/p-" + img + ".webp", photo: !!o.photo, desc, tags: o.tags || [], badge: o.badge || null, size: o.size || null, opts: o.opts !== undefined ? o.opts : ["box", "roll", "nigiri", "sashimi"].includes(cat) });
  const PRODUCTS = [
    P("party", "box", "Box Festa", 48, 54, "sushi-party", "Per tre o quattro: uramaki di salmone, nigiri misti, gunkan e hosomaki, con tre salse diverse.", { badge: ["Novità", "terra"] }),
    P("mix", "box", "Box Hiko Mix", 32, 38.9, "sushi-mix", "Il meglio del banco in una scatola: nigiri, tiger roll, crispy tuna e sashimi di salmone.", { badge: ["Più pezzi, stesso prezzo"] }),
    P("duo", "box", "Box del Mese", 26, 31.5, "assets/fly-boat.webp", "Uramaki di salmone scottato con maionese al lime e cipolla croccante, servito nella barca.", { badge: ["Box del mese", "ink"] }),
    P("sashbox", "box", "Box Sashimi", 15, 24.9, "sashimi-misto", "Salmone, tonno e branzino tagliati spessi, con daikon e limone."),
    P("nigbox", "box", "Box Nigiri", 10, 16.9, "nigiri-misto", "Dieci nigiri dal banco: salmone, tonno, branzino, gambero e anguilla."),
    P("rainbow", "roll", "Rainbow Roll", 8, 13.5, "rainbow-maki-8-pz", "Polpa di granchio e avocado dentro, salmone, tonno e branzino sopra.", { size: ["8 pezzi", "16 pezzi", 11.5] }),
    P("tiger", "roll", "Tiger Roll", 8, 12.9, "tiger-maki-8-pz", "Gambero in tempura, salmone fiammato e uova di salmone.", { size: ["8 pezzi", "16 pezzi", 11] }),
    P("dragon", "roll", "Dragon Roll", 8, 12.9, "dragon-maki", "Anguilla laccata e avocado sopra un roll di gambero in tempura.", { tags: ["cotto"], size: ["8 pezzi", "16 pezzi", 11] }),
    P("crispy", "roll", "Crispy Tuna", 8, 11.9, "ura-crispy-tuna-8-pz", "Tartare di tonno piccante e cipolla croccante, salsa sriracha.", { tags: ["spicy"], badge: ["Piccante", "terra"] }),
    P("urasal", "roll", "Uramaki Salmone", 8, 9.9, "ura-salmone", "Salmone, avocado e sesamo tostato. Il più ordinato di Verona.", { size: ["8 pezzi", "16 pezzi", 8.5], badge: ["Più ordinato"] }),
    P("flower", "roll", "Flower Roll", 4, 7.5, "ura-flower-4-pz", "Quattro fiori di salmone con formaggio fresco ed erba cipollina."),
    P("capesante", "roll", "Roll Capesante", 8, 13.9, "capesante-maki", "Capesante scottate, crema di zucca e wasabi fresco grattugiato sopra.", { badge: ["Autunno", "ink"] }),
    P("hoso", "roll", "Hosomaki Cetriolo", 6, 4.9, "hoso-cetriolo", "Cetriolo croccante e sesamo, avvolti nell'alga.", { tags: ["veg", "cotto"], badge: ["Veggie"] }),
    P("temaki", "roll", "Temaki Salmone", 1, 5.5, "temaki-salmone", "Il cono d'alga con salmone, avocado e asparago."),
    P("nsal", "nigiri", "Nigiri Salmone", 2, 4.2, "nigiri-salmone", "Salmone norvegese su riso tiepido.", { size: ["2 pezzi", "4 pezzi", 3.9] }),
    P("nton", "nigiri", "Nigiri Tonno", 2, 4.9, "nigiri-tonno", "Tonno pinna gialla, taglio spesso.", { size: ["2 pezzi", "4 pezzi", 4.6] }),
    P("nbra", "nigiri", "Nigiri Branzino", 2, 4.5, "nigiri-branzino", "Branzino del Mediterraneo con scorza di lime."),
    P("ngam", "nigiri", "Nigiri Gambero Rosso", 2, 6.9, "nigiri-gambero-rosso", "Gambero rosso crudo con la sua testa croccante.", { badge: ["Novità", "terra"] }),
    P("nang", "nigiri", "Nigiri Anguilla", 2, 5.2, "nigiri-anguilla", "Anguilla laccata con salsa kabayaki.", { tags: ["cotto"] }),
    P("ntar", "nigiri", "Nigiri al Tartufo", 2, 5.9, "nigiri-tartufo", "Salmone scottato con olio al tartufo nero.", { badge: ["Autunno", "ink"] }),
    P("gikura", "nigiri", "Gunkan Ikura", 2, 5.9, "gunkan-ikura", "Uova di salmone marinate nella soia."),
    P("gsal", "nigiri", "Gunkan Salmone & Ikura", 2, 6.2, "gunkan-salmon-ikura", "Salmone avvolto a cupola, uova di salmone sopra."),
    P("gmix", "nigiri", "Gunkan Misto", 6, 9.9, "gunkan-misto-6-pz", "Sei gunkan diversi: salmone, tonno spicy, ikura."),
    P("gcotto", "nigiri", "Nigiri Gambero Cotto", 2, 4.4, "gambero-cotto", "Gambero cotto al vapore e aperto a farfalla.", { tags: ["cotto"] }),
    P("ssal", "sashimi", "Sashimi Salmone", 8, 10.9, "sashimi-salmone", "Otto fette di salmone con daikon e prezzemolo.", { size: ["8 fette", "16 fette", 9.9] }),
    P("ston", "sashimi", "Sashimi Tonno", 10, 14.5, "sashimi-tonno-10-pz", "Dieci fette di tonno pinna gialla."),
    P("tataki", "sashimi", "Tataki Salmone", 10, 12.9, "tataki-salmone-10-pz", "Salmone scottato in crosta di sesamo, salsa ponzu."),
    P("tartare", "sashimi", "Tartare Tonno", "1 porzione", 9.9, "tartare-tonno", "Tonno battuto al coltello, avocado e una punta di chili.", { tags: ["spicy"] }),
    P("gyoza", "caldi", "Gyoza", 5, 5.9, "gyoza", "Ravioli di maiale e verza, piastrati e poi al vapore.", { tags: ["cotto"], size: ["5 pezzi", "10 pezzi", 5.2], opts: false }),
    P("kataifi", "caldi", "Ebi Kataifi", 4, 7.9, "ebi-kataifi", "Gamberi avvolti nella pasta kataifi e fritti.", { tags: ["cotto"], opts: false }),
    P("ramen", "caldi", "Ramen ai Gamberi", "1 ciotola", 12.5, "ramen-gamberi", "Brodo di pollo e miso, noodles, gamberi, uovo marinato.", { tags: ["cotto"], opts: false, photo: true }),
    P("xlb", "caldi", "Xiao Long Bao", 4, 6.5, "xiao-long-bao", "Ravioli in brodo al vapore: si mangiano in un boccone.", { tags: ["cotto"], opts: false, photo: true }),
    P("edamame", "contorni", "Edamame", "150 g", 4.5, "edamame", "Fagioli di soia al vapore con sale grosso.", { tags: ["veg", "cotto"], badge: ["Veggie"] }),
    P("miso", "contorni", "Zuppa di Miso", "1 ciotola", 3.5, "miso", "Miso bianco, tofu, alga wakame ed erba cipollina.", { tags: ["veg", "cotto"] }),
    P("mochi", "dolci", "Mochi", 3, 5.9, "mochi", "Tre mochi gelato: mango, cocco e azuki.", { tags: ["veg", "cotto"] }),
    P("dorayaki", "dolci", "Dorayaki", 2, 4.9, "dorayaki", "Due pancake soffici ripieni di crema di azuki.", { tags: ["veg", "cotto"], photo: true }),
  ];
  const PBY = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
  const SAUCE = { id: "salsa", label: "Salsa", type: "one", opts: [["soia", "Soia classica", 0], ["dolce", "Soia dolce", 0], ["teri", "Teriyaki", 0.5], ["spicy", "Spicy mayo", 0.5]] };
  const EXTRA = { id: "extra", label: "Extra", type: "many", opts: [["wasabi", "Wasabi in più", 0.3], ["zenzero", "Zenzero in più", 0.3], ["bacchette", "Bacchette in più", 0]] };
  const groupsFor = (p) => {
    const g = [];
    if (p.size) g.push({ id: "porz", label: "Porzione", type: "one", opts: [["s", p.size[0], 0], ["l", p.size[1], p.size[2]]] });
    if (p.opts) g.push(SAUCE, EXTRA);
    return g;
  };
  const PROMOS = {
    HIKO10: { label: "−10% sul carrello", test: (c) => c.sub >= 25 ? null : "HIKO10 vale da 25 € di spesa", value: (c) => c.sub * 0.1 },
    BENVENUTO: { label: "−5 € di benvenuto", test: (c) => c.sub >= 20 ? null : "BENVENUTO vale da 20 € di spesa", value: () => 5 },
    BOX10: { label: "−10 € sulle box", test: (c) => !c.hasBox ? "BOX10 vale solo se nel carrello c'è almeno una box" : c.sub < 40 ? "BOX10 vale da 40 € di spesa" : null, value: () => 10 },
  };
  const COLLAB = [["gikura", "ph-gunkan-ikura"], ["sashbox", "ph-sashimi-vetro"], ["nsal", "ph-nigiri-salmone"], ["ntar", "ph-nigiri-tartufo"]];

  /* ================= TIME (Europe/Rome) ================= */
  const DAYS = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
  const DAYS_SHORT = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
  const MONTHS = ["GEN", "FEB", "MAR", "APR", "MAG", "GIU", "LUG", "AGO", "SET", "OTT", "NOV", "DIC"];
  const fmtRome = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", weekday: "short", year: "numeric", month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  let nowOverride = null;
  function romeNow() {
    const parts = Object.fromEntries(fmtRome.formatToParts(new Date()).map((p) => [p.type, p.value]));
    const real = { dow: WD[parts.weekday], min: (+parts.hour % 24) * 60 + +parts.minute, d: +parts.day, m: +parts.month, y: +parts.year };
    return nowOverride ? { ...real, ...nowOverride } : real;
  }
  const hhmm = (m) => { m = ((m % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); };
  function statusFor(shop, dow, min) {
    const today = shop.h[dow], yest = shop.h[(dow + 6) % 7];
    let until = null;
    for (const [a, b] of yest) if (b > 1440 && min < b - 1440) until = b - 1440;
    for (const [a, b] of today) if (min >= a && min < b) until = b;
    if (until !== null) {
      const left = until - min;
      return left <= 30 ? { open: true, state: "soon", label: "Chiude presto", text: "Chiude alle " + hhmm(until), left } : { open: true, state: "open", label: "Aperto", text: "Fino alle " + hhmm(until), left };
    }
    for (const [a] of today) if (a > min) return { open: false, state: "closed", label: "Chiuso", text: "Apre oggi alle " + hhmm(a) };
    for (let d = 1; d <= 7; d++) {
      const iv = shop.h[(dow + d) % 7];
      if (iv.length) return { open: false, state: "closed", label: "Chiuso", text: (d === 1 ? "Apre domani" : "Apre " + DAYS[(dow + d) % 7]) + " alle " + hhmm(iv[0][0]) };
    }
    return { open: false, state: "closed", label: "Chiuso", text: "" };
  }
  const shopStatus = (shop) => { const n = romeNow(); return statusFor(shop, n.dow, n.min); };
  /* slots every 15 min from now + lead time until 15 min before closing, today and tomorrow (incl. after midnight) */
  function slotsFor(shop, lead, now = romeNow()) {
    const out = [[], []];
    const ceil15 = (m) => Math.ceil(m / 15) * 15;
    const earliest = now.min + lead;
    for (const [a, b] of shop.h[(now.dow + 6) % 7]) if (b > 1440) for (let t = Math.max(0, ceil15(earliest)); t <= b - 1440 - 15; t += 15) out[0].push(t);
    for (const [a, b] of shop.h[now.dow]) for (let t = Math.max(a + 15, ceil15(earliest)); t <= b - 15; t += 15) out[0].push(t);
    for (const [a, b] of shop.h[(now.dow + 1) % 7]) for (let t = a + 15; t <= b - 15; t += 15) out[1].push(t);
    // tomorrow's after-midnight tail belongs to "domani" too only if it's before tomorrow's own opening; keep it simple: drop
    const st = statusFor(shop, now.dow, now.min);
    const asap = st.open && st.left >= lead;
    return { days: out, asap };
  }

  /* ================= STATE ================= */
  const saved = store.get("hk-state") || {};
  const state = {
    mode: saved.mode === "pickup" ? "pickup" : "delivery",
    addr: saved.addr || null,          // {label, cap, zone, city}
    shop: saved.shop || null,          // shop id
    cart: Array.isArray(saved.cart) ? saved.cart.filter((l) => PBY[l.id]) : [],
    promo: saved.promo || null,
    cat: "all", diet: new Set(),
    slot: null,                        // {d, t} or "asap"
  };
  const persist = () => store.set("hk-state", { mode: state.mode, addr: state.addr, shop: state.shop, cart: state.cart, promo: state.promo });
  const zoneOf = (cap) => ZONES.find((z) => z.caps.includes(cap)) || null;
  const shopForCap = (cap) => SHOPS.find((s) => CAP_SHOP[s.id].includes(cap)) || SHOPS[0];
  const curZone = () => (state.addr && state.addr.zone ? ZONES.find((z) => z.id === state.addr.zone) : null);
  const curShop = () => SHOPS.find((s) => s.id === state.shop) || null;

  function totals() {
    const sub = state.cart.reduce((s, l) => s + l.unit * l.qty, 0);
    const count = state.cart.reduce((s, l) => s + l.qty, 0);
    const hasBox = state.cart.some((l) => PBY[l.id].cat === "box");
    const ctx = { sub, hasBox };
    let disc = 0, promoErr = null;
    if (state.promo && PROMOS[state.promo]) { promoErr = PROMOS[state.promo].test(ctx); if (!promoErr) disc = Math.min(sub, PROMOS[state.promo].value(ctx)); }
    const z = curZone();
    let fee = 0, minOk = true, missing = 0, toFree = null, needAddr = false;
    if (state.mode === "delivery") {
      if (!z) needAddr = true;
      else {
        fee = sub >= z.free ? 0 : z.fee;
        toFree = Math.max(0, z.free - sub);
        if (sub < z.min) { minOk = false; missing = z.min - sub; }
      }
    }
    const total = Math.max(0, sub - disc) + fee;
    return { sub, count, hasBox, disc, promoErr, fee, minOk, missing, toFree, needAddr, total, zone: z };
  }

  /* ================= UI HELPERS ================= */
  const toastEl = $("#toast"); let toastT = 0;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add("is-on"); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("is-on"), 2600); }
  const lockers = new Set();
  function lock(k, on) { on ? lockers.add(k) : lockers.delete(k); document.body.classList.toggle("hk-lock", lockers.size > 0); }
  const nextFrame = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
  async function show(el, k) { el.hidden = false; lock(k, true); await nextFrame(); el.classList.add("is-on"); }
  async function hide(el, k, ms = 300) { el.classList.remove("is-on"); lock(k, false); await wait(ms); if (!el.classList.contains("is-on")) el.hidden = true; }

  /* mode toggles share one pill style; the pill slides under the selected tab */
  function placeModePill(group, animate) {
    const btn = $('button[aria-selected="true"]', group), pill = $(".hk-mode-pill", group);
    if (!btn || !pill || !btn.offsetWidth) return;
    pill.style.transition = animate && !reduce ? "transform 300ms cubic-bezier(.22,1,.36,1), width 300ms cubic-bezier(.22,1,.36,1)" : "none";
    pill.style.width = btn.offsetWidth + "px";
    pill.style.transform = `translateX(${btn.offsetLeft - 4}px)`;
  }

  /* ================= HEADER ================= */
  const top = $("#top"), order = $("#order");
  function updateHdr() {
    const compact = order.getBoundingClientRect().bottom < top.offsetHeight + 4;
    top.classList.toggle("is-compact", compact);
    $("#mini").setAttribute("aria-hidden", compact ? "false" : "true");
    $$("#mini button").forEach((b) => (b.tabIndex = compact ? 0 : -1));
    const extra = compact && mqMobile.matches ? $("#mini").offsetHeight : 0;
    document.documentElement.style.setProperty("--hdr", top.offsetHeight + extra + "px");
  }
  addEventListener("scroll", updateHdr, { passive: true });
  addEventListener("resize", () => { updateHdr(); placeModePill($("#heroMode")); placeModePill($("#cartMode")); placeCatPill(false); applyFloatLayout(); });

  function renderHeader() {
    const z = curZone(), s = curShop();
    $("#miniModeTxt").textContent = state.mode === "delivery" ? "In consegna" : "Da asporto";
    const eta = $("#miniEta");
    if (state.mode === "delivery" && z) {
      $("#miniAddrTxt").textContent = state.addr.label;
      eta.hidden = false; $("b", eta).textContent = `${z.eta[0]}–${z.eta[1]} min`;
    } else if (state.mode === "pickup" && s) {
      $("#miniAddrTxt").textContent = "Ritiro: " + s.name;
      eta.hidden = false; $("b", eta).textContent = "15 min";
    } else {
      $("#miniAddrTxt").textContent = state.mode === "delivery" ? "Inserisci il tuo indirizzo" : "Scegli uno shop";
      eta.hidden = true;
    }
    $("#navShopName").textContent = s && (state.mode === "pickup" || z) ? s.name : "I nostri shop";
    const t = totals();
    $("#cartCount").textContent = t.count;
    const dot = $("#cartDot"); dot.textContent = t.count; dot.classList.toggle("is-zero", t.count === 0);
    $("#cartBtn").setAttribute("aria-label", `Carrello, ${t.count} articoli`);
  }
  $("#miniAddr").addEventListener("click", () => { scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" }); setTimeout(() => $("#addrInput").focus({ preventScroll: true }), reduce ? 0 : 450); });
  $("#miniMode").addEventListener("click", () => setMode(state.mode === "delivery" ? "pickup" : "delivery"));

  /* side menu */
  const side = $("#sideMenu"), menuScrim = $("#menuScrim");
  function openMenu(on) {
    $("#burger").setAttribute("aria-expanded", on ? "true" : "false");
    side.setAttribute("aria-hidden", on ? "false" : "true");
    if (on) { show(menuScrim, "menu"); side.classList.add("is-on"); setTimeout(() => $("#menuClose").focus(), 50); }
    else { side.classList.remove("is-on"); hide(menuScrim, "menu"); }
  }
  $("#burger").addEventListener("click", () => openMenu(true));
  $("#menuClose").addEventListener("click", () => openMenu(false));
  menuScrim.addEventListener("click", () => openMenu(false));
  $$("[data-close]", side).forEach((a) => a.addEventListener("click", () => openMenu(false)));

  /* ================= HERO: carousel + floating field ================= */
  const hero = $("#hero"), field = $("#floatField");
  const FLOATS = [
    // key, src, slide (-1 = always), desktop [x%, y%, width, rot, z], mobile [...]
    ["boat", "fly-boat", 0, [41, 24, "clamp(190px, 19vw, 300px)", 58, 0.85], [46, 18, "36vw", 62, 0.85]],
    ["box", "fly-box", 1, [37, 30, "clamp(280px, 30vw, 450px)", -9, 0.85], [32, 25, "62vw", -9, 0.85]],
    ["capesante", "fly-capesante", 2, [35, 42, "clamp(320px, 33vw, 500px)", -13, 0.85], [26, 30, "72vw", -13, 0.85]],
    ["gunkan", "fly-gunkan", -1, [78, 5, "clamp(120px, 12vw, 180px)", 12, 0.6], [75, 34, "25vw", 12, 0.6]],
    ["nigiri", "fly-nigiri", -1, [89, 30, "clamp(110px, 10.5vw, 160px)", -16, 0.95], [-5, 22, "26vw", -16, 0.95]],
    ["hoso", "fly-hoso", -1, [70, 44, "clamp(150px, 15vw, 220px)", 24, 0.45], [70, 2, "0px", 0, 0.45]],
    ["mochi", "fly-mochi", -1, [84, 67, "clamp(150px, 14vw, 210px)", -8, 0.75], [66, 76, "30vw", -8, 0.75]],
    ["gyoza", "fly-gyoza", -1, [60, 77, "clamp(120px, 12vw, 180px)", 9, 0.3], [5, 2, "0px", 0, 0.1]],
  ];
  const floatEls = FLOATS.map(([key, src, slide]) => {
    const el = document.createElement("div");
    el.className = "hk-fl" + (slide >= 0 ? " hk-fl-piece" : "") + (slide === 0 ? " is-on" : "");
    el.dataset.key = key; el.dataset.slide = slide;
    el.innerHTML = `<img src="assets/${src}.webp" alt="" draggable="false" ${slide > 0 ? 'loading="lazy"' : ""}>`;
    field.appendChild(el); return el;
  });
  function applyFloatLayout() {
    const m = mqMobile.matches;
    FLOATS.forEach((f, i) => {
      const [x, y, w, r, z] = m ? f[4] : f[3];
      const el = floatEls[i];
      el.style.setProperty("--x", x + "%"); el.style.setProperty("--y", y + "%"); el.style.setProperty("--w", w);
      el.style.setProperty("--r", r + "deg"); el.style.setProperty("--z", z);
      el.style.display = w === "0px" ? "none" : "";
    });
  }
  applyFloatLayout();
  /* pointer target (-1..1); the drift loop eases the field towards it so near dishes travel further than far ones */
  const ptr = { tx: 0, ty: 0, x: 0, y: 0 };
  const setPointer = (px, py) => { ptr.tx = +px; ptr.ty = +py; if (reduce) { field.style.setProperty("--px", px); field.style.setProperty("--py", py); } };
  hero.addEventListener("pointermove", (e) => { if (e.pointerType !== "mouse") return; const r = hero.getBoundingClientRect(); setPointer(((e.clientX - r.left) / r.width * 2 - 1).toFixed(3), ((e.clientY - r.top) / r.height * 2 - 1).toFixed(3)); });
  hero.addEventListener("pointerleave", () => setPointer(0, 0));
  let heroVisible = true;
  if ("IntersectionObserver" in window) new IntersectionObserver((es) => { heroVisible = es[0].isIntersecting; }).observe(hero);
  if (!reduce) {
    const t0 = performance.now();
    const tick = (now) => {
      if (heroVisible) {
        const t = (now - t0) / 1000;
        ptr.x += (ptr.tx - ptr.x) * 0.06; ptr.y += (ptr.ty - ptr.y) * 0.06;
        field.style.setProperty("--px", ptr.x.toFixed(4)); field.style.setProperty("--py", ptr.y.toFixed(4));
        floatEls.forEach((el, i) => {
          const z = FLOATS[i][3][4];
          el.style.setProperty("--dx", (Math.sin(t * 0.42 + i * 1.7) * 7 * (0.4 + z)).toFixed(2) + "px");
          el.style.setProperty("--dy", (Math.cos(t * 0.33 + i * 2.1) * 10 * (0.4 + z)).toFixed(2) + "px");
        });
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }
  let slide = 0, autoT = 0, autoOn = !reduce;
  const slides = $$(".hk-slide");
  function goSlide(i) {
    slide = (i + slides.length) % slides.length;
    hero.dataset.slide = slide;
    slides.forEach((s, k) => { const on = k === slide; s.classList.toggle("is-on", on); s.setAttribute("aria-hidden", on ? "false" : "true"); $$("a,button", s).forEach((b) => (b.tabIndex = on ? 0 : -1)); });
    floatEls.forEach((el) => { const s = +el.dataset.slide; if (s >= 0) el.classList.toggle("is-on", s === slide); });
    $("#heroCount").textContent = `${slide + 1} / ${slides.length}`;
  }
  goSlide(0);
  const scheduleAuto = () => { clearTimeout(autoT); if (autoOn) autoT = setTimeout(() => { if (!hero.matches(":hover") && !order.contains(document.activeElement) && document.visibilityState === "visible") goSlide(slide + 1); scheduleAuto(); }, 7000); };
  scheduleAuto();
  $("#heroPrev").addEventListener("click", () => { autoOn = false; clearTimeout(autoT); goSlide(slide - 1); });
  $("#heroNext").addEventListener("click", () => { autoOn = false; clearTimeout(autoT); goSlide(slide + 1); });
  let swipeX = null;
  hero.addEventListener("touchstart", (e) => { if (!order.contains(e.target)) swipeX = e.touches[0].clientX; }, { passive: true });
  hero.addEventListener("touchend", (e) => { if (swipeX === null) return; const dx = e.changedTouches[0].clientX - swipeX; swipeX = null; if (Math.abs(dx) > 60) { autoOn = false; clearTimeout(autoT); goSlide(slide + (dx < 0 ? 1 : -1)); } }, { passive: true });

  /* ================= ADDRESS / ZONE ================= */
  const addrInput = $("#addrInput"), sug = $("#addrSug"), zoneMsg = $("#zoneMsg");
  let sugItems = [], sugIdx = -1;
  function streetMatches(q) {
    const nq = norm(q).replace(/\b\d+\b/g, "").replace(/\bverona\b/g, "").trim();
    if (nq.length < 2) return [];
    const words = nq.split(" ");
    return STREETS.map((s) => {
      const ns = norm(s.name + " " + s.city);
      if (!words.every((w) => ns.includes(w))) return null;
      return { s, score: ns.startsWith(nq) ? 0 : norm(s.name).split(" ").some((w) => w.startsWith(words[words.length - 1])) ? 1 : 2 };
    }).filter(Boolean).sort((a, b) => a.score - b.score).map((x) => x.s);
  }
  const houseNo = (q) => { const m = q.match(/\b(\d{1,4}[a-z]?)\b(?!\d)/i); return m && m[1].length < 5 ? m[1] : ""; };
  const fromStreet = (s, q) => { const n = houseNo(q); return { label: `${s.name}${n ? " " + n : ""}, ${s.cap} ${s.city}`, cap: s.cap, city: s.city, zone: zoneOf(s.cap)?.id || null }; };
  function resolveAddress(q) {
    q = q.trim();
    if (!q) return { err: "Scrivi via e numero, oppure il CAP." };
    const cap = (q.match(/\b(\d{5})\b/) || [])[1];
    const ms = streetMatches(q);
    if (cap) {
      if (!/^3[0-9]{4}$/.test(cap)) return { err: `Il CAP ${cap} non sembra della provincia di Verona.` , cap };
      const street = ms.find((s) => s.cap === cap);
      const label = street ? fromStreet(street, q).label : q.replace(/\s+/g, " ");
      return { label, cap, city: street ? street.city : "Verona", zone: zoneOf(cap)?.id || null };
    }
    if (ms.length === 1 || (ms.length > 1 && norm(ms[0].name) === norm(q).replace(/\b\d+\b/g, "").trim() && ms.filter((s) => s.name === ms[0].name).length === 1)) return fromStreet(ms[0], q);
    if (ms.length > 1) return { err: "Più vie corrispondono: scegline una dai suggerimenti o aggiungi il CAP." };
    return { err: "Non troviamo questa via: aggiungi il CAP (es. 37121) e riprova." };
  }
  function renderSug() {
    const q = addrInput.value;
    if (state.mode === "delivery") {
      sugItems = streetMatches(q).slice(0, 6).map((s) => ({ kind: "street", s, label: fromStreet(s, q).label }));
    } else {
      const nq = norm(q);
      sugItems = SHOPS.filter((s) => !nq || norm(s.name + " " + s.addr + " " + s.area).includes(nq)).map((s) => ({ kind: "shop", shop: s }));
    }
    sugIdx = sugItems.length && state.mode === "pickup" ? -1 : -1;
    if (!sugItems.length || document.activeElement !== addrInput) { sug.hidden = true; addrInput.setAttribute("aria-expanded", "false"); return; }
    sug.innerHTML = sugItems.map((it, i) => {
      if (it.kind === "street") { const z = zoneOf(it.s.cap); return `<li role="option" id="sug${i}" data-i="${i}" aria-selected="false"><svg><use href="#i-pin"/></svg><span>${esc(it.label)}</span><small><i class="hk-z${z ? "" : " out"}">${z ? "Zona " + z.id : "Fuori zona"}</i></small></li>`; }
      const st = shopStatus(it.shop); return `<li role="option" id="sug${i}" data-i="${i}" aria-selected="false"><svg><use href="#i-shop"/></svg><span><b>${esc(it.shop.name)}</b><br><small style="margin:0">${esc(it.shop.addr)}</small></span><small class="hk-st-${st.state}">${st.label}</small></li>`;
    }).join("");
    sug.hidden = false; addrInput.setAttribute("aria-expanded", "true");
  }
  function moveSug(d) {
    if (sug.hidden || !sugItems.length) return;
    sugIdx = (sugIdx + d + sugItems.length) % sugItems.length;
    $$("li", sug).forEach((li, i) => li.setAttribute("aria-selected", i === sugIdx ? "true" : "false"));
    addrInput.setAttribute("aria-activedescendant", "sug" + sugIdx);
  }
  function pickSug(i) {
    const it = sugItems[i]; if (!it) return;
    sug.hidden = true; addrInput.setAttribute("aria-expanded", "false");
    if (it.kind === "street") { addrInput.value = it.label; setAddress(fromStreet(it.s, it.label)); }
    else { addrInput.value = it.shop.name; setPickupShop(it.shop.id, true); }
  }
  let sugT = 0;
  addrInput.addEventListener("input", () => { clearTimeout(sugT); sugT = setTimeout(renderSug, 90); });
  addrInput.addEventListener("focus", renderSug);
  addrInput.addEventListener("blur", () => setTimeout(() => { sug.hidden = true; addrInput.setAttribute("aria-expanded", "false"); }, 160));
  addrInput.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); moveSug(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); moveSug(-1); }
    else if (e.key === "Escape") { sug.hidden = true; }
  });
  sug.addEventListener("mousedown", (e) => e.preventDefault());
  sug.addEventListener("click", (e) => { const li = e.target.closest("li"); if (li) pickSug(+li.dataset.i); });
  $("#heroAddr").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!sug.hidden && sugIdx >= 0) return pickSug(sugIdx);
    sug.hidden = true;
    if (state.mode === "pickup") {
      const nq = norm(addrInput.value);
      const hit = SHOPS.find((s) => nq && norm(s.name + " " + s.addr + " " + s.area).includes(nq));
      if (hit) { addrInput.value = hit.name; setPickupShop(hit.id, true); }
      else zoneCard("info", "Scegli uno shop", "<p>Scrivi «centro», «Veronetta» o «Borgo Trento», oppure toccane uno nella lista.</p>");
      return;
    }
    const r = resolveAddress(addrInput.value);
    if (r.err) { zoneCard("info", "Ci serve un dettaglio in più", `<p>${esc(r.err)}</p>`); return; }
    addrInput.value = r.label; setAddress(r);
  });

  function zoneCard(kind, title, body, actions = "") {
    zoneMsg.innerHTML = `<div class="hk-zone-card ${kind}"><button class="hk-x hk-zone-x" type="button" data-act="zone-close" aria-label="Chiudi"><svg><use href="#i-close"/></svg></button><header><i><svg><use href="#i-${kind === "ok" ? "check" : kind === "bad" ? "close" : "pin"}"/></svg></i>${title}</header>${body}${actions ? `<div class="hk-zone-act">${actions}</div>` : ""}</div>`;
  }
  function renderZoneCard() {
    if (state.mode === "pickup") {
      const s = curShop(); if (!s) { zoneMsg.innerHTML = ""; return; }
      const st = shopStatus(s);
      zoneCard(st.open ? "ok" : "info", `Ritiro da ${esc(s.name)}`, `<ul><li>Indirizzo <b>${esc(s.addr.split(",")[0])}</b></li><li>Pronto in <b>15 min</b></li><li>Stato <b class="hk-st-${st.state}">${st.label}</b></li><li>Consegna <b>gratis</b></li></ul><p>${st.open ? st.text + "." : st.text + ": puoi già scegliere l'orario."}</p>`, `<a class="hk-btn hk-btn-ink" href="#carta">Vai al menu</a>`);
      return;
    }
    if (!state.addr) { zoneMsg.innerHTML = ""; return; }
    const z = curZone();
    if (!z) {
      const near = SHOPS[0];
      zoneCard("bad", `Non arriviamo ancora al ${esc(state.addr.cap)}`, `<p>${esc(state.addr.label)} è fuori dalle nostre zone. Puoi ordinare lo stesso e ritirare in shop: il più comodo è ${esc(near.name)}, ${esc(near.addr.split(",")[0])}.</p>`, `<button class="hk-btn hk-btn-ink" type="button" data-act="to-pickup">Passa al ritiro</button><button class="hk-btn hk-btn-line" type="button" data-act="change-addr">Cambia indirizzo</button>`);
      return;
    }
    const s = curShop(), st = s ? shopStatus(s) : null;
    zoneCard("ok", `Consegniamo qui · Zona ${z.id}`, `<ul><li>Consegna <b>${eur(z.fee)}</b></li><li>Minimo <b>${eur(z.min)}</b></li><li>Gratis da <b>${eur(z.free)}</b></li><li>Arrivo <b>${z.eta[0]}–${z.eta[1]} min</b></li></ul><p>Prepara ${esc(s.name)} · <span class="hk-st-${st.state}">${st.open ? st.text : st.text + ", ordina per dopo"}</span></p>`, `<a class="hk-btn hk-btn-ink" href="#carta">Vai al menu</a><button class="hk-btn hk-btn-line" type="button" data-act="change-addr">Cambia</button>`);
  }
  zoneMsg.addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    if (b.dataset.act === "to-pickup") { setMode("pickup"); setPickupShop(state.shop || "centro", false); }
    if (b.dataset.act === "change-addr") { addrInput.value = ""; addrInput.focus(); }
    if (b.dataset.act === "zone-close") zoneMsg.innerHTML = "";
  });

  function setAddress(r) {
    state.addr = { label: r.label, cap: r.cap, city: r.city, zone: r.zone };
    if (r.zone) state.shop = shopForCap(r.cap).id;
    state.slot = null;
    persist(); refreshAll();
    if (r.zone) toast(`Zona ${r.zone}: consegniamo a ${r.label.split(",")[0]}`);
  }
  function setPickupShop(id, announce) {
    state.shop = id; state.slot = null; persist(); refreshAll();
    if (announce) toast(`Ritiro da ${curShop().name}`);
  }
  function setMode(m) {
    if (state.mode === m) return;
    state.mode = m; state.slot = null;
    if (m === "pickup" && !state.shop) state.shop = "centro";
    persist();
    addrInput.value = m === "delivery" ? (state.addr ? state.addr.label : "") : (curShop() ? curShop().name : "");
    refreshAll(true);
  }
  function renderModes(animate) {
    $$(".hk-mode").forEach((g) => {
      $$("button", g).forEach((b) => b.setAttribute("aria-selected", b.dataset.mode === state.mode ? "true" : "false"));
      placeModePill(g, animate);
    });
    addrInput.placeholder = state.mode === "delivery" ? "Inserisci un indirizzo di consegna" : "Cerca uno shop o un quartiere";
    $(".hk-addr-pin use").setAttribute("href", state.mode === "delivery" ? "#i-pin" : "#i-shop");
    $("label[for=addrInput]").textContent = state.mode === "delivery" ? "Indirizzo di consegna" : "Shop per il ritiro";
  }
  $$(".hk-mode").forEach((g) => g.addEventListener("click", (e) => { const b = e.target.closest("button[data-mode]"); if (b) setMode(b.dataset.mode); }));

  /* zone table */
  function renderZoneTable() {
    const mine = state.mode === "delivery" ? state.addr?.zone : null;
    $("#zoneTable").innerHTML = ZONES.map((z) => `<article class="hk-zc${mine === z.id ? " is-mine" : ""}" data-zone="${z.id}"><h3><span><span class="hk-zc-sw hk-lg-${z.id.toLowerCase()}"></span>Zona ${z.id}</span><i>La tua</i></h3><p>${z.areas}</p><dl><dt>Consegna</dt><dd>${eur(z.fee)}</dd><dt>Minimo d'ordine</dt><dd>${eur(z.min)}</dd><dt>Gratis da</dt><dd>${eur(z.free)}</dd><dt>Arrivo</dt><dd>${z.eta[0]}–${z.eta[1]} min</dd><dt>CAP</dt><dd>${z.caps.length} codici</dd></dl></article>`).join("")
      + `<article class="hk-zc out${state.addr && !state.addr.zone && state.mode === "delivery" ? " is-mine" : ""}"><h3><span>Fuori zona</span><i>La tua</i></h3><p>Villafranca, Bussolengo, Peschiera, Valpolicella e oltre.</p><dl><dt>Ritiro in shop</dt><dd>gratis</dd><dt>Pronto in</dt><dd>15 min</dd><dt>Minimo</dt><dd>nessuno</dd></dl></article>`;
  }

  /* ================= COLLAB TILES ================= */
  $("#collabTiles").innerHTML = COLLAB.map(([id, ph]) => { const p = PBY[id]; return `<button class="hk-tile" type="button" data-open="${id}"><span class="hk-tile-m"><img src="assets/${ph}.webp" alt="${esc(p.name)}" loading="lazy"><em>Ordina</em></span><b>${esc(p.name)}</b><small>${pcsTxt(p.pcs)} · ${eur(p.price)}</small></button>`; }).join("");
  function pcsTxt(pcs) { return typeof pcs === "number" ? `${pcs} ${pcs === 1 ? "pezzo" : "pezzi"}` : pcs; }

  /* ================= CARTA: filter chips + grid ================= */
  const catList = $("#catList"), catPill = $(".hk-cats-pill"), grid = $("#grid");
  catList.insertAdjacentHTML("beforeend", [{ id: "all", name: "Tutto il menu" }, ...CATS].map((c) => `<button type="button" data-cat="${c.id}" aria-pressed="${c.id === "all"}">${c.name}<small>${c.id === "all" ? PRODUCTS.length : PRODUCTS.filter((p) => p.cat === c.id).length}</small></button>`).join(""));
  let pillEdges = null, pillRaf = 0;
  function placeCatPill(animate) {
    const btn = $('button[aria-pressed="true"]', catList); if (!btn || !btn.offsetWidth) return;
    const horiz = mqNarrow.matches;
    const to = horiz ? [btn.offsetLeft, btn.offsetLeft + btn.offsetWidth] : [btn.offsetTop, btn.offsetTop + btn.offsetHeight];
    const apply = ([a, b]) => {
      if (horiz) { catPill.style.top = btn.offsetTop + "px"; catPill.style.height = btn.offsetHeight + "px"; catPill.style.left = a + "px"; catPill.style.width = b - a + "px"; catPill.style.right = "auto"; }
      else { catPill.style.left = "0"; catPill.style.right = "0"; catPill.style.width = "auto"; catPill.style.top = a + "px"; catPill.style.height = b - a + "px"; }
      pillEdges = [a, b, horiz];
    };
    cancelAnimationFrame(pillRaf);
    if (!animate || reduce || !pillEdges || pillEdges[2] !== horiz) { apply(to); return; }
    /* leading edge leaves first (220 ms), trailing edge follows (300 ms, 40 ms late): the pill stretches on the way */
    const from = pillEdges.slice(0, 2), fwd = to[0] > from[0], t0 = performance.now();
    const eOut = (t) => 1 - Math.pow(1 - t, 3), eIo = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const step = (now) => {
      const ms = now - t0;
      const lead = eOut(Math.min(1, ms / 220)), trail = eIo(Math.min(1, Math.max(0, (ms - 40) / 300)));
      const pa = fwd ? trail : lead, pb = fwd ? lead : trail;
      apply([from[0] + (to[0] - from[0]) * pa, from[1] + (to[1] - from[1]) * pb]);
      if (ms < 340) pillRaf = requestAnimationFrame(step); else apply(to);
    };
    pillRaf = requestAnimationFrame(step);
  }
  function filtered() {
    return PRODUCTS.filter((p) => (state.cat === "all" || p.cat === state.cat) && [...state.diet].every((d) => p.tags.includes(d)));
  }
  function cardHTML(p) {
    const tag = p.badge ? `<span class="hk-tag ${p.badge[1] || ""}">${esc(p.badge[0])}</span>` : "";
    const q = state.cart.filter((l) => l.id === p.id).reduce((s, l) => s + l.qty, 0);
    return `<article class="hk-pc" data-id="${p.id}"><button class="hk-pc-open" type="button" data-open="${p.id}" aria-label="${esc(p.name)}, ${eur(p.price)}: dettagli e opzioni"><span class="hk-pc-m${p.photo ? " is-photo" : ""}">${tag}<img src="${p.img}" alt="" loading="lazy"></span>${p.badge ? `<span class="hk-tag hk-pc-tagm ${p.badge[1] || ""}">${esc(p.badge[0])}</span>` : ""}<span class="hk-pc-n">${esc(p.name)}</span><span class="hk-pc-meta"><b>${eur(p.price)}</b> · ${pcsTxt(p.pcs)}</span></button><button class="hk-pc-add" type="button" data-add="${p.id}" aria-label="Aggiungi ${esc(p.name)} al carrello"><svg><use href="#i-plus"/></svg>${q ? `<span class="hk-pc-q">${q}</span>` : ""}</button></article>`;
  }
  function gridHTML(list) {
    if (state.cat !== "all") return list.map(cardHTML).join("");
    return CATS.map((c) => { const items = list.filter((p) => p.cat === c.id); return items.length ? `<h3 class="hk-grid-h">${c.name}</h3>` + items.map(cardHTML).join("") : ""; }).join("");
  }
  let gridTimers = [], shownKey = "";
  function renderGrid(animate) {
    const list = filtered();
    const key = state.cat + "|" + [...state.diet].sort().join(",");
    const c = CATS.find((x) => x.id === state.cat);
    $("#cartaTitle").textContent = c ? c.name : "Il menu";
    $("#cartaNote").textContent = `${list.length} ${list.length === 1 ? "piatto" : "piatti"}${c && c.note ? " · " + c.note : ""}`;
    $("#gridEmpty").hidden = list.length > 0;
    if (key === shownKey && animate) return;
    gridTimers.forEach(clearTimeout); gridTimers = [];
    const build = (withIn) => {
      grid.classList.remove("is-leaving");
      grid.innerHTML = gridHTML(list);
      if (!withIn) return;
      const kids = [...grid.children];
      kids.forEach((k) => k.classList.add("hk-in"));
      grid.getBoundingClientRect();
      kids.forEach((k, i) => gridTimers.push(setTimeout(() => k.classList.remove("hk-in"), 16 + Math.min(i, 12) * 40)));
    };
    shownKey = key;
    if (!animate || reduce) { build(false); return; }
    grid.classList.add("is-leaving");
    gridTimers.push(setTimeout(() => build(true), 200));
  }
  function refreshCardBadges() {
    $$(".hk-pc", grid).forEach((card) => {
      const q = state.cart.filter((l) => l.id === card.dataset.id).reduce((s, l) => s + l.qty, 0);
      const btn = $(".hk-pc-add", card); let b = $(".hk-pc-q", btn);
      if (q && !b) { b = document.createElement("span"); b.className = "hk-pc-q"; btn.appendChild(b); }
      if (b) { if (q) b.textContent = q; else b.remove(); }
    });
  }
  function pickCat(id, scroll) {
    if (id === state.cat) { if (scroll) scrollToCarta(); return; }
    state.cat = id;
    $$("button", catList).forEach((b) => b.setAttribute("aria-pressed", b.dataset.cat === id ? "true" : "false"));
    placeCatPill(true);
    const btn = $(`button[data-cat="${id}"]`, catList);
    if (mqNarrow.matches && btn) catList.scrollTo({ left: Math.max(0, btn.offsetLeft - 40), behavior: reduce ? "auto" : "smooth" });
    renderGrid(true);
    if (scroll) scrollToCarta();
    else if ($("#carta").getBoundingClientRect().top < 0) scrollToCarta();
  }
  function scrollToCarta() {
    const y = $("#carta").getBoundingClientRect().top + scrollY - parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--hdr")) + (mqNarrow.matches ? 0 : 0);
    scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
  }
  catList.addEventListener("click", (e) => { const b = e.target.closest("button[data-cat]"); if (b) pickCat(b.dataset.cat, false); });
  $("#dietChips").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-diet]"); if (!b) return;
    const d = b.dataset.diet; state.diet.has(d) ? state.diet.delete(d) : state.diet.add(d);
    b.setAttribute("aria-pressed", state.diet.has(d) ? "true" : "false");
    renderGrid(true);
  });
  $("#clearDiet").addEventListener("click", () => { state.diet.clear(); $$("#dietChips button").forEach((b) => b.setAttribute("aria-pressed", "false")); renderGrid(true); });
  document.addEventListener("click", (e) => {
    const c = e.target.closest("[data-cat]:not(#catList button)"); if (c && !c.closest("#catList")) { e.preventDefault(); pickCat(c.dataset.cat, true); return; }
    const cl = e.target.closest("[data-cat-link]"); if (cl) { e.preventDefault(); pickCat(cl.dataset.catLink, true); return; }
    const o = e.target.closest("[data-open]"); if (o) { openProduct(o.dataset.open, o.querySelector("img")); return; }
    const a = e.target.closest("[data-add]"); if (a) { quickAdd(a.dataset.add, a); }
  });

  /* ================= CART LOGIC ================= */
  function lineKey(id, sel) { return id + "|" + (sel.porz || "") + "|" + (sel.salsa || "") + "|" + [...(sel.extra || [])].sort().join("+"); }
  function unitPrice(p, sel) {
    let u = p.price;
    for (const g of groupsFor(p)) for (const [id, , d] of g.opts) if (g.type === "one" ? sel[g.id] === id : (sel[g.id] || []).includes(id)) u += d;
    return Math.round(u * 100) / 100;
  }
  function optLabel(p, sel) {
    const out = [];
    for (const g of groupsFor(p)) for (const [id, lab] of g.opts) if (g.type === "one" ? sel[g.id] === id : (sel[g.id] || []).includes(id)) out.push(lab);
    return out.join(" · ");
  }
  const defaults = (p) => { const s = {}; for (const g of groupsFor(p)) s[g.id] = g.type === "one" ? g.opts[0][0] : []; return s; };
  function addToCart(id, sel, qty) {
    const p = PBY[id], key = lineKey(id, sel);
    const ex = state.cart.find((l) => l.key === key);
    if (ex) ex.qty = Math.min(50, ex.qty + qty);
    else state.cart.push({ key, id, sel: { ...sel, extra: [...(sel.extra || [])] }, qty, unit: unitPrice(p, sel), opt: optLabel(p, sel) });
    persist();
  }
  function quickAdd(id, btn) {
    const p = PBY[id];
    addToCart(id, defaults(p), 1);
    btn.classList.add("is-done"); setTimeout(() => btn.classList.remove("is-done"), 300);
    const img = btn.closest(".hk-pc")?.querySelector(".hk-pc-m img");
    flyToCart(img, p.img, () => { renderHeader(); renderCart(); refreshCardBadges(); });
    renderHeader(); refreshCardBadges();
  }

  /* fly-to-cart: the photo leaves the card on a quadratic arc and lands in the bag */
  function flyToCart(srcImg, src, done) {
    const target = $("#cartBtn");
    const bump = () => { target.classList.remove("is-bump"); void target.offsetWidth; target.classList.add("is-bump"); done && done(); };
    if (reduce || !srcImg || !srcImg.getBoundingClientRect().width) { bump(); return; }
    const a = srcImg.getBoundingClientRect(), b = target.getBoundingClientRect();
    const size = 76;
    const sx = a.left + a.width / 2 - size / 2, sy = a.top + a.height / 2 - size / 2;
    const tx = b.left + b.width / 2 - size / 2, ty = b.top + b.height / 2 - size / 2;
    const cx = (sx + tx) / 2 + (tx > sx ? -40 : 40), cy = Math.min(sy, ty) - Math.max(80, Math.abs(tx - sx) * 0.18);
    const s0 = Math.min(2.4, Math.max(1, Math.min(a.width, a.height) / size));
    const el = document.createElement("img"); el.src = src; el.alt = "";
    el.style.width = el.style.height = size + "px";
    $("#flyLayer").appendChild(el);
    const frames = [];
    for (let i = 0; i <= 16; i++) {
      const u = i / 16, t = u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
      const x = (1 - t) * (1 - t) * sx + 2 * (1 - t) * t * cx + t * t * tx;
      const y = (1 - t) * (1 - t) * sy + 2 * (1 - t) * t * cy + t * t * ty;
      const sc = s0 + (0.28 - s0) * t;
      frames.push({ transform: `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${sc.toFixed(3)}) rotate(${(t * 200).toFixed(0)}deg)`, opacity: u > 0.9 ? 1 - (u - 0.9) * 6 : 1 });
    }
    const anim = el.animate(frames, { duration: 680, easing: "linear", fill: "forwards" });
    anim.onfinish = () => { el.remove(); bump(); };
  }

  /* ================= DRAG STEPPER ================= */
  /* tap for one; hold 260 ms then drag sideways to sweep (one unit per 14 px) */
  function stepper(el, { get, set, min = 0, max = 50, onLift }) {
    const out = $("output", el);
    let timer = 0, sweeping = false, origin = null, dir = 0, btn = null;
    el.addEventListener("pointerdown", (e) => {
      btn = e.target.closest("button"); if (!btn) return;
      e.preventDefault();
      dir = +btn.dataset.d; origin = { x: e.clientX, v: get() }; btn.classList.add("hold");
      try { el.setPointerCapture(e.pointerId); } catch (err) { /* ignore */ }
      timer = setTimeout(() => { sweeping = true; el.classList.add("sweeping"); }, 260);
    });
    el.addEventListener("pointermove", (e) => {
      if (!sweeping) return;
      const v = Math.max(Math.max(min, 1), Math.min(max, Math.round(origin.v + (e.clientX - origin.x) / 14)));
      if (v !== get()) { set(v, true); out.textContent = v; }
    });
    const lift = (e) => {
      if (!btn) return;
      clearTimeout(timer);
      if (!sweeping && e.type === "pointerup") { const v = Math.max(min, Math.min(max, get() + dir)); set(v, false); out.textContent = v; }
      sweeping = false; el.classList.remove("sweeping"); btn.classList.remove("hold"); btn = null;
      onLift && onLift();
    };
    el.addEventListener("pointerup", lift); el.addEventListener("pointercancel", lift);
    el.addEventListener("keydown", (e) => { if (e.key === "ArrowRight" || e.key === "ArrowUp") { e.preventDefault(); const v = Math.min(max, get() + 1); set(v, false); out.textContent = v; } if (e.key === "ArrowLeft" || e.key === "ArrowDown") { e.preventDefault(); const v = Math.max(min, get() - 1); set(v, false); out.textContent = v; } });
    // keyboard users: buttons also respond to Enter/Space via click without pointer events
    el.addEventListener("click", (e) => { const b = e.target.closest("button"); if (!b || e.detail !== 0) return; const v = Math.max(min, Math.min(max, get() + +b.dataset.d)); set(v, false); out.textContent = v; });
  }

  /* ================= PRODUCT MODAL ================= */
  const pm = $("#prodModal"), pmAdd = $("#pmAdd");
  let pmP = null, pmSel = null, pmQty = 1, pmBusy = false, pmReturn = null;
  function pmUpdate() {
    $("#pmTotal").textContent = eur(unitPrice(pmP, pmSel) * pmQty);
    $("#pmQty").textContent = pmQty;
  }
  function openProduct(id, srcImg) {
    const p = PBY[id]; if (!p) return;
    pmP = p; pmSel = defaults(p); pmQty = 1; pmReturn = document.activeElement;
    const c = CATS.find((x) => x.id === p.cat);
    $("#pmImg").src = p.img; $("#pmImg").alt = p.name; $(".hk-pm-media", pm).classList.toggle("is-photo", p.photo);
    const tag = $("#pmTag"); tag.hidden = !p.badge; if (p.badge) { tag.textContent = p.badge[0]; tag.className = "hk-tag " + (p.badge[1] || ""); }
    $("#pmCat").textContent = c.name; $("#pmName").textContent = p.name;
    $("#pmMeta").textContent = `${pcsTxt(p.pcs)} · da ${eur(p.price)}` + (p.tags.includes("veg") ? " · vegetariano" : "") + (p.tags.includes("spicy") ? " · piccante" : "");
    $("#pmDesc").textContent = p.desc;
    $("#pmIng").textContent = ING[p.cat]; $("#pmAll").textContent = "Contiene: " + ALL[p.cat];
    $("#pmOpts").innerHTML = groupsFor(p).map((g) => `<div class="hk-og" role="${g.type === "one" ? "radiogroup" : "group"}" aria-label="${g.label}"><p>${g.label}<small>${g.type === "one" ? "scegline una" : "facoltativo"}</small></p><div class="hk-og-row">${g.opts.map(([oid, lab, d]) => `<button type="button" class="hk-opt" role="${g.type === "one" ? "radio" : "checkbox"}" data-g="${g.id}" data-o="${oid}" aria-checked="${g.type === "one" ? pmSel[g.id] === oid : false}">${esc(lab)}${d ? `<small>+${eur(d)}</small>` : ""}</button>`).join("")}</div></div>`).join("");
    $$(".hk-acc", pm).forEach((d) => (d.open = false));
    $(".hk-pm-scroll", pm).scrollTop = 0;
    pmAdd.className = "hk-add"; pmAdd.style.width = "";
    pmUpdate();
    show(pm, "modal");
    setTimeout(() => $(".hk-modal-x", pm).focus({ preventScroll: true }), 60);
  }
  $("#pmOpts").addEventListener("click", (e) => {
    const b = e.target.closest(".hk-opt"); if (!b) return;
    const g = groupsFor(pmP).find((x) => x.id === b.dataset.g);
    if (g.type === "one") { pmSel[g.id] = b.dataset.o; $$(`.hk-opt[data-g="${g.id}"]`, pm).forEach((x) => x.setAttribute("aria-checked", x === b ? "true" : "false")); }
    else { const arr = pmSel[g.id]; const i = arr.indexOf(b.dataset.o); i >= 0 ? arr.splice(i, 1) : arr.push(b.dataset.o); b.setAttribute("aria-checked", i >= 0 ? "false" : "true"); }
    pmUpdate();
  });
  stepper($("#pmStp"), { get: () => pmQty, set: (v) => { pmQty = v; pmUpdate(); }, min: 1, max: 20 });
  function closeProduct() { if (pm.hidden) return; hide(pm, "modal", 280); if (pmReturn && pmReturn.focus) pmReturn.focus({ preventScroll: true }); }
  $$("[data-close-modal]", pm).forEach((b) => b.addEventListener("click", closeProduct));

  /* done-burst: squeeze to a circle, draw a tick, burst a ring of dots, then the dish flies to the bag */
  pmAdd.addEventListener("click", async () => {
    if (pmBusy) return; pmBusy = true;
    const p = pmP, sel = { ...pmSel, extra: [...(pmSel.extra || [])] }, qty = pmQty;
    if (!reduce) {
      pmAdd.style.width = pmAdd.offsetWidth + "px"; pmAdd.getBoundingClientRect();
      pmAdd.classList.add("is-press");
      await wait(110);
      pmAdd.classList.add("is-round"); pmAdd.style.width = "50px";
      await wait(270);
      pmAdd.classList.add("is-tick");
      await wait(230);
      burst(pmAdd);
      await wait(260);
    }
    addToCart(p.id, sel, qty);
    const img = $("#pmImg");
    flyToCart(img, p.img, () => { renderHeader(); renderCart(); refreshCardBadges(); });
    renderHeader(); refreshCardBadges();
    closeProduct();
    toast(`${qty} × ${p.name} nel carrello`);
    setTimeout(() => { pmAdd.className = "hk-add"; pmAdd.style.width = ""; pmBusy = false; }, 320);
  });
  const cv = $("#burst"), ctx = cv.getContext("2d");
  function burst(el) {
    if (reduce) return;
    const dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = innerWidth * dpr; cv.height = innerHeight * dpr;
    const r = el.getBoundingClientRect(), ox = r.left + r.width / 2, oy = r.top + r.height / 2;
    const cols = ["#cf6f45", "#b4c1a6", "#a8977d", "#2f8a55"];
    const ps = Array.from({ length: 20 }, (_, i) => { const a = (i / 20) * Math.PI * 2 + (Math.random() - 0.5) * 0.5, sp = 160 + Math.random() * 140; return { x: ox + Math.cos(a) * 8, y: oy + Math.sin(a) * 8, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, r: 3 + Math.random() * 3.5, c: cols[i % 4] }; });
    const t0 = performance.now(); let last = t0;
    const step = (now) => {
      const t = (now - t0) / 650, dt = Math.min(0.05, (now - last) / 1000); last = now;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, innerWidth, innerHeight);
      if (t >= 1) return;
      for (const q of ps) {
        q.vy += 200 * dt; q.vx *= 1 - 2.6 * dt; q.vy *= 1 - 2 * dt; q.x += q.vx * dt; q.y += q.vy * dt;
        ctx.globalAlpha = t < 0.45 ? 1 : 1 - (t - 0.45) / 0.55; ctx.fillStyle = q.c;
        ctx.beginPath(); ctx.arc(q.x, q.y, q.r * (1 - t * 0.35), 0, Math.PI * 2); ctx.fill();
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ================= CART DRAWER ================= */
  const cart = $("#cart"), cartScrim = $("#cartScrim");
  function openCart(on) {
    cart.setAttribute("aria-hidden", on ? "false" : "true");
    if (on) { renderCart(); show(cartScrim, "cart"); cart.classList.add("is-on"); requestAnimationFrame(() => placeModePill($("#cartMode"))); setTimeout(() => $("#cartClose").focus({ preventScroll: true }), 60); }
    else { cart.classList.remove("is-on"); hide(cartScrim, "cart"); }
  }
  $("#cartBtn").addEventListener("click", () => openCart(true));
  $("#cartClose").addEventListener("click", () => openCart(false));
  cartScrim.addEventListener("click", () => openCart(false));

  function renderCartDest() {
    const d = $("#cartDest");
    if (state.mode === "pickup") {
      d.innerHTML = `<div class="hk-shop-pick" role="radiogroup" aria-label="Shop per il ritiro">${SHOPS.map((s) => { const st = shopStatus(s); return `<label><input type="radio" name="cartShop" value="${s.id}" ${state.shop === s.id ? "checked" : ""}><span>${esc(s.name)}</span><small class="hk-st-${st.state}">${st.label}</small></label>`; }).join("")}</div>`;
      return;
    }
    const z = curZone();
    if (state.addr && z) {
      d.innerHTML = `<div class="hk-dest-line"><svg><use href="#i-pin"/></svg><div><b>${esc(state.addr.label)}</b><small>Zona ${z.id} · ${curShop().name} · ${z.eta[0]}–${z.eta[1]} min</small></div><button type="button" data-act="edit-dest">Cambia</button></div>`;
    } else {
      d.innerHTML = `<form class="hk-addr" id="cartAddr" novalidate><svg class="hk-addr-pin"><use href="#i-pin"/></svg><input type="text" id="cartAddrIn" placeholder="Via e numero, o CAP" aria-label="Indirizzo di consegna" value="${state.addr ? esc(state.addr.label) : ""}" list="cartStreets"><button class="hk-addr-go" type="submit" aria-label="Verifica"><svg><use href="#i-search"/></svg></button></form><datalist id="cartStreets">${STREETS.map((s) => `<option value="${esc(s.name + ", " + s.cap + " " + s.city)}">`).join("")}</datalist><p class="hk-dest-msg ${state.addr && !z ? "bad" : ""}" id="cartAddrMsg">${state.addr && !z ? `Il ${esc(state.addr.cap)} è fuori zona: passa al ritiro o cambia indirizzo.` : "Ti diciamo subito se arriviamo, quanto costa e in quanto."}</p>`;
    }
  }
  $("#cartDest").addEventListener("submit", (e) => {
    if (e.target.id !== "cartAddr") return;
    e.preventDefault();
    const r = resolveAddress($("#cartAddrIn").value);
    if (r.err) { const m = $("#cartAddrMsg"); m.textContent = r.err; m.className = "hk-dest-msg bad"; return; }
    addrInput.value = r.label; setAddress(r);
  });
  $("#cartDest").addEventListener("change", (e) => { if (e.target.name === "cartShop") setPickupShop(e.target.value, false); });
  $("#cartDest").addEventListener("click", (e) => { if (e.target.closest('[data-act="edit-dest"]')) { const keep = state.addr; state.addr = null; renderCartDest(); state.addr = keep; $("#cartAddrIn").value = ""; $("#cartAddrIn").focus(); } });

  function renderCart() {
    renderCartDest();
    const body = $("#cartBody");
    if (!state.cart.length) {
      body.innerHTML = `<div class="hk-cart-empty"><b>Il carrello è vuoto</b>Aggiungi una box o due roll: il resto lo calcoliamo noi.<br><button class="hk-btn hk-btn-ink" type="button" data-act="to-menu">Vai al menu</button></div>`;
    } else {
      body.innerHTML = state.cart.map((l) => { const p = PBY[l.id]; return `<div class="hk-cl" data-key="${esc(l.key)}"><span class="hk-cl-m${p.photo ? " is-photo" : ""}"><img src="${p.img}" alt=""></span><div><p class="hk-cl-n">${esc(p.name)}</p>${l.opt ? `<p class="hk-cl-o">${esc(l.opt)}</p>` : ""}<p class="hk-cl-p">${eur(l.unit * l.qty)}</p></div><div class="hk-stp hk-stp-sm" tabindex="0" aria-label="Quantità ${esc(p.name)}"><button type="button" data-d="-1" aria-label="Meno">−</button><output>${l.qty}</output><button type="button" data-d="1" aria-label="Più">+</button></div></div>`; }).join("");
      $$(".hk-cl", body).forEach((row) => {
        const key = row.dataset.key, line = () => state.cart.find((l) => l.key === key);
        stepper($(".hk-stp", row), {
          min: 0, max: 50,
          get: () => (line() ? line().qty : 0),
          set: (v, sweeping) => {
            const l = line(); if (!l) return;
            if (v <= 0 && !sweeping) { removeLine(row, key); return; }
            l.qty = v; persist();
            $(".hk-cl-p", row).textContent = eur(l.unit * l.qty);
            renderTotals(); renderHeader(); refreshCardBadges();
          },
        });
      });
    }
    renderTotals();
  }
  function removeLine(row, key) {
    state.cart = state.cart.filter((l) => l.key !== key); persist();
    row.classList.add("is-gone");
    setTimeout(() => { renderCart(); }, reduce ? 0 : 220);
    renderTotals(); renderHeader(); refreshCardBadges();
  }
  $("#cartBody").addEventListener("click", (e) => { if (e.target.closest('[data-act="to-menu"]')) { openCart(false); pickCat("all", true); } });
  function renderTotals() {
    const t = totals();
    const fb = $("#freeBar");
    if (state.mode === "delivery" && t.zone) {
      fb.hidden = false;
      const pct = Math.min(100, (t.sub / t.zone.free) * 100);
      $("#freeFill").style.setProperty("--hk-fill", pct.toFixed(1) + "%");
      fb.classList.toggle("is-done", t.toFree === 0);
      $("#freeTxt").innerHTML = t.toFree === 0 ? `<b>Consegna gratuita sbloccata.</b>` : `Ti mancano <b>${eur(t.toFree)}</b> per la consegna gratuita (Zona ${t.zone.id}).`;
    } else if (state.mode === "pickup") {
      fb.hidden = false; $("#freeFill").style.setProperty("--hk-fill", "100%"); fb.classList.add("is-done");
      $("#freeTxt").innerHTML = `<b>Ritiro gratuito</b> da ${esc(curShop() ? curShop().name : "uno shop")}, pronto in 15 min.`;
    } else fb.hidden = true;
    const pmsg = $("#promoMsg");
    if (state.promo) {
      pmsg.className = "hk-promo-msg " + (t.promoErr ? "bad" : "ok");
      pmsg.innerHTML = `${esc(state.promo)}: ${esc(t.promoErr || PROMOS[state.promo].label)}<button type="button" id="promoRemove">Rimuovi</button>`;
    } else if (!pmsg.classList.contains("bad")) pmsg.textContent = "";
    $("#cartSum").innerHTML = `<dt>Subtotale</dt><dd>${eur(t.sub)}</dd>`
      + (state.mode === "delivery" ? `<dt>Consegna${t.zone ? " · Zona " + t.zone.id : ""}</dt><dd>${t.zone ? (t.fee ? eur(t.fee) : "gratis") : "—"}</dd>` : `<dt>Ritiro in shop</dt><dd>gratis</dd>`)
      + (t.disc ? `<dt class="hk-sum-disc">Sconto ${esc(state.promo)}</dt><dd class="hk-sum-disc">−${eur(t.disc)}</dd>` : "")
      + `<dt class="hk-sum-tot">Totale</dt><dd class="hk-sum-tot">${eur(t.total)}</dd>`;
    const warn = $("#cartWarn"), btn = $("#checkoutBtn");
    let w = "";
    if (!state.cart.length) w = "";
    else if (state.mode === "delivery" && t.needAddr) w = state.addr ? "Questo indirizzo è fuori zona: scegli il ritiro o un altro indirizzo." : "Inserisci l'indirizzo per calcolare la consegna.";
    else if (!t.minOk) w = `Minimo d'ordine Zona ${t.zone.id}: ${eur(t.zone.min)}. Aggiungi ancora ${eur(t.missing)}.`;
    warn.textContent = w;
    btn.disabled = !state.cart.length || !!w;
    btn.textContent = state.cart.length ? `Vai alla cassa · ${eur(t.total)}` : "Vai alla cassa";
    $("#cartFoot").hidden = !state.cart.length;
  }
  $("#promoForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const code = $("#promoInput").value.trim().toUpperCase().replace(/\s+/g, "");
    const m = $("#promoMsg");
    if (!code) { m.className = "hk-promo-msg bad"; m.textContent = "Scrivi un codice."; return; }
    if (!PROMOS[code]) { m.className = "hk-promo-msg bad"; m.textContent = `Il codice «${code}» non esiste o è scaduto.`; return; }
    m.className = "hk-promo-msg"; state.promo = code; persist(); $("#promoInput").value = ""; renderTotals();
  });
  $("#promoMsg").addEventListener("click", (e) => { if (e.target.id === "promoRemove") { state.promo = null; persist(); $("#promoMsg").className = "hk-promo-msg"; renderTotals(); } });
  $("#checkoutBtn").addEventListener("click", () => openCheckout());

  /* ================= CHECKOUT (step sheet) ================= */
  const co = $("#co"), sheet = $("#sheet"), vp = $("#sheetVp"), panes = $$(".hk-pane", co);
  const coTitles = ["Quando e dove", "I tuoi dati", "Pagamento"];
  let coStep = 0, coDay = 0, coData = { name: "", phone: "", email: "", bell: "", note: "", pay: "card", cash: "exact", cn: "", ce: "", cc: "" };
  function fitSheet() {
    const pane = panes[coStep];
    const chrome = $(".hk-sheet-head", sheet).offsetHeight + $(".hk-sheet-foot", sheet).offsetHeight;
    const maxH = Math.min(innerHeight * (mqMobile.matches ? 0.94 : 0.9), 780);
    const h = Math.min(maxH, chrome + pane.scrollHeight);
    sheet.style.height = h + "px";
    vp.style.height = h - chrome + "px";
  }
  const ro = "ResizeObserver" in window ? new ResizeObserver(() => { if (!co.hidden) fitSheet(); }) : null;
  panes.forEach((p) => ro && ro.observe(p));
  function setStep(i) {
    coStep = i;
    panes.forEach((p, k) => (p.dataset.pos = k < i ? "left" : k > i ? "right" : "center"));
    panes.forEach((p, k) => p.setAttribute("aria-hidden", k === i ? "false" : "true"));
    $$(".hk-dots i", co).forEach((d, k) => d.classList.toggle("on", k === i));
    $("#coStepLbl").textContent = `Passo ${i + 1} di 3`; $("#coTitle").textContent = coTitles[i];
    $("#coBack").disabled = i === 0;
    $("#coErr").textContent = "";
    renderPane(i);
    fitSheet();
  }
  function openCheckout() {
    if (!state.cart.length) return;
    openCart(false);
    coDay = 0;
    show(co, "co");
    setStep(0);
    setTimeout(() => $("#coNext").focus({ preventScroll: true }), 80);
  }
  function closeCheckout() { hide(co, "co", 340); }
  $$("[data-close-co]", co).forEach((b) => b.addEventListener("click", closeCheckout));
  $("#coBack").addEventListener("click", () => coStep > 0 && setStep(coStep - 1));

  function slotLabel(s) { if (!s) return ""; if (s === "asap") { const z = curZone(); return state.mode === "delivery" && z ? `Prima possibile · ${z.eta[0]}–${z.eta[1]} min` : "Prima possibile · 15 min"; } return `${s.d === 0 ? "Oggi" : "Domani"} alle ${hhmm(s.t)}${s.t >= 1440 ? " (dopo mezzanotte)" : ""}`; }
  function renderPane(i) {
    const pane = panes[i], t = totals();
    if (i === 0) {
      const shop = state.mode === "delivery" ? (curZone() ? curShop() : null) : curShop();
      const lead = state.mode === "delivery" ? (curZone() ? curZone().eta[0] : 30) : 15;
      const sl = shop ? slotsFor(shop, lead) : { days: [[], []], asap: false };
      if (!sl.days[coDay].length && !(coDay === 0 && sl.asap)) coDay = sl.days[0].length || sl.asap ? 0 : 1;
      let where;
      if (state.mode === "delivery") {
        const z = curZone();
        where = z ? `<div class="hk-co-where"><svg><use href="#i-pin"/></svg><div><b>${esc(state.addr.label)}</b><small>Zona ${z.id} · consegna ${t.fee ? eur(t.fee) : "gratis"} · prepara ${esc(shop.name)}</small></div></div>`
          : `<div class="hk-addr" style="background:var(--cream);box-shadow:none;height:46px"><svg class="hk-addr-pin"><use href="#i-pin"/></svg><input type="text" id="coAddr" placeholder="Via e numero, o CAP" aria-label="Indirizzo" value="${state.addr ? esc(state.addr.label) : ""}"><button class="hk-addr-go" type="button" id="coAddrGo" aria-label="Verifica" style="width:36px;height:36px"><svg><use href="#i-search"/></svg></button></div><span class="hk-f-err" id="coAddrErr">${state.addr && !z ? "Fuori zona: scegli il ritiro qui sopra." : ""}</span>`;
      } else {
        where = `<div class="hk-shop-pick" role="radiogroup" aria-label="Shop">${SHOPS.map((s) => { const st = shopStatus(s); return `<label><input type="radio" name="coShop" value="${s.id}" ${state.shop === s.id ? "checked" : ""}><span>${esc(s.name)}<br><small style="color:var(--mute);font-weight:400">${esc(s.addr.split(",")[0])} · ${st.text}</small></span><small class="hk-st-${st.state}">${st.label}</small></label>`; }).join("")}</div>`;
      }
      const times = sl.days[coDay];
      pane.innerHTML = `<span class="hk-f-lbl">Modalità</span><div class="hk-days" id="coMode"><button type="button" data-mode="delivery" aria-pressed="${state.mode === "delivery"}">Consegna</button><button type="button" data-mode="pickup" aria-pressed="${state.mode === "pickup"}">Ritiro</button></div>
        <span class="hk-f-lbl">${state.mode === "delivery" ? "Indirizzo" : "Shop"}</span>${where}
        <span class="hk-f-lbl">Orario</span>
        ${shop ? `<div class="hk-days" id="coDays"><button type="button" data-day="0" aria-pressed="${coDay === 0}" ${sl.days[0].length || sl.asap ? "" : "disabled"}>Oggi · ${DAYS_SHORT[romeNow().dow]}</button><button type="button" data-day="1" aria-pressed="${coDay === 1}" ${sl.days[1].length ? "" : "disabled"}>Domani · ${DAYS_SHORT[(romeNow().dow + 1) % 7]}</button></div>
        <div class="hk-slots" id="coSlots">${coDay === 0 && sl.asap ? `<button type="button" class="asap" data-slot="asap" aria-pressed="${state.slot === "asap"}">${slotLabel("asap")}</button>` : ""}${times.map((m) => `<button type="button" data-slot="${coDay}:${m}" aria-pressed="${state.slot && state.slot !== "asap" && state.slot.d === coDay && state.slot.t === m}">${hhmm(m)}</button>`).join("")}${!times.length && !(coDay === 0 && sl.asap) ? `<p class="hk-slots-none">Nessun orario disponibile in questo giorno.</p>` : ""}</div>` : `<p class="hk-slots-none" style="padding:0">Prima l'indirizzo: gli orari dipendono dallo shop che prepara.</p>`}`;
    } else if (i === 1) {
      const d = coData;
      pane.innerHTML = `<label class="hk-f-lbl" for="coName">Nome e cognome</label><input class="hk-in-f" id="coName" autocomplete="name" value="${esc(d.name)}"><span class="hk-f-err" data-for="coName"></span>
        <div class="hk-f-row"><div><label class="hk-f-lbl" for="coPhone">Telefono</label><input class="hk-in-f" id="coPhone" type="tel" inputmode="tel" autocomplete="tel" placeholder="347 123 4567" value="${esc(d.phone)}"><span class="hk-f-err" data-for="coPhone"></span></div>
        <div><label class="hk-f-lbl" for="coEmail">Email</label><input class="hk-in-f" id="coEmail" type="email" autocomplete="email" value="${esc(d.email)}"><span class="hk-f-err" data-for="coEmail"></span></div></div>
        ${state.mode === "delivery" ? `<label class="hk-f-lbl" for="coBell">Citofono e piano</label><input class="hk-in-f" id="coBell" placeholder="Rossi, 2° piano" value="${esc(d.bell)}"><span class="hk-f-err" data-for="coBell"></span>` : ""}
        <label class="hk-f-lbl" for="coNote">Note ${state.mode === "delivery" ? "per il rider o la cucina" : "per la cucina"} <span style="text-transform:none;letter-spacing:0;font-weight:500">(facoltativo)</span></label><textarea class="hk-in-f" id="coNote" maxlength="200">${esc(d.note)}</textarea>`;
    } else {
      const d = coData;
      const cashOpts = [["exact", "Importo esatto"], ...[20, 50, 100].filter((n) => n >= t.total).map((n) => [String(n), `Banconota da ${n} €`])];
      if (d.pay === "cash" && !cashOpts.some(([v]) => v === d.cash)) d.cash = "exact";
      pane.innerHTML = `<div class="hk-co-where" style="margin-top:6px"><svg><use href="#i-clock"/></svg><div><b>${state.mode === "delivery" ? "Consegna" : "Ritiro"} · ${esc(slotLabel(state.slot))}</b><small>${state.mode === "delivery" ? esc(state.addr.label) : esc(curShop().name + ", " + curShop().addr.split(",")[0])}</small></div></div>
        <span class="hk-f-lbl">Come paghi</span>
        <div class="hk-pay" id="coPay">
          <label><input type="radio" name="pay" value="card" ${d.pay === "card" ? "checked" : ""}>Carta, adesso<small>Visa · Mastercard</small></label>
          <label><input type="radio" name="pay" value="pos" ${d.pay === "pos" ? "checked" : ""}>Carta ${state.mode === "delivery" ? "al rider (POS)" : "in shop"}</label>
          <label><input type="radio" name="pay" value="cash" ${d.pay === "cash" ? "checked" : ""}>Contanti</label>
        </div>
        ${d.pay === "card" ? `<div class="hk-card-f"><input class="hk-in-f" id="coCn" inputmode="numeric" autocomplete="cc-number" placeholder="Numero carta" value="${esc(d.cn)}" aria-label="Numero carta"><span class="hk-f-err" data-for="coCn"></span><div class="hk-f-row"><div><input class="hk-in-f" id="coCe" inputmode="numeric" autocomplete="cc-exp" placeholder="MM/AA" value="${esc(d.ce)}" aria-label="Scadenza"><span class="hk-f-err" data-for="coCe"></span></div><div><input class="hk-in-f" id="coCc" inputmode="numeric" autocomplete="cc-csc" placeholder="CVC" value="${esc(d.cc)}" aria-label="Codice di sicurezza"><span class="hk-f-err" data-for="coCc"></span></div></div></div>` : ""}
        ${d.pay === "cash" ? `<label class="hk-f-lbl" for="coCash">Resto</label><select class="hk-in-f" id="coCash">${cashOpts.map(([v, l]) => `<option value="${v}" ${d.cash === v ? "selected" : ""}>${l}</option>`).join("")}</select>` : ""}
        <dl class="hk-co-sum"><dt>Subtotale</dt><dd>${eur(t.sub)}</dd><dt>${state.mode === "delivery" ? "Consegna" : "Ritiro"}</dt><dd>${t.fee ? eur(t.fee) : "gratis"}</dd>${t.disc ? `<dt>Sconto ${esc(state.promo)}</dt><dd>−${eur(t.disc)}</dd>` : ""}<dt class="t">Totale</dt><dd class="t">${eur(t.total)}</dd></dl>`;
    }
    $("#coNext").textContent = i < 2 ? "Continua" : (coData.pay === "card" ? `Paga e ordina · ${eur(t.total)}` : `Conferma l'ordine · ${eur(t.total)}`);
  }
  panes[0].addEventListener("click", (e) => {
    const m = e.target.closest("#coMode button"); if (m) { setMode(m.dataset.mode); setStep(0); return; }
    const d = e.target.closest("#coDays button"); if (d && !d.disabled) { coDay = +d.dataset.day; renderPane(0); fitSheet(); return; }
    const s = e.target.closest("#coSlots button"); if (s) { const v = s.dataset.slot; state.slot = v === "asap" ? "asap" : { d: +v.split(":")[0], t: +v.split(":")[1] }; $$("#coSlots button").forEach((b) => b.setAttribute("aria-pressed", b === s ? "true" : "false")); $("#coErr").textContent = ""; return; }
    if (e.target.closest("#coAddrGo")) coVerifyAddr();
  });
  panes[0].addEventListener("keydown", (e) => { if (e.target.id === "coAddr" && e.key === "Enter") { e.preventDefault(); coVerifyAddr(); } });
  panes[0].addEventListener("change", (e) => { if (e.target.name === "coShop") { setPickupShop(e.target.value, false); renderPane(0); fitSheet(); } });
  function coVerifyAddr() {
    const r = resolveAddress($("#coAddr").value);
    if (r.err) { $("#coAddrErr").textContent = r.err; return; }
    addrInput.value = r.label; setAddress(r); renderPane(0); fitSheet();
  }
  panes[2].addEventListener("change", (e) => {
    if (e.target.name === "pay") { saveStep2(); coData.pay = e.target.value; renderPane(2); fitSheet(); }
    if (e.target.id === "coCash") coData.cash = e.target.value;
  });
  panes[2].addEventListener("input", (e) => {
    if (e.target.id === "coCn") { const v = e.target.value.replace(/\D/g, "").slice(0, 19); e.target.value = v.replace(/(.{4})/g, "$1 ").trim(); }
    if (e.target.id === "coCe") { let v = e.target.value.replace(/\D/g, "").slice(0, 4); if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2); e.target.value = v; }
    if (e.target.id === "coCc") e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4);
  });
  function saveStep2() { const g = (id) => ($("#" + id) ? $("#" + id).value : coData[id]); coData.cn = g("coCn") ?? coData.cn; coData.ce = g("coCe") ?? coData.ce; coData.cc = g("coCc") ?? coData.cc; }
  const luhn = (n) => { let s = 0, alt = false; for (let i = n.length - 1; i >= 0; i--) { let d = +n[i]; if (alt) { d *= 2; if (d > 9) d -= 9; } s += d; alt = !alt; } return s % 10 === 0; };
  function fieldErr(id, msg) { const inp = $("#" + id), e = $(`.hk-f-err[data-for="${id}"]`); if (inp) inp.classList.toggle("is-bad", !!msg); if (e) e.textContent = msg || ""; return !msg; }
  function validateStep(i) {
    const t = totals();
    if (i === 0) {
      if (state.mode === "delivery") {
        if (!state.addr) return "Inserisci l'indirizzo di consegna.";
        if (!t.zone) return "Questo indirizzo è fuori zona: scegli il ritiro in shop.";
        if (!t.minOk) return `Minimo d'ordine Zona ${t.zone.id}: ${eur(t.zone.min)}. Mancano ${eur(t.missing)}.`;
      } else if (!curShop()) return "Scegli lo shop per il ritiro.";
      if (!state.slot) return "Scegli un orario.";
      return null;
    }
    if (i === 1) {
      const v = (id) => ($("#" + id) ? $("#" + id).value.trim() : "");
      coData.name = v("coName"); coData.phone = v("coPhone"); coData.email = v("coEmail"); coData.bell = v("coBell"); coData.note = v("coNote");
      const digits = coData.phone.replace(/^\+39/, "").replace(/[\s.-]/g, "");
      let ok = true;
      ok = fieldErr("coName", coData.name.length < 2 ? "Come ti chiami?" : "") && ok;
      ok = fieldErr("coPhone", !/^(3\d{8,9}|0\d{5,10})$/.test(digits) ? "Un numero italiano, es. 347 123 4567" : "") && ok;
      ok = fieldErr("coEmail", !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(coData.email) ? "Controlla l'email" : "") && ok;
      if (state.mode === "delivery") ok = fieldErr("coBell", coData.bell.length < 2 ? "Serve al rider per trovarti" : "") && ok;
      return ok ? null : "Controlla i campi evidenziati.";
    }
    if (coData.pay === "card") {
      saveStep2();
      const n = coData.cn.replace(/\D/g, ""), [mm, yy] = coData.ce.split("/").map((x) => +x), now = romeNow();
      let ok = true;
      ok = fieldErr("coCn", n.length < 13 || !luhn(n) ? "Numero carta non valido" : "") && ok;
      const expOk = mm >= 1 && mm <= 12 && yy >= 0 && (2000 + yy > now.y || (2000 + yy === now.y && mm >= now.m));
      ok = fieldErr("coCe", !expOk ? "Scadenza non valida" : "") && ok;
      ok = fieldErr("coCc", !/^\d{3,4}$/.test(coData.cc) ? "3 o 4 cifre" : "") && ok;
      return ok ? null : "Controlla i dati della carta.";
    }
    return null;
  }
  $("#coNext").addEventListener("click", async () => {
    const err = validateStep(coStep);
    $("#coErr").textContent = err || "";
    if (err) return;
    if (coStep < 2) { setStep(coStep + 1); return; }
    const btn = $("#coNext"); btn.disabled = true; btn.textContent = coData.pay === "card" ? "Pagamento in corso…" : "Invio dell'ordine…";
    await wait(700);
    btn.disabled = false;
    const snapshot = { ...totals(), lines: state.cart.map((l) => ({ ...l })), mode: state.mode, addr: state.addr, shop: curShop(), slot: state.slot, pay: coData.pay, cash: coData.cash, name: coData.name };
    closeCheckout();
    printReceipt(snapshot);
  });

  /* ================= RECEIPT ================= */
  const C128 = "212222 222122 222221 121223 121322 131222 122213 122312 132212 221213 221312 231212 112232 122132 122231 113222 123122 123221 223211 221132 221231 213212 223112 312131 311222 321122 321221 312212 322112 322211 212123 212321 232121 111323 131123 131321 112313 132113 132311 211313 231113 231311 112133 112331 132131 113123 113321 133121 313121 211331 231131 213113 213311 213131 311123 311321 331121 312113 312311 332111 314111 221411 431111 111224 111422 121124 121421 141122 141221 112214 112412 122114 122411 142112 142211 241211 221114 413111 241112 134111 111242 121142 121241 114212 124112 124211 411212 421112 421211 212141 214121 412121 111143 111341 131141 114113 114311 411113 411311 113141 114131 311141 411131 211412 211214 211232 2331112".split(" ");
  function code128(text) {
    const vals = [104, ...[...text].map((ch) => ch.charCodeAt(0) - 32)];
    const check = vals.reduce((s, v, i) => s + v * (i || 1), 0) % 103;
    let x = 0, bars = "";
    [...[...vals, check, 106].map((v) => C128[v]).join("")].forEach((w, i) => { if (i % 2 === 0) bars += `<rect x="${x}" width="${w}" height="1"/>`; x += +w; });
    return `<svg class="bars" viewBox="0 0 ${x} 1" preserveAspectRatio="none" fill="#141414" aria-label="Codice a barre ${text}">${bars}</svg>`;
  }
  const rc = $("#rc"), paper = $("#rcPaper"), feedBox = $(".hk-rc-feed", rc);
  let lastOrder = null;
  async function printReceipt(o) {
    const now = romeNow();
    const no = `HK-${String(now.m).padStart(2, "0")}${String(now.d).padStart(2, "0")}-${String(Math.floor(1000 + Math.random() * 8999))}`;
    lastOrder = { ...o, no };
    window.__hkLastOrder = lastOrder;
    const date = `${now.d} ${MONTHS[now.m - 1]} ${now.y} · ${hhmm(now.min)}`;
    const payTxt = o.pay === "card" ? "PAGATO CON CARTA" : o.pay === "pos" ? "CARTA ALLA " + (o.mode === "delivery" ? "CONSEGNA" : "CASSA") : "CONTANTI" + (o.cash && o.cash !== "exact" ? ` · RESTO DA ${o.cash} €` : "");
    paper.innerHTML = `<div class="b">hiko</div><div class="k">COMANDA · ORDINE ONLINE</div><hr>
      <div class="m"><span>ORDINE</span><em>${no}</em></div><div class="m"><span>DATA</span><em>${date}</em></div>
      <div class="m"><span>${o.mode === "delivery" ? "CONSEGNA" : "RITIRO"}</span><em>${esc(o.mode === "delivery" ? o.addr.label : o.shop.name)}</em></div>
      <div class="m"><span>ORARIO</span><em>${esc(slotLabel(o.slot))}</em></div><div class="m"><span>SHOP</span><em>${esc(o.shop.name)}</em></div><div class="m"><span>CLIENTE</span><em>${esc(o.name.toUpperCase())}</em></div><hr>
      ${o.lines.map((l) => `<div class="i"><span>${l.qty} × ${esc(PBY[l.id].name)}${l.opt ? `<small>${esc(l.opt)}</small>` : ""}</span>${eur(l.unit * l.qty)}</div>`).join("")}
      <hr class="s"><div class="m"><span>SUBTOTALE</span><em>${eur(o.sub)}</em></div><div class="m"><span>${o.mode === "delivery" ? "CONSEGNA" + (o.zone ? " ZONA " + o.zone.id : "") : "RITIRO"}</span><em>${o.fee ? eur(o.fee) : "GRATIS"}</em></div>${o.disc ? `<div class="m"><span>SCONTO ${esc(state.promo || "")}</span><em>−${eur(o.disc)}</em></div>` : ""}
      <hr class="s"><div class="tot">TOTALE <b>${eur(o.total)}</b></div><div class="m" style="margin-top:8px"><span>${payTxt}</span><em>${o.pay === "card" ? "APPROVATO" : "DA SALDARE"}</em></div><hr>
      ${code128(no)}<div class="no">${no}</div><div class="ty">Grazie${o.name ? ", " + esc(o.name.split(" ")[0]) : ""}! ${o.mode === "delivery" ? "Ti scriviamo quando il rider parte." : "Ti avvisiamo quando è pronto."}</div>
      <svg class="hk-rc-stamp" id="rcStamp" viewBox="0 0 96 96" aria-hidden="true"><defs><path id="hkRing" d="M48 48 m-37 0 a37 37 0 1 1 74 0 a37 37 0 1 1 -74 0"/><filter id="hkInk" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="4" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.2"/></filter></defs><g filter="url(#hkInk)" fill="none" stroke="#b8532c" color="#b8532c"><circle cx="48" cy="48" r="45" stroke-width="3"/><circle cx="48" cy="48" r="30" stroke-width="1.3"/><text fill="currentColor" stroke="none" font-family="ui-monospace, Menlo, monospace" font-size="7.2" font-weight="700" letter-spacing="1.5"><textPath href="#hkRing">HIKO · VERONA · ORDINE RICEVUTO ·</textPath></text><text x="48" y="47" text-anchor="middle" fill="currentColor" stroke="none" font-family="Figtree, sans-serif" font-size="12.5" font-weight="800" letter-spacing=".4">CONFER-</text><text x="48" y="59" text-anchor="middle" fill="currentColor" stroke="none" font-family="Figtree, sans-serif" font-size="12.5" font-weight="800" letter-spacing=".4">MATO</text></g></svg>`;
    // persist: the order is done, clear the cart
    state.cart = []; state.promo = null; state.slot = null; persist();
    renderHeader(); renderCart(); refreshCardBadges();
    feedBox.classList.remove("is-scroll"); feedBox.scrollTop = 0;
    $("#rcDone").classList.remove("is-on");
    $("#rcCap").textContent = "Stiamo stampando la comanda…";
    paper.style.transform = "translateY(-110%)";
    await show(rc, "rc");
    await wait(450);
    await feed(reduce ? 1 : 1900);
    const stamp = $("#rcStamp");
    if (!reduce) {
      await paper.animate([{ transform: "translate(0,0) rotate(0)" }, { transform: "translate(0,5px) rotate(.8deg)", offset: 0.45 }, { transform: "translate(0,2px) rotate(-.3deg)", offset: 0.75 }, { transform: "translate(0,0) rotate(0)" }], { duration: 480, easing: "ease-out" }).finished.catch(() => {});
      await stamp.animate([{ opacity: 0, transform: "scale(2.4) rotate(-34deg)" }, { opacity: 0.95, transform: "scale(.94) rotate(-12deg)", offset: 0.72 }, { opacity: 0.92, transform: "scale(1) rotate(-14deg)" }], { duration: 280, easing: "cubic-bezier(.5,0,.75,0)", fill: "forwards" }).finished.catch(() => {});
    } else { stamp.style.opacity = 0.92; stamp.style.transform = "rotate(-14deg)"; }
    stamp.style.opacity = 0.92; stamp.style.transform = "rotate(-14deg)";
    const eta = o.slot === "asap" ? (o.mode === "delivery" ? `arrivo tra ${o.zone.eta[0]} e ${o.zone.eta[1]} minuti` : "pronto tra 15 minuti") : slotLabel(o.slot).toLowerCase();
    $("#rcCap").textContent = `Ordine ${no} confermato · ${eta}.`;
    feedBox.classList.add("is-scroll");
    $("#rcDone").classList.add("is-on");
    $("#rcDone").focus({ preventScroll: true });
  }
  /* speed-modulated feed: surges and hesitates like a thermal printer, never backs up, stops on time */
  function feed(dur) {
    const H = paper.offsetHeight, n = 19, k = 0.7, t0 = performance.now();
    return new Promise((res) => {
      const step = (now) => {
        const t = Math.min(1, (now - t0) / dur);
        const q = t - k * Math.sin(2 * Math.PI * n * t) / (2 * Math.PI * n);
        const p = 1 - Math.pow(1 - q, 1.25);
        paper.style.transform = `translate(${(t < 1 ? (Math.random() - 0.5) * 0.7 : 0).toFixed(2)}px, ${(-H * (1 - p)).toFixed(2)}px)`;
        t < 1 ? requestAnimationFrame(step) : (paper.style.transform = "none", res());
      };
      requestAnimationFrame(step);
    });
  }
  $("#rcDone").addEventListener("click", () => { hide(rc, "rc", 280); toast("Buon appetito! Ti abbiamo mandato la conferma via email."); });

  /* ================= SHOPS ================= */
  let selShop = null;
  function renderShops() {
    const q = norm($("#shopSearch").value), only = $("#openOnly").checked;
    const rows = SHOPS.filter((s) => (!q || norm(s.name + " " + s.addr + " " + s.area).includes(q)) && (!only || shopStatus(s).open));
    $("#shopRows").innerHTML = rows.length ? rows.map((s) => { const st = shopStatus(s); return `<li><button type="button" class="hk-shop-row${selShop === s.id ? " is-sel" : ""}" data-shop="${s.id}"><i>${s.n}</i><span><b>${esc(s.name)}</b><small>${esc(s.addr)}</small></span><span class="hk-shop-st hk-st-${st.state}">${st.label}<small><br>${esc(st.text)}</small></span></button></li>`; }).join("") : `<li style="padding:18px 8px;color:var(--mute);font-size:14px">Nessuno shop ${only ? "aperto adesso" : "trovato"}.</li>`;
    $("#mapPins").innerHTML = SHOPS.map((s) => `<g class="hk-pin${selShop === s.id ? " is-sel" : ""}" data-shop="${s.id}" transform="translate(${s.pos[0]} ${s.pos[1]})" tabindex="0" role="button" aria-label="${esc(s.name)}"><circle class="hk-pin-ring" r="18"/><circle class="hk-pin-dot" r="16"/><text text-anchor="middle" y="5">${s.n}</text></g>`).join("");
    renderMapCard();
    $("#sideStatus").innerHTML = SHOPS.map((s) => { const st = shopStatus(s); return `<div><span>${esc(s.name)}</span><span class="hk-st-${st.state}">${st.label} · ${esc(st.text)}</span></div>`; }).join("");
  }
  function renderMapCard() {
    const c = $("#mapCard"), s = SHOPS.find((x) => x.id === selShop);
    if (!s) { c.hidden = true; return; }
    const now = romeNow(), st = shopStatus(s);
    const order = [1, 2, 3, 4, 5, 6, 0];
    c.hidden = false;
    c.innerHTML = `<button class="hk-x" type="button" data-act="map-close" aria-label="Chiudi" style="position:absolute;right:8px;top:8px"><svg><use href="#i-close"/></svg></button><h3>${esc(s.name)}</h3><p>${esc(s.addr)} · ${s.tel}</p><p class="hk-st-${st.state}" style="font-weight:600;margin-top:4px">${st.label} · ${esc(st.text)}</p><table>${order.map((d) => `<tr class="${d === now.dow ? "is-today" : ""}"><td>${DAYS[d][0].toUpperCase() + DAYS[d].slice(1)}</td><td>${s.h[d].length ? s.h[d].map(([a, b]) => hhmm(a) + "–" + hhmm(b)).join(", ") : "chiuso"}</td></tr>`).join("")}</table><button class="hk-btn hk-btn-ink" type="button" data-act="pick-shop" data-shop-id="${s.id}">Ritira qui</button>`;
  }
  function selectShop(id) { selShop = selShop === id ? null : id; renderShops(); }
  $("#shopRows").addEventListener("click", (e) => { const b = e.target.closest("[data-shop]"); if (b) selectShop(b.dataset.shop); });
  $("#mapPins").addEventListener("click", (e) => { const g = e.target.closest("[data-shop]"); if (g) selectShop(g.dataset.shop); });
  $("#mapPins").addEventListener("keydown", (e) => { const g = e.target.closest("[data-shop]"); if (g && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); selectShop(g.dataset.shop); } });
  $("#mapCard").addEventListener("click", (e) => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    if (b.dataset.act === "map-close") { selShop = null; renderShops(); }
    if (b.dataset.act === "pick-shop") { setMode("pickup"); setPickupShop(b.dataset.shopId, true); }
  });
  $("#shopSearch").addEventListener("input", renderShops);
  $("#openOnly").addEventListener("change", renderShops);

  /* ================= LOGIN / NEWSLETTER ================= */
  const login = $("#login");
  $("#loginBtn").addEventListener("click", () => { $("#loginOk").hidden = true; $("#loginErr").textContent = ""; show(login, "login"); setTimeout(() => $("#loginMail").focus(), 80); });
  $$("[data-close-login]", login).forEach((b) => b.addEventListener("click", () => hide(login, "login", 280)));
  $("#loginForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = $("#loginMail").value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v)) { $("#loginErr").textContent = "Scrivi un indirizzo email valido."; $("#loginOk").hidden = true; return; }
    $("#loginErr").textContent = ""; $("#loginOk").hidden = false; $("p", $("#loginOk")).textContent = `Link inviato a ${v}. Aprilo da questo dispositivo entro 15 minuti.`;
  });
  $("#newsForm").addEventListener("submit", (e) => {
    e.preventDefault();
    const v = $("#newsMail").value.trim();
    $("#newsMsg").textContent = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v) ? "Fatto! La prima email arriva a inizio mese." : "Controlla l'indirizzo email.";
  });

  /* ================= GLOBAL ================= */
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!rc.hidden && $("#rcDone").classList.contains("is-on")) return $("#rcDone").click();
    if (!co.hidden) return closeCheckout();
    if (!pm.hidden) return closeProduct();
    if (!login.hidden) return hide(login, "login", 280);
    if (cart.classList.contains("is-on")) return openCart(false);
    if (side.classList.contains("is-on")) return openMenu(false);
  });
  function refreshAll(animateModes) {
    renderModes(animateModes); renderHeader(); renderZoneCard(); renderZoneTable(); renderCart(); renderShops(); updateHdr();
  }
  if (state.mode === "delivery" && state.addr) addrInput.value = state.addr.label;
  if (state.mode === "pickup" && curShop()) addrInput.value = curShop().name;
  renderGrid(false);
  refreshAll(false);
  requestAnimationFrame(() => { placeCatPill(false); placeModePill($("#heroMode")); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { placeCatPill(false); placeModePill($("#heroMode")); placeModePill($("#cartMode")); });
  setInterval(() => { renderShops(); renderZoneCard(); }, 30000);
  mqNarrow.addEventListener && mqNarrow.addEventListener("change", () => { pillEdges = null; placeCatPill(false); });

  /* test hooks */
  window.__hk = { state, statusFor, slotsFor, resolveAddress, totals, zoneOf, SHOPS, setNow: (dow, min) => { nowOverride = dow === null ? null : { dow, min }; refreshAll(); }, goSlide, floatEls, flyToCart };
})();
