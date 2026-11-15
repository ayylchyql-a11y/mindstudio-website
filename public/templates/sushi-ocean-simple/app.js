/* Shiomi · sushi-ocean-simple */
(() => {
"use strict";
const D = window.SO_DATA;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------- storage: the site runs in a sandbox without same-origin, where touching
   localStorage throws. Fall back to memory silently. ---------- */
const mem = {};
const store = {
  get(k) { try { const v = window.localStorage.getItem("so-" + k); return v == null ? mem[k] ?? null : JSON.parse(v); } catch (e) { return mem[k] ?? null; } },
  set(k, v) { mem[k] = v; try { window.localStorage.setItem("so-" + k, JSON.stringify(v)); } catch (e) { /* sandboxed */ } },
  del(k) { delete mem[k]; try { window.localStorage.removeItem("so-" + k); } catch (e) { /* sandboxed */ } }
};

/* ---------- toast ---------- */
let toastT = 0;
function toast(msg) {
  const t = $("#toast");
  t.textContent = msg; t.classList.add("is-on");
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("is-on"), 2600);
}

const eur = (n) => "€ " + n.toFixed(2).replace(".", ",");
const eurShort = (n) => "€ " + (Number.isInteger(n) ? String(n) : n.toFixed(2).replace(".", ","));
const hhmm = (m) => { m = ((m % 1440) + 1440) % 1440; return String(Math.floor(m / 60)).padStart(2, "0") + ":" + String(m % 60).padStart(2, "0"); };
const DAYS = ["domenica", "lunedì", "martedì", "mercoledì", "giovedì", "venerdì", "sabato"];
const DAYS_SHORT = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];

/* ---------- Europe/Rome clock (overridable for tests) ---------- */
let fakeNow = null;
const WD = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
function romeNow() {
  if (fakeNow) return { ...fakeNow };
  const parts = new Intl.DateTimeFormat("en-GB", { timeZone: "Europe/Rome", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(new Date());
  const g = (t) => parts.find((p) => p.type === t).value;
  return { dow: WD[g("weekday")], min: (+g("hour") % 24) * 60 + +g("minute") };
}

/* Intervals that are live on `dow`: that day's own, plus yesterday's spill past midnight. */
function intervalsOn(sede, dow) {
  const own = sede.hours[dow].map(([o, c]) => [o, c]);
  const spill = sede.hours[(dow + 6) % 7].filter(([, c]) => c > 1440).map(([, c]) => [0, c - 1440, true]);
  return [...spill, ...own].sort((a, b) => a[0] - b[0]);
}

function statusFor(sede, dow, min) {
  const live = intervalsOn(sede, dow);
  const cur = live.find(([o, c]) => min >= o && min < c);
  if (cur) {
    const left = cur[1] - min;
    const state = left <= 45 ? "soon" : "open";
    return { open: true, state, closeAt: cur[1], left,
      text: state === "soon" ? `Chiude presto · alle ${hhmm(cur[1])}` : `Aperto · fino alle ${hhmm(cur[1])}` };
  }
  const later = live.find(([o]) => o > min);
  if (later) return { open: false, state: "closed", nextDay: 0, nextAt: later[0], text: `Chiuso · apre oggi alle ${hhmm(later[0])}` };
  for (let d = 1; d <= 7; d++) {
    const own = sede.hours[(dow + d) % 7];
    if (own.length) {
      const when = d === 1 ? "domani" : DAYS[(dow + d) % 7];
      return { open: false, state: "closed", nextDay: d, nextAt: own[0][0], text: `Chiuso · apre ${when} alle ${hhmm(own[0][0])}` };
    }
  }
  return { open: false, state: "closed", text: "Chiuso" };
}

/* ---------- queue estimate (fictional but consistent) ---------- */
const LIST_CLOSES_BEFORE = 30; // the list shuts half an hour before closing
function queueFor(sede, party, now = romeNow()) {
  const st = statusFor(sede, now.dow, now.min);
  if (!st.open) return { ok: false, why: st.text, st };
  if (st.left <= LIST_CLOSES_BEFORE) return { ok: false, why: `Lista chiusa: la cucina chiude alle ${hhmm(st.closeAt)}`, st };
  const m = now.min, wkd = now.dow === 0 || now.dow === 6 || (now.dow === 5 && m > 1000);
  let ahead = sede.base;
  if (m >= 750 && m < 840) ahead += 3;
  if (m >= 1170 && m < 1290) ahead += 5; else if (m >= 1290 && m < 1350) ahead += 2;
  if (wkd) ahead += 2;
  const big = party >= 5;
  if (big) ahead += 2; else if (party >= 3) ahead += 1;
  const mins = Math.max(5, Math.round((ahead * sede.perTable * (big ? 1.3 : 1)) / 5) * 5);
  return { ok: true, ahead, mins, st };
}

/* ---------- nav ---------- */
const nav = $("#nav");
function navState() { nav.dataset.state = scrollY > 24 ? "solid" : "top"; }
addEventListener("scroll", navState, { passive: true }); navState();

const spyTargets = ["menu", "pesce", "sedi"].map((id) => document.getElementById(id));
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    const a = $(`.so-nav-l a[href="#${e.target.id}"]`);
    if (a) a.classList.toggle("is-here", e.isIntersecting);
  }), { rootMargin: "-45% 0px -50% 0px" });
  spyTargets.forEach((t) => t && io.observe(t));
}

/* mobile drawer */
const drawer = $("#drawer"), burger = $("#burger");
let lastFocus = null;
function openDrawer() {
  lastFocus = document.activeElement;
  drawer.hidden = false; burger.setAttribute("aria-expanded", "true");
  requestAnimationFrame(() => drawer.classList.add("is-open"));
  document.body.style.overflow = "hidden";
  $("#drawerX").focus();
}
function closeDrawer(restore = true) {
  if (drawer.hidden) return;
  drawer.classList.remove("is-open"); burger.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
  setTimeout(() => { drawer.hidden = true; }, reduce ? 0 : 260);
  if (restore && lastFocus) lastFocus.focus();
}
burger.addEventListener("click", openDrawer);
$("#drawerX").addEventListener("click", () => closeDrawer());
$$(".so-drawer-nav a").forEach((a) => a.addEventListener("click", () => closeDrawer(false)));

/* in-page links: the fixed bar would cover the heading, so land a bar-height above it */
document.addEventListener("click", (e) => {
  const a = e.target.closest('a[href^="#"]');
  if (!a) return;
  const id = a.getAttribute("href").slice(1);
  if (a.dataset.toast) { e.preventDefault(); toast(a.dataset.toast); return; }
  if (!id) { e.preventDefault(); return; }
  const el = document.getElementById(id);
  if (!el) return;
  e.preventDefault();
  if (a.closest(".so-modal")) closeModal(a.closest(".so-modal"));
  const y = id === "top" ? 0 : el.getBoundingClientRect().top + scrollY - (innerWidth <= 900 ? 58 : 62);
  scrollTo({ top: y, behavior: reduce ? "auto" : "smooth" });
});

/* generic modal plumbing */
let modalOpener = null;
function openModal(m) {
  modalOpener = document.activeElement;
  closeDrawer(false);
  m.hidden = false; document.body.style.overflow = "hidden";
  requestAnimationFrame(() => requestAnimationFrame(() => m.classList.add("is-open")));
  const f = m.querySelector("input:not([type=checkbox]):not([type=radio]), button.so-sheet-x");
  setTimeout(() => f && f.focus({ preventScroll: true }), 60);
}
function closeModal(m) {
  if (!m || m.hidden) return;
  m.classList.remove("is-open");
  setTimeout(() => { m.hidden = true; }, reduce ? 0 : 320);
  document.body.style.overflow = "";
  if (modalOpener && document.contains(modalOpener)) modalOpener.focus({ preventScroll: true });
}
$$(".so-modal").forEach((m) => m.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) closeModal(m); }));
addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  const m = $$(".so-modal").find((x) => !x.hidden);
  if (m) closeModal(m); else closeDrawer();
});
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-open]");
  if (!b) return;
  if (b.dataset.open === "wait") openWait(b.dataset.sede);
  if (b.dataset.open === "cart") openCart(b.dataset.sede);
});

/* ---------- opening status: hero line, drawer line, footer hours ---------- */
const sedeById = (id) => D.sedi.find((s) => s.id === id) || D.sedi[0];
const fmtRange = ([o, c]) => `${hhmm(o)}–${hhmm(c)}`;
const waitLabel = (q) => q.ok ? `${q.ahead} ${q.ahead === 1 ? "tavolo" : "tavoli"} in lista · ~${q.mins} min` : "Lista chiusa";

function renderStatus() {
  const now = romeNow(), main = D.sedi[0];
  const st = statusFor(main, now.dow, now.min), q = queueFor(main, 2, now);
  const el = $("#heroStatus");
  el.firstElementChild.dataset.state = st.state;
  el.lastElementChild.textContent = `${main.name} · ${st.text}` + (q.ok ? ` · ${waitLabel(q)}` : "");
  const openN = D.sedi.filter((s) => statusFor(s, now.dow, now.min).open).length;
  $$("[data-status-line]").forEach((p) => {
    p.textContent = openN ? `${openN} ${openN === 1 ? "sede aperta" : "sedi aperte"} adesso · ${main.name}: ${st.text.toLowerCase()}` : `Adesso siamo chiusi · ${main.name}: ${st.text.toLowerCase()}`;
  });
}

function renderHours() {
  const today = romeNow().dow, order = [1, 2, 3, 4, 5, 6, 0];
  $("#hours").innerHTML = D.sedi.map((s) => {
    const groups = [];
    order.forEach((d) => {
      const key = s.hours[d].map(fmtRange).join(" · ") || "Chiuso";
      const g = groups[groups.length - 1];
      if (g && g.key === key) g.days.push(d); else groups.push({ key, days: [d] });
    });
    return `<div><h3>${s.name}</h3>` + groups.map((g) => {
      const lab = g.days.length === 1 ? DAYS_SHORT[g.days[0]] : `${DAYS_SHORT[g.days[0]]}–${DAYS_SHORT[g.days[g.days.length - 1]]}`;
      return `<p class="${g.days.includes(today) ? "is-today" : ""}"><span>${lab}</span>${g.key}</p>`;
    }).join("") + `</div>`;
  }).join("");
}

/* ---------- manifesto: words brighten with the paragraph's progress through the viewport
   (scroll-word-brighten, driven by getBoundingClientRect — no scroll hijack) ---------- */
const manifesto = $("#manifesto");
const words = manifesto.textContent.trim().split(/\s+/);
manifesto.innerHTML = words.map((w) => `<i>${w}</i>`).join(" ");
const wordEls = $$("i", manifesto);
const bandBg = $(".so-band-bg"), band = $(".so-band");
let manifestoP = -1;
function manifestoTick() {
  const r = manifesto.getBoundingClientRect(), vh = innerHeight;
  // 0 when the paragraph's top reaches 82% of the viewport, 1 when its bottom reaches 48%
  const p = reduce ? 1 : clamp((vh * 0.82 - r.top) / (vh * 0.34 + r.height), 0, 1);
  if (Math.abs(p - manifestoP) > 0.0005) {
    manifestoP = p;
    const n = wordEls.length, head = p * (n + 6);
    for (let i = 0; i < n; i++) wordEls[i].style.opacity = (0.2 + 0.8 * clamp((head - i) / 6, 0, 1)).toFixed(3);
  }
  if (!reduce) {
    const b = band.getBoundingClientRect();
    if (b.bottom > 0 && b.top < vh) bandBg.style.setProperty("--py", ((b.top + b.height / 2 - vh / 2) * -0.06).toFixed(1) + "px");
  }
}
addEventListener("scroll", manifestoTick, { passive: true });
addEventListener("resize", manifestoTick);

/* ---------- hero sea: procedural aerial water in WebGL. The same leaning band the CSS lens
   clips is refracted inside the shader, so headline and water bend together. ---------- */
const SEA_FS = `
precision highp float;
uniform vec2 uRes; uniform float uT; uniform vec3 uBand; uniform vec3 uPtr;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float a = .5, s = 0.; for(int i=0;i<5;i++){ s += a*noise(p); p = p*2.03 + vec2(1.7, 9.2); a *= .5; } return s; }
float sea(vec2 p, float t){
  vec2 q = p + vec2(fbm(p*1.2 + t*.05), fbm(p*1.2 - t*.04 + 4.0)) * .9;
  float swell = sin(q.x*2.2 + q.y*5.5 + t*.55) * .5 + .5;
  return fbm(q*2.6 + vec2(t*.07, -t*.1)) * .72 + swell * .28;
}
void main(){
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 uv = px / uRes;
  float cx = uBand.x + uBand.y * (1.0 - 2.0*uv.y);
  float d = (px.x - cx) / max(uBand.z, 1.0);
  float inside = smoothstep(1.0, .96, abs(d));
  px.x -= inside * (d * uBand.z * .34 + uBand.y * .5);
  vec2 dp = px - uPtr.xy; float r = length(dp);
  float ring = sin(r*.09 - uT*5.0) * exp(-r*.012) * uPtr.z;
  px += normalize(dp + .001) * ring * 9.0;
  vec2 p = vec2(px.x / uRes.y, px.y / uRes.y) * 2.4;
  float h = sea(p, uT);
  float hx = sea(p + vec2(.012, 0.), uT), hy = sea(p + vec2(0., .012), uT);
  vec2 n = vec2(h - hx, h - hy) * 26.0;
  vec3 deep = vec3(.016, .086, .19), mid = vec3(.03, .2, .38), lit = vec3(.11, .42, .62);
  vec3 col = mix(deep, mid, smoothstep(.25, .62, h));
  col = mix(col, lit, smoothstep(.58, .82, h) * .55);
  float glint = pow(clamp(dot(normalize(vec3(n, 1.0)), normalize(vec3(-.45, -.5, .74))), 0., 1.), 22.0);
  col += vec3(.75, .9, 1.) * glint * .34;
  col += vec3(.8, .95, 1.) * smoothstep(.83, .95, h) * .18;
  float v = smoothstep(1.25, .25, length((uv - vec2(.42, .4)) * vec2(1.1, 1.3)));
  col *= .58 + .5 * v;
  col = mix(col, col * 1.16 + vec3(.0, .035, .05), inside);
  col += (hash(gl_FragCoord.xy + uT) - .5) * .012;
  gl_FragColor = vec4(col, 1.0);
}`;

const hero = $("#hero"), seaCv = $("#sea"), lens = $("#lens"), edgeL = $("#edgeL"), edgeR = $("#edgeR");
const seaState = { w: 0, h: 0, x: -200, tilt: 0, half: 54, tx: -200, ptrOn: false, px: 0, py: 0, ripple: 0, frames: 0, gl: false };
let seaGL = null, seaU = null;
function seaInit() {
  let gl = null;
  try { gl = seaCv.getContext("webgl", { antialias: false, alpha: false, powerPreference: "low-power" }); } catch (e) { gl = null; }
  if (!gl) return;
  const mk = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
  const vs = mk(gl.VERTEX_SHADER, "attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }");
  const fs = mk(gl.FRAGMENT_SHADER, SEA_FS);
  if (!vs || !fs) return;
  const pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return;
  gl.useProgram(pr);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
  const loc = gl.getAttribLocation(pr, "a"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
  seaGL = gl; seaState.gl = true;
  seaU = { res: gl.getUniformLocation(pr, "uRes"), t: gl.getUniformLocation(pr, "uT"), band: gl.getUniformLocation(pr, "uBand"), ptr: gl.getUniformLocation(pr, "uPtr") };
  seaCv.addEventListener("webglcontextlost", (e) => { e.preventDefault(); seaGL = null; seaState.gl = false; });
}
function seaResize() {
  const r = hero.getBoundingClientRect();
  seaState.w = r.width; seaState.h = r.height;
  seaState.half = clamp(r.width * 0.045, 34, 64);
  if (!seaGL) return;
  // the water is soft by nature: render at reduced resolution, it costs a third and looks the same
  const k = Math.min(devicePixelRatio || 1, 1.5) * (r.width > 900 ? 0.6 : 0.75);
  seaCv.width = Math.max(2, Math.round(r.width * k)); seaCv.height = Math.max(2, Math.round(r.height * k));
  seaState.k = seaCv.width / r.width;
  seaGL.viewport(0, 0, seaCv.width, seaCv.height);
}
function seaDraw(t) {
  if (!seaGL) return;
  const s = seaState, k = s.k;
  seaGL.uniform2f(seaU.res, seaCv.width, seaCv.height);
  seaGL.uniform1f(seaU.t, t);
  seaGL.uniform3f(seaU.band, s.x * k, s.tilt * k, s.half * k);
  seaGL.uniform3f(seaU.ptr, s.px * k, s.py * k, s.ripple);
  seaGL.drawArrays(seaGL.TRIANGLES, 0, 3);
}

/* lens: follows the pointer with a spring, leans with its speed; with no pointer it drifts slowly */
let seaRun = false, seaVisible = true, seaT0 = performance.now(), seaLast = 0, lastMoveT = 0;
function lensApply() {
  const s = seaState;
  lens.style.setProperty("--x", s.x.toFixed(1) + "px");
  lens.style.setProperty("--tilt", s.tilt.toFixed(1) + "px");
  lens.style.setProperty("--half", s.half.toFixed(1) + "px");
  const ang = Math.atan2(2 * s.tilt, s.h || 1) * 180 / Math.PI;
  edgeL.style.transform = `translateX(${(s.x - s.half + 10).toFixed(1)}px) rotate(${ang.toFixed(2)}deg)`;
  edgeR.style.transform = `translateX(${(s.x + s.half + 10).toFixed(1)}px) rotate(${ang.toFixed(2)}deg)`;
}
function seaFrame(now) {
  if (!seaRun) return;
  const s = seaState, t = (now - seaT0) / 1000, dt = Math.min(0.05, (now - seaLast) / 1000 || 0.016);
  seaLast = now;
  const idle = !s.ptrOn || now - lastMoveT > 2600;
  if (idle) s.tx = s.w * (0.5 + 0.36 * Math.sin(t * 0.22 + 0.9));
  const prev = s.x;
  s.x += (s.tx - s.x) * (1 - Math.exp(-dt * (idle ? 2.2 : 9)));
  const vel = (s.x - prev) / dt;                       // px/s
  const want = clamp(vel * 0.07, -90, 90) + (idle ? 16 * Math.cos(t * 0.22 + 0.9) : 0);
  s.tilt += (want - s.tilt) * (1 - Math.exp(-dt * 7));
  s.ripple += ((idle ? 0 : 1) - s.ripple) * (1 - Math.exp(-dt * 3));
  lensApply(); seaDraw(t); s.frames++;
  requestAnimationFrame(seaFrame);
}
function seaStart() {
  const should = seaVisible && !document.hidden && !reduce;
  if (should && !seaRun) { seaRun = true; seaLast = performance.now(); requestAnimationFrame(seaFrame); }
  if (!should) seaRun = false;
}
seaInit(); seaResize();
if (reduce) {
  // still water: one frame, the band parked off-screen
  seaState.x = -400; lensApply(); seaDraw(12);
} else {
  seaState.x = seaState.tx = seaState.w * 0.5;
  hero.addEventListener("pointermove", (e) => {
    const r = hero.getBoundingClientRect();
    seaState.ptrOn = true; lastMoveT = performance.now();
    seaState.tx = e.clientX - r.left; seaState.px = e.clientX - r.left; seaState.py = e.clientY - r.top;
  });
  hero.addEventListener("pointerleave", () => { seaState.ptrOn = false; });
  if ("IntersectionObserver" in window) new IntersectionObserver((es) => { seaVisible = es[0].isIntersecting; seaStart(); }).observe(hero);
  document.addEventListener("visibilitychange", seaStart);
  seaStart();
}
let seaRz = 0;
addEventListener("resize", () => { cancelAnimationFrame(seaRz); seaRz = requestAnimationFrame(() => { seaResize(); if (reduce) { lensApply(); seaDraw(12); } }); });

/* ---------- menu: pranzo/cena, the three Fidati (flip-to-reveal), à la carte accordion ---------- */
let service = romeNow().min < 930 ? "pranzo" : "cena";
const CATALOG = {};
D.sets.forEach((s) => { CATALOG[s.id] = { name: s.name, desc: "Percorso fisso", price: s.price }; });
CATALOG[D.maestro.id] = { name: D.maestro.name, desc: "Percorso dell'itamae", price: D.maestro.price };
D.carta.forEach((g) => g.items.forEach((it) => { CATALOG[it.id] = { name: it.name, desc: it.desc, price: { pranzo: it.price, cena: it.price } }; }));
const priceOf = (id, svc = service) => CATALOG[id].price[svc];
const pieces = (set) => set.items.reduce((n, [, pz]) => n + pz, 0);

const setsEl = $("#sets"), compareBtn = $("#compareBtn");
function renderSets() {
  setsEl.innerHTML = D.sets.map((s, i) => {
    const prev = i ? new Map(D.sets[i - 1].items) : null;
    const list = s.items.map(([k, pz]) => {
      const extra = prev && (!prev.has(k) || prev.get(k) < pz);
      return `<li class="${extra ? "is-extra" : ""}"><span>${D.dishes[k]}</span><small>${pz ? pz + " pz" : ""}</small></li>`;
    }).join("");
    const diff = i ? `+${pieces(s) - pieces(D.sets[i - 1])} nigiri rispetto a ${D.sets[i - 1].name}` : "La base: tre nigiri, un sashimi, un temaki";
    return `<article class="so-set" data-set="${s.id}">
      <div class="so-set-in">
        <div class="so-face so-face--front">
          <div class="so-set-pic"><img src="${s.img}" alt="" width="900" height="600" loading="lazy" draggable="false"></div>
          <div class="so-set-body">
            <p class="so-set-tag">${s.tag}</p><h3>${s.name}</h3>
            <p class="so-set-count">${s.items.length} portate · ${pieces(s)} nigiri</p>
            <div class="so-set-foot"><b class="so-price" data-price="${s.id}"></b>
              <div class="so-set-acts">
                <button type="button" class="so-iconbtn" data-flip aria-label="Gira: cosa c'è nel ${s.name}" aria-expanded="false">↻</button>
                <button type="button" class="so-iconbtn so-iconbtn--gold" data-add="${s.id}" aria-label="Aggiungi ${s.name} all'asporto">+</button>
              </div></div>
          </div>
        </div>
        <div class="so-face so-face--back" inert>
          <div class="so-back-h"><span class="so-set-tag">${s.name}</span><b data-price="${s.id}"></b></div>
          <ul class="so-back-list">${list}</ul>
          <p class="so-back-diff">${diff}</p>
          <div class="so-back-foot">
            <button type="button" class="so-btn so-btn--line so-btn--sm" data-flip>Torna</button>
            <button type="button" class="so-btn so-btn--gold so-btn--sm" data-add="${s.id}">Aggiungi</button>
          </div>
        </div>
      </div></article>`;
  }).join("");
}
function flipSet(card, on) {
  card.classList.toggle("is-flipped", on);
  $(".so-face--front", card).inert = on; $(".so-face--back", card).inert = !on;
  $("[data-flip]", card).setAttribute("aria-expanded", String(on));
}
/* the faces are absolutely stacked, so the card can't size to its content: grow it until the longest face fits.
   Side by side the three share one height; stacked (phone) each card takes its own. */
function fitSets() {
  const cards = $$(".so-set", setsEl);
  if (!cards.length) return;
  cards.forEach((c) => { c.style.height = ""; });
  // measured from the last child, not scrollHeight: a column flexbox leaves its bottom padding out of the scrollable overflow
  const over = (f) => { const l = f.lastElementChild; return Math.ceil(l.offsetTop + l.offsetHeight + parseFloat(getComputedStyle(f).paddingBottom) - f.clientHeight); };
  const need = cards.map((c) => Math.max(...$$(".so-face", c).map(over)));
  const stacked = cards.length > 1 && cards[1].offsetTop > cards[0].offsetTop + 10;
  const max = Math.max(...need);
  cards.forEach((c, i) => { const n = stacked ? need[i] : max; if (n > 0) c.style.height = c.offsetHeight + n + "px"; });
}
let fitRz = 0;
addEventListener("resize", () => { cancelAnimationFrame(fitRz); fitRz = requestAnimationFrame(fitSets); });
if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitSets);
addEventListener("load", fitSets);
function setCompare(on) {
  $$(".so-set", setsEl).forEach((c, i) => setTimeout(() => flipSet(c, on), reduce ? 0 : i * 90));
  setsEl.classList.toggle("is-compare", on);
  compareBtn.setAttribute("aria-pressed", String(on));
  compareBtn.textContent = on ? "Chiudi il confronto" : "Confronta i tre";
  $("#setsHint").textContent = on ? "In oro, quello che ogni percorso aggiunge al precedente." : "Gira una carta per vedere cosa arriva al tavolo.";
}
setsEl.addEventListener("click", (e) => {
  const f = e.target.closest("[data-flip]");
  if (!f) return;
  const card = f.closest(".so-set"), on = !card.classList.contains("is-flipped");
  flipSet(card, on);
  if (!on && setsEl.classList.contains("is-compare") && !$(".so-set.is-flipped", setsEl)) setCompare(false);
  const focusTo = $(on ? ".so-face--back [data-flip]" : ".so-face--front [data-flip]", card);
  setTimeout(() => focusTo.focus({ preventScroll: true }), reduce ? 0 : 320);
});
compareBtn.addEventListener("click", () => setCompare(compareBtn.getAttribute("aria-pressed") !== "true"));

function setService(svc, animate = true) {
  service = svc;
  $(".so-seg").dataset.on = svc;
  $$(".so-seg [role=tab]").forEach((b) => { const on = b.dataset.service === svc; b.setAttribute("aria-selected", String(on)); b.tabIndex = on ? 0 : -1; });
  $$("[data-price]").forEach((el) => {
    el.textContent = eurShort(priceOf(el.dataset.price));
    if (animate && el.classList.contains("so-price")) { el.classList.remove("is-swap"); void el.offsetWidth; el.classList.add("is-swap"); }
  });
  const mp = $("#maestroPrice"); mp.textContent = eurShort(priceOf("maestro"));
}
$(".so-seg").addEventListener("click", (e) => { const b = e.target.closest("[data-service]"); if (b && b.dataset.service !== service) setService(b.dataset.service); });
$(".so-seg").addEventListener("keydown", (e) => {
  if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
  e.preventDefault(); setService(service === "pranzo" ? "cena" : "pranzo"); $(`.so-seg [data-service="${service}"]`).focus();
});

const accEl = $("#acc");
function renderCarta() {
  accEl.innerHTML = D.carta.map((g, i) => `
    <div class="so-acc-item">
      <button type="button" class="so-acc-btn" id="accB-${g.id}" aria-expanded="${i === 0}" aria-controls="accP-${g.id}">${g.name}<svg width="18" height="18" aria-hidden="true"><use href="#so-i-bars"/></svg></button>
      <div class="so-acc-panel${i === 0 ? " is-open" : ""}" id="accP-${g.id}" role="region" aria-labelledby="accB-${g.id}"${i === 0 ? "" : " inert"}><div>
        ${g.note ? `<p class="so-acc-note">${g.note}</p>` : ""}
        ${g.items.map((it) => `<div class="so-dish">
          ${it.img ? `<img src="${it.img}" alt="" width="128" height="96" loading="lazy" draggable="false">` : `<i class="so-dish-ph" aria-hidden="true"><svg width="34" height="14"><use href="#so-fish"/></svg></i>`}
          <div><b>${it.name}</b><span>${it.desc}</span></div><em>${eur(it.price)}</em>
          <button type="button" class="so-iconbtn" data-add="${it.id}" aria-label="Aggiungi ${it.name} all'asporto">+</button></div>`).join("")}
      </div></div>
    </div>`).join("");
}
accEl.addEventListener("click", (e) => {
  const b = e.target.closest(".so-acc-btn");
  if (!b) return;
  const on = b.getAttribute("aria-expanded") !== "true", p = b.nextElementSibling;
  b.setAttribute("aria-expanded", String(on)); p.classList.toggle("is-open", on); p.inert = !on;
});

/* ---------- sedi: hovering a row tints the whole section and cross-fades the card
   (hover-tinted-service-list) ---------- */
const sediSec = $("#sedi"), sediList = $("#sediList"), sedeBody = $("#sedeBody"), sedePhoto = $("#sedePhoto");
let sedeOn = D.sedi[0].id, sedeSwapT = 0;
function sedeBodyHTML(s) {
  const now = romeNow(), st = statusFor(s, now.dow, now.min), q = queueFor(s, 2, now);
  const today = s.hours[now.dow].map(fmtRange).join(" · ") || "Chiuso";
  return `<h3>${s.name}</h3><p class="so-sede-addr">${s.addr}</p>
    <p class="so-sede-status"><i class="so-dot" data-state="${st.state}"></i><span>${st.text}</span></p>
    <dl class="so-sede-meta">
      <dt>Oggi</dt><dd>${today}</dd>
      <dt>Lista</dt><dd>${q.ok ? waitLabel(q) : q.why}</dd>
      <dt>Telefono</dt><dd>${s.tel}</dd>
      <dt>Arrivare</dt><dd>${s.note}</dd>
    </dl>
    <div class="so-sede-acts">
      <button type="button" class="so-btn so-btn--gold so-btn--sm" data-open="wait" data-sede="${s.id}"${q.ok ? "" : " disabled"}>Mettiti in lista</button>
      <button type="button" class="so-btn so-btn--line so-btn--sm" data-open="cart" data-sede="${s.id}">Asporto</button>
    </div>`;
}
function renderSediRows() {
  const now = romeNow();
  sediList.innerHTML = D.sedi.map((s) => {
    const st = statusFor(s, now.dow, now.min), q = queueFor(s, 2, now);
    return `<li class="so-sede-row${s.id === sedeOn ? " is-on" : ""}" role="option" tabindex="0" data-sede="${s.id}" aria-selected="${s.id === sedeOn}">
      <b>${s.name}</b><small><i class="so-dot" data-state="${st.state}"></i>${st.text}</small>
      <span class="so-wait-pill">${q.ok ? "~" + q.mins + " min" : "—"}</span></li>`;
  }).join("");
}
function selectSede(id, instant = false) {
  const s = sedeById(id);
  if (id === sedeOn && !instant) return;
  sedeOn = id;
  sediSec.style.setProperty("--tint", s.tint);
  $$(".so-sede-row", sediList).forEach((r) => { const on = r.dataset.sede === id; r.classList.toggle("is-on", on); r.setAttribute("aria-selected", String(on)); });
  clearTimeout(sedeSwapT);
  const swap = () => {
    sedeBody.innerHTML = sedeBodyHTML(s); sedePhoto.src = s.img; sedePhoto.alt = `Un piatto della sede ${s.name}`;
    sedeBody.classList.remove("is-swap"); sedePhoto.classList.remove("is-swap");
    sedePhoto.style.setProperty("--r", "0deg");
  };
  if (instant || reduce) return swap();
  sedeBody.classList.add("is-swap"); sedePhoto.classList.add("is-swap");
  sedePhoto.style.setProperty("--r", (D.sedi.indexOf(s) % 2 ? 2.4 : -2.4) + "deg");   // the photo leans, then settles
  sedeSwapT = setTimeout(swap, 220);
}
const rowOf = (e) => e.target.closest(".so-sede-row");
sediList.addEventListener("pointerover", (e) => { const r = rowOf(e); if (r && e.pointerType !== "touch") selectSede(r.dataset.sede); });
sediList.addEventListener("focusin", (e) => { const r = rowOf(e); if (r) selectSede(r.dataset.sede); });
sediList.addEventListener("click", (e) => { const r = rowOf(e); if (r) selectSede(r.dataset.sede); });
sediList.addEventListener("keydown", (e) => {
  const r = rowOf(e); if (!r) return;
  const sib = e.key === "ArrowDown" ? r.nextElementSibling : e.key === "ArrowUp" ? r.previousElementSibling : null;
  if (sib) { e.preventDefault(); sib.focus(); }
});

function refreshLive() {
  renderStatus(); renderHours(); renderSediRows();
  sedeBody.innerHTML = sedeBodyHTML(sedeById(sedeOn));
}

/* ---------- lista d'attesa: sede → persone → contatto → biglietto ---------- */
const waitModal = $("#waitModal"), waitForm = $("#waitForm"), waitTicket = $("#waitTicket"), waitStepsEl = $("#waitSteps");
const W = { step: 0, sede: null, party: 2 };
const PARTY_MAX = 8;
const partyNotes = ["", "Da soli si mangia benissimo: posto al banco.", "Tavolo da due, di solito al banco.", "In tre: tavolo o angolo del banco.", "In quattro: tavolo in sala.",
  "In cinque servono due tavoli vicini: l'attesa si allunga un po'.", "In sei servono due tavoli vicini: l'attesa si allunga un po'.", "In sette: vi sediamo appena si liberano tre tavoli.", "In otto: è il massimo che riusciamo a far sedere insieme."];
const validPhone = (v) => /^(\+?39)?3\d{8,9}$/.test(v.replace(/[\s.\-()]/g, ""));
function showErr(el, msg) {
  el.textContent = msg;
  if (msg) { el.classList.remove("is-shake"); void el.offsetWidth; el.classList.add("is-shake"); }
}
function renderWaitSedi() {
  const now = romeNow();
  $("#waitSedi").innerHTML = D.sedi.map((s) => {
    const q = queueFor(s, W.party, now), st = q.st;
    return `<label class="${q.ok ? "" : "is-off"}"><input type="radio" name="wSede" value="${s.id}"${q.ok ? "" : " disabled"}${W.sede === s.id && q.ok ? " checked" : ""}>
      <b>${s.name}</b><small><i class="so-dot" data-state="${st.state}"></i>${q.ok ? st.text : q.why}</small><em>${q.ok ? `${q.ahead} davanti<br>~${q.mins} min` : "—"}</em></label>`;
  }).join("");
  if (W.sede && !queueFor(sedeById(W.sede), W.party, now).ok) W.sede = null;
}
function waitEstimate() {
  const est = $("#waitEst");
  if (!W.sede || W.step === 0) { est.textContent = W.step === 0 ? "Scegli dove vuoi mangiare." : ""; return; }
  const q = queueFor(sedeById(W.sede), W.party);
  est.innerHTML = q.ok ? `<b>${q.ahead}</b> tavoli davanti · circa <b>${q.mins} min</b>` : q.why;
}
function waitGo(step) {
  W.step = step;
  $$(".so-step", waitForm).forEach((f) => { const on = +f.dataset.step === step; f.hidden = !on; f.classList.toggle("is-in", on); });
  $$("li", waitStepsEl).forEach((li, i) => { li.classList.toggle("is-on", i === step); li.classList.toggle("is-done", i < step); });
  $("#waitBack").hidden = step === 0;
  $("#waitNext").textContent = step === 2 ? "Entra in lista" : "Avanti";
  $$(".so-err", waitForm).forEach((e) => { e.textContent = ""; });
  waitEstimate();
}
function partySet(n) {
  if (n > PARTY_MAX) { toast("Più di otto? Chiamaci: ci organizziamo al telefono."); n = PARTY_MAX; }
  W.party = clamp(n, 1, PARTY_MAX);
  $("#partyOut").textContent = W.party;
  $("#partyNote").textContent = partyNotes[W.party];
  $("#partyMinus").disabled = W.party <= 1;
  waitEstimate();
}
$("#partyMinus").addEventListener("click", () => partySet(W.party - 1));
$("#partyPlus").addEventListener("click", () => partySet(W.party + 1));
$("#waitSedi").addEventListener("change", (e) => { W.sede = e.target.value; showErr($("#errSede"), ""); });
$("#waitBack").addEventListener("click", () => waitGo(W.step - 1));
waitForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (W.step === 0) {
    if (!W.sede) return showErr($("#errSede"), "Scegli una sede aperta per entrare in lista.");
    return waitGo(1);
  }
  if (W.step === 1) {
    if (W.party > 1 && !$("#allHere").checked) return showErr($("#errParty"), "Conferma che arriverete insieme: senza il gruppo completo non possiamo farvi sedere.");
    return waitGo(2);
  }
  const name = $("#wName"), phone = $("#wPhone");
  const badN = name.value.trim().length < 2, badP = !validPhone(phone.value);
  name.setAttribute("aria-invalid", String(badN)); phone.setAttribute("aria-invalid", String(badP));
  if (badN) { name.focus(); return showErr($("#errContact"), "Scrivi il nome con cui ti chiameremo."); }
  if (badP) { phone.focus(); return showErr($("#errContact"), "Serve un cellulare italiano valido, ad esempio 333 123 4567."); }
  const sede = sedeById(W.sede), q = queueFor(sede, W.party);
  if (!q.ok) { waitGo(0); renderWaitSedi(); return showErr($("#errSede"), q.why + "."); }
  const no = String.fromCharCode(65 + D.sedi.indexOf(sede)) + String(10 + ((romeNow().min * 7 + W.party * 13) % 89)).padStart(2, "0");
  store.set("ticket", { no, sede: sede.id, party: W.party, name: name.value.trim(), ahead0: q.ahead, mins0: q.mins, t0: Date.now(), state: "live" });
  renderTicket(); toast(`Sei in lista a ${sede.name}. Numero ${no}.`);
});
function openWait(sedeId) {
  const tk = store.get("ticket");
  if (!tk || tk.state !== "live") {
    if (sedeId) W.sede = sedeId;
    renderWaitSedi(); partySet(W.party);
    waitGo(W.sede && sedeId ? 1 : 0);
  }
  renderTicket();
  openModal(waitModal);
}

/* the ticket: counts down on real elapsed time, survives a reload when storage is available */
let tkSkew = 0, tkAsk = false;
function ticketLive(tk) {
  const el = (Date.now() - tk.t0) / 60000 + tkSkew;
  const mins = Math.max(0, Math.ceil(tk.mins0 - el));
  const ahead = mins === 0 ? 0 : Math.max(0, Math.min(tk.ahead0, Math.ceil(tk.ahead0 * (mins / tk.mins0))));
  return { mins, ahead, p: clamp(1 - mins / tk.mins0, 0, 1), ready: mins === 0 };
}
function renderTicket() {
  const tk = store.get("ticket"), chip = $("#waitChip");
  const live = tk && tk.state === "live";
  waitForm.hidden = !!tk; waitStepsEl.hidden = !!tk; waitTicket.hidden = !tk;
  chip.hidden = !live;
  if (!tk) { waitTicket.innerHTML = ""; return; }
  const sede = sedeById(tk.sede);
  if (tk.state === "cancelled") {
    waitTicket.innerHTML = `<div class="so-tk is-cancelled"><p class="so-tk-no">${tk.no}</p><p class="so-tk-sub">Hai lasciato la lista</p>
      <p class="so-tk-msg">Nessun problema, ${tk.name}. Il posto è passato al tavolo dopo di te.</p>
      <div class="so-tk-acts"><button type="button" class="so-btn so-btn--gold so-btn--sm" data-tk="again">Rimettiti in lista</button></div></div>`;
    return;
  }
  const L = ticketLive(tk);
  chip.textContent = L.ready ? "Pronto" : `~${L.mins}′`;
  waitTicket.innerHTML = `<div class="so-tk${L.ready ? " is-ready" : ""}">
    <p class="so-tk-no">${tk.no}</p><p class="so-tk-sub">${sede.name} · ${tk.party} ${tk.party === 1 ? "persona" : "persone"} · ${tk.name}</p>
    <div class="so-tk-grid"><div><span>Tavoli davanti</span><b data-tk-ahead>${L.ahead}</b></div><div><span>Attesa stimata</span><b data-tk-mins>${L.ready ? "ora" : L.mins + " min"}</b></div></div>
    <div class="so-tk-bar"><i style="--p:${L.p.toFixed(3)}"></i></div>
    <p class="so-tk-msg">${L.ready ? "Il tavolo è pronto. Hai 10 minuti per presentarti alla cassa." : "Ti scriviamo un SMS quando tocca a te. Sediamo il gruppo solo al completo."}</p>
    ${tkAsk ? `<p class="so-tk-ask">Sicuro di voler lasciare la lista? Il posto non si può riprendere.</p>
      <div class="so-tk-acts"><button type="button" class="so-btn so-btn--line so-btn--sm" data-tk="keep">Resto in lista</button><button type="button" class="so-btn so-btn--gold so-btn--sm" data-tk="leave">Sì, esco</button></div>`
      : `<div class="so-tk-acts"><button type="button" class="so-btn so-btn--line so-btn--sm" data-tk="ask">Lascia la lista</button><button type="button" class="so-btn so-btn--gold so-btn--sm" data-close>Ho capito</button></div>`}
  </div>`;
}
waitTicket.addEventListener("click", (e) => {
  const b = e.target.closest("[data-tk]");
  if (!b) return;
  const act = b.dataset.tk, tk = store.get("ticket");
  if (act === "ask") tkAsk = true;
  if (act === "keep") tkAsk = false;
  if (act === "leave") { tkAsk = false; store.set("ticket", { ...tk, state: "cancelled" }); toast("Hai lasciato la lista d'attesa."); }
  if (act === "again") { store.del("ticket"); W.sede = tk.sede; renderWaitSedi(); partySet(W.party); waitGo(0); }
  renderTicket();
  const f = $("[data-tk], input", waitModal); if (f) f.focus({ preventScroll: true });
});

/* ---------- asporto: borsa, sede e orario di ritiro. The lunch price follows the pickup time. ---------- */
const cartModal = $("#cartModal"), cartLines = $("#cartLines");
let cart = store.get("cart") || {};
Object.keys(cart).forEach((id) => { if (!CATALOG[id]) delete cart[id]; });
const P = { sede: D.sedi[0].id, slot: null, slots: [] };
const seenLines = new Set();
const cartCount = () => Object.values(cart).reduce((a, b) => a + b, 0);
const cartService = () => (P.slot && P.slot.min >= 930 ? "cena" : P.slot ? "pranzo" : service);
const cartTotal = () => Object.entries(cart).reduce((a, [id, q]) => a + priceOf(id, cartService()) * q, 0);

function slotsFor(sede, now = romeNow()) {
  for (let d = 0; d <= 7; d++) {
    const dow = (now.dow + d) % 7, out = [];
    const ivs = d === 0 ? intervalsOn(sede, dow) : sede.hours[dow];
    const from = d === 0 ? Math.ceil((now.min + 25) / 15) * 15 : 0;
    ivs.forEach(([o, c]) => { for (let m = Math.max(Math.ceil((o + 15) / 15) * 15, from); m <= Math.min(c, 1440) - 15; m += 15) out.push({ d, min: m }); });
    if (out.length) return { day: d === 0 ? "Oggi" : d === 1 ? "Domani" : DAYS[dow][0].toUpperCase() + DAYS[dow].slice(1), list: out.slice(0, 12) };
  }
  return { day: "", list: [] };
}
function renderSlots() {
  const s = slotsFor(sedeById(P.sede));
  P.slots = s.list;
  if (!P.slot || !s.list.some((x) => x.d === P.slot.d && x.min === P.slot.min)) P.slot = s.list[0] || null;
  $("#pkSlots").innerHTML = `<p class="so-slots-day">${s.day || "Nessun orario disponibile"}</p>` + s.list.map((x, i) =>
    `<button type="button" role="radio" data-slot="${i}" aria-checked="${x === P.slot || (P.slot && x.min === P.slot.min && x.d === P.slot.d)}">${hhmm(x.min)}</button>`).join("");
  $("#pkService").textContent = !P.slot ? "" : cartService() === "pranzo" ? `Ritiro alle ${hhmm(P.slot.min)}: valgono i prezzi del pranzo.` : `Ritiro alle ${hhmm(P.slot.min)}: valgono i prezzi della cena (dalle 15:30).`;
}
function renderCart() {
  const n = cartCount(), svc = cartService();
  [$("#cartCount"), $("#cartCountM")].forEach((c) => { c.hidden = !n; c.textContent = n; });
  cartLines.innerHTML = Object.entries(cart).map(([id, q]) => {
    const it = CATALOG[id];
    const old = seenLines.has(id); seenLines.add(id);
    return `<li class="so-line" data-line="${id}"${old ? ' style="animation:none"' : ""}><div><b>${it.name}</b><small>${it.desc} · ${eur(priceOf(id, svc))}</small></div><em>${eur(priceOf(id, svc) * q)}</em>
      <div class="so-qty"><button type="button" data-qty="-1" aria-label="Uno in meno: ${it.name}">−</button><output>${q}</output><button type="button" data-qty="1" aria-label="Uno in più: ${it.name}">+</button></div></li>`;
  }).join("");
  $("#cartEmpty").hidden = n > 0; $("#pickup").hidden = !n; $("#cartFoot").hidden = !n;
  $("#cartQty").textContent = n ? `· ${n} ${n === 1 ? "articolo" : "articoli"}` : "";
  $("#cartTotal").textContent = eur(cartTotal());
}
function cartSave() { store.set("cart", cart); }
function addToCart(id, by = 1) {
  const q = clamp((cart[id] || 0) + by, 0, 20);
  if (q) cart[id] = q; else { delete cart[id]; seenLines.delete(id); }
  cartSave(); renderCart();
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-add]");
  if (!b) return;
  addToCart(b.dataset.add);
  [$("#cartCount"), $("#cartCountM")].forEach((c) => { c.classList.remove("is-bump"); void c.offsetWidth; c.classList.add("is-bump"); });
  toast(`${CATALOG[b.dataset.add].name} è nella borsa.`);
});
cartLines.addEventListener("click", (e) => {
  const b = e.target.closest("[data-qty]");
  if (!b) return;
  const li = b.closest("[data-line]"), id = li.dataset.line, idx = $$("[data-line]", cartLines).indexOf(li), dir = b.dataset.qty;
  addToCart(id, +dir);
  const again = $(`[data-line="${id}"] [data-qty="${dir}"]`, cartLines) || $$("[data-qty]", cartLines)[Math.max(0, idx - 1) * 2] || $("#cartEmpty a");
  if (again) again.focus({ preventScroll: true });
});
$("#pkSede").innerHTML = D.sedi.map((s) => `<option value="${s.id}">${s.name}</option>`).join("");
$("#pkSede").addEventListener("change", (e) => { P.sede = e.target.value; P.slot = null; renderSlots(); renderCart(); });
$("#pkSlots").addEventListener("click", (e) => {
  const b = e.target.closest("[data-slot]");
  if (!b) return;
  P.slot = P.slots[+b.dataset.slot]; renderSlots(); renderCart();
  $(`[data-slot="${b.dataset.slot}"]`).focus({ preventScroll: true });
});

const cartDone = $("#cartDone");
function openCart(sedeId) {
  if (sedeId) { P.sede = sedeId; P.slot = null; }
  $("#pkSede").value = P.sede;
  cartDone.hidden = true; showErr($("#errCart"), "");
  renderSlots(); renderCart();
  openModal(cartModal);
}
$("#cartGo").addEventListener("click", () => {
  const name = $("#pkName"), phone = $("#pkPhone"), err = $("#errCart");
  const badN = name.value.trim().length < 2, badP = !validPhone(phone.value);
  name.setAttribute("aria-invalid", String(badN)); phone.setAttribute("aria-invalid", String(badP));
  if (!cartCount()) return showErr(err, "La borsa è vuota.");
  if (!P.slot) return showErr(err, "Per questa sede non ci sono orari di ritiro disponibili.");
  if (badN) { name.focus(); return showErr(err, "Scrivi il nome per il ritiro."); }
  if (badP) { phone.focus(); return showErr(err, "Serve un cellulare italiano valido, ad esempio 333 123 4567."); }
  const sede = sedeById(P.sede), total = cartTotal(), n = cartCount();
  const day = P.slot.d === 0 ? "oggi" : P.slot.d === 1 ? "domani" : DAYS[(romeNow().dow + P.slot.d) % 7];
  const no = "R" + String(100 + ((P.slot.min * 3 + n * 17 + Math.round(total)) % 900));
  cartDone.innerHTML = `<svg width="72" height="30" aria-hidden="true" style="color:var(--gold)"><use href="#so-fish"/></svg>
    <p class="so-eyebrow">Ordine ricevuto</p><p class="so-done-no">${no}</p>
    <p><b>${name.value.trim()}</b>, ti aspettiamo ${day} alle <b>${hhmm(P.slot.min)}</b> a ${sede.name}, ${sede.addr.split(",")[0]}.</p>
    <p>${n} ${n === 1 ? "articolo" : "articoli"} · <b>${eur(total)}</b> · paghi al ritiro</p>
    <button type="button" class="so-btn so-btn--line so-btn--sm" data-close>Chiudi</button>`;
  cartDone.hidden = false;
  cart = {}; seenLines.clear(); cartSave(); renderCart(); showErr(err, "");
  $("button", cartDone).focus({ preventScroll: true });
});
[["#wName", "#errContact"], ["#wPhone", "#errContact"], ["#pkName", "#errCart"], ["#pkPhone", "#errCart"]].forEach(([i, e]) =>
  $(i).addEventListener("input", () => { $(i).removeAttribute("aria-invalid"); $(e).textContent = ""; }));

/* ---------- boot ---------- */
renderSets(); renderCarta(); setService(service, false); fitSets();
refreshLive(); selectSede(sedeOn, true);
renderCart(); renderTicket(); manifestoTick();
setInterval(() => {
  refreshLive();
  if (!waitModal.hidden && waitForm.hidden === false) { renderWaitSedi(); waitEstimate(); }
  const tk = store.get("ticket");
  if (tk && tk.state === "live" && !tkAsk) renderTicket();
}, 30000);

/* test hooks: freeze the Rome clock, fast-forward the ticket, read the sea state */
window.__so = {
  setNow(dow, min) { fakeNow = dow == null ? null : { dow, min }; service = romeNow().min < 930 ? "pranzo" : "cena"; setService(service, false); refreshLive(); renderSlots(); renderCart(); },
  status: (id, dow, min) => statusFor(sedeById(id), dow, min),
  queue: (id, party, dow, min) => queueFor(sedeById(id), party, { dow, min }),
  skipTicket(min) { tkSkew += min; renderTicket(); },
  sea: seaState, cart: () => ({ ...cart }), total: cartTotal, manifesto: () => manifestoP
};
})();
