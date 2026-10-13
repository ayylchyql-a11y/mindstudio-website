/* M Alpha Relax — the app's five screens rebuilt from its SwiftUI source (HomeView, SessionView, MixerView,
   StatsView, SettingsView + NeuComponents). Every size below is the app's own point value. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const dev = $("#dev"), pagesEl = $("#pages"), A = window.ARAudio, St = window.ARStats, S = window.ARStrings;
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  // ---------- language: the lab passes its own (?lang=, the iframe is sandboxed so it can't read the parent);
  //            opened directly it follows the browser. Any language the app has a table for; the rest get English.
  //            (Arabic would need the whole layout mirrored, as the app does, so it falls back to English here.) ----------
  const LANGS = { zh: "简体中文", "zh-tw": "繁體中文", en: "English", ja: "日本語", ko: "한국어", fr: "Français", de: "Deutsch", es: "Español", pt: "Português", ru: "Русский", it: "Italiano" };
  const TAG = { zh: "zh-CN", "zh-tw": "zh-TW", pt: "pt-BR" };
  const norm = (l) => { l = String(l || "").toLowerCase(); if (/^zh-(tw|hk|mo|hant)/.test(l)) return "zh-tw"; const b = l.split("-")[0]; return LANGS[b] ? b : "en"; };
  let langPref = null;
  const sysLang = () => { const q = new URLSearchParams(location.search).get("lang"); return norm(q || navigator.language); };
  const lang = () => langPref || sysLang();
  const tag = () => TAG[lang()] || lang();
  const t = (k, ...a) => { const l = lang(); let s = l === "zh" ? k : (S[l]?.[k] ?? S.en[k] ?? k); a.forEach((v) => (s = s.replace("%lld", v))); return s; };

  // ---------- icons ----------
  const FILLED = new Set(["play", "pause", "moon", "leaf", "star", "flame", "moonStar", "hand"]);
  const ic = (n, extra = "") => {
    if (n === "zzz") return `<svg class="i ${extra}" viewBox="0 0 24 24"><path d="M3 9h7l-7 8h7M13 4h5l-5 6h5M17 13h4l-4 5h4" stroke-width="2.4"/></svg>`;
    if (n === "pauseF") return `<svg class="i fill ${extra}" viewBox="0 0 24 24"><rect x="5" y="4" width="5" height="16" rx="1.6"/><rect x="14" y="4" width="5" height="16" rx="1.6"/></svg>`;
    return `<svg class="i ${FILLED.has(n) ? "fill" : ""} ${extra}" viewBox="0 0 24 24">${window.ARIcons[n] || ""}</svg>`;
  };

  // ---------- model (Presets.swift) ----------
  const PROGRAMS = [
    { id: "deepRelax", key: "深度放松", sym: "wind", mode: "binaural", carrier: 200, kf: [[0, 10]], mins: 30 },
    { id: "focus", key: "专注", sym: "target", mode: "binaural", carrier: 200, kf: [[0, 10], [600, 12]], mins: 45 },
    { id: "sleep", key: "入睡", sym: "moon", mode: "binaural", carrier: 180, kf: [[0, 10], [600, 8], [1500, 6], [2400, 4]], mins: 40 },
    { id: "meditation", key: "冥想", sym: "leaf", mode: "isochronic", carrier: 200, kf: [[0, 8]], mins: 20 },
    { id: "nap", key: "小憩", sym: "zzz", mode: "binaural", carrier: 200, kf: [[0, 10], [480, 6], [960, 10]], mins: 20 },
  ];
  const AMBIENT = ["whiteNoise", "pinkNoise", "rain", "ocean", "campfire", "wind", "stream"];
  const AMB_NAME = { whiteNoise: "白噪音", pinkNoise: "粉噪音", rain: "雨声", ocean: "海浪", campfire: "篝火", wind: "风声", stream: "溪流" };
  const BANDS = [{ key: "δ 睡眠", lo: .5, hi: 4, target: 2 }, { key: "θ 冥想", lo: 4, hi: 8, target: 6 }, { key: "α 放松", lo: 8, hi: 13.5, target: 10 }, { key: "β 专注", lo: 13.5, hi: 30.5, target: 18 }];
  const MODE_NAME = { binaural: "双耳节拍", isochronic: "等时音调" };

  const prefs = { appearance: "system", endChime: true, breathingGuide: true, splash: true, lastProgram: "deepRelax", lastProgress: .4, sceneMins: {}, weeklyGoal: 5 };
  const engine = { mode: "binaural", carrier: 200, beat: 8, volume: .68, amb: { whiteNoise: 0, pinkNoise: 0, rain: .55, ocean: 0, campfire: 0, wind: 0, stream: 0 }, playing: false, freeEnd: null, freeStart: 0, active: null };
  let mixes = [{ id: 1, key: "深夜专注", beat: 14, carrier: 200, mode: "binaural", mins: 45 }, { id: 2, key: "晨间冥想", beat: 8, carrier: 200, mode: "isochronic", mins: 20 }];
  const mixName = (m) => (m.key ? t(m.key) : m.name);
  const records = St.seed();
  let tab = "home", range = "week";
  A.set({ mode: engine.mode, carrier: engine.carrier, beat: engine.beat, brainVol: engine.volume, amb: engine.amb });

  const progMins = (p) => prefs.sceneMins[p.id] ?? p.mins;
  const heroProg = () => PROGRAMS.find((p) => p.id === prefs.lastProgram) || PROGRAMS[0];
  const fmt = (sec) => { sec = Math.max(0, Math.round(sec)); return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`; };
  const hz = (v) => (v % 1 === 0 ? String(v) : v.toFixed(1));

  // ---------- theme ----------
  const darkMQ = matchMedia("(prefers-color-scheme: dark)");
  function applyTheme() {
    const dark = prefs.appearance === "dark" || (prefs.appearance === "system" && darkMQ.matches);
    dev.dataset.theme = dark ? "dark" : "light";
    document.body.classList.toggle("dark-page", dark);
  }
  darkMQ.addEventListener?.("change", applyTheme);

  // ---------- fit the 440 × 956 device ----------
  const fitEl = $("#fit");
  function fit() {
    const s = Math.min(1, (innerHeight - 40) / 980, (innerWidth - 32) / 464);
    fitEl.style.setProperty("--s", s); dev.style.setProperty("--s", s);
    fitEl.style.margin = `${12 * s}px`;
  }
  addEventListener("resize", fit);

  // ---------- small UI kit ----------
  const toastEl = $("#toast"); let toastT = 0;
  function toast(msg) { toastEl.textContent = msg; toastEl.classList.add("on"); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("on"), 1600); }

  function seg(items, sel, onPick, cls = "") {
    const i = items.findIndex((x) => x.v === sel);
    return `<div class="seg ${cls}" data-seg>${`<span class="knob" style="width:calc((100% - 12px) / ${items.length});left:6px;transform:translateX(${i * 100}%)"></span>`}${items.map((x) => `<button type="button" data-v="${x.v}" aria-pressed="${x.v === sel}">${esc(x.label)}</button>`).join("")}</div>`;
  }
  function wireSeg(root, onPick) {
    $$("[data-seg]", root).forEach((el) => el.addEventListener("click", (e) => {
      const b = e.target.closest("button"); if (!b) return;
      const btns = $$("button", el), i = btns.indexOf(b);
      const ok = onPick(b.dataset.v, el); if (ok === false) return;
      btns.forEach((x, k) => x.setAttribute("aria-pressed", String(k === i)));
      $(".knob", el).style.transform = `translateX(${i * 100}%)`;
      fitText(el);                                                         // the selected label turns bold → wider
    }));
  }
  const tgl = (on, key) => `<button type="button" class="tgl" role="switch" aria-checked="${on}" data-tgl="${key}"></button>`;
  const chip = (mins, attr) => `<button type="button" class="chip press" ${attr}>${ic("timer")}${esc(t("%lld 分钟", mins))}</button>`;
  const conic = (f, size = "") => `background:conic-gradient(var(--accent) 0 ${f * 100}%, var(--track) ${f * 100}% 100%)${size}`;

  // pressable: raised → inset while pressed (150 ms) — :active alone misses touch on iOS
  dev.addEventListener("pointerdown", (e) => { const p = e.target.closest(".press"); if (p) { p.classList.add("down"); const up = () => { p.classList.remove("down"); removeEventListener("pointerup", up); removeEventListener("pointercancel", up); }; addEventListener("pointerup", up); addEventListener("pointercancel", up); } });

  // =====================================================================================
  // HOME (2a): greeting · daily ring · "continue" hero · 2×2 scenes · my presets
  // =====================================================================================
  const greet = () => { const h = new Date().getHours(); return h >= 5 && h < 12 ? "早上好" : h < 18 && h >= 12 ? "下午好" : h >= 18 && h < 23 ? "晚上好" : "夜深了"; };
  const dateStr = () => { const d = new Date(); return /^zh/.test(lang()) ? `${d.getMonth() + 1}月${d.getDate()}日` : d.toLocaleDateString(tag(), { month: "short", day: "numeric" }); };
  function todayMinutes() { const d0 = St.startOfDay(Date.now()); return records.filter((r) => r.start >= d0).reduce((a, r) => a + r.dur, 0) / 60; }

  function renderHome() {
    const hero = heroProg(), grid = PROGRAMS.filter((p) => p.id !== hero.id), f = Math.min(1, todayMinutes() / 30);
    const p = Math.min(Math.max(prefs.lastProgress, 0), 1);
    page.home.innerHTML = `
      <div class="hd"><div><small>${esc(dateStr())} · ${esc(t(greet()))}</small><h1>${esc(t("今天想进入哪种状态？"))}</h1></div>
        <span class="ring" title="${Math.round(todayMinutes())} / 30 min"><i style="${conic(f)}"></i></span></div>
      <div class="hero"><div class="top"><div><small>${esc(t("继续上次"))}</small><b>${esc(t(hero.key))}</b>
          <div class="meta">${esc(t(MODE_NAME[hero.mode]))} · ${hero.kf[0][1]} Hz ${chip(progMins(hero), `data-dur="${hero.id}"`)}</div></div>
          <button type="button" class="grad-btn play" data-start="${hero.id}" aria-label="Play">${ic("play")}</button></div>
        <div class="bar"><i style="width:${p * 100}%"></i></div></div>
      <div class="grid2">${grid.map((g) => `<div role="button" tabindex="0" class="scene press big" data-start="${g.id}"><span class="ic">${ic(g.sym)}</span><b>${esc(t(g.key))}</b><span class="meta">${g.kf[g.kf.length - 1][1]} Hz ${chip(progMins(g), `data-dur="${g.id}"`)}</span></div>`).join("")}</div>
      ${mixes.length ? `<p class="sec-label">${esc(t("我的预设"))}</p><div class="grid2" style="margin-top:12px">${mixes.map((m) => `<div role="button" tabindex="0" class="scene press big" data-mix="${m.id}"><span class="ic">${ic("sliders")}</span><b>${esc(mixName(m))}</b><span class="meta">${hz(m.beat)} Hz ${chip(m.mins, `data-mixdur="${m.id}"`)}</span></div>`).join("")}</div>` : ""}`;
  }
  function wireHome() {
    page.home.addEventListener("click", (e) => {
      const d = e.target.closest("[data-dur]"), md = e.target.closest("[data-mixdur]");
      if (d) { e.stopPropagation(); const p = PROGRAMS.find((x) => x.id === d.dataset.dur); openDuration(progMins(p), (m) => { prefs.sceneMins[p.id] = m; renderHome(); }); return; }
      if (md) { e.stopPropagation(); const m = mixes.find((x) => x.id == md.dataset.mixdur); openDuration(m.mins, (v) => { m.mins = v; renderHome(); }); return; }
      const s = e.target.closest("[data-start]"); if (s) { const p = PROGRAMS.find((x) => x.id === s.dataset.start); openSession(p, progMins(p)); return; }
      const mx = e.target.closest("[data-mix]"); if (mx && !mx._long) { const m = mixes.find((x) => x.id == mx.dataset.mix); openSession({ id: "mix" + m.id, key: mixName(m), mix: true, mode: m.mode, carrier: m.carrier, kf: [[0, m.beat]], mins: m.mins }, m.mins); }
    });
    page.home.addEventListener("keydown", (e) => { if ((e.key === "Enter" || e.key === " ") && e.target.matches(".scene")) { e.preventDefault(); e.target.click(); } });
    // long-press / right-click on a preset: rename · delete (the app's context menu)
    let lt = 0;
    page.home.addEventListener("pointerdown", (e) => { const mx = e.target.closest("[data-mix]"); if (!mx) return; mx._long = false; lt = setTimeout(() => { mx._long = true; mixMenu(mx); }, 520); });
    ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => page.home.addEventListener(ev, () => clearTimeout(lt)));
    page.home.addEventListener("contextmenu", (e) => { const mx = e.target.closest("[data-mix]"); if (mx) { e.preventDefault(); mx._long = true; mixMenu(mx); } });
  }
  function mixMenu(card) {
    const m = mixes.find((x) => x.id == card.dataset.mix);
    menu(card, [
      { label: t("重命名"), icon: "pencil", run: () => openName(t("重命名预设"), mixName(m), (n) => { m.name = n; delete m.key; renderHome(); }) },
      { label: t("删除"), icon: "trash", del: true, run: () => { mixes = mixes.filter((x) => x !== m); renderHome(); } },
    ]);
    setTimeout(() => (card._long = false), 400);
  }

  // =====================================================================================
  // SESSION (2b): band badge · three breathing circles · countdown · -5m / play-pause / close
  // =====================================================================================
  const cover = $("#cover"); let ses = null;
  const bandName = (b) => (b < 4 ? "DELTA" : b < 8 ? "THETA" : b <= 13 ? "ALPHA" : "BETA");
  function beatAt(prog, elapsed) {            // keyframes ramp linearly between offsets
    const k = prog.kf; if (elapsed <= k[0][0]) return k[0][1];
    for (let i = 1; i < k.length; i++) if (elapsed < k[i][0]) { const [t0, b0] = k[i - 1], [t1, b1] = k[i]; return b0 + (b1 - b0) * (elapsed - t0) / (t1 - t0); }
    return k[k.length - 1][1];
  }
  function openSession(prog, mins) {
    const chosen = mins * 60;
    ses = { prog, chosen, remaining: chosen, elapsed: 0, playing: true, appear: performance.now(), last: performance.now(), started: Date.now(), raf: 0 };
    engine.active = prog;
    A.set({ mode: prog.mode, carrier: prog.carrier, beat: beatAt(prog, 0), brainVol: Math.max(engine.volume, .5) });
    A.start();
    cover.innerHTML = `<span class="badge" id="sBadge"></span><h2>${esc(prog.mix ? prog.key : t(prog.key))}</h2>
      <div class="breath"><span class="b1"></span><span class="b2"></span><span class="b3"><span><span id="sPh"></span><em id="sSec"></em></span></span></div>
      <button type="button" class="count" id="sCount"><b id="sRem"></b><span id="sTot"></span></button>
      <div class="bar"><i id="sBar"></i></div>
      <div class="ctrls"><button type="button" class="sm press" id="sMinus">-5m</button>
        <button type="button" class="grad-btn big" id="sPlay" aria-label="Pause">${ic("pauseF")}</button>
        <button type="button" class="sm press" id="sClose" aria-label="Close">${ic("x")}</button></div>`;
    cover.setAttribute("aria-hidden", "false"); cover.classList.add("on"); syncFloat();
    $("#sMinus").onclick = () => { ses.remaining = Math.max(60, ses.remaining - 300); ses.chosen = ses.elapsed + ses.remaining; paintSession(); };
    $("#sPlay").onclick = () => { ses.playing = !ses.playing; ses.playing ? A.resume() : A.pause(); $("#sPlay").innerHTML = ses.playing ? ic("pauseF") : ic("play"); $("#sPlay").setAttribute("aria-label", ses.playing ? "Pause" : "Play"); };
    $("#sClose").onclick = () => finishSession(false);
    $("#sCount").onclick = () => openDuration(Math.max(1, Math.floor(ses.remaining / 60)), (m) => { ses.remaining = m * 60; ses.chosen = ses.elapsed + ses.remaining; paintSession(); });
    loop();
  }
  // 8 s breath: 0–3.6 inhale, 3.6–4.4 hold, 4.4–8 exhale; scale 1 → 1.14 → 1 on a cosine; the core lags 2 s
  const scaleAt = (tt) => { const ph = ((tt % 8) + 8) % 8; return 1 + .07 * (1 - Math.cos(2 * Math.PI * ph / 8)); };
  function loop() {
    if (!ses) return;
    const now = performance.now(), dt = (now - ses.last) / 1000; ses.last = now;
    if (ses.playing) { ses.elapsed += dt; ses.remaining -= dt; A.set({ beat: beatAt(ses.prog, ses.elapsed) }); }
    const tt = (now - ses.appear) / 1000, still = !ses.playing || reduce();
    const [b1, b2, b3] = $$(".breath > span", cover);
    b1.style.transform = b2.style.transform = `scale(${still ? 1 : scaleAt(tt)})`;
    b3.style.transform = `scale(${still ? 1 : scaleAt(tt - 2)})`;
    const ph = ((tt % 8) + 8) % 8;
    $("#sPh").textContent = prefs.breathingGuide ? t(ph < 3.6 ? "吸气" : ph < 4.4 ? "屏息" : "呼气") : "";
    $("#sSec").textContent = prefs.breathingGuide && !(ph >= 3.6 && ph < 4.4) ? t("%lld 秒", 4) : "";
    paintSession();
    if (ses.remaining <= 0) return finishSession(true);
    ses.raf = requestAnimationFrame(loop);
  }
  function paintSession() {
    const b = beatAt(ses.prog, ses.elapsed);
    $("#sBadge").textContent = `${bandName(b)} · ${hz(Math.round(b * 10) / 10)} HZ`;
    $("#sRem").textContent = fmt(ses.remaining); $("#sTot").textContent = `/ ${fmt(ses.chosen)}`;
    $("#sBar").style.width = `${Math.min(Math.max(1 - ses.remaining / Math.max(ses.chosen, 1), 0), 1) * 100}%`;
  }
  function finishSession(completedNaturally) {
    if (!ses) return;
    cancelAnimationFrame(ses.raf);
    const s = ses; ses = null; engine.active = null;
    A.stop(); if (engine.playing) setTimeout(() => { A.set({ mode: engine.mode, carrier: engine.carrier, beat: engine.beat, brainVol: engine.volume }); A.start(); }, 460);
    const done = s.elapsed >= s.chosen - 1;
    if (s.elapsed >= 1) records.push({ start: s.started, dur: Math.round(s.elapsed), completed: done, name: s.prog.mix ? s.prog.key : s.prog.key, beat: beatAt(s.prog, s.elapsed), mode: s.prog.mode, carrier: s.prog.carrier, brain: engine.volume, amb: { ...engine.amb } });
    if (!s.prog.mix) { prefs.lastProgram = s.prog.id; prefs.lastProgress = Math.min(Math.max(s.elapsed / Math.max(s.chosen, 1), 0), 1); }
    if (done && completedNaturally && prefs.endChime) A.chime();
    cover.classList.remove("on"); cover.setAttribute("aria-hidden", "true");
    renderHome(); renderStats(); syncFloat();
  }

  // =====================================================================================
  // MIXER (2c): mode segmented · frequency card · ambient knobs · headphone banner · start/stop
  // =====================================================================================
  let dragging = false, pendingMixer = false;
  function renderMixer() {
    if (dragging) { pendingMixer = true; return; }
    const inactive = engine.volume === 0, band = (b) => engine.beat >= b.lo && engine.beat < b.hi;
    page.mixer.innerHTML = `
      <div class="mx-hd"><h1 class="h-title">${esc(t("混音器"))}</h1><button type="button" class="round52 press" id="saveMix" aria-label="Save preset">${ic("download")}</button></div>
      <div class="stack" style="margin-top:20px">
        ${seg([{ v: "binaural", label: t("双耳节拍") }, { v: "isochronic", label: t("等时音调") }], engine.mode)}
        <div class="card">
          ${inactive ? `<div class="muted-note">${ic("mute")}${esc(t("脑波已关闭,频率暂不生效"))}</div>` : ""}
          <div class="freq ${inactive ? "off" : ""}">
            <div class="blk"><div class="row"><span class="card-t">${esc(t("载波频率"))}</span><span class="v" id="vCar">${Math.round(engine.carrier)} Hz</span></div><div class="sld" data-sld="carrier" data-min="100" data-max="400" data-step="1"></div></div>
            <div class="blk"><div class="row"><span class="card-t">${esc(t("节拍频率"))}</span><span class="v" id="vBeat">${engine.beat.toFixed(1)} Hz</span></div>
              <div class="bands">${BANDS.map((b) => `<button type="button" data-band="${b.target}" aria-pressed="${band(b)}">${esc(t(b.key))}</button>`).join("")}</div>
              <div class="sld" data-sld="beat" data-min="0.5" data-max="30" data-step="0.5"></div></div>
          </div>
        </div>
        <div class="card"><div class="knobs">${["brainwave", ...AMBIENT].map(knobHTML).join("")}</div></div>
        ${engine.mode === "binaural" && engine.volume > 0 ? `<div class="warn">${ic("headphones")}<span>${esc(t("双耳节拍需要佩戴耳机才有效果"))}</span></div>` : ""}
        ${engine.playing ? `<button type="button" class="timer-row press" id="timerRow">${ic("timer")}<b>${esc(t("定时停止"))}</b><span id="timerVal">${engine.freeEnd ? fmt((engine.freeEnd - Date.now()) / 1000) : esc(t("关闭"))}</span></button>` : ""}
      </div><div style="height:90px"></div>`;
    $$(".sld", page.mixer).forEach(slider);
    $$("[data-knob]", page.mixer).forEach(knob);
    wireSeg(page.mixer, (v) => { engine.mode = v; A.set({ mode: v }); setTimeout(renderMixer, 160); });
    $$("[data-band]", page.mixer).forEach((b) => b.onclick = () => { setBeat(+b.dataset.band); });
    $("#saveMix").onclick = () => openName(t("预设名称"), `${t("我的混音")} ${mixes.length + 1}`, (n) => { mixes.push({ id: Date.now(), name: n, beat: engine.beat, carrier: engine.carrier, mode: engine.mode, mins: 30 }); renderHome(); toast("✓"); });
    const tr = $("#timerRow"); if (tr) tr.onclick = () => openDuration(engine.freeEnd ? Math.max(1, Math.ceil((engine.freeEnd - Date.now()) / 60000)) : 30, (m) => { engine.freeEnd = Date.now() + m * 60000; renderMixer(); }, () => { engine.freeEnd = null; renderMixer(); });
    syncFloat();
  }
  function setBeat(v) {
    engine.beat = v; A.set({ beat: v });
    const vb = $("#vBeat"); if (vb) vb.textContent = `${v.toFixed(1)} Hz`;
    $$("[data-band]", page.mixer).forEach((b) => { const B = BANDS.find((x) => x.target == b.dataset.band); b.setAttribute("aria-pressed", String(v >= B.lo && v < B.hi)); });
    const bands = $(".bands", page.mixer); if (bands) fitText(bands);
    const s = $('[data-sld="beat"]', page.mixer); if (s) s._paint();
  }
  // slider: 10px inset track, gradient fill, 26px raised thumb; drag anywhere on the row
  function slider(el) {
    const key = el.dataset.sld, min = +el.dataset.min, max = +el.dataset.max, step = +el.dataset.step;
    el.innerHTML = `<span class="tr"></span><span class="fill"></span><span class="th"></span>`;
    const paint = () => { const w = el.clientWidth, f = (engine[key] - min) / (max - min), x = f * w; $(".fill", el).style.width = `${Math.max(10, x)}px`; $(".th", el).style.left = `${Math.min(Math.max(13, x), w - 13)}px`; };
    el._paint = paint; requestAnimationFrame(paint);
    const set = (cx) => { const r = el.getBoundingClientRect(), f = Math.min(Math.max((cx - r.left) / r.width, 0), 1); let v = min + f * (max - min); v = Math.round(v / step) * step; v = Math.min(Math.max(v, min), max); if (key === "beat") setBeat(v); else { engine.carrier = v; A.set({ carrier: v }); $("#vCar").textContent = `${Math.round(v)} Hz`; } paint(); };
    el.addEventListener("pointerdown", (e) => { el.setPointerCapture(e.pointerId); dragging = true; set(e.clientX); const mv = (ev) => set(ev.clientX), up = () => { el.removeEventListener("pointermove", mv); el.removeEventListener("pointerup", up); el.removeEventListener("pointercancel", up); dragging = false; if (pendingMixer) { pendingMixer = false; renderMixer(); } }; el.addEventListener("pointermove", mv); el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up); });
  }

  // ---- ambient knob: on = raised + conic ring, off = inset. Tap toggles; rotate around the centre to set
  //      volume (relative: clockwise louder, one full turn = 0 → 100%); turning an off knob clockwise turns it on.
  const lastVol = {};
  const volOf = (id) => (id === "brainwave" ? engine.volume : engine.amb[id] || 0);
  function setVol(id, v) {
    v = Math.min(Math.max(v, 0), 1);
    if (id === "brainwave") { const crossed = (engine.volume === 0) !== (v === 0); engine.volume = v; A.set({ brainVol: v }); if (crossed) renderMixer(); }
    else { engine.amb[id] = v; A.set({ amb: { [id]: v } }); }
  }
  const arcPath = (a0, a1, r = 40) => { const p = (a) => [42 + r * Math.cos(a), 42 + r * Math.sin(a)]; const [x0, y0] = p(a0), [x1, y1] = p(a1), large = Math.abs(a1 - a0) > Math.PI ? 1 : 0; return `M${x0.toFixed(2)} ${y0.toFixed(2)}A${r} ${r} 0 ${large} ${a1 > a0 ? 1 : 0} ${x1.toFixed(2)} ${y1.toFixed(2)}`; };
  function arrowHead(toDeg, cw) {
    const to = toDeg * Math.PI / 180, r = 40, tip = [42 + r * Math.cos(to), 42 + r * Math.sin(to)];
    const tan = cw ? [-Math.sin(to), Math.cos(to)] : [Math.sin(to), -Math.cos(to)], rad = [Math.cos(to), Math.sin(to)];
    const P = (x, y) => `${x.toFixed(2)} ${y.toFixed(2)}`;
    return `M${P(tip[0] + tan[0] * 5.5, tip[1] + tan[1] * 5.5)}L${P(tip[0] + rad[0] * 3, tip[1] + rad[1] * 3)}L${P(tip[0] - rad[0] * 3, tip[1] - rad[1] * 3)}Z`;
  }
  const HINT = `<g class="hint"><path d="${arcPath(-94 * Math.PI / 180, -66 * Math.PI / 180)}" stroke="var(--accent)" stroke-opacity=".7" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="${arrowHead(-66, true)}" fill="var(--accent)" fill-opacity=".85"/>
    <path d="${arcPath(-86 * Math.PI / 180, -114 * Math.PI / 180)}" stroke="var(--accent)" stroke-opacity=".7" stroke-width="1.5" fill="none" stroke-linecap="round"/><path d="${arrowHead(-114, false)}" fill="var(--accent)" fill-opacity=".85"/>
    <path d="M65 11h6M68 8v6M13 11h6" stroke="var(--accent)" stroke-width="1.8" stroke-linecap="round"/></g>`;
  function knobHTML(id) {
    const v = volOf(id), on = v > .001, name = id === "brainwave" ? "脑波" : AMB_NAME[id];
    return `<div class="knob ${on ? "on" : "off"}" data-knob="${id}"><div class="hit" role="slider" aria-label="${esc(t(name))}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(v * 100)}" tabindex="0">
      <svg class="ov" viewBox="0 0 84 84">${on ? HINT : ""}<circle class="ring2" cx="42" cy="42" r="40" fill="none" stroke="var(--accent)" stroke-opacity=".45" stroke-width="1.5" stroke-dasharray="3 5"/><path class="trail" fill="none" stroke="var(--accent)" stroke-opacity=".4" stroke-width="3" stroke-linecap="round"/><circle class="dot" r="4" fill="var(--accent)" cx="-20" cy="-20"/></svg>
      <span class="face"><span class="dial" style="${on ? conic(v) : ""}"></span></span><span class="num">${Math.round(v * 100)}</span></div>
      <label>${esc(t(name))} ${on ? `${Math.round(v * 100)}%` : esc(t("关"))}</label></div>`;
  }
  function knob(el) {
    const id = el.dataset.knob, hit = $(".hit", el);
    const paint = () => {
      const v = volOf(id), on = v > .001, name = id === "brainwave" ? "脑波" : AMB_NAME[id];
      const wasOn = el.classList.contains("on");
      el.classList.toggle("on", on); el.classList.toggle("off", !on);
      if (on !== wasOn) { const svg = $(".ov", el), h = $(".hint", svg); if (on && !h) svg.insertAdjacentHTML("afterbegin", HINT); if (!on && h) h.remove(); }
      $(".dial", el).style.cssText = on ? conic(v) : "";
      $(".num", el).textContent = Math.round(v * 100);
      $("label", el).textContent = `${t(name)} ${on ? `${Math.round(v * 100)}%` : t("关")}`;
      hit.setAttribute("aria-valuenow", Math.round(v * 100));
    };
    el._paint = paint;
    let last = null, rot = false, sx = 0, sy = 0, dir = 1;
    const centre = () => { const r = hit.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2, r.width / 84]; };
    const trail = (ang) => {
      const tail = 50 * Math.PI / 180, a0 = dir >= 0 ? ang - tail : ang + tail;
      $(".trail", el).setAttribute("d", arcPath(a0, ang));
      const d = $(".dot", el); d.setAttribute("cx", 42 + 40 * Math.cos(ang)); d.setAttribute("cy", 42 + 40 * Math.sin(ang));
    };
    hit.addEventListener("pointerdown", (e) => {
      hit.setPointerCapture(e.pointerId); sx = e.clientX; sy = e.clientY; last = null; rot = false; dragging = true;
      const mv = (ev) => {
        const [cx, cy, sc] = centre(), dx = (ev.clientX - cx) / sc, dy = (ev.clientY - cy) / sc;
        if (!rot && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 8) return;
        if (dx * dx + dy * dy <= 100) return;                   // dead zone at the centre: the angle jumps there
        const ang = Math.atan2(dy, dx);
        if (!rot) { rot = true; el.classList.add("rot"); }
        if (last != null) {
          let d = ang - last; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI;
          if (Math.abs(d) > .002) dir = d >= 0 ? 1 : -1;
          setVol(id, volOf(id) + d / (2 * Math.PI)); paint();
        }
        last = ang; trail(ang);
      };
      const up = () => {
        hit.removeEventListener("pointermove", mv); hit.removeEventListener("pointerup", up); hit.removeEventListener("pointercancel", up);
        if (!rot) {                                              // a tap: off ↔ last volume
          const v = volOf(id);
          if (v > .001) { lastVol[id] = v; setVol(id, 0); } else setVol(id, lastVol[id] || .5);
          paint();
        } else if (volOf(id) > .001) lastVol[id] = volOf(id);
        el.classList.remove("rot"); $(".trail", el).setAttribute("d", ""); $(".dot", el).setAttribute("cx", -20);
        dragging = false; if (pendingMixer) { pendingMixer = false; renderMixer(); }
      };
      hit.addEventListener("pointermove", mv); hit.addEventListener("pointerup", up); hit.addEventListener("pointercancel", up);
    });
    hit.addEventListener("keydown", (e) => { const k = { ArrowUp: .05, ArrowRight: .05, ArrowDown: -.05, ArrowLeft: -.05 }[e.key]; if (k) { e.preventDefault(); setVol(id, volOf(id) + k); paint(); } else if (e.key === " " || e.key === "Enter") { e.preventDefault(); const v = volOf(id); if (v > .001) { lastVol[id] = v; setVol(id, 0); } else setVol(id, lastVol[id] || .5); paint(); } });
    // for the recording: turn the knob programmatically through the same paint path
    el._demo = (to, ms = 1200) => new Promise((res) => {
      const from = volOf(id), a0 = -Math.PI / 2 + from * 2 * Math.PI, t0 = performance.now(); el.classList.add("rot"); dir = to >= from ? 1 : -1;
      const step = (now) => { const k = Math.min(1, (now - t0) / ms), e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2, v = from + (to - from) * e; setVol(id, v); paint(); trail(a0 + (v - from) * 2 * Math.PI); if (k < 1) requestAnimationFrame(step); else { el.classList.remove("rot"); $(".trail", el).setAttribute("d", ""); $(".dot", el).setAttribute("cx", -20); res(); } };
      requestAnimationFrame(step);
    });
  }

  // floating start / stop pill — mixer tab only, and only while no program session is running
  const floatBtn = $("#float");
  function syncFloat() { floatBtn.hidden = !(tab === "mixer" && !engine.active); floatBtn.textContent = t(engine.playing ? "停止" : "开始"); }
  floatBtn.onclick = () => {
    if (engine.playing) { stopFree(); return; }
    engine.playing = true; engine.freeStart = Date.now(); A.set({ mode: engine.mode, carrier: engine.carrier, beat: engine.beat, brainVol: engine.volume, amb: engine.amb }); A.start(); renderMixer();
  };
  function stopFree() {
    const el = (Date.now() - engine.freeStart) / 1000;
    engine.playing = false; engine.freeEnd = null; A.stop();
    if (el >= 30) { records.push({ start: engine.freeStart, dur: Math.round(el), completed: false, name: "混音器", beat: engine.beat, mode: engine.mode, carrier: engine.carrier, brain: engine.volume, amb: { ...engine.amb } }); renderStats(); }
    renderMixer();
  }
  setInterval(() => { // sleep-timer readout + auto stop
    if (!engine.playing || !engine.freeEnd) return;
    const left = (engine.freeEnd - Date.now()) / 1000, tv = $("#timerVal");
    if (left <= 0) stopFree(); else if (tv) tv.textContent = fmt(left);
  }, 500);

  // =====================================================================================
  // STATS (2d): range · numbers · trend · goal · bedtime clock · streak map · weekday · scenes ·
  //             ambient · bands · milestones — every figure computed by the ported StatsCalculator
  // =====================================================================================
  const wd = (ms) => (/^zh/.test(lang()) ? "日一二三四五六"[new Date(ms).getDay()] : new Date(ms).toLocaleDateString(tag(), { weekday: "narrow" }));
  const mo = (ms) => (/^zh/.test(lang()) ? `${new Date(ms).getMonth() + 1}月` : new Date(ms).toLocaleDateString(tag(), { month: "short" }));
  const clockStr = (h) => `${String(Math.floor(h)).padStart(2, "0")}:${String(Math.floor((h % 1) * 60)).padStart(2, "0")}`;
  const lbar = (f, grad = "var(--grad-h)") => `<span class="bar"><i style="width:max(8px, ${f * 100}%);background:${grad}"></i></span>`;
  const SCENE_GRAD = { "深度放松": "var(--grad-h)", "冥想": "linear-gradient(90deg,#9fd0f2,#6aa8e8)", "小憩": "linear-gradient(90deg,#b8aef5,#8f7de8)", "入睡": "linear-gradient(90deg,#a5c8f0,#7aa5e0)", "专注": "linear-gradient(90deg,#c3cbdb,#9aa6bd)" };
  function renderStats() {
    const scoped = St.inRange(records, range), tot = St.total(scoped), avg = St.average(scoped), rate = St.completion(scoped);
    const longest = St.longestStreak(records), cur = St.currentStreak(records);
    const stat = (title, v, unit, fn) => `<div class="stat"><small>${esc(t(title))}</small><div class="v"><b>${v}</b><span>${esc(t(unit))}</span></div>${fn ? `<div class="fn">${esc(fn)}</div>` : ""}</div>`;
    let html = `<h1 class="h-title">${esc(t("统计"))}</h1><div class="stack" style="margin-top:20px">${seg([{ v: "week", label: t("本周") }, { v: "month", label: t("本月") }, { v: "year", label: t("今年") }, { v: "all", label: t("全部") }], range)}`;
    if (!records.length) { page.stats.innerHTML = html + `<div class="empty">${ic("chart", "")}<br>${esc(t("还没有数据，听完第一次就会出现在这里"))}</div></div>`; return; }
    html += `<div class="nums">${stat("连续天数", cur, "天", cur === longest ? null : t("最长 %lld 天", longest))}${stat("累计时长", tot >= 6000 ? (tot / 3600).toFixed(1) : Math.floor(tot / 60), tot >= 6000 ? "小时" : "分钟")}
      ${stat("平均单次", Math.floor(avg / 60), "分钟")}${stat("听满率", Math.round(rate * 100), "%", `${scoped.filter((r) => r.completed).length} / ${scoped.length}`)}</div>`;
    // trend
    const days = St.buckets(records, range), peak = Math.max(...days.map((d) => d.dur), 1), ch = St.changeVsPrevious(records, range), byMonth = range === "year" || range === "all";
    const bw = days.length <= 7 ? 18 : days.length <= 12 ? 14 : 6;
    html += `<div class="card"><div class="ch"><span class="card-t">${esc(t("时长趋势"))}</span>${ch != null ? `<span class="r ${ch >= 0 ? "up" : ""}">${ic(ch >= 0 ? "up" : "down")}${Math.abs(Math.round(ch * 100))}%</span>` : `<span class="r">${esc(t(byMonth ? "分钟 / 月" : "分钟 / 天"))}</span>`}</div>
      <div class="bars">${days.map((d, i) => { const last = i === days.length - 1, show = days.length <= 12 || i % 5 === 0 || last; return `<div><i class="${d.dur < 30 ? "z" : ""}" style="width:${bw}px;height:${Math.max(10, 96 * d.dur / peak)}px"></i><span class="${last && !byMonth ? "now" : ""}">${last && !byMonth ? esc(t("今")) : show ? esc(byMonth ? mo(d.date) : wd(d.date)) : "&nbsp;"}</span></div>`; }).join("")}</div></div>`;
    // weekly goal
    const goal = prefs.weeklyGoal, nights = St.nightsThisWeek(records), gp = Math.min(1, nights / Math.max(goal, 1)), C = 2 * Math.PI * 32;
    html += `<div class="card goal"><svg viewBox="0 0 74 74"><defs><linearGradient id="gg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8a97ff"/><stop offset="1" stop-color="#5b6cf0"/></linearGradient></defs>
        <circle cx="37" cy="37" r="32" fill="none" stroke="var(--dis)" stroke-opacity=".25" stroke-width="10"/><circle cx="37" cy="37" r="32" fill="none" stroke="url(#gg)" stroke-width="10" stroke-linecap="round" stroke-dasharray="${gp * C} ${C}" transform="rotate(-90 37 37)"/>
        ${nights >= goal ? `<path d="M28 37.5l6 6 12-13" fill="none" stroke="var(--accent)" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/>` : `<text x="37" y="42" text-anchor="middle" font-size="15" font-weight="900" fill="var(--text)">${nights}/${goal}</text>`}</svg>
      <div><span class="card-t">${esc(t("本周目标"))}</span><small>${esc(nights >= goal ? t("这周的目标已经达成") : t("最近 7 晚里已经听了 %lld 晚", nights))}</small><button type="button" class="menu-b" id="goalBtn">${esc(t("每周目标"))} ${goal} ${ic("chevD")}</button></div></div>`;
    // bedtime
    const hist = St.hourHistogram(scoped), hp = Math.max(...hist, 1), bed = St.bedtime(scoped);
    html += `<div class="card"><div class="ch" style="margin-bottom:16px"><span class="card-t">${esc(t("就寝时段"))}</span>${bed ? `<span class="r up">${clockStr(bed.hour)} ± ${Math.floor(bed.spread)} <span style="color:var(--text2);font-weight:400">${esc(t("分钟"))}</span></span>` : ""}</div>
      <div class="clock"><span class="dial"></span>${hist.map((n, h) => `<span class="tk" style="height:${8 + 34 * n / hp}px;background:${n ? "var(--grad-v)" : "color-mix(in srgb, var(--dis) 22%, transparent)"};transform:rotate(${h / 24 * 360 + 180}deg) translateY(${84 - (8 + 34 * n / hp) / 2}px)"></span>`).join("")}
        <div class="c"><b>${bed ? clockStr(bed.hour) : "—"}</b><small>${esc(t("常见入睡时间"))}</small></div></div></div>`;
    // streak map (17 weeks)
    const grid = St.heatmap(records), hpk = Math.max(...grid.flat().map((d) => d.dur), 1);
    const heat = (d) => (d < 0 ? "transparent" : d < 30 ? "color-mix(in srgb, var(--dis) 18%, transparent)" : `color-mix(in srgb, var(--accent) ${Math.round((.25 + .7 * Math.min(1, d / hpk)) * 100)}%, transparent)`);
    html += `<div class="card"><p class="card-t" style="margin:0 0 14px">${esc(t("坚持轨迹"))}</p><div class="heat">${grid.map((w) => `<div>${w.map((d) => `<i style="background:${heat(d.dur)}"></i>`).join("")}</div>`).join("")}</div>
      <div class="legend">${esc(t("少"))}${[0, 1, 2, 3].map((i) => `<i style="opacity:${.2 + .26 * i}"></i>`).join("")}${esc(t("多"))}</div></div>`;
    // weekday
    const wk = St.weekdayPattern(records), wp = Math.max(...wk.map((x) => x.dur), 1);
    html += `<div class="card"><p class="card-t" style="margin:0 0 14px">${esc(t("星期分布"))}</p><div class="lst" style="gap:10px">${wk.map((x) => `<div class="lrow"><span class="n" style="width:34px;font-size:12px;color:var(--text2)">${esc(wd(x.date))}</span>${lbar(x.dur / wp)}<span class="e" style="width:34px;color:var(--dis)">${Math.floor(x.dur / 60)}</span></div>`).join("")}</div></div>`;
    // scenes · ambient · bands
    const usage = St.usageByProgram(scoped), up = Math.max(...usage.map((u) => u.dur), 1);
    if (usage.length) html += `<div class="card"><p class="card-t" style="margin:0 0 16px">${esc(t("场景使用分布"))}</p><div class="lst">${usage.map((u) => `<div class="lrow"><span class="n" data-fit=".75" style="width:92px">${esc(t(u.name))}</span>${lbar(u.dur / up, SCENE_GRAD[u.name] || "var(--grad-h)")}<span class="e" style="width:56px">${esc(t("%lld 分钟", Math.floor(u.dur / 60)))}</span></div>`).join("")}</div></div>`;
    const amb = St.topAmbient(scoped).slice(0, 5), ap = Math.max(...amb.map((a) => a.count), 1);
    if (amb.length) html += `<div class="card"><p class="card-t" style="margin:0 0 16px">${esc(t("环境音偏好"))}</p><div class="lst">${amb.map((a) => `<div class="lrow"><span class="n" style="width:92px">${esc(t(AMB_NAME[a.id]))}</span>${lbar(a.count / ap)}<span class="e" style="width:48px">${esc(t("%lld 次", a.count))}</span></div>`).join("")}</div></div>`;
    const bands = St.bandEffectiveness(scoped);
    if (bands.length >= 2) html += `<div class="card"><p class="card-t" style="margin:0">${esc(t("哪个波段对你有效"))}</p><p style="margin:14px 0;font-size:11px;color:var(--text2)">${esc(t("按平均听满时长排序 —— 听得越久，说明越合适"))}</p><div class="lst" style="gap:12px">${bands.map((b) => `<div class="lrow"><span class="n" style="width:76px;font-weight:600;white-space:normal">${esc(t(b.key))}</span><span style="font-size:12px;color:var(--text2)">${esc(t("平均 %lld 分钟", Math.floor(b.avg / 60)))}</span><span style="margin-left:auto;font-size:12px;font-weight:700;color:var(--accent)">${Math.round(b.rate * 100)}%</span></div>`).join("")}</div></div>`;
    // milestones (all-time)
    const hours = St.total(records) / 3600, done = records.filter((r) => r.completed).length, scenes = new Set(records.map((r) => r.name).filter((n) => PROGRAMS.some((p) => p.key === n))).size;
    const ms = [["flame", "连续 7 天", longest >= 7], ["flame", "连续 30 天", longest >= 30], ["moonStar", "累计 24 小时", hours >= 24], ["seal", "听满 50 次", done >= 50], ["grid", "试遍所有场景", scenes >= 5]];
    html += `<div class="card"><p class="card-t" style="margin:0 0 14px">${esc(t("里程碑"))}</p><div class="lst" style="gap:12px">${ms.map(([i, k, ok]) => `<div class="mile ${ok ? "ok" : ""}">${ic(i)}<span>${esc(t(k))}</span>${ok ? `<span class="ck">${ic("check")}</span>` : ""}</div>`).join("")}</div></div>`;
    page.stats.innerHTML = html + `</div>`;
    wireSeg(page.stats, (v) => { range = v; setTimeout(renderStats, 160); });
    $("#goalBtn").onclick = (e) => menu(e.currentTarget, [3, 4, 5, 6, 7].map((n) => ({ label: String(n), check: n === prefs.weeklyGoal, run: () => { prefs.weeklyGoal = n; renderStats(); } })));
  }

  // =====================================================================================
  // SETTINGS: Pro · appearance · options · feedback · about · the disclaimer
  // =====================================================================================
  const LINKS = { review: "https://apps.apple.com/app/id6787405665?action=write-review", more: "https://apps.apple.com/developer/id6780315706", privacy: "https://ayylchyql-a11y.github.io/M-Alpha-Relax-privacy/" };
  function renderSettings() {
    const langLabel = langPref == null ? t("跟随系统") : LANGS[langPref];
    const link = (k, icon, key) => `<button type="button" class="opt" data-link="${k}"><span class="ri">${ic(icon)}</span>${esc(t(key))}${ic("chevR", "chev")}</button>`;
    page.settings.innerHTML = `<h1 class="h-title">${esc(t("设置"))}</h1><div class="stack" style="margin-top:20px">
      <button type="button" class="pro press big" id="proCard"><span class="ic">${ic("seal")}</span><span><b>M Alpha Relax Pro</b><small>${esc(t("已解锁全部功能"))}</small></span>${ic("chevR", "chev")}</button>
      <div><p class="lbl">${esc(t("外观"))}</p>${seg([{ v: "system", label: t("跟随系统") }, { v: "light", label: t("浅色") }, { v: "dark", label: t("深色") }], prefs.appearance)}</div>
      <div class="opts"><button type="button" class="opt" id="langRow">${esc(t("语言"))}<span class="rv">${esc(langLabel)} ${ic("chevD")}</span></button>
        <div class="opt">${esc(t("结束提示音"))}${tgl(prefs.endChime, "endChime")}</div>
        <div class="opt">${esc(t("呼吸引导"))}${tgl(prefs.breathingGuide, "breathingGuide")}</div>
        <div class="opt">${esc(t("开屏动画"))}${tgl(prefs.splash, "splash")}</div></div>
      <div><p class="lbl">${esc(t("反馈"))}</p><div class="opts">${link("review", "star", "给应用评分")}${link("mail", "mail", "联系作者")}${link("more", "grid", "更多作品")}</div></div>
      <div><p class="lbl">${esc(t("关于"))}</p><div class="opts">${link("privacy", "hand", "隐私政策")}<div class="opt"><span class="ri">${ic("info")}</span>${esc(t("版本"))}<span class="rv">1.1 (3)</span></div></div></div>
      <div><p class="lbl">${esc(t("关于双耳节拍与等时音调"))}</p><div class="about">${esc(S.about[lang()] || S.about.en)}</div></div>
    </div>`;
    wireSeg(page.settings, (v) => { prefs.appearance = v; applyTheme(); });
    $$("[data-tgl]", page.settings).forEach((b) => b.onclick = () => { const k = b.dataset.tgl; prefs[k] = !prefs[k]; b.setAttribute("aria-checked", String(prefs[k])); });
    $$("[data-link]", page.settings).forEach((b) => b.onclick = () => { const k = b.dataset.link; if (k === "mail") toast(t("在 App 里会打开邮件")); else window.open(LINKS[k], "_blank", "noopener"); });
    $("#langRow").onclick = (e) => menu($(".rv", e.currentTarget), [{ v: null, label: t("跟随系统") }, ...Object.entries(LANGS).map(([v, label]) => ({ v, label }))].map((o) => ({ label: o.label, check: langPref === o.v, run: () => { langPref = o.v; renderAll(); } })));
  }

  // =====================================================================================
  // sheets: the system duration picker (15/30/45/60/90 + a 1–180 wheel) and the neumorphic name sheet
  // =====================================================================================
  const scrim = $("#scrim"), sys = $("#sheetSys"), neu = $("#sheetNeu"); let closeSheet = null;
  function show(el, onClose) { scrim.classList.add("on"); el.classList.add("on"); el.setAttribute("aria-hidden", "false"); closeSheet = () => { el.classList.remove("on"); el.setAttribute("aria-hidden", "true"); scrim.classList.remove("on"); closeSheet = null; onClose && onClose(); }; }
  scrim.onclick = () => closeSheet && closeSheet();
  function openDuration(mins, onDone, onClear) {
    let m = mins;
    sys.innerHTML = `<div class="nav">${onClear ? `<button type="button" class="l" id="dClr">${esc(t("关闭定时"))}</button>` : "<span></span>"}<b>${esc(t("选择时长"))}</b><button type="button" id="dOk">${esc(t("完成"))}</button></div>
      <div class="quick">${[15, 30, 45, 60, 90].map((q) => `<button type="button" data-q="${q}" aria-pressed="${q === m}">${q}</button>`).join("")}</div>
      <div class="wheel"><span class="sel"></span><ul id="wheel">${Array.from({ length: 180 }, (_, i) => `<li>${esc(t("%lld 分钟", i + 1))}</li>`).join("")}</ul></div>`;
    const ul = $("#wheel", sys), quick = $$("[data-q]", sys);
    const mark = () => quick.forEach((b) => b.setAttribute("aria-pressed", String(+b.dataset.q === m)));
    let st = 0; ul.addEventListener("scroll", () => { clearTimeout(st); st = setTimeout(() => { m = Math.min(180, Math.max(1, Math.round(ul.scrollTop / 36) + 1)); mark(); }, 80); });
    quick.forEach((b) => b.onclick = () => { m = +b.dataset.q; mark(); ul.scrollTo({ top: (m - 1) * 36, behavior: reduce() ? "auto" : "smooth" }); });
    $("#dOk", sys).onclick = () => { onDone(m); closeSheet(); };
    if (onClear) $("#dClr", sys).onclick = () => { onClear(); closeSheet(); };
    show(sys); requestAnimationFrame(() => (ul.scrollTop = (m - 1) * 36));
  }
  function openName(title, initial, onSave) {
    neu.innerHTML = `<h3>${esc(title)}</h3><input id="nIn" type="text" maxlength="40" placeholder="${esc(t("预设名称"))}" value="${esc(initial)}"><div class="btns"><button type="button" class="press" id="nNo">${esc(t("取消"))}</button><button type="button" class="ok" id="nOk">${esc(t("保存"))}</button></div>`;
    const inp = $("#nIn", neu), ok = $("#nOk", neu), sync = () => (ok.disabled = !inp.value.trim());
    inp.oninput = sync; sync();
    $("#nNo", neu).onclick = () => closeSheet();
    ok.onclick = () => { if (!inp.value.trim()) return; onSave(inp.value.trim()); closeSheet(); };
    inp.onkeydown = (e) => { if (e.key === "Enter") ok.click(); };
    show(neu); setTimeout(() => inp.focus(), 380);
  }
  // iOS-style pop-up menu anchored to a control
  const pop = $("#pop");
  function menu(anchor, items) {
    pop.innerHTML = items.map((it, i) => `<button type="button" data-i="${i}" class="${it.del ? "del" : ""}">${esc(it.label)}${it.check ? ic("check") : it.icon ? ic(it.icon) : ""}</button>`).join("");
    const d = dev.getBoundingClientRect(), a = anchor.getBoundingClientRect(), s = d.width / 440;
    pop.style.top = `${Math.min((a.bottom - d.top) / s + 6, 956 - 60 - items.length * 44)}px`;
    pop.style.left = `${Math.max(16, Math.min((a.right - d.left) / s - 220, 440 - 236))}px`;
    pop.classList.add("on");
    $$("button", pop).forEach((b) => b.onclick = () => { pop.classList.remove("on"); items[+b.dataset.i].run(); });
    setTimeout(() => addEventListener("pointerdown", function off(e) { if (!pop.contains(e.target)) { pop.classList.remove("on"); removeEventListener("pointerdown", off, true); } }, true), 0);
  }

  // =====================================================================================
  // tabs
  // =====================================================================================
  const TABS = [["home", "首页"], ["mixer", "混音器"], ["stats", "统计"], ["settings", "设置"]];
  const page = {}; TABS.forEach(([k]) => { const d = document.createElement("div"); d.className = "page"; d.id = "p-" + k; d.hidden = k !== tab; d.setAttribute("role", "tabpanel"); pagesEl.appendChild(d); page[k] = d; });
  const tabbar = $("#tabbar"), ind = $("#ind");
  function renderTabs() {
    $$("button", tabbar).forEach((b) => b.remove());
    TABS.forEach(([k, label], i) => { const b = document.createElement("button"); b.type = "button"; b.setAttribute("role", "tab"); b.textContent = t(label); b.dataset.tab = k; b.setAttribute("aria-selected", String(k === tab)); b.onclick = () => go(k); tabbar.appendChild(b); });
    placeInd();
  }
  function placeInd() { const i = TABS.findIndex(([k]) => k === tab); ind.style.width = `calc((100% - 20px) / 4)`; ind.style.left = "10px"; ind.style.transform = `translateX(${i * 100}%)`; }
  function go(k) {
    if (k === tab) return; tab = k;
    TABS.forEach(([x]) => { page[x].hidden = x !== k; });
    $$("button", tabbar).forEach((b) => b.setAttribute("aria-selected", String(b.dataset.tab === k)));
    placeInd(); syncFloat(); fitText(tabbar);
    if (k === "mixer") requestAnimationFrame(() => $$(".sld", page.mixer).forEach((s) => s._paint && s._paint()));
  }

  // single-line labels shrink to fit before they truncate — SwiftUI's lineLimit(1) + minimumScaleFactor(0.6), as the app does.
  // German, French and Russian labels are 1.5–2× the Chinese ones the layout was drawn for.
  const FIT = "#tabbar button, [data-seg] button, .bands button, [data-fit]";   // floor 0.6 unless data-fit says otherwise
  function fitText(root = dev) {
    const els = $$(FIT, root);
    els.forEach((el) => (el.style.fontSize = ""));                       // all writes, then all reads: one layout
    const over = els.map((el) => (el.scrollWidth > el.clientWidth + .5 ? [el, el.clientWidth / el.scrollWidth, parseFloat(getComputedStyle(el).fontSize), +(el.dataset.fit || .6)] : null)).filter(Boolean);
    over.forEach(([el, k, base, floor]) => (el.style.fontSize = `${Math.max(floor, k) * base}px`));
  }
  new MutationObserver(() => { cancelAnimationFrame(fitText._r); fitText._r = requestAnimationFrame(() => fitText()); }).observe(pagesEl, { childList: true, subtree: true, characterData: true });

  function renderAll() { document.documentElement.lang = tag(); renderTabs(); renderHome(); renderMixer(); renderStats(); renderSettings(); syncFloat(); requestAnimationFrame(() => fitText()); }

  // status-bar clock
  const clockEl = $("#clock"); const tick = () => { const d = new Date(); clockEl.textContent = `${d.getHours()}:${String(d.getMinutes()).padStart(2, "0")}`; }; tick(); setInterval(tick, 15000);

  // ---------- boot ----------
  applyTheme(); fit(); renderAll(); wireHome();
  const splash = $("#splash");
  // cold launch: logo scales in, slogan follows; at 1.0 s the splash fades for 0.3 s
  if (prefs.splash && !reduce()) setTimeout(() => { splash.classList.add("out"); setTimeout(() => splash.remove(), 320); }, 1000);
  else splash.remove();

  // ?demo (the lab's recording only): the app's tour, hands-free
  if (/[?&]demo\b/.test(location.search)) {
    const seq = [
      [1900, () => openSession(heroProg(), progMins(heroProg()))],
      [6400, () => finishSession(false)],
      [7200, () => go("mixer")],
      [8100, () => { const k = $('[data-knob="whiteNoise"]', page.mixer); k && k._demo(.62, 1300); }],
      [9900, () => go("stats")],
      [10600, () => page.stats.scrollTo({ top: 520, behavior: "smooth" })],
      [12300, () => go("settings")],
      [13100, () => { const b = $$('[data-seg] button', page.settings)[2]; b && b.click(); }],
      [15000, () => { const b = $$('[data-seg] button', page.settings)[1]; b && b.click(); }],
    ];
    let timers = seq.map(([at, fn]) => setTimeout(fn, at));
    addEventListener("pointerdown", (e) => { if (e.isTrusted) { timers.forEach(clearTimeout); timers = []; } }, { capture: true, once: true });
  }
})();
