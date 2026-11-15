/* Hibana · sushi & robata — template script (no libraries).
   Runs inside a sandboxed iframe without allow-same-origin: every storage access is wrapped. */
(() => {
  "use strict";

  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fineHover = () => matchMedia("(hover: hover) and (pointer: fine)").matches;
  const EUR = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" });
  const eur = (n) => EUR.format(n);
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const pad = (n) => String(n).padStart(2, "0");
  const hm = (m) => pad(Math.floor((((m % 1440) + 1440) % 1440) / 60)) + ":" + pad(m % 60);

  const store = {
    get(k) { try { return JSON.parse(window.localStorage.getItem(k)); } catch (e) { return null; } },
    set(k, v) { try { window.localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* sandboxed: memory only */ } },
  };

  /* ---------------------------------------------------------------- data */
  const LUNCH = [720, 900, 870], DIN = [1140, 1440, 1380], DIN_LATE = [1140, 1500, 1410];
  const LOCS = {
    pratello: {
      name: "Pratello", addr: "Via del Pratello 41/b", city: "40122 Bologna", tel: "+39 051 000 0417", img: "assets/r-pratello.webp",
      alt: "Sala con divanetti in pelle bordeaux e tavoli in legno",
      days: { 0: [LUNCH, DIN], 1: [], 2: [LUNCH, DIN], 3: [LUNCH, DIN], 4: [LUNCH, DIN], 5: [LUNCH, DIN_LATE], 6: [LUNCH, DIN_LATE] },
    },
    maggiore: {
      name: "Maggiore", addr: "Strada Maggiore 18", city: "40125 Bologna", tel: "+39 051 000 0418", img: "assets/r-maggiore.webp",
      alt: "Sala ampia con lampadari a globo e separé in legno",
      days: { 0: [[720, 1380, 1320]], 1: [[720, 1410, 1350]], 2: [[720, 1410, 1350]], 3: [[720, 1410, 1350]], 4: [[720, 1410, 1350]], 5: [[720, 1410, 1350]], 6: [[720, 1410, 1350]] },
    },
  };
  const DAYS_LONG = ["Domenica", "Lunedì", "Martedì", "Mercoledì", "Giovedì", "Venerdì", "Sabato"];
  const DAYS_SHORT = ["dom", "lun", "mar", "mer", "gio", "ven", "sab"];
  const MONTHS = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];

  // cat: sushi | robata | side | bar ; img: product shot on white (shot) or a cut-out plate (cut)
  const MENU = [
    { id: "barca", cat: "sushi", n: "Barca Hibana", d: "Quaranta pezzi da mettere in mezzo: nigiri, uramaki, sashimi e gunkan del giorno.", pcs: "40 pz", p: 58, img: "m-sushi-party.webp", share: true },
    { id: "nigiri-chef", cat: "sushi", n: "Nigiri dello chef", d: "Otto pezzi scelti al banco: ricciola, salmone, gambero, tamago, anguilla e tre gunkan.", pcs: "8 pz", p: 22, img: "m-nigiri-misto.webp" },
    { id: "n-salmone", cat: "sushi", n: "Nigiri salmone", d: "Salmone norvegese, riso tiepido, un velo di wasabi.", pcs: "2 pz", p: 5.5, img: "m-nigiri-salmone.webp" },
    { id: "n-tonno", cat: "sushi", n: "Nigiri tonno", d: "Tonno pinna gialla e soia invecchiata.", pcs: "2 pz", p: 6.5, img: "m-nigiri-tonno.webp" },
    { id: "n-gambero", cat: "sushi", n: "Nigiri gambero rosso", d: "Gambero rosso crudo, sale al limone.", pcs: "2 pz", p: 8, img: "m-nigiri-gambero-rosso.webp" },
    { id: "n-branzino", cat: "sushi", n: "Nigiri branzino", d: "Branzino scottato, yuzu e cipollotto.", pcs: "2 pz", p: 5.5, img: "m-nigiri-branzino.webp" },
    { id: "n-anguilla", cat: "sushi", n: "Nigiri anguilla", d: "Anguilla laccata alla brace, sesamo tostato.", pcs: "2 pz", p: 6.5, img: "m-nigiri-anguilla.webp" },
    { id: "n-tartufo", cat: "sushi", n: "Nigiri al tartufo", d: "Salmone scottato e crema al tartufo nero dei colli.", pcs: "2 pz", p: 7, img: "m-nigiri-tartufo.webp" },
    { id: "ikura", cat: "sushi", n: "Gunkan ikura", d: "Uova di salmone marinate nella soia, alga croccante.", pcs: "2 pz", p: 7, img: "m-gunkan-ikura.webp" },
    { id: "tiger", cat: "sushi", n: "Tiger roll", d: "Gambero in tempura, avocado, salmone scottato, salsa piccante.", pcs: "8 pz", p: 13, img: "m-tiger-maki-8-pz.webp" },
    { id: "rainbow", cat: "sushi", n: "Rainbow roll", d: "Granchio e cetriolo dentro, cinque pesci fuori.", pcs: "8 pz", p: 14, img: "m-rainbow-maki-8-pz.webp" },
    { id: "dragon", cat: "sushi", n: "Dragon roll", d: "Anguilla alla brace, avocado, salsa teriyaki.", pcs: "8 pz", p: 14, img: "m-dragon-maki.webp" },
    { id: "crispy", cat: "sushi", n: "Crispy tuna", d: "Tartare di tonno piccante su riso croccante.", pcs: "8 pz", p: 13, img: "m-ura-crispy-tuna-8-pz.webp" },
    { id: "salmon-sp", cat: "sushi", n: "Salmon special", d: "Salmone, formaggio fresco, ikura e cipolla fritta.", pcs: "8 pz", p: 12, img: "m-special-salmon-maki.webp" },
    { id: "flower", cat: "sushi", n: "Flower roll", d: "Salmone scottato, maionese al lime, briciole di tempura.", pcs: "4 pz", p: 7.5, img: "m-ura-flower-4-pz.webp" },
    { id: "hoso", cat: "sushi", veg: true, n: "Hosomaki cetriolo", d: "Cetriolo e sesamo. Semplice e fresco.", pcs: "6 pz", p: 5, img: "m-hoso-cetriolo.webp" },
    { id: "sashimi-s", cat: "sushi", n: "Sashimi salmone", d: "Dieci fette spesse, limone e shiso.", pcs: "10 pz", p: 14, img: "m-sashimi-salmone.webp" },
    { id: "sashimi-m", cat: "sushi", n: "Sashimi misto", d: "Salmone, tonno, ricciola, branzino: il taglio del giorno.", pcs: "12 pz", p: 19, img: "m-sashimi-misto.webp", share: true },
    { id: "tataki", cat: "sushi", n: "Tataki di salmone", d: "Scottato sulla brace, ponzu, daikon e rucola.", pcs: "10 fette", p: 15, img: "m-tataki-salmone-10-pz.webp" },
    { id: "tartare", cat: "sushi", n: "Tartare di tonno", d: "Tonno, avocado, olio al sesamo, chips di riso.", pcs: "", p: 14, img: "m-tartare-tonno.webp" },
    { id: "temaki", cat: "sushi", n: "Temaki salmone", d: "Cono di alga, salmone, avocado e maionese al lime.", pcs: "1 pz", p: 7, img: "m-temaki-salmone.webp" },
    { id: "momo-negi", cat: "robata", n: "Momo negi", d: "Coscia di pollo e cipollotto, salsa tare.", pcs: "2 spiedini", p: 6.5, img: "t-yaki-pollo.webp", cut: true },
    { id: "butabara", cat: "robata", n: "Butabara", d: "Pancia di maiale croccante, sale e limone.", pcs: "2 spiedini", p: 7, img: "t-yaki-pancetta.webp", cut: true },
    { id: "kawa", cat: "robata", n: "Kawa", d: "Pelle di pollo arrotolata, croccante fino all'ultimo.", pcs: "1 spiedino", p: 4.5, img: "t-yaki-kawa.webp", cut: true },
    { id: "ebi-negi", cat: "robata", n: "Ebi negi", d: "Gambero e cipollotto, burro al miso e lime.", pcs: "2 spiedini", p: 8, img: "t-negima.webp", cut: true },
    { id: "edamame", cat: "side", veg: true, n: "Edamame alla brace", d: "Sale affumicato e scorza di limone.", pcs: "", p: 5, img: "m-edamame.webp", share: true },
    { id: "gyoza", cat: "side", veg: true, n: "Gyoza di verdure", d: "Cavolo, shiitake e zenzero, fondo croccante.", pcs: "5 pz", p: 7, img: "m-gyoza.webp" },
    { id: "miso", cat: "side", veg: true, n: "Zuppa di miso", d: "Tofu, wakame e cipollotto.", pcs: "", p: 4, img: "t-miso.webp", cut: true },
    { id: "mochi", cat: "side", veg: true, n: "Mochi", d: "Tre gusti: matcha, sesamo nero, fragola.", pcs: "3 pz", p: 6, img: "m-mochi.webp" },
    { id: "sour", cat: "bar", n: "Yuzu sour", d: "Shochu, yuzu, albume, bordo al peperoncino.", pcs: "", p: 10, img: "t-sour.webp", cut: true },
    { id: "ume", cat: "bar", n: "Ume spritz", d: "Liquore di prugna, bollicine dei colli, timo.", pcs: "", p: 9, img: "t-spritz.webp", cut: true },
  ];
  const BY_ID = Object.fromEntries(MENU.map((m) => [m.id, m]));

  /* The table. x,y,w = desktop stage (% of 1600×1000); mx,my,mw = portrait stage; d = parallax depth (taller = closer = moves more). */
  const PLATES = [
    { id: "barca", img: "t-barca.webp", x: 50, y: 30, w: 26, mx: 50, my: 25, mw: 64, d: 9 },
    { id: "nigiri-chef", img: "t-nigiri.webp", x: 78, y: 30, w: 18, mx: 85, my: 50, mw: 42, d: 11 },
    { id: "momo-negi", img: "t-yaki-pollo.webp", x: 21, y: 31, w: 16, mx: 16, my: 50, mw: 40, d: 11 },
    { id: "tataki", img: "t-tataki.webp", x: 35, y: 4, w: 14, mx: 50, my: 67, mw: 30, d: 12 },
    { id: "miso", img: "t-miso.webp", x: 66, y: 7, w: 10.5, mx: 90, my: 8, mw: 26, d: 18, tall: true },
    { id: "kawa", img: "t-yaki-kawa.webp", x: 6, y: 58, w: 13, mx: 9, my: 8, mw: 30, d: 11 },
    { id: "butabara", img: "t-yaki-pancetta.webp", x: 24, y: 80, w: 14.5, mx: 16, my: 80, mw: 36, d: 11 },
    { id: "ebi-negi", img: "t-negima.webp", x: 93, y: 58, w: 13.5, mx: 85, my: 78, mw: 34, d: 13 },
    { id: "edamame", img: "t-edamame.webp", x: 80, y: 79, w: 12, mx: 42, my: 90, mw: 28, d: 15, tall: true },
    { id: "sour", img: "t-sour.webp", x: 93, y: 13, w: 9.5, mx: 90, my: 31, mw: 22, d: 28, tall: true },
    { id: "ume", img: "t-spritz.webp", x: 24, y: 12.5, w: 9, mx: 10, my: 32, mw: 21, d: 28, tall: true },
    { id: null, img: "t-wasabi.webp", x: 75, y: 59, w: 5.4, m: 0, d: 7, name: "Wasabi fresco", meta: "In omaggio con il sushi" },
    { id: null, img: "t-zenzero.webp", x: 81.5, y: 62.5, w: 5.4, m: 0, d: 7, name: "Zenzero marinato", meta: "In omaggio con il sushi" },
  ];
  const TABLE_IDS = PLATES.filter((p) => p.id).map((p) => p.id);

  /* ---------------------------------------------------------------- Rome clock */
  const ROME = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23", weekday: "short" });
  const WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  function romeNow(date = new Date()) {
    const p = Object.fromEntries(ROME.formatToParts(date).map((x) => [x.type, x.value]));
    return { y: +p.year, mo: +p.month, d: +p.day, dow: WD[p.weekday], min: (+p.hour % 24) * 60 + +p.minute };
  }
  // calendar day k days after the Rome "today"
  function romeDay(k) {
    const n = romeNow(); const t = new Date(Date.UTC(n.y, n.mo - 1, n.d + k));
    return { y: t.getUTCFullYear(), mo: t.getUTCMonth() + 1, d: t.getUTCDate(), dow: t.getUTCDay(), k, key: `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}` };
  }

  function statusAt(locId, dow, min) {
    const L = LOCS[locId], today = L.days[dow] || [], yest = L.days[(dow + 6) % 7] || [];
    for (const iv of today) if (min >= iv[0] && min < iv[1]) return { open: true, close: iv[1], kitchen: iv[2], kitchenOpen: min < iv[2] };
    for (const iv of yest) if (iv[1] > 1440 && min < iv[1] - 1440) return { open: true, close: iv[1] - 1440, kitchen: iv[2] - 1440, kitchenOpen: min < iv[2] - 1440 };
    for (let k = 0; k < 8; k++) {
      for (const iv of L.days[(dow + k) % 7] || []) {
        if (k === 0 && iv[0] <= min) continue;
        return { open: false, k, at: iv[0], dow: (dow + k) % 7 };
      }
    }
    return { open: false, k: -1 };
  }
  function statusText(s) {
    if (s.open) return { badge: "APERTO", main: `Chiude alle ${hm(s.close)}`, sub: s.kitchenOpen ? `Cucina fino alle ${hm(s.kitchen)}` : "Cucina chiusa, il bar è aperto" };
    if (s.k === 0) return { badge: "CHIUSO", main: `Apre alle ${hm(s.at)}`, sub: "Prenota per oggi qui sotto" };
    if (s.k === 1) return { badge: "CHIUSO", main: `Apre domani alle ${hm(s.at)}`, sub: "Oggi si riposa la brace" };
    return { badge: "CHIUSO", main: `Apre ${DAYS_LONG[s.dow].toLowerCase()} alle ${hm(s.at)}`, sub: "" };
  }

  /* ---------------------------------------------------------------- toast */
  const toastEl = $("#toast"); let toastT = 0;
  function toast(msg, ms = 2800) {
    toastEl.textContent = msg; toastEl.classList.add("is-on");
    clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("is-on"), ms);
  }

  /* ---------------------------------------------------------------- particle burst (done-burst-button) */
  const cv = $("#burst"), ctx = cv.getContext("2d");
  let burstRaf = 0;
  function sizeCanvas() { const r = Math.min(2, devicePixelRatio || 1); cv.width = innerWidth * r; cv.height = innerHeight * r; ctx.setTransform(r, 0, 0, r, 0, 0); }
  sizeCanvas(); addEventListener("resize", sizeCanvas);
  function burst(el) {
    if (reduce()) return;
    const b = el.getBoundingClientRect(), ox = b.left + b.width / 2, oy = b.top + b.height / 2;
    const cols = ["#c8452c", "#f4f1e6", "#e8b04a", "#8aa45a"];
    const ps = Array.from({ length: 26 }, (_, i) => {
      const a = (i / 26) * Math.PI * 2 + (Math.random() - .5) * .5, sp = 170 + Math.random() * 170;
      return { x: ox + Math.cos(a) * 8, y: oy + Math.sin(a) * 8, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 50, r: 3.4 + Math.random() * 4.2, c: cols[i % 4] };
    });
    const t0 = performance.now(); let last = t0;
    cancelAnimationFrame(burstRaf);
    const step = (now) => {
      const t = (now - t0) / 900, dt = Math.min(.05, (now - last) / 1000); last = now;
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      if (t >= 1) return;
      for (const q of ps) {
        q.vy += 190 * dt; q.vx *= 1 - 2.6 * dt; q.vy *= 1 - 2 * dt; q.x += q.vx * dt; q.y += q.vy * dt;
        ctx.globalAlpha = t < .45 ? 1 : 1 - (t - .45) / .55; ctx.fillStyle = q.c;
        ctx.beginPath(); ctx.arc(q.x, q.y, q.r * (1 - t * .35), 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
      burstRaf = requestAnimationFrame(step);
    };
    burstRaf = requestAnimationFrame(step);
  }
  // squeeze → tick → burst. Resolves when the sequence is done.
  function doneSequence(btn) {
    const R = reduce();
    return new Promise((res) => {
      const w = btn.offsetWidth, h = btn.offsetHeight;
      btn.style.width = w + "px"; void btn.offsetWidth;
      btn.classList.add("is-press");
      const later = (ms, f) => setTimeout(f, R ? 0 : ms);
      later(180, () => { btn.classList.add("is-round"); btn.style.width = h + "px"; });
      later(600, () => btn.classList.add("is-tick"));
      later(950, () => burst(btn));
      later(1250, res);
    });
  }
  function doneReset(btn, label) {
    const span = btn.querySelector("span");
    btn.classList.remove("is-press", "is-tick");
    if (label) span.textContent = label;
    const from = btn.offsetWidth;
    btn.classList.remove("is-round"); btn.style.width = "auto";
    const to = btn.offsetWidth;
    btn.style.width = from + "px"; void btn.offsetWidth; btn.style.width = to + "px";
    setTimeout(() => { btn.style.width = ""; }, reduce() ? 0 : 450);
  }

  /* ---------------------------------------------------------------- cart */
  const saved = store.get("hibana-cart") || {};
  const cart = {
    items: new Map(Object.entries(saved.items || {}).filter(([k, v]) => BY_ID[k] && v > 0)),
    mode: saved.mode === "consegna" ? "consegna" : "ritiro",
    loc: LOCS[saved.loc] ? saved.loc : "pratello",
    slot: "asap",
  };
  const cartCount = () => [...cart.items.values()].reduce((a, b) => a + b, 0);
  const cartSub = () => [...cart.items].reduce((s, [id, q]) => s + BY_ID[id].p * q, 0);
  const DELIVERY_MIN = 25, DELIVERY_FEE = 3.5, DELIVERY_FREE = 60;
  const cartFee = () => cart.mode === "consegna" && cartSub() < DELIVERY_FREE ? DELIVERY_FEE : 0;
  function saveCart() { store.set("hibana-cart", { items: Object.fromEntries(cart.items), mode: cart.mode, loc: cart.loc }); }
  function addItem(id, n = 1, quiet) {
    const q = (cart.items.get(id) || 0) + n;
    if (q <= 0) cart.items.delete(id); else cart.items.set(id, q);
    saveCart(); renderCart(true);
    if (!quiet && n > 0) toast(`${BY_ID[id].n} aggiunto all'ordine · ${eur(cartSub())}`, 2000);
  }

  // pickup/delivery slots (today, then tomorrow), every 15 minutes up to kitchen close
  function orderSlots(locId, mode) {
    const lead = mode === "consegna" ? 40 : 20, now = romeNow(), out = [];
    for (let k = 0; k < 2 && out.length < 28; k++) {
      const day = romeDay(k);
      for (const iv of LOCS[locId].days[day.dow] || []) {
        for (let t = iv[0] + (mode === "consegna" ? 30 : 15); t <= iv[2]; t += 15) {
          if (k === 0 && t < now.min + lead) continue;
          out.push({ key: `${day.key} ${hm(t)}`, label: `${k === 0 ? "Oggi" : "Domani"} ${hm(t)}` });
        }
      }
      if (k === 0 && out.length) break; // only roll over to tomorrow when today is done
    }
    return out.slice(0, 28);
  }
  function renderSlotSelects() {
    const slots = orderSlots(cart.loc, cart.mode);
    const opts = slots.length
      ? [`<option value="asap">Prima possibile · ${slots[0].label.toLowerCase()}</option>`, ...slots.map((s) => `<option value="${s.key}">${s.label}</option>`)]
      : [`<option value="">Nessun orario disponibile</option>`];
    if (cart.slot !== "asap" && !slots.some((s) => s.key === cart.slot)) cart.slot = "asap";
    $$("[data-slot-select]").forEach((sel) => { sel.innerHTML = opts.join(""); sel.value = slots.length ? cart.slot : ""; });
    return slots;
  }
  function renderLocSelects() {
    $$("[data-loc-select]").forEach((sel) => {
      sel.innerHTML = Object.entries(LOCS).map(([k, L]) => `<option value="${k}">${L.name}</option>`).join("");
      sel.value = cart.loc;
    });
  }
  function renderMode() {
    $$("[data-mode]").forEach((b) => b.setAttribute("aria-checked", String(b.dataset.mode === cart.mode)));
    $("#cAddrWrap").hidden = cart.mode !== "consegna";
    $("#cSlotLbl").textContent = cart.mode === "consegna" ? "Consegna" : "Ritiro";
    $("#cartForm legend").textContent = cart.mode === "consegna" ? "A chi consegniamo" : "Chi ritira";
  }

  const head = $("#head"), mbar = $(".hb-mbar");
  function renderCart(bump) {
    const n = cartCount(), sub = cartSub(), fee = cartFee();
    $$("[data-cart-sum]").forEach((e) => (e.textContent = eur(sub)));
    $$("[data-cart-count]").forEach((e) => (e.textContent = n));
    head.classList.toggle("has-cart", n > 0); mbar.classList.toggle("has-cart", n > 0);
    if (bump) ["#cartBtnTop", ".hb-mbar-cart"].forEach((s) => { const e = $(s); e.classList.remove("is-bump"); void e.offsetWidth; e.classList.add("is-bump"); });
    // menu "+" badges
    $$(".hb-dc").forEach((c) => { const b = c.querySelector(".hb-plus b"); if (b) b.textContent = cart.items.get(c.dataset.id) || ""; });
    // hero tag buttons
    $$(".hb-plate[data-id]").forEach((p) => p.querySelector(".hb-add")?.classList.toggle("is-added", cart.items.has(p.dataset.id)));
    // drawer
    const list = $("#cItems");
    list.innerHTML = [...cart.items].map(([id, q]) => {
      const m = BY_ID[id];
      return `<li class="hb-li" data-id="${id}"><img src="assets/${m.img}" alt="" class="${m.cut ? "" : "is-shot"}"><div><p class="hb-li-n">${m.n}</p><p class="hb-li-p">${eur(m.p)}${q > 1 ? ` × ${q} = ${eur(m.p * q)}` : ""}</p></div>
        <div class="hb-qty"><button type="button" data-q="-1" aria-label="Togli un ${m.n}"><svg viewBox="0 0 24 24"><path d="M6 12h12"/></svg></button><b>${q}</b><button type="button" data-q="1" aria-label="Aggiungi un ${m.n}"><svg viewBox="0 0 24 24"><path d="M12 6v12M6 12h12"/></svg></button></div></li>`;
    }).join("");
    $("#cEmpty").hidden = n > 0;
    $("#cTotals").hidden = n === 0;
    $("#cSub").textContent = eur(sub);
    $("#cFeeRow").hidden = cart.mode !== "consegna";
    $("#cFee").textContent = fee ? eur(fee) : "Gratis";
    $("#cTot").textContent = eur(sub + fee);
    let hint = "";
    if (cart.mode === "consegna" && n) hint = sub < DELIVERY_MIN ? `Consegna da ${eur(DELIVERY_MIN)}: mancano ${eur(DELIVERY_MIN - sub)}.` : sub < DELIVERY_FREE ? `Consegna gratis sopra ${eur(DELIVERY_FREE)}: mancano ${eur(DELIVERY_FREE - sub)}.` : "Consegna gratuita.";
    $("#cHint").textContent = hint;
    // hero take-table state follows the cart
    if (n === 0 && takeState === "added") { takeState = "idle"; take.classList.remove("is-ok"); doneReset(takeBtn, "VOGLIO QUESTA TAVOLA"); }
  }

  /* ---------------------------------------------------------------- hero: the explorable table */
  const hero = $("#hero"), platesEl = $("#plates");
  platesEl.innerHTML = PLATES.map((p, i) => {
    const m = p.id ? BY_ID[p.id] : null;
    const name = m ? m.n : p.name, meta = m ? [m.pcs, m.cat === "robata" ? "dalla brace" : m.cat === "bar" ? "dal bancone" : m.cat === "side" ? "per tutti" : "dal banco"].filter(Boolean).join(" · ") : p.meta;
    const style = `--i:${i};--x:${p.x};--y:${p.y};--w:${p.w};--mx:${p.mx ?? p.x};--my:${p.my ?? p.y};--mw:${p.mw ?? p.w};--d:${p.d}`;
    return `<div class="hb-plate hb-par${p.tall ? " is-tall" : ""}" style="${style}"${p.id ? ` data-id="${p.id}"` : ""}${p.m === 0 ? ' data-m="0"' : ""}>
      <button type="button" class="hb-dish" aria-label="${name}${m ? ", " + eur(m.p) : ""}" aria-expanded="false"><img src="assets/${p.img}" alt="" draggable="false"></button>
      <div class="hb-tag" style="top:${p.w < 8 ? 96 : 74}%"><span class="hb-tag-t"><span class="hb-tag-n">${name}</span><span class="hb-tag-m">${meta}</span></span>
        ${m ? `<span class="hb-tag-p">${eur(m.p)}</span><button type="button" class="hb-add" aria-label="Aggiungi ${name} all'ordine"><svg viewBox="0 0 24 24"><path d="M12 6v12M6 12h12"/></svg></button>` : `<span class="hb-tag-x">gratis</span>`}
      </div></div>`;
  }).join("");
  const plates = $$(".hb-plate", platesEl);

  // discovered-dishes lines (the original's slide progress, repurposed)
  const found = new Set();
  $("#foundLines").innerHTML = TABLE_IDS.map(() => "<i></i>").join("");
  const tableTotal = TABLE_IDS.reduce((s, id) => s + BY_ID[id].p, 0);
  $("#tableSum").textContent = `${TABLE_IDS.length} piatti · per 4 · ${eur(tableTotal)}`;
  function renderFound() {
    $$("#foundLines i").forEach((l, i) => l.classList.toggle("is-on", i < found.size));
    $("#foundTxt").textContent = found.size === TABLE_IDS.length ? "Tavola esplorata: 11 di 11" : `${found.size} di ${TABLE_IDS.length} piatti scoperti`;
  }

  let openPlate = null;
  function placeTag(p) {
    const tag = p.querySelector(".hb-tag");
    tag.style.setProperty("--tx", "0px"); tag.style.setProperty("--ty", "0px");
    const hr = hero.getBoundingClientRect(), tr = tag.getBoundingClientRect(), m = 12;
    let tx = 0, ty = 0;
    if (tr.left < hr.left + m) tx = hr.left + m - tr.left;
    if (tr.right > hr.right - m) tx = hr.right - m - tr.right;
    const floor = innerWidth <= 760 ? hr.bottom - 150 : hr.bottom - 96;
    if (tr.bottom - 8 > floor) ty = floor - (tr.bottom - 8);
    if (tr.top + ty < hr.top + 70) ty = hr.top + 70 - tr.top;
    tag.style.setProperty("--tx", tx + "px"); tag.style.setProperty("--ty", ty + "px");
  }
  function setOpen(p) {
    if (openPlate === p) return;
    if (openPlate) { openPlate.classList.remove("is-on"); openPlate.querySelector(".hb-dish").setAttribute("aria-expanded", "false"); }
    openPlate = p;
    hero.classList.toggle("has-focus", !!p);
    if (!p) return;
    placeTag(p);
    p.classList.add("is-on"); p.querySelector(".hb-dish").setAttribute("aria-expanded", "true");
    if (p.dataset.id && !found.has(p.dataset.id)) { found.add(p.dataset.id); renderFound(); }
  }
  plates.forEach((p) => {
    p.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") setOpen(p); });
    p.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse" && openPlate === p) setOpen(null); });
    // a tap focuses the button before it clicks: remember whether it was open *before* the press, or the tap opens and closes in one go
    let wasOpen = false;
    p.querySelector(".hb-dish").addEventListener("pointerdown", () => { wasOpen = openPlate === p; });
    p.querySelector(".hb-dish").addEventListener("click", () => { setOpen(wasOpen && !fineHover() ? null : p); wasOpen = false; });
    p.querySelector(".hb-dish").addEventListener("focus", () => setOpen(p));
    p.addEventListener("focusout", (e) => { if (!p.contains(e.relatedTarget) && openPlate === p) setOpen(null); });
    const add = p.querySelector(".hb-add");
    if (add) add.addEventListener("click", (e) => { e.stopPropagation(); addItem(p.dataset.id, 1); });
  });
  document.addEventListener("pointerdown", (e) => { if (openPlate && !openPlate.contains(e.target)) setOpen(null); });

  // cursor-driven depth parallax (cursor-miniature-parallax): two numbers eased 10%/frame, every layer multiplies by its --d
  let tx = 0, ty = 0, px = 0, py = 0, praf = 0, lastX = 0, lastY = 0, lastT = 0, cool = 0;
  const flame = $("#flame");
  function ptick() {
    px += (tx - px) * .1; py += (ty - py) * .1;
    hero.style.setProperty("--px", px.toFixed(4)); hero.style.setProperty("--py", py.toFixed(4));
    praf = Math.abs(tx - px) > .001 || Math.abs(ty - py) > .001 ? requestAnimationFrame(ptick) : 0;
  }
  hero.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse" || reduce()) return;
    const r = hero.getBoundingClientRect();
    tx = clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1); ty = clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
    if (!praf) praf = requestAnimationFrame(ptick);
    // a flick (not a drift) makes the candle flame jump
    const now = performance.now(), dt = now - lastT;
    if (lastT && dt < 80) {
      const v = Math.hypot(e.clientX - lastX, e.clientY - lastY) / dt;
      if (v > 1.6 && now > cool) { cool = now + 700; flame.classList.remove("is-hop"); void flame.offsetWidth; flame.classList.add("is-hop"); }
    }
    lastX = e.clientX; lastY = e.clientY; lastT = now;
  }, { passive: true });
  hero.addEventListener("pointerleave", () => { tx = 0; ty = 0; if (!praf && !reduce()) praf = requestAnimationFrame(ptick); });
  flame.addEventListener("animationend", (e) => { if (e.animationName === "hb-hop") flame.classList.remove("is-hop"); });

  // "Voglio questa tavola": the whole table into the takeaway order
  const take = $(".hb-take"), takeBtn = $("#takeTable");
  let takeState = "idle";
  takeBtn.addEventListener("click", async () => {
    if (takeState === "busy") return;
    if (takeState === "added") { openDrawer($("#cart")); return; }
    takeState = "busy"; setOpen(null);
    const seq = doneSequence(takeBtn);
    setTimeout(() => { TABLE_IDS.forEach((id) => addItem(id, 1, true)); take.classList.add("is-ok"); }, reduce() ? 0 : 950);
    await seq;
    setTimeout(() => {
      takeState = "added";
      doneReset(takeBtn, "APRI L'ORDINE");
      takeBtn.setAttribute("aria-label", "Apri l'ordine");
    }, reduce() ? 0 : 1100);
    toast(`Tavola aggiunta: ${TABLE_IDS.length} piatti, ${eur(tableTotal)}. Puoi cambiarla nell'ordine.`, 3200);
  });

  /* ---------------------------------------------------------------- menu + filter chips (filter-chips-results) */
  const grid = $("#grid"), chipsEl = $(".hb-chips"), chipPill = $(".hb-chip-pill"), chips = $$(".hb-chips button");
  const SETS = {
    all: MENU, sushi: MENU.filter((m) => m.cat === "sushi"), robata: MENU.filter((m) => m.cat === "robata"),
    veg: MENU.filter((m) => m.veg), bar: MENU.filter((m) => m.cat === "bar"),
  };
  chips.forEach((c) => { c.querySelector("small").textContent = SETS[c.dataset.k].length; });
  let cat = "all", shownKey = "", gT = [];
  const cardHTML = (m) => `<article class="hb-dc" data-id="${m.id}">
      <div class="hb-dc-img"><img src="assets/${m.img}" alt="${m.n}" loading="lazy" class="${m.cut ? "is-cut" : "is-shot"}" draggable="false"></div>
      <div class="hb-dc-body"><h3>${m.n}</h3>
        <div class="hb-dc-tags">${m.veg ? '<span class="is-veg">veg</span>' : ""}${m.share ? '<span class="is-share">da condividere</span>' : ""}${m.cat === "robata" ? "<span>brace</span>" : ""}</div>
        <p>${m.d}</p>
        <div class="hb-dc-foot"><span class="hb-dc-price">${eur(m.p)}</span>${m.pcs ? `<span class="hb-dc-pcs">${m.pcs}</span>` : ""}
          <button type="button" class="hb-plus" aria-label="Aggiungi ${m.n} all'ordine"><svg viewBox="0 0 24 24"><path d="M12 6v12M6 12h12"/></svg><b>${cart.items.get(m.id) || ""}</b></button></div>
      </div></article>`;
  function renderGrid(animate) {
    const items = SETS[cat], key = cat;
    if (key === shownKey) return;
    gT.forEach(clearTimeout); gT = [];
    shownKey = key;
    const later = (ms, f) => gT.push(setTimeout(f, ms));
    const swap = () => {
      grid.innerHTML = items.map(cardHTML).join("");
      $("#gridEmpty").hidden = items.length > 0;
      if (!animate || reduce()) return;
      const cards = $$(".hb-dc", grid);
      cards.forEach((c) => c.classList.add("is-enter"));
      cards.forEach((c, i) => later(Math.min(i, 9) * 45 + 16, () => { c.getBoundingClientRect(); c.classList.replace("is-enter", "is-show"); }));
      later(Math.min(cards.length, 10) * 45 + 360, () => cards.forEach((c) => c.classList.remove("is-show")));
    };
    if (!animate || reduce() || !grid.children.length) { swap(); return; }
    $$(".hb-dc", grid).forEach((c) => c.classList.add("is-leave"));
    later(220, swap);
  }
  // highlight: leading edge leaves first, trailing edge follows → it stretches a little on the way
  function placePill(btn, animate) {
    const L = btn.offsetLeft, R = chipsEl.scrollWidth - (btn.offsetLeft + btn.offsetWidth);
    const right = L > chipPill.offsetLeft;
    chipPill.style.transition = !animate || reduce() ? "none" : right
      ? "right .22s cubic-bezier(.3,.7,.4,1), left .3s cubic-bezier(.5,0,.3,1) .04s"
      : "left .22s cubic-bezier(.3,.7,.4,1), right .3s cubic-bezier(.5,0,.3,1) .04s";
    chipPill.style.left = L + "px"; chipPill.style.right = R + "px";
  }
  function pick(k, animate = true) {
    const btn = chips.find((c) => c.dataset.k === k) || chips[0];
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c === btn)));
    placePill(btn, animate);
    if (chipsEl.scrollWidth > chipsEl.clientWidth) chipsEl.scrollTo({ left: btn.offsetLeft - 40, behavior: reduce() ? "auto" : "smooth" });
    if (cat === btn.dataset.k) return;
    cat = btn.dataset.k; renderGrid(animate);
  }
  chips.forEach((c) => c.addEventListener("click", () => pick(c.dataset.k)));
  renderGrid(false);
  requestAnimationFrame(() => placePill(chips[0], false));
  addEventListener("resize", () => placePill(chips.find((c) => c.getAttribute("aria-pressed") === "true"), false));
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => placePill(chips.find((c) => c.getAttribute("aria-pressed") === "true"), false));
  grid.addEventListener("click", (e) => {
    const b = e.target.closest(".hb-plus"); if (!b) return;
    addItem(b.closest(".hb-dc").dataset.id, 1);
  });

  /* ---------------------------------------------------------------- locations */
  const locsGrid = $("#locsGrid");
  function hoursRows(L, dowToday) {
    return [1, 2, 3, 4, 5, 6, 0].map((d) => {
      const ivs = L.days[d];
      const val = ivs.length ? ivs.map((iv) => `${hm(iv[0])}–${hm(iv[1]) === "00:00" ? "24:00" : hm(iv[1])}`).join(" · ") : "Chiuso";
      const k = ivs.length ? `<small>cucina fino ${ivs.map((iv) => hm(iv[2])).join(" · ")}</small>` : "";
      return `<div class="${d === dowToday ? "is-today" : ""}"><dt>${DAYS_LONG[d]}</dt><dd>${val}${k}</dd></div>`;
    }).join("");
  }
  function renderLocs() {
    const now = romeNow();
    const openState = Object.fromEntries($$(".hb-loc", locsGrid).map((c) => [c.dataset.loc, c.classList.contains("is-open")]));
    locsGrid.innerHTML = Object.entries(LOCS).map(([k, L]) => {
      const s = statusAt(k, now.dow, now.min), t = statusText(s);
      return `<article class="hb-loc${openState[k] ? " is-open" : ""}" data-loc="${k}">
        <div class="hb-loc-img"><img src="${L.img}" alt="${L.alt}" loading="lazy"><h3>${L.name.toUpperCase()}</h3></div>
        <div class="hb-loc-body">
          <div class="hb-status"><span class="hb-badge${s.open ? " is-open" : ""}">${t.badge}</span><p class="hb-status-t">${t.main}${t.sub ? `<small>${t.sub}</small>` : ""}</p></div>
          <p class="hb-loc-addr">${L.addr}, ${L.city}</p>
          <p class="hb-loc-tel">${L.tel}</p>
          <div class="hb-hours-wrap"><div><dl class="hb-hours">${hoursRows(L, now.dow)}</dl></div></div>
          <div class="hb-loc-acts"><button type="button" class="hb-ghost" data-book data-loc="${k}">PRENOTA</button>
            <button type="button" class="hb-arrow-link hb-more" aria-expanded="${!!openState[k]}">ORARI <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg></button></div>
        </div></article>`;
    }).join("");
  }
  locsGrid.addEventListener("click", (e) => {
    const m = e.target.closest(".hb-more"); if (!m) return;
    const c = m.closest(".hb-loc"); c.classList.toggle("is-open"); m.setAttribute("aria-expanded", String(c.classList.contains("is-open")));
  });
  renderLocs();

  /* ---------------------------------------------------------------- drawers */
  let lastOpener = null;
  const lock = () => document.body.classList.toggle("is-locked", !!$(".hb-drawer.is-open, .hb-nav.is-open"));
  function openDrawer(d) {
    if (d.classList.contains("is-open")) return;
    lastOpener = document.activeElement;
    d.classList.add("is-open"); d.setAttribute("aria-hidden", "false"); lock();
    setTimeout(() => d.querySelector(".hb-x, .hb-nav-x")?.focus({ preventScroll: true }), 60);
  }
  function closeDrawer(d) {
    if (!d.classList.contains("is-open")) return;
    d.classList.remove("is-open"); d.setAttribute("aria-hidden", "true"); lock();
    if (lastOpener && document.contains(lastOpener)) lastOpener.focus({ preventScroll: true });
  }
  $$(".hb-drawer").forEach((d) => d.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeDrawer(d); }));
  const nav = $("#nav");
  const openNav = () => { openDrawer(nav); $("#navOpen").setAttribute("aria-expanded", "true"); };
  const closeNav = () => { closeDrawer(nav); $("#navOpen").setAttribute("aria-expanded", "false"); };
  $("#navOpen").addEventListener("click", openNav);
  $$("[data-nav-open]").forEach((b) => b.addEventListener("click", openNav));
  addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    const open = $$(".hb-drawer.is-open"); if (open.length) { closeDrawer(open[open.length - 1]); return; }
    if (nav.classList.contains("is-open")) { closeNav(); return; }
    if (openPlate) setOpen(null);
  });

  // global delegation for the small data-* actions
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-nav-close], [data-book], [data-cart], [data-toast], [data-filter]");
    if (!t) return;
    if (t.matches("[data-nav-close]") && nav.classList.contains("is-open")) closeNav();
    if (t.matches("[data-toast]")) toast(t.dataset.toast);
    if (t.matches("[data-book]")) { e.preventDefault(); openBooking(t.dataset.loc); }
    if (t.matches("[data-cart]")) { e.preventDefault(); openCart(); }
    if (t.matches("[data-filter]")) {
      e.preventDefault(); pick(t.dataset.filter);
      $("#asporto").scrollIntoView({ behavior: reduce() ? "auto" : "smooth", block: "start" });
    }
  });

  /* ---------------------------------------------------------------- cart drawer */
  function openCart() { renderLocSelects(); renderSlotSelects(); renderMode(); renderCart(); $("#cartForm").hidden = false; $("#cOk").hidden = true; $("#cErr").textContent = ""; openDrawer($("#cart")); }
  $("#cItems").addEventListener("click", (e) => {
    const b = e.target.closest("[data-q]"); if (!b) return;
    addItem(b.closest(".hb-li").dataset.id, +b.dataset.q, true);
  });
  document.addEventListener("click", (e) => {
    const m = e.target.closest("[data-mode]"); if (!m) return;
    cart.mode = m.dataset.mode; saveCart(); renderMode(); renderSlotSelects(); renderCart();
  });
  document.addEventListener("change", (e) => {
    if (e.target.matches("[data-loc-select]")) { cart.loc = e.target.value; saveCart(); renderLocSelects(); renderSlotSelects(); }
    if (e.target.matches("[data-slot-select]")) { cart.slot = e.target.value || "asap"; renderSlotSelects(); }
  });
  const cartForm = $("#cartForm"), cSend = $("#cSend");
  const telOk = (v) => /^\+?[\d\s]{8,}$/.test(v.trim()) && v.replace(/\D/g, "").length >= 8;
  function markBad(input, bad) { input.closest(".hb-in").classList.toggle("is-bad", bad); }
  cartForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = $("#cErr"), f = cartForm.elements;
    const slots = orderSlots(cart.loc, cart.mode);
    const problems = [];
    if (!cartCount()) problems.push("Il carrello è vuoto.");
    if (cart.mode === "consegna" && cartSub() < DELIVERY_MIN) problems.push(`Per la consegna servono almeno ${eur(DELIVERY_MIN)}.`);
    const addrBad = cart.mode === "consegna" && f.addr.value.trim().length < 6; markBad(f.addr, addrBad); if (addrBad) problems.push("Scrivi l'indirizzo di consegna.");
    const nameBad = f.name.value.trim().length < 2; markBad(f.name, nameBad); if (nameBad) problems.push("Scrivi il tuo nome.");
    const telBad = !telOk(f.tel.value); markBad(f.tel, telBad); if (telBad) problems.push("Il telefono non sembra valido.");
    if (!slots.length) problems.push("Oggi e domani non ci sono più orari: riprova più tardi.");
    err.textContent = problems.join(" ");
    if (problems.length) return;
    const slot = cart.slot === "asap" ? slots[0] : slots.find((s) => s.key === cart.slot) || slots[0];
    const total = cartSub() + cartFee(), L = LOCS[cart.loc];
    await doneSequence(cSend);
    $("#cOkTxt").textContent = cart.mode === "consegna"
      ? `Consegna ${slot.label.toLowerCase()} in ${f.addr.value.trim()}. Totale ${eur(total)}, si paga alla consegna.`
      : `Ritiro ${slot.label.toLowerCase()} da ${L.name}, ${L.addr}. Totale ${eur(total)}, si paga al ritiro.`;
    $("#cOkCode").textContent = "ORDINE HB-" + (1000 + Math.floor(Math.random() * 9000));
    cartForm.hidden = true; $("#cOk").hidden = false;
    cart.items.clear(); saveCart(); renderCart();
    doneReset(cSend);
  });

  /* ---------------------------------------------------------------- booking drawer */
  const bk = { loc: "pratello", people: 2, day: 0, slot: null };
  const bForm = $("#bookForm");
  function bookDays() { return Array.from({ length: 21 }, (_, k) => romeDay(k)); }
  function bookSlots(locId, day) {
    const now = romeNow(), out = [];
    for (const iv of LOCS[locId].days[day.dow] || []) {
      for (let t = iv[0]; t <= iv[2] - 30; t += 15) out.push({ t, past: day.k === 0 && t < now.min + 30 });
    }
    return out;
  }
  function renderBooking() {
    const now = romeNow();
    $("#bLoc").innerHTML = Object.entries(LOCS).map(([k, L]) => {
      const t = statusText(statusAt(k, now.dow, now.min));
      return `<button type="button" role="radio" aria-checked="${bk.loc === k}" data-bloc="${k}"><b>${L.name.toUpperCase()}</b><small>${L.addr} · ${t.badge === "APERTO" ? "aperto ora" : "chiuso ora"}</small></button>`;
    }).join("");
    $("#bPeople").innerHTML = [1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => `<button type="button" role="radio" aria-checked="${bk.people === n}" data-bp="${n}" aria-label="${n === 9 ? "9 o più persone" : n + (n === 1 ? " persona" : " persone")}">${n === 9 ? "9+" : n}</button>`).join("");
    $("#bGroup").hidden = bk.people !== 9;
    const days = bookDays();
    // skip to the first day that still has a free slot
    if (!bookSlots(bk.loc, days[bk.day]).some((s) => !s.past)) { const f = days.findIndex((d) => bookSlots(bk.loc, d).some((s) => !s.past)); bk.day = Math.max(0, f); }
    $("#bDays").innerHTML = days.map((d, i) => {
      const can = bookSlots(bk.loc, d).some((s) => !s.past);
      return `<button type="button" role="radio" aria-checked="${bk.day === i}" data-bd="${i}" ${can ? "" : "disabled"} aria-label="${DAYS_LONG[d.dow]} ${d.d} ${MONTHS[d.mo - 1]}${can ? "" : ", chiuso"}"><span>${i === 0 ? "oggi" : i === 1 ? "domani" : DAYS_SHORT[d.dow]}</span><b>${d.d}</b><span>${MONTHS[d.mo - 1]}</span></button>`;
    }).join("");
    const day = days[bk.day], slots = bookSlots(bk.loc, day);
    if (bk.slot != null && !slots.some((s) => s.t === bk.slot && !s.past)) bk.slot = null;
    const lunch = slots.filter((s) => s.t < 17 * 60), dinner = slots.filter((s) => s.t >= 17 * 60);
    const btn = (s) => `<button type="button" role="radio" aria-checked="${bk.slot === s.t}" data-bs="${s.t}" ${s.past ? "disabled" : ""}>${hm(s.t)}</button>`;
    $("#bSlots").innerHTML = slots.length
      ? (lunch.length ? `<p class="hb-slots-h">Pranzo</p>${lunch.map(btn).join("")}` : "") + (dinner.length ? `<p class="hb-slots-h">Cena</p>${dinner.map(btn).join("")}` : "")
      : `<p class="hb-slots-none">Chiuso questo giorno.</p>`;
    $("#bSlotInfo").textContent = `${DAYS_LONG[day.dow].toLowerCase()} ${day.d} ${MONTHS[day.mo - 1]}`;
    const L = LOCS[bk.loc];
    $("#bSum").textContent = bk.slot != null
      ? `${L.name} · ${DAYS_SHORT[day.dow]} ${day.d} ${MONTHS[day.mo - 1]} · ${hm(bk.slot)} · ${bk.people === 9 ? "9+" : bk.people} ${bk.people === 1 ? "persona" : "persone"}`
      : "Scegli giorno e orario";
  }
  function openBooking(loc) {
    if (loc && LOCS[loc]) bk.loc = loc;
    bForm.hidden = false; $("#bOk").hidden = true; $("#bErr").textContent = "";
    renderBooking(); openDrawer($("#book"));
  }
  bForm.addEventListener("click", (e) => {
    const b = e.target.closest("[data-bloc], [data-bp], [data-bd], [data-bs]"); if (!b || b.disabled) return;
    if (b.dataset.bloc) { bk.loc = b.dataset.bloc; bk.slot = null; }
    if (b.dataset.bp) bk.people = +b.dataset.bp;
    if (b.dataset.bd) { bk.day = +b.dataset.bd; bk.slot = null; }
    if (b.dataset.bs) bk.slot = +b.dataset.bs;
    const sc = $("#bDays").scrollLeft;
    renderBooking(); $("#bDays").scrollLeft = sc;
    $("#bErr").textContent = "";
  });
  bForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const f = bForm.elements, problems = [];
    if (bk.people === 9) problems.push("Per 9 o più persone contattaci direttamente.");
    if (bk.slot == null) problems.push("Scegli un orario.");
    const nameBad = f.name.value.trim().length < 2; markBad(f.name, nameBad); if (nameBad) problems.push("Scrivi nome e cognome.");
    const telBad = !telOk(f.tel.value); markBad(f.tel, telBad); if (telBad) problems.push("Il telefono non sembra valido.");
    const mailBad = !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.value.trim()); markBad(f.email, mailBad); if (mailBad) problems.push("Controlla l'email.");
    $("#bErr").textContent = problems.join(" ");
    if (problems.length) return;
    const day = bookDays()[bk.day], L = LOCS[bk.loc];
    $("#bOkTxt").textContent = `${f.name.value.trim().split(" ")[0]}, vi aspettiamo ${bk.day === 0 ? "oggi" : bk.day === 1 ? "domani" : DAYS_LONG[day.dow].toLowerCase() + " " + day.d + " " + MONTHS[day.mo - 1]} alle ${hm(bk.slot)} da ${L.name}, ${L.addr}. Tavolo per ${bk.people}. Conferma inviata a ${f.email.value.trim()}.`;
    $("#bOkCode").textContent = "TAVOLO HB-" + (100 + Math.floor(Math.random() * 900)) + "-" + pad(day.d);
    bForm.hidden = true; $("#bOk").hidden = false;
    bForm.reset(); bk.slot = null;
  });
  $$("#bookForm input, #cartForm input").forEach((i) => i.addEventListener("input", () => i.closest(".hb-in").classList.remove("is-bad")));

  /* ---------------------------------------------------------------- scroll: stacking, header tone, menu bar */
  const secs = $$(".hb-sec"), toneEls = $$("[data-tone]:not(header)"), chipsWrap = $("#chipsWrap"), menu = $("#asporto"), obar = $("#obar");
  let sraf = 0;
  function onScroll() {
    sraf = 0;
    const h = innerHeight;
    // section-stacking-transition: how far the next one has climbed over this one, 0 → 1
    secs.forEach((s, i) => {
      const next = secs[i + 1];
      const k = next ? clamp(1 - next.getBoundingClientRect().top / h, 0, 1) : 0;
      s.style.setProperty("--k", k.toFixed(3));
    });
    const toneAt = (y) => { let t = "light"; for (const el of toneEls) { const r = el.getBoundingClientRect(); if (r.top <= y && r.bottom > y) t = el.dataset.tone; } return t; };
    head.dataset.tone = toneAt(52);
    mbar.classList.toggle("is-dark", toneAt(h - 40) === "dark");
    const cr = chipsWrap.getBoundingClientRect(), mr = menu.getBoundingClientRect(), stickTop = parseFloat(getComputedStyle(chipsWrap).top) || 0;
    head.classList.toggle("is-menu", cr.top <= stickTop + 1 && mr.bottom > 160);
    obar.classList.toggle("is-show", mr.top < h * .5 && mr.bottom > h * .7);
  }
  const schedule = () => { if (!sraf) sraf = requestAnimationFrame(onScroll); };
  addEventListener("scroll", schedule, { passive: true });
  addEventListener("resize", () => { schedule(); if (openPlate) placeTag(openPlate); });
  onScroll();

  /* ---------------------------------------------------------------- init + clock */
  renderLocSelects(); renderSlotSelects(); renderMode(); renderCart(); renderFound();
  setInterval(() => { renderLocs(); renderSlotSelects(); if ($("#book").classList.contains("is-open")) renderBooking(); }, 60000);

  // hooks for the template's own checks
  window.__hb = { statusAt, statusText, orderSlots, bookSlots, romeNow, cart, TABLE_IDS, tableTotal, pick, setOpen: (i) => setOpen(plates[i] || null) };
})();
