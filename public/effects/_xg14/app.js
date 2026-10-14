/* @西瓜同学 ep.14 — one small app, six touches. Every entry boots the same app; only the first screen differs.
   Timings: measured on the recording (3× playback, 60 fps → one frame = 50 ms of real time) and multiplied by 3. */
window.XG14 = (() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, k) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(",")})`; };
  // cubic-bezier as a JS easing (for rAF-driven tweens that must match CSS curves)
  function bezier(x1, y1, x2, y2) {
    const ax = 3 * x1 - 3 * x2 + 1, bx = 3 * x2 - 6 * x1, cx = 3 * x1, ay = 3 * y1 - 3 * y2 + 1, by = 3 * y2 - 6 * y1, cy = 3 * y1;
    const X = (t) => ((ax * t + bx) * t + cx) * t, Y = (t) => ((ay * t + by) * t + cy) * t, dX = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return (x) => { if (x <= 0) return 0; if (x >= 1) return 1; let t = x; for (let i = 0; i < 8; i++) { const e = X(t) - x, d = dX(t); if (Math.abs(e) < 1e-5 || !d) break; t -= e / d; } return Y(clamp(t, 0, 1)); };
  }
  const OUT = bezier(.2, .7, .2, 1);
  const STD = bezier(.4, 0, .2, 1);
  function tween(ms, fn, { delay = 0, ease = OUT } = {}) {
    let raf = 0, dead = false;
    if (reduce()) { const to = setTimeout(() => fn(1), 0); return () => clearTimeout(to); }
    const to = setTimeout(() => { const t0 = performance.now(); const step = (now) => { if (dead) return; const k = Math.min(1, (now - t0) / ms); fn(ease(k)); if (k < 1) raf = requestAnimationFrame(step); }; raf = requestAnimationFrame(step); }, delay);
    return () => { dead = true; clearTimeout(to); cancelAnimationFrame(raf); };
  }
  const C = { ink: "#121013", paper: "#f9f8f8", purple: "#bdabff", steel: "#b6cce1", mint: "#afebc2", leaf: "#bbf07c", lime: "#cef135", orange: "#fe5324", blue: "#3c55ff", sand: "#f5f1f0" };

  // ---------- icons (Lucide 1.28.0, ISC; the list glyph is drawn to match the reference's stacked bars) ----------
  const ICON = {
    check: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    lists: '<rect x="4" y="3" width="16" height="6" rx="3"/><path d="M4 14h16M4 19h11"/>',
    plan: '<path d="M8 2v4M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
    habits: '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
  };
  const svg = (k) => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[k]}</svg>`;

  // hand-drawn stand-in for the reference's book-stack illustration (125 × 112)
  const BOOKS = `<svg class="books" viewBox="0 0 125 112" aria-hidden="true"><defs>
    <linearGradient id="bk1" x1="0" x2="1"><stop offset="0" stop-color="#f7a26a"/><stop offset="1" stop-color="#e9577d"/></linearGradient>
    <linearGradient id="bk2" x1="0" x2="1"><stop offset="0" stop-color="#4e5fe6"/><stop offset=".6" stop-color="#8b6fd9"/><stop offset="1" stop-color="#f08aa8"/></linearGradient>
    <linearGradient id="bk3" x1="0" x2="1"><stop offset="0" stop-color="#f08aa8"/><stop offset=".55" stop-color="#f6b26b"/><stop offset="1" stop-color="#ffd27a"/></linearGradient>
    <linearGradient id="pg" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#fbe6c6"/><stop offset="1" stop-color="#f1cfa1"/></linearGradient></defs>
    <g stroke="#2a2440" stroke-width="1.1" stroke-linejoin="round">
      <path d="M14 84 98 96 118 84 34 72Z" fill="url(#bk1)"/><path d="M14 84v9l84 12v-9Z" fill="url(#pg)"/><path d="M98 96v9l20-12v-9Z" fill="#c9466b"/>
      <path d="M20 66 104 77 121 66 37 55Z" fill="url(#bk2)"/><path d="M20 66v10l84 11V77Z" fill="url(#pg)"/><path d="M104 77v10l17-11V66Z" fill="#3f4bbf"/>
      <path d="M10 49 92 59 113 47 31 37Z" fill="url(#bk3)"/><path d="M10 49v10l82 10V59Z" fill="url(#pg)"/><path d="M92 59v10l21-12V47Z" fill="#e0708f"/>
      <path d="M22 26 98 34 118 20 42 12Z" fill="#2d3163"/><path d="M22 26v11l76 9V34Z" fill="url(#pg)"/><path d="M98 34v12l20-14V20Z" fill="#20244d"/>
    </g>
    <g stroke="#c98e5e" stroke-width=".5" opacity=".7"><path d="M24 30l72 8M24 33l72 8M12 53l78 9M22 70l80 10M16 88l80 11"/></g>
    <path d="M70 17l2.2 4.6 4.8.6-3.6 3.2.9 4.8-4.3-2.4-4.3 2.4.9-4.8-3.6-3.2 4.8-.6Z" fill="#e8b04b" transform="rotate(-8 70 23)"/>
    <path d="M56 41l5-1 2 34-4.5-4-4 4.5Z" fill="#e85c7a" stroke="#2a2440" stroke-width="1"/>
  </svg>`;
  const CLOUDS = `<svg class="clouds" viewBox="0 0 288 628" preserveAspectRatio="none" aria-hidden="true">
    <path d="M150 128c-6-24 14-44 36-38 6-26 44-34 60-12 22-8 46 8 44 32 18 6 18 34-2 40H158c-18-2-22-18-8-22Z"/>
    <path d="M-20 440c-8-26 16-46 40-38 4-30 46-36 62-12 24-10 50 6 46 30 20 6 18 36-4 42H-8c-20-2-26-16-12-22Z"/>
    <path d="M150 560c-8-28 18-48 44-40 6-30 50-36 66-10 24-8 46 12 40 36 20 8 14 40-8 44H162c-20-2-26-20-12-30Z"/>
  </svg>`;

  let scr, scale = 1, pages = [], cur = 0, busy = false;
  const screenXY = (e) => { const r = scr.getBoundingClientRect(); return [(e.clientX - r.left) / scale, (e.clientY - r.top) / scale]; };

  // =========================================================================================
  // 01 FOCUS — Done squeezes into a circle (0.4 s), a check draws (0.4 s), then a ring of
  //    particles bursts out (0.9 s) and the line under the timer turns lime.
  // =========================================================================================
  function focusPage() {
    const p = el("section", "page focus");
    p.innerHTML = `${CLOUDS}<div class="head"><h1>Focus</h1></div>${BOOKS}
      <div class="fcard"><span class="mono lab">Read ten pages</span><b class="big tnum">25:00</b>
        <span class="sub"><i>One thing at a time</i><i>Nice work, session saved</i></span>
        <button type="button" class="done" aria-label="Done"><span>Done</span><svg viewBox="0 0 24 24"><path d="M7 12.5l3.2 3.2L17 9"/></svg></button></div>
      <b class="upnext">Up next</b>
      <div class="rows" style="top:365px">${row("Stretch for ten", "15:00")}${row("Tidy the desk", "18:00")}</div>
      <canvas class="burst" width="576" height="1256"></canvas>`;
    const btn = $(".done", p), card = $(".fcard", p), cv = $(".burst", p), ctx = cv.getContext("2d");
    let state = "idle", timers = [];
    const later = (ms, fn) => timers.push(setTimeout(fn, reduce() ? 0 : ms));
    btn.addEventListener("click", () => {
      if (state === "busy") return;
      if (state === "done") { // tap the check again → back to a fresh session
        timers.forEach(clearTimeout); timers = []; state = "idle";
        card.classList.remove("ok", "round", "tick"); btn.setAttribute("aria-label", "Done"); return;
      }
      state = "busy";
      card.classList.add("press");                                   // label fades: 0–300 ms
      later(250, () => card.classList.add("round"));                // pill → 42 px circle: 250–650 ms
      later(870, () => card.classList.add("tick"));                 // check draws: 870–1270 ms
      later(2480, () => { burst(); });                              // particles: 2480 ms, 900 ms long
      later(2700, () => card.classList.add("ok"));                  // "Nice work, session saved"
      later(3450, () => { state = "done"; card.classList.remove("press"); btn.setAttribute("aria-label", "Done — tap to reset"); });
    });
    function burst() {
      if (reduce()) return;
      const sr = scr.getBoundingClientRect(), br = btn.getBoundingClientRect();
      const ox = (br.left + br.width / 2 - sr.left) / scale, oy = (br.top + br.height / 2 - sr.top) / scale;
      const cols = [C.orange, C.lime, C.purple, C.blue];
      const ps = Array.from({ length: 24 }, (_, i) => {
        const a = (i / 24) * Math.PI * 2 + (Math.random() - .5) * .5, sp = 150 + Math.random() * 150;
        return { x: ox + Math.cos(a) * 6, y: oy + Math.sin(a) * 6, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 40, r: 3.6 + Math.random() * 4.4, c: cols[i % 4] };
      });
      const t0 = performance.now(); let last = t0;
      const step = (now) => {
        const t = (now - t0) / 900, dt = Math.min(.05, (now - last) / 1000); last = now;
        ctx.setTransform(2, 0, 0, 2, 0, 0); ctx.clearRect(0, 0, 288, 628);
        if (t >= 1) return;
        for (const q of ps) {
          q.vy += 170 * dt; q.vx *= 1 - 2.6 * dt; q.vy *= 1 - 2 * dt; q.x += q.vx * dt; q.y += q.vy * dt;
          ctx.globalAlpha = t < .45 ? 1 : 1 - (t - .45) / .55; ctx.fillStyle = q.c;
          ctx.beginPath(); ctx.arc(q.x, q.y, q.r * (1 - t * .35), 0, Math.PI * 2); ctx.fill();
        }
        requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }
    wireRows(p, false);
    p._demoDone = () => btn.click();
    return p;
  }

  // shared checklist row: the ring fades, a check is drawn, the label greys (Today also strikes it through)
  function row(name, time, done = false) {
    return `<button type="button" class="row" role="checkbox" aria-checked="${done}"><span class="box"><svg viewBox="0 0 20 20"><circle class="o" cx="10" cy="10" r="7"/><path class="v" d="M5.5 10.5l3 3 6-6.5" style="${done ? "stroke-dashoffset:0" : ""}"/></svg></span><b>${name}<s style="${done ? "transform:scaleX(1)" : ""}"></s></b><time>${time}</time></button>`;
  }
  // fires on touch-down, as recorded (the ring is already moving while the finger is still on the row):
  // ring +100 ms → count +270 ms → check +330 ms → strike +390 ms → card colour +430 ms
  function wireRows(p, strike, onChange) {
    $$(".row", p).forEach((r) => {
      const toggle = () => {
        const on = r.getAttribute("aria-checked") !== "true";
        r.setAttribute("aria-checked", String(on));
        const v = $(".v", r), s = $("s", r);
        tween(on ? 210 : 150, (k) => { v.style.strokeDashoffset = String(on ? 16 * (1 - k) : 16 * k); }, { delay: on ? 330 : 0 });
        if (strike && s) tween(260, (k) => { s.style.transform = `scaleX(${on ? k : 1 - k})`; }, { delay: on ? 390 : 0 });
        onChange && onChange();
      };
      r.addEventListener("pointerdown", (e) => { if (e.button === 0) { r._down = true; toggle(); } });
      r.addEventListener("click", (e) => { if (r._down) { r._down = false; return; } toggle(); });   // keyboard / demo
    });
  }

  // =========================================================================================
  // 02 TODAY — one tick moves three things: the ring (0.4 s), the rolling count (0.2 s),
  //    and the card's colour, which steps purple → steel → mint → green → lime.
  // =========================================================================================
  const TODAY_COL = [C.purple, C.steel, C.mint, C.leaf, C.lime];
  function todayPage(initial) {
    const items = [["Water the plants", "08:30"], ["Pour-over, slowly", "09:00"], ["Write 300 words", "10:30"], ["Stretch for ten", "15:00"]];
    const p = el("section", "page today");
    p.innerHTML = `<div class="head"><h1>Today</h1><small>Wed · Oct 08</small></div>
      <div class="tcard" style="background:${TODAY_COL[initial]}"><svg class="ring" viewBox="0 0 100 100"><circle class="trk" cx="50" cy="50" r="40"/><circle class="arc" cx="50" cy="50" r="40" transform="rotate(-90 50 50)"/></svg>
        <span class="mono lab">Done today</span><span class="num"><span class="win"><i>${initial}</i></span><em>/ 4</em></span><span class="tag">Small things, daily</span></div>
      <div class="rows" style="top:297px">${items.map(([n, t], i) => row(n, t, i < initial)).join("")}</div>`;
    const card = $(".tcard", p), arc = $(".arc", p), win = $(".win", p), Cc = 2 * Math.PI * 40;
    let shown = initial, arcK = initial / 4, stopArc = () => {}, stopCol = () => {};
    arc.style.strokeDasharray = `${Cc} ${Cc}`; arc.style.strokeDashoffset = String(Cc * (1 - arcK));
    function update() {
      const n = $$(".row", p).filter((r) => r.getAttribute("aria-checked") === "true").length;
      if (n === shown) return;
      const up = n > shown, from = arcK; shown = n;
      stopArc(); stopArc = tween(400, (k) => { arcK = lerp(from, n / 4, k); arc.style.strokeDashoffset = String(Cc * (1 - arcK)); }, { delay: 100 });
      // rolling digit: the old one leaves upward, the new one comes from below (reverse when unticking)
      // a tick that lands mid-roll: drop everything but the newest digit first
      const all = $$("i", win); all.slice(0, -1).forEach((x) => x.remove());
      const old = all[all.length - 1], nu = document.createElement("i"); nu.textContent = n; win.appendChild(nu); old.style.transform = "";
      nu.style.transform = `translateY(${up ? 100 : -100}%)`;
      tween(210, (k) => { old.style.transform = `translateY(${(up ? -100 : 100) * k}%)`; nu.style.transform = `translateY(${(up ? 100 : -100) * (1 - k)}%)`; if (k >= 1) old.remove(); }, { delay: 270 });
      const c0 = getComputedStyle(card).backgroundColor.match(/\d+/g).map(Number), c1 = hex(TODAY_COL[n]);
      stopCol(); stopCol = tween(220, (k) => { card.style.background = `rgb(${c0.map((v, i) => Math.round(lerp(v, c1[i], k))).join(",")})`; }, { delay: 430 });
    }
    wireRows(p, true, update);
    return p;
  }

  // =========================================================================================
  // 03 LISTS — four cards stacked to their title rows; a tap fans them out top to bottom
  //    (0.33 s each, 90 ms apart) and a second tap folds them back the same way in reverse.
  // =========================================================================================
  function listsPage() {
    const L = [["Home", 5, "Quiet corners", "Water the plants", "Tidy the desk", C.purple], ["Work", 8, "This week", "Write 300 words", "Send the draft", C.lime],
      ["Learn", 3, "Little by little", "Read ten pages", "Practice scales", "#ffffff"], ["Travel", 6, "Someday soon", "Pack the bag", "Check the train", C.ink]];
    const p = el("section", "page lists");
    p.innerHTML = `<div class="head"><h1>Lists</h1><small>4 lists · 22 tasks</small></div>
      <button type="button" class="stack" aria-expanded="false" aria-label="Lists — tap to fan out">${L.map(([n, c, s, a, b, bg], i) => `<span class="lc${i === 2 ? " light" : ""}${i === 3 ? " ink" : ""}" style="background:${bg};top:${131 + i * 35}px;z-index:${i + 1}"><span class="lt"><b>${n}</b><em>${c}</em></span><span class="lx"><span class="mono">${s}</span><span class="li">${a}</span><span class="li dim">${b}</span></span></span>`).join("")}</button>`;
    const btn = $(".stack", p), cards = $$(".lc", p);
    let open = false; const stops = [];
    btn.addEventListener("click", () => {
      open = !open; btn.setAttribute("aria-expanded", String(open));
      stops.splice(0).forEach((s) => s());
      cards.forEach((c, i) => {
        const from = parseFloat(c.style.top), to = open ? 126 + i * 105 : 131 + i * 35, x = $(".lx", c);
        // measured: fan-out waits ~90 ms, then each card 300 ms, 100 ms apart (ends ≈ 0.7 s);
        // fold starts at once from the bottom card, 260 ms each, 100 ms apart (ends ≈ 0.46 s)
        const delay = open ? 30 + i * 100 : (3 - i) * 100;
        stops.push(tween(open ? 300 : 260, (k) => { c.style.top = `${lerp(from, to, k)}px`; }, { delay, ease: STD }));
        const o0 = parseFloat(getComputedStyle(x).opacity);
        stops.push(tween(open ? 220 : 150, (k) => { x.style.opacity = String(lerp(o0, open ? 1 : 0, k)); }, { delay: open ? delay + 40 : delay }));
      });
    });
    return p;
  }

  // =========================================================================================
  // 04 PLAN — a vertical run of four time blocks. Drag; on release the nearest one snaps to the
  //    centre line (0.45 s), filling with its colour as it nears it. Once it has settled, the
  //    timeline on the left draws a line down to the block before it and colours that dot.
  // =========================================================================================
  const PLAN = [["Morning", "07:00", "Slow start", C.purple, .72], ["Noon", "12:00", "Deep work", C.lime, .4], ["Afternoon", "15:30", "Walk outside", C.orange, .55], ["Evening", "20:00", "Wind down", C.blue, .18]];
  function planPage() {
    const P = 146, TOP = 136, LINE = 327, H = 130;          // slot pitch, viewport top, centre line, card height
    const p = el("section", "page plan");
    p.innerHTML = `<div class="head"><h1>Plan</h1><small>4 parts · 1 day</small></div>
      <div class="pv" tabindex="0" role="listbox" aria-label="Day plan — drag or use arrow keys"><span class="guide l"></span><span class="guide r"></span><span class="track"></span><span class="drawn"></span>
        ${PLAN.map(([t, h, n, , pc], i) => `<div class="pc" role="option" aria-selected="${i === 0}" data-i="${i}"><span class="ph"><span class="mono">${t}</span><b class="tnum">${h}</b></span><b class="pn">${n}</b><span class="pb"><i style="width:${pc * 100}%"></i></span></div><span class="pd" data-i="${i}"></span>`).join("")}</div>`;
    const pv = $(".pv", p), cards = $$(".pc", p), dots = $$(".pd", p), drawn = $(".drawn", p), track = $(".track", p);
    let s = 0, active = 0, done = 0, drawK = 0, anim = () => {};
    const maxS = (PLAN.length - 1) * P;
    const cy = (i) => LINE + i * P - s;                     // centre of card i on screen
    function paint() {
      cards.forEach((c, i) => {
        const y = cy(i), k = clamp(1 - Math.abs(y - LINE) / P, 0, 1), col = PLAN[i][3], blue = col === C.blue;
        const ch = 120 + 10 * k; c.style.height = `${ch}px`; c.style.width = `${198 + 17 * k}px`;
        c.style.transform = `translateY(${y - TOP - ch / 2}px)`;
        c.style.background = mix(C.sand, col, k);
        c.style.color = blue ? mix("#3e3c40", "#ffffff", k) : mix("#3e3c40", C.ink, k);
        c.style.setProperty("--bar", blue ? mix("#3e3c40", "#ffffff", k) : mix("#4a484b", C.ink, k));
        c.style.setProperty("--trk", blue ? `rgba(255,255,255,${.12 + .2 * k})` : `rgba(18,16,19,${.08 + .04 * k})`);
        dots[i].style.transform = `translateY(${y - TOP - 7}px)`;
        const on = i <= drawK + 1e-3;
        dots[i].style.background = on ? col : "#d9d6d6";
        dots[i].style.boxShadow = on ? `0 0 0 3.5px ${col}55` : "0 0 0 3px #f9f8f8";
      });
      drawn.style.transform = `translateY(${cy(0) - TOP}px)`; track.style.transform = `translateY(${cy(0) - TOP}px)`;   // the dotted track starts at the first dot
      drawn.style.height = `${drawK * P}px`;
    }
    function settle(i) {
      active = i; cards.forEach((c, k) => c.setAttribute("aria-selected", String(k === i)));
      const target = Math.max(0, i - 1), from = drawK;          // "card settles first, then the line is drawn"
      if (target !== done) { done = target; tween(320, (k) => { drawK = lerp(from, target, k); paint(); }, { delay: 120 }); }
    }
    function snapTo(i, ms = 450) {
      i = clamp(i, 0, PLAN.length - 1); const from = s, to = i * P; anim();
      if (reduce()) { s = to; paint(); settle(i); return; }
      anim = tween(ms, (k) => { s = lerp(from, to, k); paint(); if (k >= 1) settle(i); });
    }
    // drag with rubber band past either end; release projects the flick 0.25 s ahead and picks the nearest slot
    let drag = null;
    pv.addEventListener("pointerdown", (e) => { anim(); drag = { y: e.clientY, s, t: performance.now(), v: 0, moved: false, from: active }; pv.setPointerCapture(e.pointerId); });
    pv.addEventListener("pointermove", (e) => {
      if (!drag) return; const now = performance.now(), dy = (e.clientY - drag.y) / scale;
      if (Math.abs(dy) > 3) drag.moved = true;
      let raw = drag.s - dy; if (raw < 0) raw = -rubber(-raw); else if (raw > maxS) raw = maxS + rubber(raw - maxS);
      const dt = Math.max(1, now - drag.t); drag.v = .8 * ((raw - s) / dt) + .2 * drag.v; drag.t = now; s = raw; paint();
    });
    const end = () => { if (!drag) return; const proj = s + drag.v * 250, from = drag.from; drag = null; snapTo(clamp(Math.round(proj / P), from - 1, from + 1)); };   // one block per flick, as recorded
    pv.addEventListener("pointerup", end); pv.addEventListener("pointercancel", end);
    let wheelT = 0;
    pv.addEventListener("wheel", (e) => { e.preventDefault(); anim(); s = clamp(s + e.deltaY, -40, maxS + 40); paint(); clearTimeout(wheelT); wheelT = setTimeout(() => snapTo(Math.round(s / P)), 140); }, { passive: false });
    pv.addEventListener("keydown", (e) => { const d = { ArrowDown: 1, ArrowUp: -1 }[e.key]; if (d) { e.preventDefault(); snapTo(active + d); } });
    cards.forEach((c, i) => c.addEventListener("click", () => { if (!drag && i !== active) snapTo(i); }));
    const rubber = (x) => (1 - 1 / (x * .55 / 120 + 1)) * 120;
    paint();
    // for the recording: a hand-like drag that goes through the same snapping
    p._demoFlick = (to, ms = 520) => { anim(); const from = s, dest = to * P + (to > active ? 26 : -26); anim = tween(ms, (k) => { s = lerp(from, dest, k); paint(); if (k >= 1) snapTo(to); }, { ease: bezier(.35, 0, .6, 1) }); };
    return p;
  }

  // =========================================================================================
  // 05 REMIND — two wheels. A flick keeps turning and slows down (iOS deceleration 0.998/ms),
  //    lands on a notch, and runs past either end like a rubber band before springing back.
  // =========================================================================================
  function remindPage() {
    const p = el("section", "page remind");
    const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0")), MINS = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, "0"));
    p.innerHTML = `<div class="head"><h1>Remind</h1><small>Set a time</small></div>
      <span class="mono rlab">Write 300 words</span><b class="rtime tnum" aria-live="polite">09:30</b>
      <div class="picker"><span class="band"></span><span class="colon">:</span>
        <div class="wheel" data-w="h" tabindex="0" role="spinbutton" aria-label="Hour"></div><div class="wheel" data-w="m" tabindex="0" role="spinbutton" aria-label="Minute"></div></div>
      <button type="button" class="remindme">Remind me</button>`;
    const out = $(".rtime", p), btn = $(".remindme", p);
    let wheels = null;
    wheels = [mkWheel($('[data-w="h"]', p), HOURS, 9), mkWheel($('[data-w="m"]', p), MINS, 6)]; readout();
    function readout() { if (!wheels) return; out.textContent = `${HOURS[clamp(Math.round(wheels[0].pos), 0, 23)]}:${MINS[clamp(Math.round(wheels[1].pos), 0, 11)]}`; }
    function mkWheel(w, vals, start) {
      const ROW = 39, CY = 110.5, N = vals.length;
      w.innerHTML = vals.map((v) => `<span class="tnum">${v}</span>`).join("");
      const spans = $$("span", w), W = { pos: start }; let v = 0, raf = 0, mode = "idle", target = start;
      function paint() {
        spans.forEach((sp, i) => {
          const d = Math.abs(i - W.pos);
          if (d > 2.9) { sp.style.visibility = "hidden"; return; }
          sp.style.visibility = "";
          const size = d < 1 ? lerp(32, 24, d) : lerp(24, 19, Math.min(1, d - 1)), sc = size / 32;
          sp.style.transform = `translateY(${CY + (i - W.pos) * ROW - 19}px) scale(${sc})`;
          sp.style.color = d < 1 ? mix(C.ink, "#59575a", d) : mix("#59575a", "#c6c4c7", Math.min(1, d - 1));
          sp.style.fontWeight = d < .5 ? "800" : "500";
          sp.style.opacity = String(d > 2.2 ? clamp((2.9 - d) / .7, 0, 1) : 1);
        });
        w.setAttribute("aria-valuenow", vals[clamp(Math.round(W.pos), 0, N - 1)]);
        readout();
      }
      const edge = (x) => (x < 0 ? -x : x > N - 1 ? N - 1 - x : 0);
      function run() {                                   // momentum → (rubber band) → notch
        cancelAnimationFrame(raf); let last = performance.now();
        const step = (now) => {
          const dt = Math.min(32, now - last); last = now; const o = edge(W.pos);
          if (mode === "fling") {
            if (o) { v += (o * .0003 - v * .04) * dt; }         // past an end: a spring pulls back, heavy damping
            else v *= Math.pow(.998, dt);                        // inside: iOS normal deceleration
            W.pos += v * dt;
            if (!edge(W.pos) && Math.abs(v) < .0035) { mode = "snap"; target = clamp(Math.round(W.pos + v * 120), 0, N - 1); v *= .5; }
            if (o && Math.abs(v) < .0006 && Math.abs(o) < .02) { mode = "snap"; target = clamp(Math.round(W.pos), 0, N - 1); }
          } else if (mode === "snap") {                          // critically damped spring onto the notch (~0.3 s)
            const k = .00028, c = 2 * Math.sqrt(k);
            v += (k * (target - W.pos) - c * v) * dt; W.pos += v * dt;
            if (Math.abs(target - W.pos) < .002 && Math.abs(v) < .0002) { W.pos = target; mode = "idle"; paint(); return; }
          }
          paint(); raf = requestAnimationFrame(step);
        };
        raf = requestAnimationFrame(step);
      }
      let drag = null;
      w.addEventListener("pointerdown", (e) => { cancelAnimationFrame(raf); mode = "idle"; drag = { y: e.clientY, p: W.pos, t: performance.now(), v: 0, raw: W.pos }; w.setPointerCapture(e.pointerId); });
      w.addEventListener("pointermove", (e) => {
        if (!drag) return; const now = performance.now(); let raw = drag.p - (e.clientY - drag.y) / scale / ROW;
        const dt = Math.max(1, now - drag.t); drag.v = .75 * ((raw - drag.raw) / dt) + .25 * drag.v; drag.raw = raw; drag.t = now;
        if (raw < 0) raw = -band(-raw); else if (raw > N - 1) raw = N - 1 + band(raw - N + 1);   // rubber band while dragging
        W.pos = raw; paint();
      });
      const end = (e) => {
        if (!drag) return; const moved = Math.abs(drag.raw - drag.p) > .1;
        if (!moved) { const r = w.getBoundingClientRect(); const yy = (e.clientY - r.top) / scale; target = clamp(Math.round(W.pos + (yy - CY) / ROW), 0, N - 1); mode = "snap"; v = 0; drag = null; run(); return; }
        v = performance.now() - drag.t > 90 ? 0 : clamp(drag.v, -.06, .06); drag = null; mode = "fling"; run();
      };
      w.addEventListener("pointerup", end); w.addEventListener("pointercancel", end);
      w.addEventListener("wheel", (e) => { e.preventDefault(); cancelAnimationFrame(raf); mode = "idle"; W.pos = clamp(W.pos + e.deltaY / ROW, -.4, N - .6); paint(); clearTimeout(w._t); w._t = setTimeout(() => { target = clamp(Math.round(W.pos), 0, N - 1); mode = "snap"; v = 0; run(); }, 120); }, { passive: false });
      w.addEventListener("keydown", (e) => { const d = { ArrowDown: 1, ArrowUp: -1 }[e.key]; if (d) { e.preventDefault(); target = clamp(Math.round(W.pos) + d, 0, N - 1); mode = "snap"; v = 0; run(); } });
      const band = (x) => (1 - 1 / (x * .55 / 1.4 + 1)) * 1.4;
      W.fling = (vel) => { cancelAnimationFrame(raf); v = vel; mode = "fling"; run(); };   // for the recording
      paint(); return W;
    }
    btn.addEventListener("click", () => { btn.textContent = `Set for ${out.textContent}`; clearTimeout(btn._t); btn._t = setTimeout(() => (btn.textContent = "Remind me"), 1600); });
    p._wheels = wheels;
    return p;
  }

  // =========================================================================================
  // HABITS — the dark page the circle transition opens onto
  // =========================================================================================
  function habitsPage() {
    const grid = ["LLL.LL.", "LLLL.LL", "LLL.LLL", "LO....."];
    const p = el("section", "page habits dark");
    p.innerHTML = `<div class="head"><h1>Habits</h1><small>12 day streak</small></div><b class="streak tnum">12</b><span class="days">days in a row</span>
      <div class="dots">${grid.join("").split("").map((c) => `<i class="${c === "L" ? "on" : c === "O" ? "today" : ""}"></i>`).join("")}</div>
      <div class="hb">${[["Read ten pages", .78, C.purple], ["Stretch for ten", .55, C.lime], ["Lights out by 11", .32, C.orange]].map(([n, k, c]) => `<span>${n}<i><b style="width:${k * 100}%;background:${c}"></b></i></span>`).join("")}</div>`;
    return p;
  }

  // =========================================================================================
  // 06 TABS — the next page grows as a circle from where the finger lands (0.55 s), a thin blue
  //    ring running ahead of it; going back, the old page grows back out of that tab the same way.
  // =========================================================================================
  function go(i, x, y) {
    if (i === cur || busy) return;
    const tabs = $$(".tabbar button", scr), from = pages[cur], to = pages[i];
    if (x == null) { const r = tabs[i].getBoundingClientRect(), sr = scr.getBoundingClientRect(); x = (r.left + r.width / 2 - sr.left) / scale; y = (r.top + r.height / 2 - sr.top) / scale; }
    busy = true;
    const rip = $(".ripple", scr);
    if (!reduce()) rip.animate([{ width: "0px", height: "0px", left: `${x}px`, top: `${y}px`, margin: "0px", opacity: 1 }, { width: "84px", height: "84px", left: `${x}px`, top: `${y}px`, margin: "-42px", opacity: .9, offset: .4 }, { width: "150px", height: "150px", left: `${x}px`, top: `${y}px`, margin: "-75px", opacity: 0 }], { duration: 760, easing: "cubic-bezier(.2,.7,.2,1)" });
    const start = () => {
      tabs.forEach((b, k) => b.setAttribute("aria-selected", String(k === i)));
      to.hidden = false; to.classList.add("reveal");
      const R = Math.hypot(Math.max(x, 288 - x), Math.max(y, 628 - y)) + 2;
      const done = () => { from.hidden = true; to.classList.remove("reveal"); to.style.clipPath = ""; cur = i; busy = false; };
      setTimeout(() => scr.classList.toggle("dark", to.classList.contains("dark")), reduce() ? 0 : 200);
      if (reduce()) { done(); return; }
      const a = to.animate([{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${R}px at ${x}px ${y}px)` }], { duration: 550, easing: "cubic-bezier(.25,.6,.3,1)" });
      a.onfinish = done;
    };
    reduce() ? start() : setTimeout(start, 210);                // the ring leads; the page follows ~0.2 s later
  }

  // =========================================================================================
  function el(tag, cls) { const n = document.createElement(tag); n.className = cls; return n; }
  function boot({ first = "today", tab = 0, todayInit = 2, demo = [] } = {}) {
    scr = $("#screen");
    const firstPage = first === "focus" ? focusPage() : first === "remind" ? remindPage() : todayPage(todayInit);
    pages = [firstPage, listsPage(), planPage(), habitsPage()];
    scr.innerHTML = `<div class="status"><span>9:41</span><i></i></div><span class="ripple"></span>
      <nav class="tabbar" role="tablist">${["check", "lists", "plan", "habits"].map((k, i) => `<button type="button" role="tab" aria-label="${["Today", "Lists", "Plan", "Habits"][i]}" aria-selected="${i === tab}">${svg(k)}</button>`).join("")}</nav><span class="homebar"></span>`;
    pages.forEach((p, i) => { p.hidden = i !== tab; scr.prepend(p); });
    cur = tab; scr.classList.toggle("dark", pages[tab].classList.contains("dark"));
    $$(".tabbar button", scr).forEach((b, i) => b.addEventListener("click", (e) => { const [x, y] = e.detail ? screenXY(e) : [null, null]; go(i, x, y); }));
    const fitEl = $("#fit");
    const fit = () => { scale = Math.min(1, (innerHeight - 24) / 640, (innerWidth - 24) / 300); fitEl.style.setProperty("--s", scale); };
    addEventListener("resize", fit); fit();
    // ?demo: the recording's timetable; a real touch cancels it
    if (/[?&]demo\b/.test(location.search)) {
      const ids = demo.map(([ms, fn]) => setTimeout(() => fn({ pages, go, $, $$, scr }), ms));
      addEventListener("pointerdown", (e) => { if (e.isTrusted) ids.forEach(clearTimeout); }, { once: true, capture: true });
    }
    return { pages, go };
  }
  return { boot };
})();
