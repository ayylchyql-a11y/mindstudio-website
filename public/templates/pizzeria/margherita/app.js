/* Legna E Farina — MARGHERITA (the bright design).
   Menu, prices and hours come from ../assets/menu.js, the same file the dark design reads. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const eur = (n) => n.toFixed(2).replace(".", ",") + " €";
  const hhmm = (m) => { m = ((Math.round(m) % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  const { CATS, ITEMS, INGREDIENTS, HOURS, DAYS } = window.LF_MENU;
  const CAT = Object.fromEntries(CATS.map((c) => [c.id, c]));
  const BY = Object.fromEntries(ITEMS.map((x) => [x.id, x]));
  const img = (x) => `../assets/${x.img}.webp`;
  const isRound = (x) => /-top$/.test(x.img);
  const PIZZA_CATS = ["classiche", "casa", "pesce", "bianche", "famiglia"];
  const tileOf = (c) => (c.id === "bianche" ? "#EFE3CF" : c.color);

  /* ───────── hours (Europe/Rome) ───────── */
  function romeNow() {
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date()).map((x) => [x.type, x.value]));
    return { day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(p.weekday), min: +p.hour * 60 + +p.minute };
  }
  function status(n = romeNow()) {
    const y = (n.day + 6) % 7, yc = HOURS[y][1], [o, c] = HOURS[n.day];
    if (n.min + 1440 < yc) return { open: true, until: yc - 1440, left: yc - 1440 - n.min, day: y };
    if (n.min >= o) return { open: true, until: c, left: c - n.min, day: n.day };
    return { open: false, opens: o, day: n.day };
  }
  const short = (m) => hhmm(m).replace(/^0/, "");
  function paintStatus() {
    const s = status();
    for (const el of $$("[data-status]")) {
      el.classList.toggle("open", s.open && s.left > 30);
      el.classList.toggle("soon", s.open && s.left <= 30);
      const d = !!el.closest("[data-dock]");
      $("[data-status-text]", el).textContent = !s.open ? `Chiuso · apre ${d ? "" : "alle "}${short(s.opens)}` : s.left <= 30 ? `Chiude tra ${s.left} min` : `Aperto${d ? "" : " · fino alle"} ${d ? "fino " : ""}${short(s.until)}`;
    }
    const seal = $("[data-seal]");
    seal.classList.toggle("closed", !s.open);
    const line = s.open ? `APERTO ORA · FINO ALLE ${hhmm(s.until)} · ` : `ADESSO CHIUSO · APRIAMO ALLE ${hhmm(s.opens)} · `;
    $("[data-seal-text]").textContent = line + line;
    $("[data-seal-big]").textContent = s.open ? short(s.until) : short(s.opens);
    return s;
  }

  /* ───────── cart state ───────── */
  // the site previews this page in a sandboxed iframe (allow-scripts only): touching localStorage there throws,
  // so fall back to memory — the cart then just doesn't survive a reload
  const store = (() => { try { const s = window.localStorage, k = "__lf"; s.setItem(k, k); s.removeItem(k); return s; } catch { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; } })();
  const KEY = "lf-cart-margherita";
  const st = Object.assign({ items: {}, mode: "asporto", zone: "vimercate", name: "", tel: "", addr: "" }, JSON.parse(store.getItem(KEY) || "{}"));
  for (const id of Object.keys(st.items)) if (!BY[id]) delete st.items[id];
  const save = () => store.setItem(KEY, JSON.stringify(st));
  const count = () => Object.values(st.items).reduce((a, b) => a + b, 0);
  const subtotal = () => Object.entries(st.items).reduce((s, [id, q]) => s + BY[id].p * q, 0);
  const fee = () => (count() && st.mode === "domicilio" ? (st.zone === "fuori" ? 2 : 1) : 0);   // no food, no delivery fee
  function addItem(id, q = 1, el) {
    if (!BY[id]) return;
    st.items[id] = (st.items[id] || 0) + q; save(); renderCart();
    const b = $("[data-cart-count]"); b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump");
    if (el) { el.classList.add("ok"); const was = el.textContent; el.textContent = "✓"; setTimeout(() => { el.classList.remove("ok"); el.textContent = was; }, 900); }
  }
  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-add]"); if (!b) return;
    e.stopPropagation(); addItem(b.dataset.add, 1, b.matches(".plus") ? b : null);
  });

  /* ───────── chrome ───────── */
  const hero = $("[data-hero]"), dock = $("[data-dock]");
  $$("[data-mode-go]").forEach((b) => b.addEventListener("click", () => { st.mode = b.dataset.modeGo; save(); renderCart(); $("#pizze").scrollIntoView({ behavior: reduce ? "auto" : "smooth" }); }));

  /* ───────── ① hero: the pizza that gets sliced ───────── */
  const heroFrame = (function heroInit() {
    const pie = $("[data-pie]"), facts = $("[data-facts]"), floaters = $("[data-floaters]"), cue = $(".hero-cue");
    const N = 8, START = -90;
    const slices = [];
    for (let i = 0; i < N; i++) {
      const a0 = START + i * (360 / N), a1 = a0 + 360 / N, pts = ["50% 50%"];
      for (const a of [a0, (a0 + a1) / 2, a1]) { const r = (a * Math.PI) / 180; pts.push(`${(50 + 74 * Math.cos(r)).toFixed(2)}% ${(50 + 74 * Math.sin(r)).toFixed(2)}%`); }
      const s = document.createElement("div"); s.className = "slice";
      s.style.setProperty("--img", "url('../assets/margherita-top.webp')");
      s.style.clipPath = `polygon(${pts.join(",")})`;
      pie.appendChild(s); slices.push({ el: s, mid: a0 + 180 / N });
    }
    const FACTS = ["<b>Forno</b> a legna", "Aperti fino alle <b>3</b>", "Pronto in <b>5–15 min</b>", "Consegna <b>1 €</b> a Vimercate", "Panino kebab <b>4 €</b>", "Kebab <b>dallo spiedo</b>", "Tavoli <b>sotto i portici</b>", "<b>Più di 80</b> cose al menù"];
    const fEls = FACTS.map((h, i) => { const f = document.createElement("span"); f.className = "fact"; f.innerHTML = h; facts.appendChild(f); return { el: f, a: START + i * (360 / N), w: 0 }; });

    // floating ingredients (floating-parallax-field: x/y in %, z = depth)
    const SVG = {
      basilico: '<svg viewBox="0 0 64 40"><path d="M3 21C14 2 46 0 61 19 46 37 15 39 3 21z" fill="#2F8F4E"/><path d="M6 21c18-2 36-3 52-2" stroke="#1f6236" stroke-width="2.4" fill="none" stroke-linecap="round"/><path d="M22 20l-6-7M34 19l-5-9M34 20l-5 9M22 21l-6 7" stroke="#1f6236" stroke-width="1.6" stroke-linecap="round"/></svg>',
      pomodoro: '<svg viewBox="0 0 60 60"><circle cx="30" cy="30" r="28" fill="#D92A1E"/><circle cx="30" cy="30" r="22" fill="#F2543F"/><g fill="#FBD38D"><ellipse cx="30" cy="17" rx="2.6" ry="4"/><ellipse cx="42" cy="26" rx="4" ry="2.6"/><ellipse cx="39" cy="40" rx="2.6" ry="4" transform="rotate(35 39 40)"/><ellipse cx="22" cy="41" rx="2.6" ry="4" transform="rotate(-35 22 41)"/><ellipse cx="18" cy="26" rx="4" ry="2.6"/></g><circle cx="30" cy="30" r="5" fill="#E8392B"/></svg>',
      mozzarella: '<svg viewBox="0 0 64 54"><path d="M8 30C4 14 22 3 37 6c16 3 24 15 20 28-3 12-18 18-31 16C16 49 10 40 8 30z" fill="#FFFDF6"/><path d="M14 33c6 8 20 11 32 4" stroke="#EADFC8" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
      oliva: '<svg viewBox="0 0 40 40"><circle cx="20" cy="20" r="15" fill="none" stroke="#2C2A22" stroke-width="10"/><circle cx="16" cy="13" r="3" fill="#fff" opacity=".35"/></svg>',
      peperoncino: '<svg viewBox="0 0 80 40"><path d="M10 22c14-14 40-18 62-6-14 8-40 18-62 6z" fill="#C8241A"/><path d="M8 22c-3-6 0-12 6-13" stroke="#2F8F4E" stroke-width="4" fill="none" stroke-linecap="round"/><path d="M24 17c12-5 26-6 38-2" stroke="#fff" stroke-opacity=".35" stroke-width="3" fill="none" stroke-linecap="round"/></svg>',
      fungo: '<svg viewBox="0 0 60 60"><path d="M6 30C6 14 18 6 30 6s24 8 24 24c0 4-4 6-8 6H38v12c0 4-3 6-8 6s-8-2-8-6V36H14c-4 0-8-2-8-6z" fill="#F3E1C3"/><path d="M14 30c4-12 28-14 32 0" stroke="#C9A27A" stroke-width="2.4" fill="none"/></svg>',
    };
    const FL = [
      ["basilico", 56, 12, .9, 88, -20], ["pomodoro", 90, 18, .6, 74, 0], ["mozzarella", 47, 72, .4, 70, 10], ["oliva", 70, 84, .8, 34, 0],
      ["peperoncino", 93, 62, .5, 92, 30], ["basilico", 84, 88, .3, 64, 160], ["fungo", 62, 4, .25, 52, -15], ["pomodoro", 2, 97, .7, 58, 0],
      ["oliva", 38, 8, .35, 26, 0], ["basilico", 40, 95, .55, 70, 60], ["mozzarella", 97, 40, .85, 56, -30], ["peperoncino", 30, 92, .3, 70, -160],
    ];
    const small = innerWidth <= 820;
    const FL_SMALL = [["basilico", 6, 50, .9, 88, -20], ["pomodoro", 88, 52, .6, 74, 0], ["oliva", 76, 92, .8, 34, 0], ["peperoncino", 8, 92, .5, 92, 30], ["mozzarella", 94, 74, .4, 60, 10], ["fungo", 3, 72, .3, 52, -15]];
    const fls = (small ? FL_SMALL : FL).map(([k, x, y, z, size, r]) => {
      const d = document.createElement("i"); d.className = "fl"; d.innerHTML = SVG[k];
      d.style.cssText = `--x:${x}%;--y:${y}%;--z:${z};--size:${small ? size * .7 : size};--r:${r}deg`;
      floaters.appendChild(d); return { el: d, z };
    });
    if (fine) {
      hero.addEventListener("pointermove", (e) => { floaters.style.setProperty("--px", (e.clientX / innerWidth * 2 - 1).toFixed(3)); floaters.style.setProperty("--py", (e.clientY / innerHeight * 2 - 1).toFixed(3)); });
      hero.addEventListener("pointerleave", () => { floaters.style.setProperty("--px", 0); floaters.style.setProperty("--py", 0); });
    }
    if (!reduce) {
      const t0 = performance.now(); let run = true;
      new IntersectionObserver(([e]) => { const was = run; run = e.isIntersecting; if (run && !was) requestAnimationFrame(tick); }).observe(hero);
      const tick = (now) => {
        const t = (now - t0) / 1000;
        fls.forEach(({ el, z }, i) => { el.style.setProperty("--dx", (Math.sin(t * .35 + i * 1.7) * 8 * (.4 + z)).toFixed(2) + "px"); el.style.setProperty("--dy", (Math.cos(t * .28 + i * 2.1) * 10 * (.4 + z)).toFixed(2) + "px"); });
        if (run) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
    const ease = (u) => (u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
    return function frame() {
      const r = hero.getBoundingClientRect(), total = hero.offsetHeight - innerHeight;
      const p = clamp(-r.top / total), e = reduce ? (p > .05 ? 1 : 0) : ease(clamp((p - .06) / .6));
      const R = pie.clientWidth / 2, rot = p * 26;
      slices.forEach(({ el, mid }, i) => {
        const a = ((mid + rot) * Math.PI) / 180, off = e * R * .3;
        el.style.transform = `translate(${(Math.cos(a) * off).toFixed(1)}px, ${(Math.sin(a) * off).toFixed(1)}px) rotate(${(rot + e * (i % 2 ? 3 : -3)).toFixed(2)}deg)`;
      });
      const pr = pie.getBoundingClientRect(), cx = pr.left + R, W = innerWidth;
      fEls.forEach((f, i) => {
        const a = ((f.a + rot) * Math.PI) / 180, d = R * (.42 + e * .6);
        let x = Math.cos(a) * d; const y = Math.sin(a) * d;
        if (!f.w) f.w = f.el.offsetWidth;
        const half = f.w / 2 + 10; x = clamp(cx + x, half, W - half) - cx;       // keep every sticker on screen
        const o = clamp((e - .18 - i * .045) / .28);
        f.el.style.setProperty("--fx", x.toFixed(1) + "px"); f.el.style.setProperty("--fy", y.toFixed(1) + "px");
        f.el.style.setProperty("--fo", o.toFixed(3)); f.el.style.setProperty("--fs", (.6 + .4 * o).toFixed(3)); f.el.style.setProperty("--fr", (i % 2 ? -5 : 4) + "deg");
      });
      fls.forEach(({ el, z }) => el.style.setProperty("--sy", (-p * z * 180).toFixed(1) + "px"));
      cue.style.opacity = String(1 - clamp(e * 3));
      dock.classList.toggle("on", r.bottom < innerHeight * .9 || scrollY > innerHeight * .8);
    };
  })();

  /* ───────── product sheet ───────── */
  const scrim = $("[data-scrim]"), sheet = $("[data-sheet]");
  let sheetItem = null, qty = 1, lastFocus = null;
  const overlays = new Set();
  function showScrim(on, who) { if (on) overlays.add(who); else overlays.delete(who); const any = overlays.size > 0; if (any) { scrim.hidden = false; requestAnimationFrame(() => scrim.classList.add("on")); } else { scrim.classList.remove("on"); setTimeout(() => { if (!overlays.size) scrim.hidden = true; }, 260); } document.body.style.overflow = any ? "hidden" : ""; }
  function openSheet(id) {
    const x = BY[id]; if (!x) return;
    sheetItem = x; qty = 1; lastFocus = document.activeElement;
    const im = $("[data-s-img]"); im.src = img(x); im.parentElement.classList.toggle("sq", !isRound(x));
    $("[data-s-cat]").textContent = CAT[x.cat].t; $("[data-s-name]").textContent = x.n; $("[data-s-desc]").textContent = x.d;
    paintQty();
    sheet.removeAttribute("inert"); sheet.setAttribute("aria-hidden", "false"); sheet.classList.add("on"); showScrim(true, "sheet");
    setTimeout(() => $("[data-s-add]").focus(), 80);
  }
  function closeSheet() { if (!sheet.classList.contains("on")) return; sheet.classList.remove("on"); sheet.setAttribute("aria-hidden", "true"); sheet.setAttribute("inert", ""); showScrim(false, "sheet"); lastFocus?.focus?.(); }
  const paintQty = () => { $("[data-s-qty]").textContent = qty; $("[data-s-price]").textContent = eur(sheetItem.p * qty); };
  $("[data-sheet-close]").addEventListener("click", closeSheet);
  $("[data-s-add]").addEventListener("click", () => { addItem(sheetItem.id, qty); closeSheet(); });
  // drag-stepper: tap for one, hold 260 ms and drag sideways to sweep
  (function stepper() {
    const stp = $("[data-stp]"); let timer = 0, sweeping = false, origin = null, dir = 0, btn = null;
    stp.addEventListener("pointerdown", (e) => { btn = e.target.closest("button"); if (!btn) return; dir = +btn.dataset.d; origin = { x: e.clientX, v: qty }; btn.classList.add("hold"); stp.setPointerCapture(e.pointerId); timer = setTimeout(() => { sweeping = true; stp.classList.add("sweeping"); }, 260); });
    stp.addEventListener("pointermove", (e) => { if (!sweeping) return; qty = Math.round(clamp(origin.v + ((e.clientX - origin.x) / stp.clientWidth) * 10, 1, 20)); paintQty(); });
    const lift = () => { if (!btn) return; clearTimeout(timer); if (!sweeping) { qty = clamp(qty + dir, 1, 20); paintQty(); } sweeping = false; stp.classList.remove("sweeping"); btn.classList.remove("hold"); btn = null; };
    stp.addEventListener("pointerup", lift); stp.addEventListener("pointercancel", lift);
    stp.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { const b = e.target.closest("button"); if (b) { e.preventDefault(); qty = clamp(qty + +b.dataset.d, 1, 20); paintQty(); } } });
  })();

  /* ───────── ② cosa ti va? ───────── */
  (function pizze() {
    const grid = $("[data-grid]"), chips = $("[data-chips]"), hits = $("[data-hits]");
    const P = ITEMS.filter((x) => PIZZA_CATS.includes(x.cat));
    const DOT = { bufala: "#ffffff", funghi: "#C9A27A", salame: "#B5231A", salsiccia: "#9C4A2E", cotto: "#F2A7A0", crudo: "#C2464C", kebab: "#8C3B1F", tonno: "#D9C8B2", mare: "#F28C6B", verdure: "#6BAA3A", rucola: "#2F8F4E", formaggi: "#FFE08A", patatine: "#F7C948", olive: "#3B3B2F" };
    const sel = new Set();
    chips.innerHTML = INGREDIENTS.map((g) => { const n = P.filter((x) => g.re.test(x.d)).length; return n ? `<button class="chip" type="button" aria-pressed="false" data-ing="${g.id}"><span class="dot" style="--c:${DOT[g.id]}"></span>${g.t}<small>${n}</small></button>` : ""; }).join("")
      + `<button class="chip reset" type="button" data-reset hidden>Azzera</button>`;
    const cards = P.map((x, i) => {
      const c = CAT[x.cat], el = document.createElement("article");
      el.className = "card"; el.dataset.id = x.id; el.dataset.i = i; el.tabIndex = 0; el.setAttribute("aria-label", `${x.n}, ${eur(x.p)}`);
      el.style.cssText = `--tile:${tileOf(c)};--tile-ink:${c.ink}`;
      el.innerHTML = `<div class="card-in">${x.tag ? `<span class="sticker">${x.tag}</span>` : ""}<div class="disc"><img src="${img(x)}" alt="" loading="lazy" width="1000" height="1000" /></div>
        <div><h3>${x.n}</h3><p>${x.d}</p></div>
        <div class="card-foot"><b>${eur(x.p)}</b><button class="plus" type="button" data-add="${x.id}" aria-label="Aggiungi ${esc(x.n)}">+</button></div></div>`;
      grid.appendChild(el); return el;
    });
    grid.addEventListener("click", (e) => { const c = e.target.closest(".card"); if (c && !e.target.closest("[data-add]")) openSheet(c.dataset.id); });
    grid.addEventListener("keydown", (e) => { const c = e.target.closest(".card"); if (c && e.target === c && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openSheet(c.dataset.id); } });

    function apply() {
      const want = INGREDIENTS.filter((g) => sel.has(g.id));
      const ok = (x) => want.every((g) => g.re.test(x.d));
      const before = new Map(cards.map((c) => [c, c.getBoundingClientRect()]));
      const order = [...cards].sort((a, b) => { const A = ok(BY[a.dataset.id]), B = ok(BY[b.dataset.id]); return A === B ? a.dataset.i - b.dataset.i : A ? -1 : 1; });
      order.forEach((c) => { c.classList.toggle("dim", want.length > 0 && !ok(BY[c.dataset.id])); grid.appendChild(c); });
      // FLIP: measure after, invert, play
      if (!reduce) order.forEach((c) => { const a = before.get(c), b = c.getBoundingClientRect(), dx = a.left - b.left, dy = a.top - b.top; if (dx || dy) c.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: 460, easing: "cubic-bezier(.22,1,.36,1)" }); });
      const n = P.filter(ok).length;
      $("[data-reset]").hidden = !want.length;
      hits.textContent = !want.length ? `${P.length} pizze. Tocca un ingrediente.` : n ? `${n} ${n === 1 ? "pizza ha" : "pizze hanno"} ${want.map((g) => g.t.toLowerCase()).join(" + ")}` : "Nessuna pizza ha tutto questo insieme: togli qualcosa.";
    }
    chips.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      if (b.hasAttribute("data-reset")) { sel.clear(); $$("[data-ing]", chips).forEach((c) => c.setAttribute("aria-pressed", "false")); }
      else { const id = b.dataset.ing; sel.has(id) ? sel.delete(id) : sel.add(id); b.setAttribute("aria-pressed", sel.has(id)); }
      apply();
    });
    apply();

    // tilt-card: two springs hold where the pointer is (-1..1); rotation is read off them
    if (fine && !reduce) {
      const S = new Map(); let raf = 0;
      grid.addEventListener("pointermove", (e) => { const c = e.target.closest(".card"); if (!c) return; const r = c.getBoundingClientRect(); const s = S.get(c) || { sx: 0, sy: 0, vx: 0, vy: 0 }; s.tx = ((e.clientX - r.left) / r.width) * 2 - 1; s.ty = ((e.clientY - r.top) / r.height) * 2 - 1; S.set(c, s); if (!raf) raf = requestAnimationFrame(loop); });
      grid.addEventListener("pointerout", (e) => { const c = e.target.closest(".card"); if (c && !c.contains(e.relatedTarget) && S.has(c)) { const s = S.get(c); s.tx = 0; s.ty = 0; if (!raf) raf = requestAnimationFrame(loop); } });
      const loop = () => {
        const k = 120, d = 2 * Math.sqrt(k) * .8; let live = false;
        for (const [c, s] of S) {
          s.vx += (-k * (s.sx - s.tx) - d * s.vx) / 60; s.sx += s.vx / 60; s.vy += (-k * (s.sy - s.ty) - d * s.vy) / 60; s.sy += s.vy / 60;
          const inner = c.firstElementChild; inner.style.setProperty("--rx", (-s.sy * 7).toFixed(2) + "deg"); inner.style.setProperty("--ry", (s.sx * 7).toFixed(2) + "deg");
          if (Math.abs(s.sx - s.tx) + Math.abs(s.sy - s.ty) + Math.abs(s.vx) + Math.abs(s.vy) > .002) live = true; else if (!s.tx && !s.ty) S.delete(c);
        }
        raf = live ? requestAnimationFrame(loop) : 0;
      };
    }
  })();

  /* ───────── ③ pizza o kebab ───────── */
  (function scegli() {
    const split = $("[data-split]"), seam = $("[data-seam]"), both = $("[data-both]"), hint = $("[data-split-hint]");
    const pz = $(".pane.pizza", split), kb = $(".pane.kebab", split);
    const fill = (k, ids) => { $(`[data-picks="${k}"]`).innerHTML = ids.map((id) => `<button class="pick press" type="button" data-pick="${id}">${BY[id].n} <b>${eur(BY[id].p)}</b><i>+</i></button>`).join(""); };
    fill("pizza", ["margherita", "diavola", "quattro-formaggi"]); fill("kebab", ["panino-kebab", "kebab-box", "piatto-barbara"]);
    split.addEventListener("click", (e) => { const b = e.target.closest("[data-pick]"); if (!b) return; addItem(b.dataset.pick); b.classList.add("ok"); $("i", b).textContent = "✓"; setTimeout(() => { b.classList.remove("ok"); $("i", b).textContent = "+"; }, 900); });
    let s = innerWidth <= 820 ? .6 : .68, anim = 0;
    function set(v) {
      s = clamp(v, .1, .9); split.style.setProperty("--s", s.toFixed(4));
      pz.style.setProperty("--k", (.62 + .55 * s).toFixed(3)); kb.style.setProperty("--k", (.62 + .55 * (1 - s)).toFixed(3));
      pz.style.setProperty("--rot", ((s - .5) * 40).toFixed(1) + "deg");
      $(".pane-picks", pz).style.setProperty("--po", clamp((s - .38) / .2).toFixed(3)); $(".pane-picks", kb).style.setProperty("--po", clamp((.62 - s) / .2).toFixed(3));
      $$(".pane-picks .pick", pz).forEach((b) => (b.tabIndex = s > .45 ? 0 : -1)); $$(".pane-picks .pick", kb).forEach((b) => (b.tabIndex = s < .55 ? 0 : -1));
      const mid = Math.abs(s - .5) < .04; both.classList.toggle("on", mid);
      $("button", both).tabIndex = mid ? 0 : -1;
      seam.setAttribute("aria-valuenow", Math.round(s * 100)); seam.setAttribute("aria-valuetext", mid ? "metà e metà: pizza kebab" : s > .5 ? `più pizza (${Math.round(s * 100)}%)` : `più kebab (${Math.round((1 - s) * 100)}%)`);
    }
    function tween(to) { cancelAnimationFrame(anim); if (reduce) return set(to); const from = s, t0 = performance.now(); const step = (now) => { const t = clamp((now - t0) / 320), k = 1 - Math.pow(1 - t, 3); set(from + (to - from) * k); if (t < 1) anim = requestAnimationFrame(step); }; anim = requestAnimationFrame(step); }
    let drag = false;
    seam.addEventListener("pointerdown", (e) => { drag = true; seam.classList.add("drag"); seam.setPointerCapture(e.pointerId); cancelAnimationFrame(anim); hint.classList.add("gone"); });
    seam.addEventListener("pointermove", (e) => { if (!drag) return; const r = split.getBoundingClientRect(); set((e.clientX - r.left) / r.width); });
    const up = () => { if (!drag) return; drag = false; seam.classList.remove("drag"); if (Math.abs(s - .5) < .07) tween(.5); };
    seam.addEventListener("pointerup", up); seam.addEventListener("pointercancel", up);
    seam.addEventListener("keydown", (e) => {
      const d = { ArrowLeft: -.05, ArrowRight: .05, ArrowDown: -.05, ArrowUp: .05 }[e.key];
      if (d) { e.preventDefault(); hint.classList.add("gone"); let v = s + d; if (Math.abs(v - .5) < .03) v = .5; tween(v); }
      if (e.key === "Home") { e.preventDefault(); tween(.1); } if (e.key === "End") { e.preventDefault(); tween(.9); }
    });
    set(s);
  })();

  /* ───────── ④ il resto ───────── */
  (function resto() {
    const box = $("[data-blocks]");
    const ORDER = ["panini", "sfiziosita", "piadine", "fritti", "insalatone", "calzoni", "focacce", "dolci"];
    box.innerHTML = ORDER.map((id) => {
      const c = CAT[id], rows = ITEMS.filter((x) => x.cat === id);
      return `<section class="block" style="--c:${c.color};--ci:${c.ink}"><header><h3>${c.t}</h3><img class="bimg" src="../assets/${c.img}.webp" alt="" loading="lazy" /></header>
        <ul>${rows.map((x) => `<li data-id="${x.id}" tabindex="0"><span><b>${x.n}</b><small>${x.d}</small></span><span class="pr">${eur(x.p)}</span><button class="plus" type="button" data-add="${x.id}" aria-label="Aggiungi ${esc(x.n)}">+</button></li>`).join("")}</ul></section>`;
    }).join("");
    box.addEventListener("click", (e) => { const li = e.target.closest("li[data-id]"); if (li && !e.target.closest("[data-add]")) openSheet(li.dataset.id); });
    box.addEventListener("keydown", (e) => { const li = e.target.closest("li[data-id]"); if (li && e.target === li && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openSheet(li.dataset.id); } });
  })();

  /* ───────── ⑤ quanti siete? ───────── */
  (function tavolata() {
    const w = $("[data-wheel]"), VALS = Array.from({ length: 12 }, (_, i) => i + 1), N = VALS.length;
    const linesEl = $("[data-tav-lines]"); let plan = [], shown = 0;
    // a suggestion, not a rule: a family pizza feeds four, the rest get one each, fries and nuggets scale with the table
    function suggest(n) {
      const out = new Map(), add = (id, q = 1) => out.set(id, (out.get(id) || 0) + q);
      const fam = Math.floor(n / 4); for (let i = 0; i < fam; i++) add(i % 2 ? "margherita-famiglia" : "kebab-famiglia");
      const singles = ["kebab-pizza", "diavola", "margherita"]; for (let i = 0; i < n - fam * 4; i++) add(singles[i % 3]);
      add("patatine", Math.max(1, Math.ceil(n / 3)));
      if (n >= 8) add("nuggets-24"); else if (n >= 4) add("nuggets-12"); else if (n >= 2) add("nuggets-6");
      return [...out].map(([id, q]) => ({ id, q }));
    }
    function show(n) {
      if (n === shown) return; shown = n; plan = suggest(n);
      $("[data-n]").textContent = n; $("[data-unit]").textContent = n === 1 ? "persona" : "persone";
      linesEl.innerHTML = plan.map(({ id, q }) => `<li><span class="q">${q}×</span><span class="n">${BY[id].n}</span><span class="p">${eur(BY[id].p * q)}</span></li>`).join("");
      const tot = plan.reduce((s, { id, q }) => s + BY[id].p * q, 0);
      $("[data-tav-tot]").textContent = eur(tot); $("[data-tav-each]").textContent = `circa ${eur(tot / n)} a testa`;
    }
    $("[data-tav-add]").addEventListener("click", (e) => { plan.forEach(({ id, q }) => addItem(id, q)); const b = e.currentTarget, was = b.textContent; b.textContent = "Aggiunto ✓"; setTimeout(() => (b.textContent = was), 1200); });

    // inertia-wheel-picker: a flick keeps turning (iOS deceleration .998/ms), lands on a notch, rubber-bands past the ends
    const ROW = 70;
    w.innerHTML = VALS.map((v) => `<span>${v}</span>`).join("");
    const spans = $$("span", w), W = { pos: 5 }; let v = 0, raf = 0, mode = "idle", target = 5;
    function paint() {
      const CY = w.clientHeight / 2;
      spans.forEach((sp, i) => {
        const d = Math.abs(i - W.pos);
        if (d > 2.9) { sp.style.visibility = "hidden"; return; }
        sp.style.visibility = "";
        const size = d < 1 ? lerp(64, 44, d) : lerp(44, 34, Math.min(1, d - 1));
        sp.style.transform = `translateY(${(CY + (i - W.pos) * ROW - 35).toFixed(2)}px) scale(${(size / 64).toFixed(3)})`;
        sp.style.opacity = String(d < 1 ? lerp(1, .45, d) : lerp(.45, .2, Math.min(1, d - 1)));
      });
      const n = VALS[clamp(Math.round(W.pos), 0, N - 1)];
      w.setAttribute("aria-valuenow", n); show(n);
    }
    const edge = (x) => (x < 0 ? -x : x > N - 1 ? N - 1 - x : 0);
    function run() {
      cancelAnimationFrame(raf); let last = performance.now();
      const step = (now) => {
        const dt = Math.min(32, now - last); last = now; const o = edge(W.pos);
        if (mode === "fling") {
          if (o) v += (o * .0003 - v * .04) * dt; else v *= Math.pow(.998, dt);
          W.pos += v * dt;
          if (!edge(W.pos) && Math.abs(v) < .0035) { mode = "snap"; target = clamp(Math.round(W.pos + v * 120), 0, N - 1); v *= .5; }
          if (o && Math.abs(v) < .0006 && Math.abs(o) < .02) { mode = "snap"; target = clamp(Math.round(W.pos), 0, N - 1); }
        } else if (mode === "snap") {
          const k = .00028, c = 2 * Math.sqrt(k);
          v += (k * (target - W.pos) - c * v) * dt; W.pos += v * dt;
          if (Math.abs(target - W.pos) < .002 && Math.abs(v) < .0002) { W.pos = target; mode = "idle"; paint(); return; }
        }
        paint(); raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    }
    const band = (x) => (1 - 1 / (x * .55 / 1.4 + 1)) * 1.4;
    let drag = null;
    w.addEventListener("pointerdown", (e) => { cancelAnimationFrame(raf); mode = "idle"; drag = { y: e.clientY, p: W.pos, t: performance.now(), v: 0, raw: W.pos }; w.setPointerCapture(e.pointerId); });
    w.addEventListener("pointermove", (e) => {
      if (!drag) return; const now = performance.now(); let raw = drag.p - (e.clientY - drag.y) / ROW;
      const dt = Math.max(1, now - drag.t); drag.v = .75 * ((raw - drag.raw) / dt) + .25 * drag.v; drag.raw = raw; drag.t = now;
      if (raw < 0) raw = -band(-raw); else if (raw > N - 1) raw = N - 1 + band(raw - N + 1);
      W.pos = raw; paint();
    });
    const end = (e) => {
      if (!drag) return; const moved = Math.abs(drag.raw - drag.p) > .1;
      if (!moved) { const r = w.getBoundingClientRect(); target = clamp(Math.round(W.pos + (e.clientY - r.top - w.clientHeight / 2) / ROW), 0, N - 1); mode = "snap"; v = 0; drag = null; run(); return; }
      v = performance.now() - drag.t > 90 ? 0 : clamp(drag.v, -.06, .06); drag = null; mode = "fling"; run();
    };
    w.addEventListener("pointerup", end); w.addEventListener("pointercancel", end);
    w.addEventListener("wheel", (e) => { e.preventDefault(); cancelAnimationFrame(raf); mode = "idle"; W.pos = clamp(W.pos + e.deltaY / ROW, -.4, N - .6); paint(); clearTimeout(w._t); w._t = setTimeout(() => { target = clamp(Math.round(W.pos), 0, N - 1); mode = "snap"; v = 0; run(); }, 120); }, { passive: false });
    w.addEventListener("keydown", (e) => { const d = { ArrowDown: 1, ArrowUp: -1, ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (d) { e.preventDefault(); target = clamp(Math.round(W.pos) + d, 0, N - 1); mode = "snap"; v = 0; run(); } });
    paint(); addEventListener("resize", paint);
  })();

  /* ───────── ⑥ orari ───────── */
  (function orari() {
    const tl = $("[data-tl]"), FROM = 360, SPAN = 1440;      // the chart's day runs 06:00 → 06:00
    const n = romeNow(), s = status(n), today = s.day;
    const order = [1, 2, 3, 4, 5, 6, 0];
    tl.innerHTML = order.map((d, k) => { const [o, c] = HOURS[d]; return `<div class="tl-row${d === today ? " today" : ""}"><span>${d === today ? "oggi" : DAYS[d].slice(0, 3)}</span><div class="tl-track"><div class="tl-bar" style="--a:${((o - FROM) / SPAN * 100).toFixed(2)}%;--w:${((c - o) / SPAN * 100).toFixed(2)}%;--d:${k * 60}ms"><span>${hhmm(o)}</span><span>${hhmm(c)}</span></div></div></div>`; }).join("")
      + `<div class="tl-axis"><span></span><div>${[6, 9, 12, 15, 18, 21, 0, 3, 6].map((h, i) => `<i style="left:${(i * 12.5).toFixed(1)}%">${String(h).padStart(2, "0")}</i>`).join("")}</div></div><div class="tl-now" data-now><b></b></div>`;
    const now = $("[data-now]");
    function place() {
      const t = $(".tl-track", tl), m0 = romeNow().min, m = m0 < FROM ? m0 + 1440 : m0;
      now.style.left = (t.offsetLeft + t.offsetWidth * ((m - FROM) / SPAN)).toFixed(1) + "px";
      $("b", now).textContent = "adesso " + hhmm(m0);
    }
    place(); addEventListener("resize", place); setInterval(() => { place(); paintStatus(); }, 30000);
  })();

  /* ───────── cart ───────── */
  const cart = $("[data-cart]"), lines = $("[data-lines]"), whenSel = $("[data-f=when]"), err = $("[data-err]"), flip = $("[data-flip]");
  let cartFocus = null;
  function openCart() { renderCart(); cartFocus = document.activeElement; cart.removeAttribute("inert"); cart.setAttribute("aria-hidden", "false"); cart.classList.add("on"); showScrim(true, "cart"); setTimeout(() => $(".x", cart).focus(), 80); }
  function closeCart() { if (!cart.classList.contains("on")) return; cart.classList.remove("on"); cart.setAttribute("aria-hidden", "true"); cart.setAttribute("inert", ""); showScrim(false, "cart"); cartFocus?.focus?.(); if (flip.classList.contains("flipped")) resetOrder(); }
  document.addEventListener("click", (e) => { if (e.target.closest("[data-cart-open]")) openCart(); if (e.target.closest("[data-cart-close]")) closeCart(); });
  scrim.addEventListener("click", () => { closeSheet(); closeCart(); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") { if (sheet.classList.contains("on")) closeSheet(); else closeCart(); } });

  function slots() {
    const n = romeNow(), s = status(n), out = [];
    const start = s.open ? n.min : s.opens, end = s.open ? s.until + (s.until < n.min ? 1440 : 0) : HOURS[n.day][1];
    if (s.open) out.push(["subito", st.mode === "domicilio" ? "Appena possibile" : "Appena pronto · 5–15 min"]);
    for (let m = Math.ceil((start + (st.mode === "domicilio" ? 40 : 20)) / 15) * 15; m <= end - 15 && out.length < 40; m += 15) out.push([String(m), hhmm(m)]);
    return out;
  }
  function renderCart() {
    const n = count();
    const badge = $("[data-cart-count]"); badge.textContent = n; badge.classList.toggle("has", n > 0);
    $("[data-cart-total]").textContent = eur(n ? subtotal() + fee() : 0);
    cart.classList.toggle("dom", st.mode === "domicilio"); cart.classList.toggle("is-empty", n === 0);
    $$("[data-m]", cart).forEach((b) => b.setAttribute("aria-checked", b.dataset.m === st.mode));
    $$("[data-z]", cart).forEach((b) => b.setAttribute("aria-checked", b.dataset.z === st.zone));
    $("[data-empty]").hidden = n > 0; $("[data-fields]").hidden = n === 0;
    const had = new Set($$(".line", lines).map((l) => l.dataset.id));
    lines.innerHTML = Object.entries(st.items).map(([id, q]) => { const x = BY[id]; return `<li class="line${had.has(id) ? "" : " new"}" data-id="${id}"><img src="${img(x)}" alt="" class="${isRound(x) ? "" : "sq"}" /><span><b>${x.n}</b><small>${eur(x.p * q)}</small></span>
      <span class="qty"><button type="button" data-dec="${id}" aria-label="Togli un ${esc(x.n)}">−</button><span>${q}</span><button type="button" data-inc="${id}" aria-label="Aggiungi un ${esc(x.n)}">+</button></span></li>`; }).join("");
    $("[data-sub]").textContent = eur(subtotal()); $("[data-fee]").textContent = eur(fee()); $("[data-tot]").textContent = eur(subtotal() + fee());
    $("[data-when-label]").textContent = st.mode === "domicilio" ? "Consegna alle" : "Ritiro alle";
    const keep = whenSel.value; whenSel.innerHTML = slots().map(([v, l]) => `<option value="${v}">${l}</option>`).join(""); if ([...whenSel.options].some((o) => o.value === keep)) whenSel.value = keep;
    const s = status(), cn = $("[data-closed]"); cn.hidden = s.open || n === 0; if (!s.open) cn.innerHTML = `<b>Adesso siamo chiusi.</b> Puoi ordinare per quando riapriamo, alle ${short(s.opens)}.`;
    $("[data-confirm-label]").textContent = n ? `Conferma ordine · ${eur(subtotal() + fee())}` : "Conferma ordine";
    for (const f of ["name", "tel", "addr"]) { const i = $(`[data-f=${f}]`); if (document.activeElement !== i) i.value = st[f]; }
  }
  cart.addEventListener("click", (e) => {
    const t = e.target.closest("button"); if (!t) return;
    if (t.dataset.inc) st.items[t.dataset.inc]++;
    else if (t.dataset.dec) { if (--st.items[t.dataset.dec] <= 0) delete st.items[t.dataset.dec]; }
    else if (t.dataset.m) st.mode = t.dataset.m;
    else if (t.dataset.z) st.zone = t.dataset.z;
    else return;
    save(); renderCart();
  });
  cart.addEventListener("input", (e) => { const f = e.target.dataset.f; if (f && f !== "when") { st[f] = e.target.value; e.target.classList.remove("bad"); err.textContent = ""; save(); } });
  function validate() {
    const bad = [];
    if (!st.name.trim()) bad.push("name");
    if (st.tel.replace(/\D/g, "").length < 6) bad.push("tel");
    if (st.mode === "domicilio" && st.addr.trim().length < 5) bad.push("addr");
    $$("[data-f]", cart).forEach((i) => i.classList.toggle("bad", bad.includes(i.dataset.f)));
    if (bad.length) { err.textContent = bad.length === 1 && bad[0] === "addr" ? "Manca l'indirizzo di consegna." : "Ci servono nome e telefono per avvisarti."; $(`[data-f=${bad[0]}]`).focus(); }
    return !bad.length;
  }

  /* done-burst → flip-to-reveal */
  const confirm = $("[data-confirm]"), cv = $("[data-burst]"), ctx = cv.getContext("2d");
  let busy = false, timers = [];
  const later = (ms, fn) => timers.push(setTimeout(fn, reduce ? 0 : ms));
  confirm.addEventListener("click", () => {
    if (busy || !count()) return;
    if (!validate()) return;
    busy = true;
    const snapshot = { items: { ...st.items }, mode: st.mode, name: st.name, addr: st.addr, sub: subtotal(), fee: fee(), when: whenSel.value === "subito" ? null : +whenSel.value };
    confirm.classList.add("press-on");                         // label fades: 0–300 ms
    later(250, () => confirm.classList.add("round"));        // pill → circle: 250–650 ms
    later(700, () => confirm.classList.add("tick"));         // check draws: 700–1100 ms
    later(1150, burst);                                      // toppings burst: 1150 ms, 900 ms long
    later(1700, () => { writeBack(snapshot); flip.classList.add("flipped"); $(".cart-front", flip).setAttribute("inert", ""); });
  });
  function burst() {
    if (reduce) return;
    const cr = cart.getBoundingClientRect(), br = confirm.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1);
    cv.width = cr.width * dpr; cv.height = cr.height * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const ox = br.left + br.width / 2 - cr.left, oy = br.top + br.height / 2 - cr.top;
    const KIND = [["#E8392B", "c"], ["#FFF8EC", "c"], ["#FFD447", "c"], ["#2F8F4E", "leaf"]];
    const ps = Array.from({ length: 30 }, (_, i) => { const a = (i / 30) * Math.PI * 2 + (Math.random() - .5) * .5, sp = 190 + Math.random() * 170, [c, k] = KIND[i % 4]; return { x: ox, y: oy, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 60, r: 4 + Math.random() * 5, c, k, rot: Math.random() * 6, vr: (Math.random() - .5) * 10 }; });
    const t0 = performance.now(); let last = t0;
    const step = (now) => {
      const t = (now - t0) / 900, dt = Math.min(.05, (now - last) / 1000); last = now;
      ctx.clearRect(0, 0, cr.width, cr.height); if (t >= 1) return;
      for (const q of ps) {
        q.vy += 260 * dt; q.vx *= 1 - 2.4 * dt; q.vy *= 1 - 1.8 * dt; q.x += q.vx * dt; q.y += q.vy * dt; q.rot += q.vr * dt;
        ctx.globalAlpha = t < .5 ? 1 : 1 - (t - .5) / .5; ctx.fillStyle = q.c;
        ctx.save(); ctx.translate(q.x, q.y); ctx.rotate(q.rot); ctx.beginPath();
        if (q.k === "leaf") ctx.ellipse(0, 0, q.r * 1.7, q.r * .8, 0, 0, Math.PI * 2); else ctx.arc(0, 0, q.r * (1 - t * .3), 0, Math.PI * 2);
        ctx.fill(); if (q.c === "#FFF8EC") { ctx.strokeStyle = "#e8d9bd"; ctx.lineWidth = 1; ctx.stroke(); }
        ctx.restore();
      }
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function writeBack(o) {
    const n = romeNow(), no = `LF-${hhmm(n.min).replace(":", "")}-${String(Object.values(o.items).reduce((a, b) => a + b, 0)).padStart(2, "0")}`;
    const ready = o.when ?? n.min + (o.mode === "domicilio" ? 40 : 15);
    const first = o.name.trim().split(/\s+/)[0];
    $("[data-back]").innerHTML = `<div class="order-card"><p>Ordine ${no} · ${o.mode === "domicilio" ? "a domicilio" : "d'asporto"}</p>
        <h3>Grazie, <em>${esc(first)}</em>!</h3>
        <p class="when">${o.mode === "domicilio" ? `Arriva verso le ${hhmm(ready)}${o.addr ? `, in ${esc(o.addr)}` : ""}.` : `Pronto alle ${hhmm(ready)}, al banco in piazzale Marconi.`}</p></div>
      <ul class="order-list">${Object.entries(o.items).map(([id, q]) => `<li><span>${q} × ${esc(BY[id].n)}</span><span>${eur(BY[id].p * q)}</span></li>`).join("")}${o.fee ? `<li><span>Consegna</span><span>${eur(o.fee)}</span></li>` : ""}</ul>
      <div class="order-tot"><span>Totale</span><span>${eur(o.sub + o.fee)}</span></div>
      <button class="btn red wide press" type="button" data-new>Nuovo ordine</button>`;
    st.items = {}; save(); renderCart();
    setTimeout(() => $("[data-new]")?.focus(), reduce ? 0 : 720);
  }
  function resetOrder() {
    timers.forEach(clearTimeout); timers = []; busy = false;
    flip.classList.remove("flipped"); $(".cart-front", flip).removeAttribute("inert");
    confirm.classList.remove("press-on", "round", "tick");
  }
  cart.addEventListener("click", (e) => { if (e.target.closest("[data-new]")) { resetOrder(); closeCart(); } });

  /* ───────── one scroll loop ───────── */
  let ticking = false;
  const onScroll = () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { ticking = false; heroFrame(); }); };
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  paintStatus(); renderCart(); heroFrame();
})();
