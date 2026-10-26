/* Legna E Farina — pizzeria, forno a legna, kebab. Vimercate, piazzale Marconi 7/D.
   Menu, prices and hours live in assets/menu.js (shared with the bright design).
   Everything else on the page is derived from those two facts. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const eur = (n) => n.toFixed(2).replace(".", ",") + " €";
  const hhmm = (m) => { m = ((Math.round(m) % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); };

  /* ───────── menu (shared with the other design: assets/menu.js) ───────── */
  const { CATS, ITEMS: M, HOURS, DAYS } = window.LF_MENU;
  const CAT = Object.fromEntries(CATS.map((c) => [c.id, c]));
  const BY = Object.fromEntries(M.map((x) => [x.id, x]));
  const imgOf = (x) => `./assets/${x.img || CAT[x.cat].img}.webp`;

  /* ───────── hours (Europe/Rome, whatever the visitor's clock says) ───────── */
  function romeNow() {
    const parts = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date()).map((p) => [p.type, p.value]));
    return { day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(parts.weekday), min: +parts.hour * 60 + +parts.minute };
  }
  /** open now? until when (minutes from today's midnight, may be < now if it wraps)? */
  function status(n = romeNow()) {
    const y = (n.day + 6) % 7, [, yc] = HOURS[y], [o, c] = HOURS[n.day];
    if (n.min + 1440 < yc) return { open: true, until: yc - 1440, left: yc - 1440 - n.min, span: [HOURS[y][0] - 1440, yc - 1440] };
    if (n.min >= o) return { open: true, until: c, left: c - n.min, span: [o, c] };
    return { open: false, opens: o, span: [o, c] };
  }
  function paintStatus() {
    const s = status();
    for (const el of $$("[data-status]")) {
      el.classList.toggle("open", s.open && s.left > 30);
      el.classList.toggle("soon", s.open && s.left <= 30);
      const short = el.closest("[data-dock]");
      $("[data-status-text]", el).textContent = !s.open ? (short ? `Chiuso · apre ${hhmm(s.opens)}` : `Chiuso · apre alle ${hhmm(s.opens)}`) : s.left <= 30 ? `Chiude tra ${s.left} min` : (short ? `Aperto · fino ${hhmm(s.until)}` : `Aperto · fino alle ${hhmm(s.until)}`);
    }
    return s;
  }

  /* ───────── header + dock ───────── */
  const header = $("[data-header]"), dock = $("[data-dock]"), hero = $("[data-hero]");
  const onScrollChrome = () => {
    header.classList.toggle("solid", scrollY > 40);
    dock.classList.toggle("on", scrollY > hero.offsetHeight * .6);
  };

  /* ───────── ① hero: sparks + heat haze ───────── */
  (function sparks() {
    const cv = $("[data-sparks]"); if (!cv || reduce) return;
    const ctx = cv.getContext("2d"); let W = 0, H = 0, dpr = 1, run = false, raf = 0;
    const P = [];
    const spawn = (p = {}) => Object.assign(p, { x: W * (.35 + Math.random() * .55), y: H * (.75 + Math.random() * .3), vx: (Math.random() - .5) * .3, vy: -(.4 + Math.random() * 1.1), life: 0, max: 160 + Math.random() * 220, r: .6 + Math.random() * 1.8, w: Math.random() * 6.28 });
    const size = () => { dpr = Math.min(2, devicePixelRatio || 1); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); };
    size(); addEventListener("resize", size);
    for (let i = 0; i < 70; i++) { const p = spawn(); p.life = Math.random() * p.max; P.push(p); }
    const tick = () => {
      ctx.clearRect(0, 0, W, H); ctx.globalCompositeOperation = "lighter";
      for (const p of P) {
        p.life++; p.w += .05; p.x += p.vx + Math.sin(p.w) * .35; p.y += p.vy;
        const k = p.life / p.max; if (k >= 1 || p.y < -10) { spawn(p); continue; }
        const a = Math.sin(Math.PI * k) * (.55 + .45 * Math.sin(p.life * .3));
        ctx.fillStyle = `rgba(255,${140 + 80 * (1 - k) | 0},60,${a.toFixed(3)})`;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * (1 - k * .5), 0, 6.283); ctx.fill();
      }
      raf = run ? requestAnimationFrame(tick) : 0;
    };
    new IntersectionObserver(([e]) => { run = e.isIntersecting; if (run && !raf) raf = requestAnimationFrame(tick); }).observe(hero);
  })();

  (function haze() {
    const stage = $("[data-haze-stage]"), lens = $("[data-haze-lens]"); if (!stage || reduce) return;
    const EASE = .1;
    let target = 0, ty = 0, x = -400, y = 0, tilt = 0, raf = 0, auto = !fine, t0 = performance.now();
    const place = () => { lens.style.setProperty("--x", x.toFixed(1) + "px"); lens.style.setProperty("--y", y.toFixed(1) + "px"); lens.style.setProperty("--rx", (150 + Math.abs(tilt) * 2.2).toFixed(1) + "px"); };
    const tick = (now) => {
      if (auto) { target = stage.clientWidth * (.5 + .42 * Math.sin((now - t0) / 2600)); ty = stage.clientHeight * .55; }
      const prev = x; x += (target - x) * EASE; y += (ty - y) * EASE;
      // the shimmer trails the pointer and stretches with its speed, then settles round again
      tilt += (clamp((x - prev) * 3, -40, 40) - tilt) * .1;
      place();
      raf = auto || Math.abs(target - x) > .05 || Math.abs(ty - y) > .05 || Math.abs(tilt) > .05 ? requestAnimationFrame(tick) : 0;
    };
    const go = () => { if (!raf) raf = requestAnimationFrame(tick); };
    if (auto) { stage.classList.add("hot"); x = stage.clientWidth / 2; y = stage.clientHeight * .55; new IntersectionObserver(([e]) => { if (e.isIntersecting) go(); else { cancelAnimationFrame(raf); raf = 0; } }).observe(stage); return; }
    hero.addEventListener("pointermove", (e) => { const r = stage.getBoundingClientRect(); target = e.clientX - r.left; ty = e.clientY - r.top; if (x < -300) { x = target; y = ty; } stage.classList.add("hot"); go(); });
    hero.addEventListener("pointerleave", () => stage.classList.remove("hot"));
  })();

  /* ───────── cart state ───────── */
  // the site previews this page in a sandboxed iframe (allow-scripts only): touching localStorage there throws,
  // so fall back to memory — the cart then just doesn't survive a reload
  const store = (() => { try { const s = window.localStorage, k = "__lf"; s.setItem(k, k); s.removeItem(k); return s; } catch { const m = new Map(); return { getItem: (k) => (m.has(k) ? m.get(k) : null), setItem: (k, v) => m.set(k, String(v)), removeItem: (k) => m.delete(k) }; } })();
  const KEY = "lf-cart-v1";
  const st = Object.assign({ items: {}, mode: "asporto", zone: "vimercate", name: "", tel: "", addr: "" }, JSON.parse(store.getItem(KEY) || "{}"));
  // a cart saved against an older menu may hold ids that no longer exist: drop them, or the badge counts ghosts
  for (const id of Object.keys(st.items)) if (!BY[id]) delete st.items[id];
  const save = () => store.setItem(KEY, JSON.stringify(st));
  const count = () => Object.values(st.items).reduce((a, b) => a + b, 0);
  const subtotal = () => Object.entries(st.items).reduce((s, [id, q]) => s + (BY[id] ? BY[id].p * q : 0), 0);
  const fee = () => (count() && st.mode === "domicilio" ? (st.zone === "fuori" ? 2 : 1) : 0);   // no food, no delivery fee
  function addItem(id, el) {
    if (!BY[id]) return;
    st.items[id] = (st.items[id] || 0) + 1; save(); renderCart();
    const b = $("[data-cart-count]"); b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump");
    if (el) { el.classList.add("ok"); const was = el.dataset.was ?? el.innerHTML; el.dataset.was = was; if (el.classList.contains("add") || el.matches(".pick i")) el.textContent = "✓"; setTimeout(() => { el.classList.remove("ok"); el.innerHTML = el.dataset.was; }, 900); }
  }
  document.addEventListener("click", (e) => { const b = e.target.closest("[data-add]"); if (b) addItem(b.dataset.add, b.matches(".add") ? b : null); });

  /* ───────── ② menu: tinted rows + preview ───────── */
  (function menu() {
    const sec = $("[data-menu]"), rows = $("[data-rows]"), tabs = $("[data-tabs]"), search = $("[data-search]");
    const pv = { img: $("[data-p-img]"), cat: $("[data-p-cat]"), name: $("[data-p-name]"), desc: $("[data-p-desc]"), price: $("[data-p-price]"), add: $("[data-p-add]") };
    let tab = "classiche", q = "", cur = null, timer = 0;
    tabs.innerHTML = [`<button class="tab" role="tab" data-tab="tutte" aria-selected="false">Tutto<small>${M.length}</small></button>`]
      .concat(CATS.map((c) => `<button class="tab" role="tab" data-tab="${c.id}" aria-selected="${c.id === "classiche"}">${c.t.replace(/^(Pizze|I|Le) /, (m) => (m === "Pizze " ? "" : ""))}<small>${M.filter((x) => x.cat === c.id).length}</small></button>`)).join("");
    // "Pizze classiche" → "Classiche" etc. reads better as a chip
    $$(".tab", tabs).forEach((b) => { if (b.dataset.tab !== "tutte") b.firstChild.textContent = CAT[b.dataset.tab].short; });

    const norm = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
    function render() {
      const nq = norm(q.trim());
      // a search looks through the whole menu, whatever tab is open
      const list = M.filter((x) => (nq ? norm(x.n + " " + x.d + " " + CAT[x.cat].t).includes(nq) : tab === "tutte" || x.cat === tab));
      if (!list.length) { rows.innerHTML = `<li class="no-hits">Niente con «${q}». Prova «bufala», «porcini» o «kebab».</li>`; return; }
      let html = "", last = "";
      for (const x of list) {
        if (x.cat !== last && (tab === "tutte" || nq)) { html += `<li class="grp" aria-hidden="true">${CAT[x.cat].t}<small>${list.filter((y) => y.cat === x.cat).length}</small></li>`; last = x.cat; }
        html += `<li class="row" data-id="${x.id}" tabindex="0">
          <img class="thumb" src="${imgOf(x)}" alt="" loading="lazy" width="56" height="56" />
          <span><span class="nm">${x.n}${x.tag ? `<span class="tag">${x.tag}</span>` : ""}</span><span class="ds">${x.d}</span></span>
          <span class="pr">${eur(x.p)}</span>
          <button class="add" type="button" data-add="${x.id}" aria-label="Aggiungi ${x.n}">+</button></li>`;
      }
      rows.innerHTML = html;
      if (!cur || !list.includes(cur)) show(list[0], true);
      else $(`.row[data-id="${cur.id}"]`, rows)?.classList.add("on");
    }
    function show(x, instant) {
      if (!x || x === cur) return;
      cur = x;
      sec.style.setProperty("--tint", CAT[x.cat].tint);
      $$(".row", rows).forEach((r) => r.classList.toggle("on", r.dataset.id === x.id));
      const put = () => { pv.cat.textContent = CAT[x.cat].t; pv.name.textContent = x.n; pv.desc.textContent = x.d; pv.price.textContent = eur(x.p); pv.add.dataset.add = x.id; };
      const src = imgOf(x), sameImg = pv.img.getAttribute("src") === src;
      clearTimeout(timer);
      if (instant || reduce) { put(); pv.img.src = src; return; }
      // out (200ms) → replace → in; a single fade would show half of one price morphing into another
      [pv.cat, pv.name, pv.desc, pv.price].forEach((e) => e.classList.add("fade", "swap"));
      if (!sameImg) pv.img.classList.add("swap");
      timer = setTimeout(() => {
        put(); [pv.cat, pv.name, pv.desc, pv.price].forEach((e) => e.classList.remove("swap"));
        if (!sameImg) { pv.img.src = src; pv.img.decode?.().catch(() => {}).finally(() => pv.img.classList.remove("swap")); }
      }, 200);
    }
    rows.addEventListener("pointerover", (e) => { const r = e.target.closest(".row"); if (r && fine) show(BY[r.dataset.id]); });
    rows.addEventListener("focusin", (e) => { const r = e.target.closest(".row"); if (r) show(BY[r.dataset.id]); });
    tabs.addEventListener("click", (e) => {
      const b = e.target.closest("[data-tab]"); if (!b) return;
      tab = b.dataset.tab; $$(".tab", tabs).forEach((t) => t.setAttribute("aria-selected", t === b));
      b.scrollIntoView({ inline: "center", block: "nearest", behavior: reduce ? "auto" : "smooth" });
      cur = null; render();
      if (tab !== "tutte") sec.style.setProperty("--tint", CAT[tab].tint);
      const top = rows.getBoundingClientRect().top + scrollY - (header.offsetHeight + tabs.offsetHeight + 20);
      if (scrollY > top) scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
    });
    search.addEventListener("input", () => { q = search.value; cur = null; render(); });
    render();
  })();

  /* ───────── dial (range-dial, 24h) ───────── */
  const NS = "http://www.w3.org/2000/svg";
  function buildDial(svg) {
    const C = 200, R1 = 168, R2 = 186, ticks = [];
    let html = `<circle cx="200" cy="200" r="150" fill="none" stroke="currentColor" stroke-opacity=".08" stroke-width="1"/>`;
    for (let i = 0; i < 96; i++) {
      const a = (i / 96) * Math.PI * 2 - Math.PI / 2, hr = i % 4 === 0, r1 = hr ? R1 - 6 : R1;
      html += `<line class="tk${hr ? " hr" : ""}" x1="${(C + Math.cos(a) * r1).toFixed(2)}" y1="${(C + Math.sin(a) * r1).toFixed(2)}" x2="${(C + Math.cos(a) * R2).toFixed(2)}" y2="${(C + Math.sin(a) * R2).toFixed(2)}"/>`;
    }
    for (let h = 0; h < 24; h += 3) { const a = (h / 24) * Math.PI * 2 - Math.PI / 2; html += `<text class="num" x="${(C + Math.cos(a) * 138).toFixed(1)}" y="${(C + Math.sin(a) * 138).toFixed(1)}">${String(h).padStart(2, "0")}</text>`; }
    html += `<g class="needle-g"><line class="needle" x1="200" y1="44" x2="200" y2="2"/><circle class="hub" cx="200" cy="23" r="6"/></g>`;
    svg.innerHTML = html;
    $$(".tk", svg).forEach((t) => ticks.push(t));
    const needle = $(".needle-g", svg);
    /** span = [open, close] minutes (close may pass midnight); now = minute; lit = ticks from open to now */
    return function set(span, now, litOn = true) {
      const [o, c] = span, rel = (m) => (((m - o) % 1440) + 1440) % 1440, len = c - o, rn = rel(now);
      ticks.forEach((t, i) => {
        const m = i * 15, r = rel(m), open = r < len;
        t.classList.toggle("open", open);
        t.classList.toggle("lit", litOn && open && r <= rn && rn < len);
      });
      needle.setAttribute("transform", `rotate(${((now / 1440) * 360).toFixed(2)} 200 200)`);
    };
  }

  /* ───────── ③ fino alle 3 ───────── */
  const notteFrame = (function notte() {
    const sec = $("[data-notte]"); if (!sec) return () => {};
    const setDial = buildDial($("[data-dial]"));
    const clock = $("[data-clock]"), dayEl = $("[data-clock-day]"), roller = $("[data-roller]"), text = $("[data-notte-text]"), picks = $("[data-notte-picks]"), photo = $("[data-notte-photo]"), steps = $("[data-notte-steps]");
    const STOPS = [
      { t: 750, day: "pranzo · dalle 10", l: ["Pausa", "<em>pranzo.</em>"], p: "Un panino kebab, un trancio di Margherita, un'insalatona: dieci minuti al banco e torni al lavoro. Si apre alle 10, la domenica alle 11.", pick: ["panino-kebab", "margherita", "insalata-mediterranea"], img: "piadina-kebab", r: 4 },
      { t: 1170, day: "cena", l: ["Cena", "in <em>famiglia.</em>"], p: "Una Margherita formato famiglia in mezzo al tavolo, la Topolino con würstel e patatine per i più piccoli. Nessuno litiga.", pick: ["margherita-famiglia", "topolino", "patatine"], img: "margherita", r: -3 },
      { t: 1260, day: "la sera", l: ["L'asta del", "<em>fantacalcio.</em>"], p: "C'è chi la fa qui ogni anno: tavolo lungo sotto i portici, otto pizze, un'asta che non finisce mai. Le nuggets da 24 aiutano.", pick: ["kebab-famiglia", "nuggets-24", "diavola"], img: "filante", r: 5 },
      { t: 1500, day: "dopo mezzanotte", l: ["Dopo", "la <em>serata.</em>"], p: "Il resto di Vimercate ha chiuso. Noi no: il forno è ancora acceso e lo spiedo gira.", pick: ["kebab-pizza", "kebab-box", "panino-falafel"], img: "kebab-spiedo", r: -4 },
      { t: 1620, day: "ven 3:30 · sab 4:00", l: ["L'ultima", "<em>infornata.</em>"], p: "Si chiude alle 3, il venerdì alle 3:30, il sabato alle 4. Se passi prima, una pizza la trovi.", pick: ["margherita", "calzone-vesuvio", "focaccia-rosmarino"], img: "fiamma", r: 3 },
    ];
    // the colour of the section is the hour (ambient-hue-follows-focus: one number, everything follows)
    const SKY = [[660, [243, 233, 218]], [1020, [240, 215, 181]], [1140, [229, 138, 74]], [1230, [90, 36, 18]], [1320, [28, 17, 12]], [1620, [10, 7, 8]]];
    const sky = (t) => { for (let i = 1; i < SKY.length; i++) if (t <= SKY[i][0]) { const [a, ca] = SKY[i - 1], [b, cb] = SKY[i], k = clamp((t - a) / (b - a)); return ca.map((v, j) => Math.round(v + (cb[j] - v) * k)); } return SKY[SKY.length - 1][1]; };
    steps.innerHTML = STOPS.map(() => "<li><i></i></li>").join("");
    roller.innerHTML = `<span class="ln"><span></span></span><span class="ln"><span></span></span>`;
    let active = -1;
    function go(i, first) {
      if (i === active) return; const s = STOPS[i]; active = i;
      $$(".ln", roller).forEach((ln, k) => {
        const old = ln.firstElementChild, nu = document.createElement("span");
        nu.innerHTML = s.l[k];
        if (first || reduce) { ln.replaceChildren(nu); return; }
        nu.className = "below"; ln.appendChild(nu);
        old.classList.add("above"); old.addEventListener("transitionend", () => old.remove(), { once: true }); setTimeout(() => old.remove(), 900);
        requestAnimationFrame(() => requestAnimationFrame(() => nu.classList.remove("below")));
      });
      text.classList.add("swap");
      const img = $("img", photo);
      img.classList.add("swap");
      setTimeout(() => {
        text.textContent = s.p; text.classList.remove("swap");
        img.src = `./assets/${s.img}.webp`; img.onload = () => img.classList.remove("swap");
        photo.style.setProperty("--r", s.r + "deg");
        picks.innerHTML = s.pick.map((id) => `<button class="pick press" type="button" data-pick="${id}">${BY[id].n} <b>${eur(BY[id].p)}</b><i>+</i></button>`).join("");
      }, first ? 0 : 220);
      dayEl.textContent = s.day;
    }
    picks.addEventListener("click", (e) => { const b = e.target.closest("[data-pick]"); if (!b) return; addItem(b.dataset.pick); b.classList.add("ok"); $("i", b).textContent = "✓"; setTimeout(() => { b.classList.remove("ok"); $("i", b).textContent = "+"; }, 900); });
    // dwell near each stop: the time eases in and out of every stop instead of sweeping linearly
    const ease = (u) => u * u * u * (u * (u * 6 - 15) + 10);
    function frame() {
      const r = sec.getBoundingClientRect(), total = sec.offsetHeight - innerHeight;
      const p = clamp(-r.top / total);
      const seg = p * (STOPS.length - 1 + .4) ; // last stop gets a bit of hold
      const k = Math.min(STOPS.length - 2, Math.floor(seg)), u = clamp(seg - k);
      const t = seg >= STOPS.length - 1 ? STOPS.at(-1).t : STOPS[k].t + (STOPS[k + 1].t - STOPS[k].t) * ease(u);
      const idx = seg >= STOPS.length - 1 ? STOPS.length - 1 : u < .5 ? k : k + 1;
      go(idx);
      const c = sky(t), lum = (.299 * c[0] + .587 * c[1] + .114 * c[2]) / 255;
      sec.style.setProperty("--bg", `rgb(${c.join(",")})`);
      sec.style.setProperty("--fg", lum > .5 ? "#1d1611" : "#f5efe4");
      clock.textContent = hhmm(t);
      setDial([600, 1620], t % 1440);
      $$("li", steps).forEach((li, i) => li.firstElementChild.style.setProperty("--p", clamp(seg - i + .5)));
    }
    go(0, true); frame();
    return frame;
  })();

  /* ───────── ④ la casa: the pizza kebab, pulled apart ───────── */
  const casaFrame = (function casa() {
    const sec = $("[data-casa]"), stack = $("[data-stack]"); if (!sec) return () => {};
    // seeded random, so the pizza is the same pizza every visit
    let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
    const S = 640, C = S / 2, R = S * .46;
    const LAYERS = [
      { k: "Doppia pasta", base: true, draw(g) {
        const gr = g.createRadialGradient(C, C, R * .2, C, C, R); gr.addColorStop(0, "#efd3a0"); gr.addColorStop(.78, "#e2b679"); gr.addColorStop(.9, "#c98a4a"); gr.addColorStop(1, "#8f5528");
        g.fillStyle = gr; g.beginPath(); g.arc(C, C, R, 0, 7); g.fill();
        for (let i = 0; i < 70; i++) { const a = rnd() * 6.28, d = R * (.84 + rnd() * .14), r = 3 + rnd() * 11; g.fillStyle = `rgba(${40 + rnd() * 30 | 0},${20 + rnd() * 10 | 0},10,${.35 + rnd() * .45})`; g.beginPath(); g.ellipse(C + Math.cos(a) * d, C + Math.sin(a) * d, r, r * (.5 + rnd() * .5), a, 0, 7); g.fill(); }
        for (let i = 0; i < 260; i++) { const a = rnd() * 6.28, d = rnd() * R * .8; g.fillStyle = `rgba(255,255,240,${rnd() * .25})`; g.fillRect(C + Math.cos(a) * d, C + Math.sin(a) * d, 2, 2); }
      } },
      { k: "Pomodoro", draw(g) {
        const r = R * .82; g.fillStyle = "#c22d18"; g.beginPath();
        for (let i = 0; i <= 64; i++) { const a = (i / 64) * 6.283, rr = r * (1 + (rnd() - .5) * .05); g.lineTo(C + Math.cos(a) * rr, C + Math.sin(a) * rr); }
        g.fill();
        for (let i = 0; i < 120; i++) { const a = rnd() * 6.28, d = rnd() * r * .95, s = 4 + rnd() * 16; g.fillStyle = rnd() > .5 ? "rgba(140,20,8,.35)" : "rgba(235,80,40,.3)"; g.beginPath(); g.arc(C + Math.cos(a) * d, C + Math.sin(a) * d, s, 0, 7); g.fill(); }
      } },
      { k: "Mozzarella", draw(g) {
        for (let i = 0; i < 17; i++) { const a = rnd() * 6.28, d = Math.sqrt(rnd()) * R * .66, s = 26 + rnd() * 30, x = C + Math.cos(a) * d, y = C + Math.sin(a) * d;
          const gr = g.createRadialGradient(x - s * .2, y - s * .2, 2, x, y, s); gr.addColorStop(0, "#fffdf6"); gr.addColorStop(.75, "#f6ecd6"); gr.addColorStop(1, "rgba(240,225,190,0)");
          g.fillStyle = gr; g.beginPath(); for (let j = 0; j <= 18; j++) { const b = (j / 18) * 6.283, rr = s * (.75 + rnd() * .3); g.lineTo(x + Math.cos(b) * rr, y + Math.sin(b) * rr); } g.fill(); }
      } },
      { k: "Kebab dallo spiedo", draw(g) {
        for (let i = 0; i < 70; i++) { const a = rnd() * 6.28, d = Math.sqrt(rnd()) * R * .72, x = C + Math.cos(a) * d, y = C + Math.sin(a) * d, w = 30 + rnd() * 34, h = 9 + rnd() * 9;
          g.save(); g.translate(x, y); g.rotate(rnd() * 3.14); const gr = g.createLinearGradient(0, -h, 0, h); gr.addColorStop(0, "#b8743c"); gr.addColorStop(.5, "#8a4a22"); gr.addColorStop(1, "#5a2c12");
          g.fillStyle = gr; g.beginPath(); g.roundRect(-w / 2, -h / 2, w, h, h / 2); g.fill(); g.fillStyle = "rgba(60,25,8,.5)"; g.fillRect(-w / 2 + 4, -1, w - 8, 2); g.restore(); }
      } },
      { k: "Insalata", draw(g) {
        g.lineCap = "round";
        for (let i = 0; i < 110; i++) { const a = rnd() * 6.28, d = Math.sqrt(rnd()) * R * .74, x = C + Math.cos(a) * d, y = C + Math.sin(a) * d, l = 14 + rnd() * 26, b = rnd() * 3.14;
          g.strokeStyle = rnd() > .3 ? `hsl(${95 + rnd() * 25}, ${55 + rnd() * 20}%, ${38 + rnd() * 18}%)` : "#d9efb0"; g.lineWidth = 3 + rnd() * 4;
          g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(b + .6) * l * .6, y + Math.sin(b + .6) * l * .6, x + Math.cos(b) * l, y + Math.sin(b) * l); g.stroke(); }
      } },
      { k: "Cipolla", draw(g) {
        for (let i = 0; i < 22; i++) { const a = rnd() * 6.28, d = Math.sqrt(rnd()) * R * .7, x = C + Math.cos(a) * d, y = C + Math.sin(a) * d, s = 14 + rnd() * 16, b = rnd() * 6.28;
          g.strokeStyle = `rgba(${150 + rnd() * 40 | 0},60,${120 + rnd() * 40 | 0},.95)`; g.lineWidth = 4; g.beginPath(); g.arc(x, y, s, b, b + 2.2 + rnd() * 2.5); g.stroke();
          g.strokeStyle = "rgba(250,235,245,.9)"; g.lineWidth = 2; g.beginPath(); g.arc(x, y, s - 4, b + .2, b + 2 + rnd() * 2); g.stroke(); }
      } },
      { k: "Salse", draw(g) {
        g.lineCap = "round"; g.lineJoin = "round";
        const zig = (col, w, n, off) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); for (let i = 0; i <= n; i++) { const t = i / n, y = C - R * .62 + t * R * 1.24, half = Math.sqrt(Math.max(0, (R * .66) ** 2 - (y - C) ** 2)); g.lineTo(C + (i % 2 ? half : -half) * (.9 + rnd() * .1) + off, y + (rnd() - .5) * 8); } g.stroke(); };
        zig("rgba(255,252,240,.92)", 6, 9, 0); zig("rgba(214,48,20,.9)", 4, 7, 18);
      } },
    ];
    const els = LAYERS.map((L, i) => {
      const d = document.createElement("div"); d.className = "layer" + (L.base ? " base" : "");
      const cv = document.createElement("canvas"); cv.width = cv.height = S; L.draw(cv.getContext("2d")); d.appendChild(cv);
      d.style.zIndex = i + 1; stack.appendChild(d);
      const tg = document.createElement("span"); tg.className = "tagline"; tg.innerHTML = `<b>${String(i + 1).padStart(2, "0")}</b> ${L.k}`; stack.appendChild(tg);
      return { d, tg };
    });
    return function frame() {
      const r = sec.getBoundingClientRect(), total = sec.offsetHeight - innerHeight;
      const p = clamp(-r.top / total);
      const spread = reduce ? 1 : clamp((p - .06) / .5), e = 1 - Math.pow(1 - spread, 3);
      const mobile = innerWidth <= 820, gap = mobile ? 24 : 62;
      const h = stack.clientHeight, cy = h * (mobile ? .66 : .58);
      els.forEach(({ d, tg }, i) => {
        const z = i * gap * e;
        d.style.setProperty("--z", z.toFixed(1) + "px");
        d.style.setProperty("--spin", (p * 50 - i * 4 * e).toFixed(2) + "deg");
        // the label sits where the layer's centre projects to (rotateX 62° → z shows as ~.88·z upward)
        tg.style.top = (cy - z * .88 - 6).toFixed(1) + "px";
        tg.style.setProperty("--o", clamp((e - i / LAYERS.length) * 3).toFixed(3));
      });
    };
  })();

  /* ───────── ⑤ dove ───────── */
  (function dove() {
    const tb = $("[data-hours]"), now = romeNow();
    const order = [1, 2, 3, 4, 5, 6, 0];
    tb.innerHTML = order.map((d) => `<tr class="${d === now.day ? "today" : ""}"><td>${DAYS[d]}</td><td>${hhmm(HOURS[d][0])} – ${hhmm(HOURS[d][1])}</td></tr>`).join("");
    const setDial = buildDial($("[data-dial-now]"));
    const t = $("[data-now-time]"), txt = $("[data-now-text]");
    function paint() {
      const n = romeNow(), s = status(n);
      setDial(s.span, n.min, s.open);
      t.textContent = hhmm(n.min);
      if (s.open) { const h = Math.floor(s.left / 60), m = s.left % 60; txt.textContent = `aperto · chiude tra ${h ? h + " h " : ""}${m} min`; }
      else txt.textContent = `chiuso · si riapre alle ${hhmm(s.opens)}`;
    }
    paint(); setInterval(() => { paint(); paintStatus(); }, 30000);
  })();

  /* ───────── cart drawer ───────── */
  const cart = $("[data-cart]"), scrim = $("[data-scrim]"), lines = $("[data-lines]"), whenSel = $("[data-f=when]"), err = $("[data-err]");
  let lastFocus = null;
  function openCart(mode) {
    if (mode) { st.mode = mode; save(); }
    renderCart(); lastFocus = document.activeElement;
    scrim.hidden = false; cart.removeAttribute("inert"); cart.setAttribute("aria-hidden", "false");
    requestAnimationFrame(() => { scrim.classList.add("on"); cart.classList.add("on"); });
    document.body.style.overflow = "hidden";
    setTimeout(() => $(".x", cart).focus(), 60);
  }
  function closeCart() {
    scrim.classList.remove("on"); cart.classList.remove("on"); cart.setAttribute("aria-hidden", "true"); cart.setAttribute("inert", "");
    document.body.style.overflow = ""; setTimeout(() => (scrim.hidden = true), 280);
    lastFocus?.focus?.();
  }
  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-cart-open]")) openCart();
    if (e.target.closest("[data-cart-close]") || e.target === scrim) closeCart();
  });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && cart.classList.contains("on")) closeCart(); });
  $$("[data-way]").forEach((b) => b.addEventListener("click", (e) => {
    const w = b.dataset.way; if (w === "tavolo") return;
    e.preventDefault(); st.mode = w; save(); renderCart();
    $("#menu").scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
  }));

  function slots() {
    const n = romeNow(), s = status(n), out = [];
    const start = s.open ? n.min : s.opens, end = s.open ? s.until + (s.until < n.min ? 1440 : 0) : HOURS[n.day][1];
    const first = Math.ceil((start + (st.mode === "domicilio" ? 40 : 20)) / 15) * 15;
    if (s.open) out.push(["subito", st.mode === "domicilio" ? "Appena possibile" : "Appena pronto · 5–15 min"]);
    for (let m = first; m <= end - 15 && out.length < 40; m += 15) out.push([String(m), hhmm(m)]);
    return out;
  }
  function renderCart() {
    const n = count();
    const badge = $("[data-cart-count]"); badge.textContent = n; badge.classList.toggle("has", n > 0);
    $("[data-cart-total]").textContent = eur(subtotal() + (n ? fee() : 0));
    cart.classList.toggle("dom", st.mode === "domicilio");
    cart.classList.toggle("is-empty", n === 0);
    $$("[data-m]", cart).forEach((b) => b.setAttribute("aria-checked", b.dataset.m === st.mode));
    $$("[data-z]", cart).forEach((b) => b.setAttribute("aria-checked", b.dataset.z === st.zone));
    $("[data-empty]").hidden = n > 0; $("[data-fields]").hidden = n === 0;
    const had = new Set($$(".line", lines).map((l) => l.dataset.id));
    lines.innerHTML = Object.entries(st.items).filter(([id]) => BY[id]).map(([id, q]) => `<li class="line${had.has(id) ? "" : " new"}" data-id="${id}"><span><b>${BY[id].n}</b><small>${CAT[BY[id].cat].t}</small></span>
      <span class="qty"><button type="button" data-dec="${id}" aria-label="Togli uno">−</button><span>${q}</span><button type="button" data-inc="${id}" aria-label="Aggiungi uno">+</button></span>
      <span class="lp">${eur(BY[id].p * q)}</span></li>`).join("");
    $("[data-sub]").textContent = eur(subtotal()); $("[data-fee]").textContent = eur(fee()); $("[data-tot]").textContent = eur(subtotal() + fee());
    $("[data-when-label]").textContent = st.mode === "domicilio" ? "Consegna alle" : "Ritiro alle";
    const s = status(); $("[data-closed]").hidden = s.open || n === 0;
    if (!s.open) $("[data-closed]").innerHTML = `<b>Adesso siamo chiusi.</b> Puoi ordinare per quando riapriamo, alle ${hhmm(s.opens)}.`;
    const keep = whenSel.value; whenSel.innerHTML = slots().map(([v, l]) => `<option value="${v}">${l}</option>`).join(""); if ([...whenSel.options].some((o) => o.value === keep)) whenSel.value = keep;
    for (const f of ["name", "tel", "addr"]) { const i = $(`[data-f=${f}]`); if (document.activeElement !== i) i.value = st[f]; }
  }
  cart.addEventListener("click", (e) => {
    const t = e.target.closest("button"); if (!t) return;
    if (t.dataset.inc) { st.items[t.dataset.inc]++; }
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
    if (bad.length) { err.textContent = bad.includes("addr") && bad.length === 1 ? "Manca l'indirizzo di consegna." : "Ci servono nome e telefono per chiamarti al banco."; $(`[data-f=${bad[0]}]`).focus(); }
    return !bad.length;
  }

  /* slide-to-confirm (spring grip; rebuilt from Bencho by Lorenzo Cabra, MIT) */
  (function slider() {
    const slide = $("[data-slide]"), grip = $("[data-grip]"), PAD = 6, GRIP = 48;
    let x = 0, vel = 0, target = 0, dragging = false, grab = null, done = false, raf = 0, last = 0;
    const travel = () => slide.clientWidth - PAD * 2 - GRIP - 70;
    const paint = () => { grip.style.transform = `translateX(${x.toFixed(2)}px) rotate(${(x * 1.2).toFixed(1)}deg)`; $(".slide-label", slide).style.opacity = done ? 0 : (1 - x / travel() * 1.6).toFixed(2); };
    const frame = (now) => {
      const dt = Math.min(.04, (now - last) / 1000); last = now;
      if (!dragging) { const k = 300, d = 2 * Math.sqrt(k) * .9; vel += (-k * (x - target) - d * vel) * dt; x += vel * dt; }
      paint();
      raf = dragging || Math.abs(vel) > .01 || Math.abs(x - target) > .05 ? requestAnimationFrame(frame) : (x = target, paint(), 0);
    };
    const kick = () => { if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };
    const local = (cx) => cx - slide.getBoundingClientRect().left;
    grip.addEventListener("pointerdown", (e) => { if (done) return; dragging = true; grab = null; grip.setPointerCapture(e.pointerId); kick(); });
    grip.addEventListener("pointermove", (e) => { if (!dragging) return; const at = local(e.clientX); if (grab === null) { grab = at - x; return; } x = clamp(at - grab, 0, travel()); });
    const lift = () => { if (!dragging) return; dragging = false; if (x > travel() * .72) commit(); else target = 0; kick(); };
    grip.addEventListener("pointerup", lift); grip.addEventListener("pointercancel", lift);
    // keyboard: Enter/Space on the grip confirms (a drag-only control would lock keyboard users out)
    grip.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); x = travel() * .8; commit(); kick(); } });
    function commit() {
      if (!validate()) { target = 0; kick(); return; }
      target = travel() + 30; done = true; slide.classList.add("done"); kick();
      setTimeout(printTicket, reduce ? 0 : 420);
    }
    window.__resetSlide = () => { done = false; slide.classList.remove("done"); x = 0; target = 0; vel = 0; paint(); };
  })();

  /* receipt-print-stamp: the kitchen ticket */
  const sleep = (ms) => new Promise((r) => setTimeout(r, reduce ? 0 : ms));
  function tween(el, frames, o) { const a = el.animate(frames, { fill: "both", ...o, duration: reduce ? 1 : o.duration }); return a.finished.then(() => { const lf = frames[frames.length - 1]; for (const k in lf) if (k !== "offset" && k !== "easing") el.style[k] = lf[k]; a.cancel(); }).catch(() => {}); }
  async function printTicket() {
    const box = $("[data-printout]"), paper = $("[data-paper]"), again = $("[data-again]");
    const n = romeNow(), no = `LF-${hhmm(n.min).replace(":", "")}-${String(count()).padStart(2, "0")}`;
    const when = whenSel.value === "subito" ? (st.mode === "domicilio" ? "appena possibile" : "tra 5–15 minuti") : "alle " + whenSel.selectedOptions[0].textContent;
    paper.innerHTML = `<div class="brand">LEGNA E FARINA</div><div class="kick">COMANDA · ${st.mode === "domicilio" ? "DOMICILIO" : "ASPORTO"}</div><hr>
      <div class="m"><span>N.</span>${no}</div><div class="m"><span>NOME</span>${esc(st.name).toUpperCase()}</div><div class="m"><span>ORA</span>${hhmm(n.min)}</div>
      ${st.mode === "domicilio" ? `<div class="m"><span>A</span>${esc(st.addr)}</div>` : ""}<hr>
      ${Object.entries(st.items).map(([id, q]) => `<div class="i"><span>${q} × ${BY[id].n}</span>${eur(BY[id].p * q)}</div>`).join("")}
      ${fee() ? `<div class="m"><span>Consegna</span>${eur(fee())}</div>` : ""}<hr>
      <div class="tot"><span>TOTALE</span><span>${eur(subtotal() + fee())}</span></div>
      <div class="eta">${st.mode === "domicilio" ? "Arriva" : "Pronta"} ${when}.<br>Grazie!</div>
      <svg class="stamp" viewBox="0 0 96 96" aria-hidden="true"><defs><path id="ring" d="M48 48 m-38 0 a38 38 0 1 1 76 0 a38 38 0 1 1 -76 0"/>
        <filter id="ink"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="2.2"/></filter></defs>
        <g filter="url(#ink)" fill="none" stroke="#c22d18" color="#c22d18"><circle cx="48" cy="48" r="45" stroke-width="3"/><circle cx="48" cy="48" r="31" stroke-width="1.3"/>
        <text fill="currentColor" stroke="none" font-family="JetBrains Mono, monospace" font-size="7.2" font-weight="700" letter-spacing="1.5"><textPath href="#ring">FORNO A LEGNA · VIMERCATE · FINO ALLE 3 ·</textPath></text>
        <text x="48" y="46" text-anchor="middle" fill="currentColor" stroke="none" font-family="Anton, Impact, sans-serif" font-size="17" letter-spacing="1">IN</text>
        <text x="48" y="63" text-anchor="middle" fill="currentColor" stroke="none" font-family="Anton, Impact, sans-serif" font-size="17" letter-spacing="1">FORNO</text></g></svg>`;
    box.hidden = false; again.style.opacity = 0; again.style.pointerEvents = "none";
    const stamp = $(".stamp", paper); stamp.style.opacity = 0;
    paper.style.transform = "translateY(-110%)";
    await sleep(300);
    // speed-modulated feed: q(t) = t − k·sin(2πnt)/(2πn): surges and hesitates, never backs up, stops on time
    await new Promise((res) => {
      const H = paper.offsetHeight, nn = 19, k = .72, t0 = performance.now(), dur = reduce ? 1 : 2000;
      const step = (now) => { const t = Math.min(1, (now - t0) / dur), q = t - k * Math.sin(2 * Math.PI * nn * t) / (2 * Math.PI * nn), p = 1 - Math.pow(1 - q, 1.25);
        paper.style.transform = `translate(${(t < 1 ? (Math.random() - .5) * .7 : 0).toFixed(2)}px, ${(-H * (1 - p)).toFixed(2)}px)`; t < 1 ? requestAnimationFrame(step) : res(); };
      requestAnimationFrame(step);
    });
    await tween(paper, [{ transform: "translate(0,0) rotate(0)" }, { transform: "translate(0,5px) rotate(.9deg)", offset: .45 }, { transform: "translate(0,3px) rotate(0)" }], { duration: 480, easing: "ease-out" });
    await tween(stamp, [{ opacity: 0, transform: "scale(2.4) rotate(-34deg)", filter: "blur(4px)" }, { opacity: .95, transform: "scale(.94) rotate(-12deg)", filter: "blur(0)", offset: .72 }, { opacity: .9, transform: "scale(1) rotate(-14deg)", filter: "blur(0)" }], { duration: 280, easing: "cubic-bezier(.5,0,.75,0)" });
    tween(paper, [{ transform: "translate(0,3px)" }, { transform: "translate(0,7px)", offset: .35 }, { transform: "translate(0,3px)" }], { duration: 200, easing: "ease-out" });
    await sleep(300);
    await tween(again, [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 320, easing: "cubic-bezier(.22,1,.36,1)" });
    again.style.pointerEvents = ""; again.focus();
  }
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  $("[data-again]").addEventListener("click", () => { st.items = {}; save(); $("[data-printout]").hidden = true; window.__resetSlide(); renderCart(); closeCart(); });

  /* ───────── one scroll loop for everything scroll-driven ───────── */
  let ticking = false;
  const onScroll = () => { if (ticking) return; ticking = true; requestAnimationFrame(() => { ticking = false; onScrollChrome(); scrollers.forEach((f) => f()); }); };
  const scrollers = [casaFrame, notteFrame];
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);

  paintStatus(); renderCart(); onScrollChrome(); casaFrame();
})();
