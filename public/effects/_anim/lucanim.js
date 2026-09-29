/* LucAnim — animated Lucide icons.
 *
 * The trigger model follows Lordicon's player (in / click / hover / loop /
 * loop-on-hover / morph / boomerang / sequence, a target element that receives
 * the events, stroke weight, a primary + secondary colour, speed). The icons
 * are Lucide (ISC) and every motion below is original: no Lordicon artwork or
 * keyframes are used. Morph states run on morphicons (MIT, ../_morph).
 *
 * Motions are built from the icon's own parts — Lucide draws an icon as a few
 * separate strokes (a bell is body + clapper, a bin is body + lid + handle +
 * two slats), so each part can move on its own. Transforms use
 * `transform-box: view-box`, so origins and translations are in the icon's
 * 24-unit grid.
 *
 *   const c = LucAnim.mount(host, { icon: "bell", trigger: "hover", size: 48 });
 *   c.set({ trigger: "loop", stroke: 2.5, primary: "#111", secondary: "#f60", speed: 1 });
 *   c.play("hover-ring"); c.destroy();
 */
window.LucAnim = (() => {
  const NS = "http://www.w3.org/2000/svg";
  const N = window.LucAnimIcons;
  const EO = "cubic-bezier(.2,.8,.2,1)";          // starts fast, lands soft
  const EIO = "cubic-bezier(.45,0,.25,1)";        // between keyframes
  const reduceQ = matchMedia("(prefers-reduced-motion: reduce)");

  /* keyframe helpers: f(offset, transform, extra) */
  const f = (o, t, x = {}) => ({ offset: o, transform: t, ...x });
  const S = (o, k) => f(o, `scale(${k})`);
  const R = (o, d) => f(o, `rotate(${d}deg)`);
  const TR = (o, x, y, extra) => f(o, `translate(${x}px, ${y}px)`, extra);
  const track = (parts, origin, frames, opt = {}) => ({ parts, origin, frames, ...opt });

  /* ── the motions ── d = duration (ms), loop = endDelay between loop cycles,
     peak = where a held state rests (morph / hold triggers) */
  const DEF = {
    Heart: { label: "heart", morph: "HeartOff", def: "hover-beat", states: {
      "hover-beat": { d: 900, peak: 0.15, tracks: [track("all", [12, 13], [S(0, 1), S(0.15, 1.18), S(0.3, 0.94), S(0.45, 1.12), S(0.7, 1), S(1, 1)])] },
      "loop-beat": { d: 900, loop: 700, tracks: [track("all", [12, 13], [S(0, 1), S(0.15, 1.18), S(0.3, 0.94), S(0.45, 1.12), S(0.7, 1), S(1, 1)])] },
      "morph-off": { morph: true } } },
    Bell: { label: "bell", accent: [0], def: "hover-ring", states: {
      "hover-ring": { d: 1000, peak: 0.12, tracks: [
        track([1], [12, 2.5], [R(0, 0), R(0.12, 16), R(0.28, -14), R(0.44, 10), R(0.6, -6), R(0.76, 3), R(1, 0)]),
        track([0], [12, 2.5], [R(0, 0), R(0.18, -10), R(0.34, 22), R(0.5, -16), R(0.66, 10), R(0.82, -4), R(1, 0)])] },
      "loop-ring": { d: 1000, loop: 1400, tracks: [
        track([1], [12, 2.5], [R(0, 0), R(0.12, 16), R(0.28, -14), R(0.44, 10), R(0.6, -6), R(0.76, 3), R(1, 0)]),
        track([0], [12, 2.5], [R(0, 0), R(0.18, -10), R(0.34, 22), R(0.5, -16), R(0.66, 10), R(0.82, -4), R(1, 0)])] } } },
    Trash2: { label: "trash", accent: [3, 4], def: "hover-empty", states: {
      "hover-empty": { d: 1100, peak: 0.3, tracks: [
        track([3, 4], [3, 6], [f(0, "translate(0px,0px) rotate(0deg)"), f(0.3, "translate(0px,-1.6px) rotate(-24deg)"), f(0.62, "translate(0px,-1.6px) rotate(-24deg)"), f(0.8, "translate(0px,0.4px) rotate(3deg)"), f(1, "translate(0px,0px) rotate(0deg)")]),
        track([0, 1], [12, 14], [TR(0, 0, 0), TR(0.3, 0, 1.6), TR(0.62, 0, 1.6), TR(0.9, 0, 0), TR(1, 0, 0)]),
        track([2], [12, 22], [S(0, 1), S(0.78, 1), f(0.86, "scale(1.03, 0.96)"), S(1, 1)])] } } },
    CircleCheck: { label: "check", accent: [1], def: "hover-check", states: {
      "hover-check": { d: 700, peak: 1, tracks: [
        track([1], null, [{ offset: 0, strokeDashoffset: 1, strokeDasharray: "1 1" }, { offset: 0.25, strokeDashoffset: 1, strokeDasharray: "1 1" }, { offset: 1, strokeDashoffset: 0, strokeDasharray: "1 1" }], { dash: true, ease: EO }),
        track([0], [12, 12], [S(0, 1), S(0.3, 1.08), S(0.6, 0.98), S(1, 1)])] },
      "loop-check": { d: 700, loop: 1300, tracks: [
        track([1], null, [{ offset: 0, strokeDashoffset: 1, strokeDasharray: "1 1" }, { offset: 0.25, strokeDashoffset: 1, strokeDasharray: "1 1" }, { offset: 1, strokeDashoffset: 0, strokeDasharray: "1 1" }], { dash: true, ease: EO }),
        track([0], [12, 12], [S(0, 1), S(0.3, 1.08), S(0.6, 0.98), S(1, 1)])] } } },
    Settings: { label: "settings", accent: [1], def: "hover-spin", states: {
      "hover-spin": { d: 1000, peak: 0.6, tracks: [
        track([0], [12, 12], [R(0, 0), R(0.6, 200), R(1, 180)], { ease: EO }),
        track([1], [12, 12], [S(0, 1), S(0.3, 0.7), S(0.7, 1.08), S(1, 1)])] },
      "loop-spin": { d: 4000, loop: 0, linear: true, tracks: [track([0], [12, 12], [R(0, 0), R(1, 360)])] } } },
    Send: { label: "send", accent: [1], def: "hover-fly", states: {
      "hover-fly": { d: 1000, peak: 0.38, tracks: [
        track("all", [12, 12], [TR(0, 0, 0, { opacity: 1 }), TR(0.38, 8, -8, { opacity: 0 }), TR(0.4, -8, 8, { opacity: 0 }), TR(0.85, 0.6, -0.6, { opacity: 1 }), TR(1, 0, 0, { opacity: 1 })])] } } },
    Download: { label: "download", accent: [0, 2], def: "hover-drop", states: {
      "hover-drop": { d: 900, peak: 0.25, tracks: [
        track([0, 2], [12, 12], [TR(0, 0, 0), TR(0.25, 0, -3), TR(0.55, 0, 2.4), TR(0.75, 0, -0.6), TR(1, 0, 0)]),
        track([1], [12, 21], [S(0, 1), S(0.5, 1), f(0.6, "scale(1.06, 0.72)"), f(0.8, "scale(0.98, 1.06)"), S(1, 1)])] },
      "loop-drop": { d: 900, loop: 900, tracks: [
        track([0, 2], [12, 12], [TR(0, 0, 0), TR(0.25, 0, -3), TR(0.55, 0, 2.4), TR(0.75, 0, -0.6), TR(1, 0, 0)]),
        track([1], [12, 21], [S(0, 1), S(0.5, 1), f(0.6, "scale(1.06, 0.72)"), f(0.8, "scale(0.98, 1.06)"), S(1, 1)])] } } },
    Eye: { label: "eye", accent: [1], def: "hover-blink", states: {
      "hover-blink": { d: 1200, peak: 0.16, tracks: [
        track([0], [12, 12], [f(0, "scale(1,1)"), f(0.16, "scale(1,0.08)"), f(0.32, "scale(1,1)"), f(1, "scale(1,1)")]),
        track([1], [12, 12], [f(0, "translate(0px,0px) scale(1,1)"), f(0.16, "translate(0px,0px) scale(1,0.08)"), f(0.32, "translate(0px,0px) scale(1,1)"), f(0.52, "translate(-2.2px,0px) scale(1,1)"), f(0.74, "translate(2.2px,0px) scale(1,1)"), f(1, "translate(0px,0px) scale(1,1)")])] } } },
    Clock: { label: "clock", accent: [1], def: "hover-wind", states: {
      "hover-wind": { d: 900, peak: 0.5, tracks: [track([1], [12, 12], [R(0, 0), R(1, 360)], { ease: EO })] },
      "loop-tick": { d: 6000, loop: 0, linear: true, tracks: [track([1], [12, 12], [R(0, 0), R(1, 360)])] } } },
    Copy: { label: "copy", accent: [1], def: "hover-shuffle", states: {
      "hover-shuffle": { d: 900, peak: 0.35, tracks: [
        track([0], [12, 12], [TR(0, 0, 0), TR(0.35, 2.2, 2.2), TR(0.7, -0.4, -0.4), TR(1, 0, 0)]),
        track([1], [12, 12], [TR(0, 0, 0), TR(0.35, -1.6, -1.6), TR(0.7, 0.3, 0.3), TR(1, 0, 0)])] } } },
    Coins: { label: "coins", accent: [1, 2], def: "hover-jump", states: {
      "hover-jump": { d: 1000, peak: 0.3, tracks: [
        track([1, 3], [16, 14], [TR(0, 0, 0), TR(0.3, 0, -5), TR(0.55, 0, 0), TR(0.7, 0, -1.4), TR(0.85, 0, 0), TR(1, 0, 0)]),
        track([0, 2], [9, 22], [S(0, 1), S(0.5, 1), f(0.57, "scale(1.05, 0.92)"), S(0.75, 1), S(1, 1)])] } } },
    House: { label: "house", accent: [0], def: "hover-door", states: {
      "hover-door": { d: 1100, peak: 0.4, tracks: [
        track([0], [9, 17], [f(0, "scale(1,1)"), f(0.4, "scale(0.15,1)"), f(0.62, "scale(0.15,1)"), f(0.88, "scale(1.08,1)"), f(1, "scale(1,1)")]),
        track([1], [12, 21], [S(0, 1), f(0.14, "scale(1.02,0.97)"), f(0.3, "scale(0.99,1.02)"), S(0.45, 1), S(1, 1)])] } } },
    Volume2: { label: "volume", accent: [1, 2], def: "hover-waves", states: {
      "hover-waves": { d: 1000, peak: 0.6, tracks: [
        track([0], [6, 12], [S(0, 1), S(0.1, 0.9), S(0.3, 1), S(1, 1)]),
        track([1], [12, 12], [TR(0, 0, 0, { opacity: 1 }), TR(0.06, -1.5, 0, { opacity: 0 }), TR(0.32, 0, 0, { opacity: 1 }), TR(1, 0, 0, { opacity: 1 })]),
        track([2], [12, 12], [TR(0, 0, 0, { opacity: 1 }), TR(0.06, -2, 0, { opacity: 0 }), TR(0.3, -2, 0, { opacity: 0 }), TR(0.58, 0, 0, { opacity: 1 }), TR(1, 0, 0, { opacity: 1 })])] },
      "loop-waves": { d: 1000, loop: 500, tracks: [
        track([1], [12, 12], [TR(0, -1.5, 0, { opacity: 0 }), TR(0.3, 0, 0, { opacity: 1 }), TR(0.8, 0, 0, { opacity: 1 }), TR(1, 0.6, 0, { opacity: 0 })]),
        track([2], [12, 12], [TR(0, -2, 0, { opacity: 0 }), TR(0.25, -2, 0, { opacity: 0 }), TR(0.55, 0, 0, { opacity: 1 }), TR(0.85, 0, 0, { opacity: 1 }), TR(1, 0.8, 0, { opacity: 0 })])] } } },
    Wifi: { label: "wifi", accent: [0], def: "loop-signal", states: {
      "hover-signal": { d: 1100, peak: 0.7, tracks: [
        track([3], null, [{ offset: 0, opacity: 0.15 }, { offset: 0.2, opacity: 1 }, { offset: 1, opacity: 1 }]),
        track([2], null, [{ offset: 0, opacity: 0.15 }, { offset: 0.2, opacity: 0.15 }, { offset: 0.45, opacity: 1 }, { offset: 1, opacity: 1 }]),
        track([1], null, [{ offset: 0, opacity: 0.15 }, { offset: 0.45, opacity: 0.15 }, { offset: 0.7, opacity: 1 }, { offset: 1, opacity: 1 }])] },
      "loop-signal": { d: 1600, loop: 0, tracks: [
        track([3], null, [{ offset: 0, opacity: 0.15 }, { offset: 0.15, opacity: 1 }, { offset: 0.8, opacity: 1 }, { offset: 1, opacity: 0.15 }]),
        track([2], null, [{ offset: 0, opacity: 0.15 }, { offset: 0.2, opacity: 0.15 }, { offset: 0.35, opacity: 1 }, { offset: 0.8, opacity: 1 }, { offset: 1, opacity: 0.15 }]),
        track([1], null, [{ offset: 0, opacity: 0.15 }, { offset: 0.4, opacity: 0.15 }, { offset: 0.55, opacity: 1 }, { offset: 0.8, opacity: 1 }, { offset: 1, opacity: 0.15 }])] } } },
    Sparkles: { label: "sparkles", accent: [1, 2, 3], def: "loop-twinkle", states: {
      "hover-twinkle": { d: 1100, peak: 0.35, tracks: [
        track([0], [12, 12], [f(0, "scale(1) rotate(0deg)"), f(0.35, "scale(0.78) rotate(18deg)"), f(0.7, "scale(1.06) rotate(-4deg)"), f(1, "scale(1) rotate(0deg)")]),
        track([1, 2], [20, 4], [S(0, 1), S(0.2, 0), S(0.55, 1.25), S(1, 1)]),
        track([3], [4, 20], [S(0, 1), S(0.4, 0), S(0.75, 1.3), S(1, 1)])] },
      "loop-twinkle": { d: 1800, loop: 0, tracks: [
        track([0], [12, 12], [f(0, "scale(1) rotate(0deg)"), f(0.5, "scale(0.84) rotate(12deg)"), f(1, "scale(1) rotate(0deg)")]),
        track([1, 2], [20, 4], [S(0, 1), S(0.25, 0.1), S(0.5, 1.2), S(0.75, 1), S(1, 1)]),
        track([3], [4, 20], [S(0, 1), S(0.5, 1), S(0.7, 0.2), S(0.9, 1.25), S(1, 1)])] } } },
    RefreshCw: { label: "refresh", accent: [1, 3], def: "hover-spin", states: {
      "hover-spin": { d: 900, peak: 0.5, tracks: [track("all", [12, 12], [R(0, 0), R(1, 360)], { ease: EO })] },
      "loop-spin": { d: 1200, loop: 0, linear: true, tracks: [track("all", [12, 12], [R(0, 0), R(1, 360)])] } } },
    ThumbsUp: { label: "like", accent: [1], def: "hover-like", states: {
      "hover-like": { d: 900, peak: 0.3, tracks: [track("all", [7, 22], [f(0, "rotate(0deg) scale(1)"), f(0.3, "rotate(-16deg) scale(1.1)"), f(0.6, "rotate(6deg) scale(0.98)"), f(0.82, "rotate(-2deg) scale(1)"), f(1, "rotate(0deg) scale(1)")])] } } },
    Search: { label: "search", accent: [0], def: "hover-zoom", states: {
      "hover-zoom": { d: 900, peak: 0.3, tracks: [
        track([1], [11, 11], [S(0, 1), S(0.3, 1.18), S(0.55, 0.95), S(0.8, 1.02), S(1, 1)]),
        track([0], [11, 11], [TR(0, 0, 0), TR(0.3, 1.3, 1.3), TR(0.55, -0.3, -0.3), TR(1, 0, 0)])] },
      "loop-scan": { d: 2200, loop: 0, tracks: [track("all", [12, 12], [TR(0, 0, 0), TR(0.25, -1.4, -0.8), TR(0.5, 0, -1.4), TR(0.75, 1.4, -0.8), TR(1, 0, 0)])] } } },
    Lock: { label: "lock", morph: "LockOpen", def: "morph-unlock", states: {
      "hover-shake": { d: 700, peak: 0.2, tracks: [track("all", [12, 16], [R(0, 0), R(0.15, -9), R(0.3, 8), R(0.45, -6), R(0.6, 4), R(0.8, -1), R(1, 0)])] },
      "morph-unlock": { morph: true } } },
    Bookmark: { label: "bookmark", morph: "BookmarkCheck", def: "morph-check", states: {
      "hover-flutter": { d: 900, peak: 0.3, tracks: [track("all", [12, 3], [f(0, "scale(1,1)"), f(0.3, "scale(1,0.86)"), f(0.55, "scale(1,1.06)"), f(0.8, "scale(1,0.98)"), f(1, "scale(1,1)")])] },
      "morph-check": { morph: true } } },
    Menu: { label: "menu", morph: "X", def: "morph-close", states: { "morph-close": { morph: true } } },
    Play: { label: "play", morph: "Pause", def: "morph-pause", states: {
      "hover-nudge": { d: 700, peak: 0.3, tracks: [track("all", [12, 12], [TR(0, 0, 0), TR(0.3, 1.6, 0), TR(0.6, -0.4, 0), TR(1, 0, 0)])] },
      "morph-pause": { morph: true } } },
  };

  /* ── the second set: 78 more icons with a motion of their own ── */
  const DRAW = (s = 0, from = 1) => [{ offset: 0, strokeDasharray: "1 1", strokeDashoffset: from }, ...(s ? [{ offset: s, strokeDasharray: "1 1", strokeDashoffset: from }] : []), { offset: 1, strokeDasharray: "1 1", strokeDashoffset: 0 }];
  const draw = (parts, s = 0, opt = {}) => track(parts, null, DRAW(s, opt.reverse ? -1 : 1), { dash: true, ease: EO, ...opt });
  const OP = (...p) => p.map(([o, v]) => ({ offset: o, opacity: v }));
  const T = (o, x, y, r = 0, sx = 1, sy = sx, extra) => f(o, `translate(${x}px, ${y}px) rotate(${r}deg) scale(${sx}, ${sy})`, extra);
  const Z = (o, extra) => T(o, 0, 0, 0, 1, 1, extra);
  /* one hover state and (optionally) its looping twin */
  const pair = (name, st, loop) => (loop == null ? { [`hover-${name}`]: st } : { [`hover-${name}`]: st, [`loop-${name}`]: { ...st, loop } });
  const icon = (label, accent, name, st, loop, more = {}) => ({ label, accent, def: `hover-${name}`, states: { ...pair(name, st, loop), ...more } });
  const shake = (o, a) => [R(0, 0), R(0.1, -a), R(0.2, a * 0.9), R(0.3, -a * 0.7), R(0.4, a * 0.5), R(0.5, -a * 0.2), R(0.6, 0), R(1, 0)];
  const pop = (a = 1.18, at = 0.3) => [S(0, 1), S(at, a), S(at + 0.25, 0.95), S(at + 0.45, 1.02), S(1, 1)];
  const squash = (at, sx = 1.05, sy = 0.9) => [S(0, 1), S(Math.max(0, at - 0.1), 1), f(at, `scale(${sx}, ${sy})`), f(Math.min(1, at + 0.15), `scale(${2 - sx}, ${2 - sy})`), S(Math.min(1, at + 0.3), 1), S(1, 1)];
  /* a slider knob moves dx; the line on each side stretches with it */
  const slide = (knob, left, right, x0, xl, xr, dx, y, delay) => [
    track([knob], [12, 12], [TR(0, 0, 0), TR(0.4, dx, 0), TR(0.6, dx, 0), TR(1, 0, 0)], { delay }),
    track([left], [3, y], [S(0, 1), f(0.4, `scale(${(xl - 3 + dx) / (xl - 3)}, 1)`), f(0.6, `scale(${(xl - 3 + dx) / (xl - 3)}, 1)`), S(1, 1)], { delay }),
    track([right], [21, y], [S(0, 1), f(0.4, `scale(${(21 - xr - dx) / (21 - xr)}, 1)`), f(0.6, `scale(${(21 - xr - dx) / (21 - xr)}, 1)`), S(1, 1)], { delay })];

  Object.assign(DEF, {
    /* arrows & navigation */
    ExternalLink: icon("external-link", [0, 1], "out", { d: 950, peak: 0.35, tracks: [
      track([0, 1], [12, 12], [TR(0, 0, 0, { opacity: 1 }), TR(0.35, 5, -5, { opacity: 0 }), TR(0.4, -3, 3, { opacity: 0 }), TR(0.8, 0.4, -0.4, { opacity: 1 }), TR(1, 0, 0, { opacity: 1 })]),
      track([2], [3, 21], [S(0, 1), S(0.35, 0.94), S(0.7, 1.02), S(1, 1)])] }, 700),
    LogOut: icon("log-out", [0, 1], "leave", { d: 900, peak: 0.35, tracks: [
      track([0, 1], [12, 12], [TR(0, 0, 0), TR(0.35, 3.2, 0), TR(0.6, -0.8, 0), TR(0.8, 0.3, 0), TR(1, 0, 0)]),
      track([2], [3, 12], [S(0, 1), f(0.35, "scale(0.88, 1)"), f(0.6, "scale(1.03, 1)"), S(1, 1)])] }, 700),
    LogIn: icon("log-in", [0, 1], "enter", { d: 950, peak: 0.7, tracks: [
      track([0, 1], [12, 12], [TR(0, 0, 0, { opacity: 1 }), TR(0.25, -5, 0, { opacity: 0 }), TR(0.32, -5, 0, { opacity: 0 }), TR(0.68, 0.9, 0, { opacity: 1 }), TR(0.85, -0.2, 0, { opacity: 1 }), TR(1, 0, 0, { opacity: 1 })]),
      track([2], [12, 12], [TR(0, 0, 0), TR(0.64, 0, 0), TR(0.74, 0.9, 0), TR(1, 0, 0)])] }, 700),
    Upload: icon("upload", [0, 1], "send", { d: 950, peak: 0.35, tracks: [
      track([0, 1], [12, 12], [TR(0, 0, 0, { opacity: 1 }), TR(0.35, 0, -6, { opacity: 0 }), TR(0.4, 0, 5, { opacity: 0 }), TR(0.8, 0, -0.6, { opacity: 1 }), TR(1, 0, 0, { opacity: 1 })]),
      track([2], [12, 21], squash(0.12, 1.04, 0.8))] }, 800),
    Share2: icon("share", [0, 2], "spread", { d: 1100, peak: 0.6, tracks: [
      track([1], [6, 12], pop(1.3, 0.12)),
      draw([3], 0.15), draw([4], 0.15, { reverse: true }),
      track([0], [18, 5], [S(0, 1), S(0.45, 1), S(0.6, 1.3), S(0.78, 0.95), S(1, 1)]),
      track([2], [18, 19], [S(0, 1), S(0.45, 1), S(0.6, 1.3), S(0.78, 0.95), S(1, 1)])] }, 600),
    Navigation: icon("navigation", [0], "go", { d: 900, peak: 0.3, tracks: [
      track("all", [12, 12], [Z(0), T(0.3, 2, -2, -8), T(0.6, -0.5, 0.5, 4), T(0.8, 0.2, -0.2, -1), Z(1)])] }, 700),
    Compass: icon("compass", [1], "find", { d: 1300, peak: 0.45, tracks: [
      track([1], [12, 12], [R(0, 0), R(0.45, 400), R(0.65, 340), R(0.82, 372), R(1, 360)], { ease: EO })] }, null, {
      "loop-search": { d: 2400, loop: 0, tracks: [track([1], [12, 12], [R(0, 0), R(0.25, -32), R(0.5, 22), R(0.75, -10), R(1, 0)])] } }),
    Maximize2: icon("maximize", [0, 3], "expand", { d: 850, peak: 0.35, tracks: [
      track([0, 1], [12, 12], [TR(0, 0, 0), TR(0.35, 2.2, -2.2), TR(0.6, -0.5, 0.5), TR(0.8, 0.2, -0.2), TR(1, 0, 0)]),
      track([2, 3], [12, 12], [TR(0, 0, 0), TR(0.35, -2.2, 2.2), TR(0.6, 0.5, -0.5), TR(0.8, -0.2, 0.2), TR(1, 0, 0)])] }, 700),

    /* communication */
    Mail: icon("mail", [0], "open", { d: 1200, peak: 0.35, tracks: [
      track([0], [12, 5.5], [S(0, 1), f(0.35, "scale(1, -0.9)"), f(0.62, "scale(1, -0.9)"), f(0.85, "scale(1, 1.06)"), S(1, 1)]),
      track([1], [12, 20], [S(0, 1), f(0.35, "scale(1.02, 0.97)"), S(0.55, 1), S(1, 1)])] }, 800),
    MessageCircle: icon("message-circle", [0], "pop", { d: 850, peak: 0.3, tracks: [
      track("all", [3, 21], [Z(0), T(0.15, 0, 0, 4, 0.88), T(0.4, 0, 0, -6, 1.1), T(0.65, 0, 0, 2, 0.97), Z(1)])] }, 900),
    MessageSquareText: icon("message-square-text", [1, 2, 3], "type", { d: 1100, peak: 1, tracks: [
      draw([3], 0), draw([1], 0.25), draw([2], 0.5),
      track([0], [3, 21], [S(0, 1), S(0.12, 0.96), S(0.3, 1), S(1, 1)])] }, 700),
    Phone: icon("phone", [0], "ring", { d: 1100, peak: 0.1, tracks: [
      track("all", [12, 12], [R(0, 0), R(0.07, -14), R(0.14, 12), R(0.21, -12), R(0.28, 10), R(0.35, -8), R(0.42, 6), R(0.5, 0), R(1, 0)])] }, 900),
    AtSign: icon("at-sign", [0], "write", { d: 1100, peak: 1, tracks: [
      draw([1], 0),
      track([0], [12, 12], [S(0, 1), S(0.45, 1), S(0.62, 1.25), S(0.8, 0.95), S(1, 1)])] }, 700, {
      "hover-spin": { d: 900, peak: 0.5, tracks: [track("all", [12, 12], [R(0, 0), R(1, 360)], { ease: EO })] } }),
    Inbox: icon("inbox", [0], "receive", { d: 1000, peak: 0.45, tracks: [
      track([0], [12, 12], [TR(0, 0, 0), TR(0.3, 0, -0.6), TR(0.45, 0, 2.2), TR(0.65, 0, -0.5), TR(0.8, 0, 0.2), TR(1, 0, 0)]),
      track([1], [12, 20], squash(0.45, 1.03, 0.95))] }, 800),
    Megaphone: icon("megaphone", [0], "shout", { d: 1000, peak: 0.4, tracks: [
      track("all", [5, 10], [Z(0), T(0.2, 0, 0, 6, 0.94), T(0.4, 0, 0, -8, 1.08), T(0.6, 0, 0, 3, 0.98), T(0.8, 0, 0, -1, 1), Z(1)])] }, 800),
    Mic: icon("mic", [2], "level", { d: 1200, peak: 0.2, tracks: [
      track([2], [12, 15], [f(0, "scale(1, 1)"), f(0.2, "scale(1, 0.8)"), f(0.4, "scale(1, 1.06)"), f(0.6, "scale(1, 0.86)"), f(0.8, "scale(1, 1.02)"), f(1, "scale(1, 1)")]),
      track([1], [12, 17], [S(0, 1), S(0.2, 1.06), S(0.4, 0.98), S(0.6, 1.04), S(1, 1)])] }, 0),

    /* shopping & money */
    ShoppingCart: icon("shopping-cart", [0, 1], "roll", { d: 1000, peak: 0.3, tracks: [
      track([2], [8, 21], [Z(0), T(0.3, 3, 0, -6), T(0.6, -1, 0, 2), T(0.8, 0.3, 0, 0), Z(1)]),
      track([0, 1], [12, 12], [TR(0, 0, 0), TR(0.3, 3, 0), TR(0.6, -1, 0), TR(0.8, 0.3, 0), TR(1, 0, 0)])] }, 800),
    ShoppingBag: icon("shopping-bag", [0], "lift", { d: 1100, peak: 0.25, tracks: [
      track("all", [12, 2], [Z(0), T(0.25, 0, -2, -7), T(0.5, 0, -2, 5), T(0.7, 0, -0.8, -2), Z(1)])] }, 700),
    CreditCard: icon("credit-card", [1], "swipe", { d: 1000, peak: 0.45, tracks: [
      track("all", [12, 12], [TR(0, 0, 0, { opacity: 1 }), TR(0.2, -2, 0, { opacity: 1 }), TR(0.45, 7, 0, { opacity: 0 }), TR(0.5, -7, 0, { opacity: 0 }), TR(0.82, 0.4, 0, { opacity: 1 }), TR(1, 0, 0, { opacity: 1 })])] }, 700, {
      "hover-flip": { d: 900, peak: 0.5, tracks: [track("all", [12, 12], [S(0, 1), f(0.5, "scale(0, 1)"), f(0.8, "scale(1.06, 1)"), S(1, 1)])] } }),
    Wallet: icon("wallet", [0], "pay", { d: 1000, peak: 0.3, tracks: [
      track([0], [12, 12], [TR(0, 0, 0), TR(0.3, 1.6, -0.8), TR(0.55, -0.4, 0.2), TR(0.75, 0.2, 0), TR(1, 0, 0)]),
      track([1], [12, 21], squash(0.3, 1.04, 0.93))] }, 800),
    Gift: icon("gift", [2], "open", { d: 1200, peak: 0.3, tracks: [
      track([2, 3], [3, 11], [Z(0), T(0.3, 0, -3, -10), T(0.55, 0, -3, -10), T(0.75, 0, 0.4, 1), Z(1)]),
      track([1], [12, 21], squash(0.75, 1.04, 0.93))] }, 800),
    Tag: icon("tag", [1], "swing", { d: 1100, peak: 0.2, tracks: [
      track("all", [7.5, 7.5], [R(0, 0), R(0.2, -14), R(0.4, 10), R(0.6, -6), R(0.8, 3), R(1, 0)])] }, 700),
    Receipt: icon("receipt", [0, 1], "flip", { d: 1000, peak: 0.5, tracks: [
      track([0, 1], [12, 12], [S(0, 1), f(0.25, "scale(0, 1)"), f(0.5, "scale(1, 1)"), f(0.75, "scale(0, 1)"), S(1, 1)]),
      track([2], [12, 12], [TR(0, 0, 0), TR(0.25, 0, -0.8), TR(0.5, 0, 0), TR(0.75, 0, -0.8), TR(1, 0, 0)])] }, 700),
    Percent: icon("percent", [1, 2], "flip", { d: 900, peak: 0.5, tracks: [
      track("all", [12, 12], [R(0, 0), R(1, 180)], { ease: EO }),
      track([1, 2], "self", [S(0, 1), S(0.4, 0.6), S(0.75, 1.15), S(1, 1)])] }, 700),

    /* files */
    FileText: icon("file-text", [2, 3, 4], "write", { d: 1100, peak: 1, tracks: [
      draw([2], 0), draw([3], 0.2), draw([4], 0.4),
      track([1], [20, 2], [S(0, 1), S(0.15, 0.6), S(0.35, 1.08), S(0.5, 1), S(1, 1)])] }, 700),
    Folder: icon("folder", [0], "open", { d: 900, peak: 0.3, tracks: [
      track("all", [12, 20], [S(0, 1), f(0.3, "scale(1.04, 0.9) skewX(-6deg)"), f(0.55, "scale(0.98, 1.04) skewX(2deg)"), f(0.8, "scale(1, 1) skewX(0deg)"), S(1, 1)])] }, 800),
    Clipboard: icon("clipboard", [0], "clip", { d: 900, peak: 0.2, tracks: [
      track([0], [12, 4], [TR(0, 0, 0), TR(0.2, 0, -2.2), TR(0.35, 0, 0.6), TR(0.5, 0, 0), TR(1, 0, 0)]),
      track([1], [12, 22], squash(0.35, 1.02, 0.96))] }, 800),
    Paperclip: icon("paperclip", [0], "attach", { d: 1000, peak: 0.3, tracks: [
      track("all", [12, 12], [Z(0), T(0.3, 0, -3, -12), T(0.6, 0, 0.6, 4), T(0.8, 0, 0, -1), Z(1)])] }, 700, {
      "hover-bend": { d: 1000, peak: 1, tracks: [draw([0], 0)] } }),
    Save: icon("save", [2], "store", { d: 1000, peak: 0.3, tracks: [
      track([2], [12, 12], [TR(0, 0, 0), TR(0.3, 3, 0), TR(0.6, 3, 0), TR(0.8, -0.4, 0), TR(1, 0, 0)]),
      track("all", [12, 21], [Z(0), T(0.25, 0, -2.5), T(0.45, 0, 0, 0, 1.06, 0.9), T(0.6, 0, -0.4, 0, 0.98, 1.02), Z(0.75), Z(1)])] }, 700),
    Archive: icon("archive", [0, 2], "store", { d: 1100, peak: 0.3, tracks: [
      track([0], [2, 5.5], [Z(0), T(0.3, 0, -2, -12), T(0.55, 0, -2, -12), T(0.78, 0, 0.3, 1), Z(1)]),
      track([2], [12, 12], [TR(0, 0, 0), TR(0.4, 0, 0), TR(0.6, 0, 1.6, 0, 1, 1, { opacity: 0 }), TR(0.61, 0, -1, 0, 1, 1, { opacity: 0 }), TR(0.85, 0, 0, 0, 1, 1, { opacity: 1 }), TR(1, 0, 0)]),
      track([1], [12, 21], squash(0.78, 1.03, 0.95))] }, 700),
    Printer: icon("printer", [2], "print", { d: 1200, peak: 0.8, tracks: [
      track([2], [12, 12], [TR(0, 0, 0, { opacity: 1 }), TR(0.2, 0, -4, { opacity: 0 }), TR(0.3, 0, -4, { opacity: 0 }), TR(0.8, 0, 0.6, { opacity: 1 }), TR(1, 0, 0, { opacity: 1 })]),
      track([0], [12, 12], [TR(0, 0, 0), TR(0.3, 0, 0), TR(0.38, 0, 0.4), TR(0.46, 0, 0), TR(0.54, 0, 0.4), TR(0.62, 0, 0), TR(1, 0, 0)])] }, 700),
    Link: icon("link", [0], "connect", { d: 900, peak: 0.3, tracks: [
      track([0], [12, 12], [TR(0, 0, 0), TR(0.3, 1.8, -1.8), TR(0.55, -0.4, 0.4), TR(0.75, 0.1, -0.1), TR(1, 0, 0)]),
      track([1], [12, 12], [TR(0, 0, 0), TR(0.3, -1.8, 1.8), TR(0.55, 0.4, -0.4), TR(0.75, -0.1, 0.1), TR(1, 0, 0)])] }, 700),

    /* status */
    CircleAlert: icon("circle-alert", [1, 2], "alert", { d: 900, peak: 0.1, tracks: [
      track("all", [12, 12], shake(0, 10)),
      track([2], [12, 16], [S(0, 1), S(0.5, 1), S(0.62, 1.8), S(0.75, 1), S(1, 1)])] }, 900),
    TriangleAlert: icon("triangle-alert", [1, 2], "flash", { d: 1000, peak: 0.2, tracks: [
      track([1, 2], null, OP([0, 1], [0.15, 0.1], [0.3, 1], [0.45, 0.1], [0.6, 1], [1, 1])),
      track([0], [12, 20], [S(0, 1), S(0.15, 1.06), S(0.3, 0.98), S(0.45, 1.04), S(0.6, 1), S(1, 1)])] }, 500),
    Info: icon("info", [1, 2], "bounce", { d: 1000, peak: 0.25, tracks: [
      track([2], [12, 12], [TR(0, 0, 0), TR(0.25, 0, -3), TR(0.45, 0, 0), TR(0.6, 0, -1), TR(0.72, 0, 0), TR(1, 0, 0)]),
      track([1], [12, 16], [S(0, 1), S(0.4, 1), f(0.45, "scale(1, 0.8)"), f(0.58, "scale(1, 1.06)"), S(0.72, 1), S(1, 1)])] }, 800),
    CircleX: icon("circle-x", [1, 2], "dismiss", { d: 800, peak: 0.5, tracks: [
      track([1, 2], [12, 12], [f(0, "rotate(0deg) scale(1)"), f(0.5, "rotate(90deg) scale(0.6)"), f(0.8, "rotate(90deg) scale(1.1)"), f(1, "rotate(90deg) scale(1)")], { ease: EO }),
      track([0], [12, 12], [S(0, 1), S(0.5, 0.94), S(0.8, 1.02), S(1, 1)])] }, 800, {
      "hover-shake": { d: 700, peak: 0.1, tracks: [track("all", [12, 12], [TR(0, 0, 0), TR(0.12, -2, 0), TR(0.26, 2, 0), TR(0.4, -1.4, 0), TR(0.54, 1, 0), TR(0.7, 0, 0), TR(1, 0, 0)])] } }),
    CircleQuestionMark: icon("circle-question-mark", [1, 2], "wonder", { d: 1000, peak: 0.25, tracks: [
      track([1, 2], [12, 17], [R(0, 0), R(0.25, -16), R(0.5, 12), R(0.7, -5), R(0.85, 2), R(1, 0)])] }, 800),
    Ban: icon("ban", [1], "block", { d: 900, peak: 1, tracks: [
      draw([1], 0.15),
      track([0], [12, 12], [S(0, 1), S(0.15, 0.92), S(0.6, 1.04), S(1, 1)])] }, 800),
    ShieldCheck: icon("shield-check", [1], "check", { d: 800, peak: 1, tracks: [
      draw([1], 0.25),
      track([0], [12, 12], [S(0, 1), S(0.3, 1.08), S(0.6, 0.98), S(1, 1)])] }, 1200),
    BadgeCheck: icon("badge-check", [1], "check", { d: 1000, peak: 1, tracks: [
      track([0], [12, 12], [R(0, 0), R(1, 90)], { ease: EO }),
      draw([1], 0.3)] }, 1000),

    /* tools */
    Pencil: icon("pencil", [1], "write", { d: 1100, peak: 0.2, tracks: [
      track("all", [2, 22], [Z(0), T(0.2, -1, 0, -6), T(0.4, 1.2, 0.3, 4), T(0.6, -0.8, 0, -5), T(0.8, 0.6, 0, 3), Z(1)])] }, 400),
    Scissors: icon("scissors", [0, 3], "snip", { d: 900, peak: 0.2, tracks: [
      track([0, 1, 4], [12, 12], [R(0, 0), R(0.2, -12), R(0.4, 2), R(0.6, -12), R(0.8, 1), R(1, 0)]),
      track([2, 3], [12, 12], [R(0, 0), R(0.2, 12), R(0.4, -2), R(0.6, 12), R(0.8, -1), R(1, 0)])] }, 500),
    Wrench: icon("wrench", [0], "tighten", { d: 1000, peak: 0.35, tracks: [
      track("all", [12, 12], [R(0, 0), R(0.35, -35), R(0.6, 10), R(0.8, -4), R(1, 0)])] }, 700),
    Hammer: icon("hammer", [2], "hit", { d: 1000, peak: 0.3, tracks: [
      track("all", [3, 21], [R(0, 0), R(0.3, -22), R(0.42, 6), R(0.52, 0), R(0.62, 3), R(0.75, 0), R(1, 0)])] }, 500),
    Paintbrush: icon("paintbrush", [0], "paint", { d: 1100, peak: 1, tracks: [
      track([1, 2], [20, 4], [R(0, 0), R(0.25, -10), R(0.5, 8), R(0.75, -3), R(1, 0)]),
      draw([0], 0.3)] }, 700),
    Funnel: icon("funnel", [0], "sift", { d: 900, peak: 0.2, tracks: [
      track("all", [12, 3], [S(0, 1), f(0.2, "scale(1.08, 0.9)"), f(0.45, "scale(0.95, 1.06)"), f(0.7, "scale(1.02, 0.98)"), S(1, 1)])] }, 800),
    SlidersHorizontal: icon("sliders-horizontal", [2, 3, 7], "adjust", { d: 1200, peak: 0.4, tracks: [
      ...slide(2, 0, 6, 14, 10, 14, 3, 5, 0), ...slide(7, 8, 4, 8, 8, 12, 5, 12, 80), ...slide(3, 1, 5, 16, 12, 16, -6, 19, 160)] }, 600),
    Pin: icon("pin", [1], "push", { d: 900, peak: 0.25, tracks: [
      track("all", [12, 22], [Z(0), T(0.25, 0, -2.5, -10), T(0.4, 0, 1, 0), T(0.55, 0, 0, 2), Z(1)])] }, 800),

    /* time */
    Calendar: icon("calendar", [0, 1], "turn", { d: 1000, peak: 0.2, tracks: [
      track([0], [8, 3], [TR(0, 0, 0), TR(0.15, 0, -1.6), TR(0.35, 0, 0), TR(1, 0, 0)]),
      track([1], [16, 3], [TR(0, 0, 0), TR(0.25, 0, -1.6), TR(0.45, 0, 0), TR(1, 0, 0)]),
      track([2, 3], [12, 21], [S(0, 1), S(0.4, 1), f(0.5, "scale(1.03, 0.95)"), S(0.65, 1), S(1, 1)])] }, 800),
    CalendarCheck: icon("calendar-check", [4], "check", { d: 900, peak: 1, tracks: [
      draw([4], 0.25),
      track([0, 1], [12, 3], [TR(0, 0, 0), TR(0.15, 0, -1.4), TR(0.3, 0, 0), TR(1, 0, 0)])] }, 1100),
    Hourglass: icon("hourglass", [2, 3], "flip", { d: 1100, peak: 0.6, tracks: [
      track("all", [12, 12], [R(0, 0), R(0.6, 195), R(0.8, 175), R(1, 180)], { ease: EO })] }, 1200),
    Timer: icon("timer", [1], "start", { d: 1100, peak: 0.5, tracks: [
      track([0], [12, 12], [TR(0, 0, 0), TR(0.1, 0, 1), TR(0.22, 0, 0), TR(1, 0, 0)]),
      track([1], [12, 14], [R(0, 0), R(0.15, 0), R(1, 360)], { ease: EO })] }, null, {
      "loop-run": { d: 2400, loop: 0, linear: true, tracks: [track([1], [12, 14], [R(0, 0), R(1, 360)])] } }),
    AlarmClock: icon("alarm-clock", [2, 3], "ring", { d: 1000, peak: 0.1, tracks: [
      track("all", [12, 13], [R(0, 0), R(0.06, -8), R(0.12, 8), R(0.18, -8), R(0.24, 8), R(0.3, -6), R(0.36, 6), R(0.44, -3), R(0.52, 0), R(1, 0)]),
      track([2, 3], [12, 5], [TR(0, 0, 0), TR(0.06, 0, -1), TR(0.12, 0, 0), TR(0.18, 0, -1), TR(0.24, 0, 0), TR(0.3, 0, -1), TR(0.36, 0, 0), TR(1, 0, 0)])] }, 900),

    /* people & places */
    User: icon("user", [1], "nod", { d: 900, peak: 0.25, tracks: [
      track([1], [12, 11], [TR(0, 0, 0), TR(0.25, 0, 1.2), TR(0.5, 0, -0.6), TR(0.7, 0, 0.3), TR(1, 0, 0)]),
      track([0], [12, 21], squash(0.25, 1.03, 0.96))] }, 900),
    Users: icon("users", [1, 2], "join", { d: 1000, peak: 0.55, tracks: [
      track([1, 2], [12, 12], [TR(0, 0, 0, { opacity: 1 }), TR(0.2, -2, 2, { opacity: 0 }), TR(0.55, 0.4, -0.8, { opacity: 1 }), TR(0.75, 0, 0.2, { opacity: 1 }), TR(1, 0, 0, { opacity: 1 })]),
      track([3], [9, 11], [TR(0, 0, 0), TR(0.55, 0, 0), TR(0.7, 0, 0.8), TR(0.85, 0, -0.2), TR(1, 0, 0)])] }, 900),
    UserPlus: icon("user-plus", [2, 3], "add", { d: 900, peak: 0.4, tracks: [
      track([2, 3], [19, 11], [f(0, "rotate(0deg) scale(1)"), f(0.4, "rotate(180deg) scale(1.3)"), f(0.7, "rotate(180deg) scale(0.95)"), f(1, "rotate(180deg) scale(1)")], { ease: EO }),
      track([0, 1], [9, 21], [S(0, 1), S(0.4, 1), f(0.55, "scale(1.03, 0.96)"), S(0.75, 1), S(1, 1)])] }, 900),
    MapPin: icon("map-pin", [1], "drop", { d: 1000, peak: 0.2, tracks: [
      track("all", [12, 22], [Z(0), T(0.2, 0, -4), T(0.4, 0, 0, 0, 1.1, 0.88), T(0.55, 0, -1, 0, 0.97, 1.03), Z(0.7), Z(1)])] }, 800),
    Map: icon("map", [1, 2], "unfold", { d: 1000, peak: 0.3, tracks: [
      track("all", [12, 12], [S(0, 1), f(0.3, "scale(0.55, 1)"), f(0.7, "scale(1.05, 1)"), f(0.85, "scale(0.99, 1)"), S(1, 1)])] }, 800),
    Globe: icon("globe", [1], "spin", { d: 1200, peak: 0.25, tracks: [
      track([1], [12, 12], [f(0, "scale(1, 1)"), f(0.25, "scale(0.08, 1)"), f(0.5, "scale(1, 1)"), f(0.75, "scale(0.08, 1)"), f(1, "scale(1, 1)")]),
      track("all", [12, 12], [R(0, 0), R(0.3, -14), R(0.7, 4), R(1, 0)])] }, null, {
      "loop-spin": { d: 1400, loop: 0, linear: true, tracks: [track([1], [12, 12], [f(0, "scale(1, 1)"), f(0.5, "scale(0.05, 1)"), f(1, "scale(1, 1)")])] } }),
    Plane: icon("plane", [0], "takeoff", { d: 1100, peak: 0.35, tracks: [
      track("all", [12, 12], [Z(0, { opacity: 1 }), T(0.35, 6, -6, -8, 1, 1, { opacity: 0 }), T(0.4, -6, 6, 0, 1, 1, { opacity: 0 }), T(0.8, 0.5, -0.5, 0, 1, 1, { opacity: 1 }), Z(1, { opacity: 1 })])] }, 700),

    /* weather & nature */
    Sun: icon("sun", [1, 2, 3, 4, 5, 6, 7, 8], "shine", { d: 1000, peak: 0.5, tracks: [
      track([1, 2, 3, 4, 5, 6, 7, 8], [12, 12], [R(0, 0), R(1, 45)], { ease: EO }),
      track([0], [12, 12], pop(1.2, 0.25))] }, null, {
      "loop-spin": { d: 1600, loop: 0, linear: true, tracks: [track([1, 2, 3, 4, 5, 6, 7, 8], [12, 12], [R(0, 0), R(1, 45)])] } }),
    Moon: icon("moon", [0], "rock", { d: 1100, peak: 0.3, tracks: [
      track("all", [12, 12], [R(0, 0), R(0.3, -20), R(0.6, 8), R(0.8, -3), R(1, 0)])] }, null, {
      "loop-rock": { d: 3000, loop: 0, tracks: [track("all", [12, 12], [R(0, 0), R(0.5, -12), R(1, 0)])] } }),
    Cloud: icon("cloud", [0], "drift", { d: 1100, peak: 0.3, tracks: [
      track("all", [12, 12], [TR(0, 0, 0), TR(0.3, -2, 0), TR(0.65, 1.5, 0), TR(1, 0, 0)])] }, null, {
      "loop-drift": { d: 3200, loop: 0, tracks: [track("all", [12, 12], [TR(0, 0, 0), TR(0.25, -1.6, 0), TR(0.75, 1.6, 0), TR(1, 0, 0)])] } }),
    CloudRain: icon("cloud-rain", [1, 2, 3], "rain", { d: 1000, peak: 0.4, tracks: [
      track([2], [12, 12], [TR(0, 0, 0, { opacity: 1 }), TR(0.4, 0, 4, { opacity: 0 }), TR(0.41, 0, -3, { opacity: 0 }), TR(0.8, 0, 0, { opacity: 1 }), TR(1, 0, 0, { opacity: 1 })]),
      track([3], [12, 12], [TR(0, 0, 0, { opacity: 1 }), TR(0.4, 0, 4, { opacity: 0 }), TR(0.41, 0, -3, { opacity: 0 }), TR(0.8, 0, 0, { opacity: 1 }), TR(1, 0, 0, { opacity: 1 })], { delay: 120 }),
      track([1], [12, 12], [TR(0, 0, 0, { opacity: 1 }), TR(0.4, 0, 4, { opacity: 0 }), TR(0.41, 0, -3, { opacity: 0 }), TR(0.8, 0, 0, { opacity: 1 }), TR(1, 0, 0, { opacity: 1 })], { delay: 240 })] }, 0),
    Zap: icon("zap", [0], "flash", { d: 900, peak: 0.1, tracks: [
      track("all", [12, 12], [f(0, "scale(1)", { opacity: 1 }), f(0.1, "scale(1.12)", { opacity: 0.25 }), f(0.2, "scale(1.12)", { opacity: 1 }), f(0.3, "scale(1)", { opacity: 0.35 }), f(0.45, "scale(1.04)", { opacity: 1 }), f(1, "scale(1)", { opacity: 1 })])] }, 900),
    Snowflake: icon("snowflake", [0, 1, 2, 3], "spin", { d: 1200, peak: 0.5, tracks: [
      track("all", [12, 12], [f(0, "rotate(0deg) scale(1)"), f(0.5, "rotate(120deg) scale(0.85)"), f(1, "rotate(180deg) scale(1)")], { ease: EO })] }, null, {
      "loop-spin": { d: 4000, loop: 0, linear: true, tracks: [track("all", [12, 12], [R(0, 0), R(1, 180)])] } }),
    Umbrella: icon("umbrella", [2], "open", { d: 1000, peak: 0.3, tracks: [
      track([2], [12, 13], [f(0, "scale(1, 1)"), f(0.3, "scale(0.6, 1.15)"), f(0.6, "scale(1.08, 0.95)"), f(0.8, "scale(0.98, 1.02)"), f(1, "scale(1, 1)")]),
      track([1], [12, 12], [TR(0, 0, 0), TR(0.3, 0, -1.4), TR(0.6, 0, 0.4), TR(0.8, 0, 0), TR(1, 0, 0)]),
      track([0], [12, 13], [R(0, 0), R(0.3, -8), R(0.6, 5), R(0.8, -2), R(1, 0)])] }, 800),
    Flame: icon("flame", [0], "flicker", { d: 1200, peak: 0.2, tracks: [
      track("all", [12, 21], [f(0, "scale(1, 1) skewX(0deg)"), f(0.2, "scale(0.95, 1.08) skewX(-4deg)"), f(0.4, "scale(1.04, 0.94) skewX(3deg)"), f(0.6, "scale(0.97, 1.05) skewX(-2deg)"), f(0.8, "scale(1.02, 0.98) skewX(1deg)"), f(1, "scale(1, 1) skewX(0deg)")])] }, 0),

    /* media */
    Music: icon("music", [1, 2], "dance", { d: 1100, peak: 0.25, tracks: [
      track("all", [12, 21], [Z(0), T(0.25, 0, -2.5, -8), Z(0.5), T(0.7, 0, -1.2, 6), Z(1)])] }, 0),
    Camera: icon("camera", [1], "shoot", { d: 800, peak: 0.15, tracks: [
      track([1], [12, 13], [S(0, 1), S(0.15, 0.4), S(0.32, 1.15), S(0.5, 0.97), S(0.65, 1), S(1, 1)]),
      track([0], [12, 20], [S(0, 1), f(0.15, "scale(1.03, 0.96)"), S(0.32, 1), S(1, 1)])] }, 1000),
    Image: icon("image", [1], "rise", { d: 1100, peak: 0.8, tracks: [
      track([1], [12, 12], [TR(0, 0, 0, { opacity: 1 }), TR(0.3, 0, 4, { opacity: 0 }), TR(0.35, 0, 4, { opacity: 0 }), TR(0.8, 0, -0.4, { opacity: 1 }), TR(1, 0, 0, { opacity: 1 })]),
      track([2], [12, 21], [S(0, 1), f(0.3, "scale(1, 0.85)"), f(0.6, "scale(1, 1.04)"), S(0.8, 1), S(1, 1)])] }, 800),
    Headphones: icon("headphones", [0], "bop", { d: 1000, peak: 0.25, tracks: [
      track("all", [12, 12], [f(0, "rotate(0deg) scale(1)"), f(0.25, "rotate(-8deg) scale(1.05)"), f(0.5, "rotate(0deg) scale(0.97)"), f(0.75, "rotate(8deg) scale(1.05)"), f(1, "rotate(0deg) scale(1)")])] }, 0),
    SkipForward: icon("skip-forward", [1], "skip", { d: 850, peak: 0.3, tracks: [
      track([1], [16, 12], [Z(0), T(0.3, 3, 0, 0, 0.85, 1), T(0.5, -0.6, 0), T(0.7, 0.2, 0), Z(1)]),
      track([0], [12, 12], [TR(0, 0, 0), TR(0.25, 0, 0), TR(0.35, 1.2, 0), TR(0.6, 0, 0), TR(1, 0, 0)])] }, 700),

    /* misc */
    Star: icon("star", [0], "spin", { d: 1100, peak: 0.45, tracks: [
      track("all", [12, 12.6], [f(0, "rotate(0deg) scale(1)"), f(0.45, "rotate(200deg) scale(0.75)"), f(0.8, "rotate(370deg) scale(1.12)"), f(1, "rotate(360deg) scale(1)")], { ease: EO })] }, 800),
    Flag: icon("flag", [0], "wave", { d: 1200, peak: 0.25, tracks: [
      track("all", [4, 12], [f(0, "skewY(0deg) scale(1, 1)"), f(0.25, "skewY(-6deg) scale(0.96, 1)"), f(0.5, "skewY(4deg) scale(1, 1)"), f(0.75, "skewY(-2deg) scale(0.98, 1)"), f(1, "skewY(0deg) scale(1, 1)")])] }, 0),
    Key: icon("key", [2], "unlock", { d: 1100, peak: 0.55, tracks: [
      track("all", [7.5, 15.5], [Z(0), T(0.3, 1.5, -1.5), T(0.55, 1.5, -1.5, -24), T(0.75, 1.5, -1.5, -24), T(0.9, 0, 0, 2), Z(1)])] }, 700),
    Plus: icon("plus", [0, 1], "add", { d: 800, peak: 0.5, tracks: [
      track("all", [12, 12], [f(0, "rotate(0deg) scale(1)"), f(0.5, "rotate(90deg) scale(1.2)"), f(0.75, "rotate(90deg) scale(0.95)"), f(1, "rotate(90deg) scale(1)")], { ease: EO })] }, 800),
    Power: icon("power", [0], "switch", { d: 1000, peak: 1, tracks: [
      track([0], [12, 12], [TR(0, 0, 0), TR(0.2, 0, 2.5), TR(0.4, 0, -0.5), TR(0.55, 0, 0), TR(1, 0, 0)]),
      draw([1], 0.2)] }, 900),
  });

  /* ── generic motions: any Lucide icon, no knowledge of its parts ──
     Eight kinds (pop, wiggle, jump, turn, redraw, cascade, float, breathe) plus
     a directional nudge for icons whose name says where they point. The default
     is picked from the name; icons with a custom motion keep theirs. */
  const GENERIC = ["hover-pop", "hover-wiggle", "hover-jump", "hover-turn", "hover-redraw", "hover-cascade", "loop-float", "loop-breathe"];
  // real Lucide names when the full data is loaded ("AArrowDown" is a-arrow-down, which no regex can know)
  const NAMES = new Map((window.LucAnimMeta?.list || []).map(([n]) => [n.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(""), n]));
  const kebab = (k) => NAMES.get(k) || k.replace(/([a-z])([A-Z0-9])/g, "$1-$2").replace(/([0-9])([A-Za-z])/g, "$1-$2").toLowerCase();
  function directionOf(words) {
    if (!words.some((w) => /^(arrow|arrows|chevron|chevrons|move|corner|trending|log|redo|undo|forward|reply|navigation|send|square|circle)$/.test(w))) return null;
    if (!words.some((w) => /^(arrow|arrows|chevron|chevrons|move|corner|trending|log|redo|undo|forward|reply|navigation)$/.test(w))) return null;
    let dx = 0, dy = 0;
    for (const w of words) { if (!dx && w === "right") dx = 1; if (!dx && w === "left") dx = -1; if (!dy && w === "up") dy = -1; if (!dy && w === "down") dy = 1; }
    if (words[0] === "trending" && !dx) dx = 1;
    if (words[0] === "log" && words[1] === "in") dx = 1;
    if (words[0] === "log" && words[1] === "out") dx = 1;
    if (words[0] === "redo" || words[0] === "forward") dx = dx || 1;
    if (words[0] === "undo" || words[0] === "reply") dx = dx || -1;
    return dx || dy ? [dx, dy] : null;
  }
  function genericStates(key, nParts) {
    const words = kebab(key).split("-"), dir = directionOf(words);
    const st = {
      "hover-pop": { d: 700, peak: 0.3, tracks: [track("all", [12, 12], [S(0, 1), S(0.3, 1.18), S(0.55, 0.94), S(0.8, 1.04), S(1, 1)])] },
      "hover-wiggle": { d: 750, peak: 0.15, tracks: [track("all", [12, 12], [R(0, 0), R(0.15, -12), R(0.35, 10), R(0.55, -7), R(0.75, 4), R(1, 0)])] },
      "hover-jump": { d: 800, peak: 0.35, tracks: [track("all", [12, 22], [f(0, "translate(0px,0px) scale(1,1)"), f(0.35, "translate(0px,-3.5px) scale(0.96,1.04)"), f(0.6, "translate(0px,0px) scale(1.06,0.92)"), f(0.8, "translate(0px,-0.6px) scale(0.99,1.01)"), f(1, "translate(0px,0px) scale(1,1)")])] },
      "hover-turn": { d: 900, peak: 0.5, tracks: [track("all", [12, 12], [R(0, 0), R(1, 360)], { ease: EO })] },
      "hover-redraw": { d: 650, peak: 1, redraw: true },
      "hover-cascade": { d: 520, peak: 0.35, tracks: [track("each", "self", [f(0, "translate(0px,0px) scale(1)"), f(0.35, "translate(0px,-2.4px) scale(1.08)"), f(0.7, "translate(0px,0.5px) scale(0.98)"), f(1, "translate(0px,0px) scale(1)")], { stagger: 60 })] },
      "loop-float": { d: 2200, loop: 0, tracks: [track("all", [12, 12], [TR(0, 0, 0), TR(0.5, 0, -1.6), TR(1, 0, 0)])] },
      "loop-breathe": { d: 2600, loop: 0, tracks: [track("all", [12, 12], [f(0, "scale(1)", { opacity: 1 }), f(0.5, "scale(1.07)", { opacity: 0.7 }), f(1, "scale(1)", { opacity: 1 })])] },
    };
    if (dir) { const [x, y] = dir; st["hover-nudge"] = { d: 700, peak: 0.3, tracks: [track("all", [12, 12], [TR(0, 0, 0), TR(0.3, 3 * x, 3 * y), TR(0.55, -0.8 * x, -0.8 * y), TR(0.8, 0.5 * x, 0.5 * y), TR(1, 0, 0)])] }; }
    const has = (re) => re.test(words.join("-"));
    const def = dir ? "hover-nudge"
      : has(/(refresh|rotate|loader|repeat|iteration|fan|orbit|disc|cog|settings|cycle|recycle|circle-dashed|aperture|ferris)/) ? "hover-turn"
      : has(/(bell|alarm|vibrate|megaphone|siren|phone-call|bug)/) ? "hover-wiggle"
      : has(/(heart|star|sparkle|badge|award|gem|crown|smile|thumbs|party|trophy|medal)/) ? "hover-pop"
      : nParts >= 3 ? "hover-cascade" : "hover-jump";
    return { st, def };
  }
  const defCache = new Map();
  function defOf(key) {
    let d = defCache.get(key); if (d) return d;
    const custom = DEF[key], nParts = (N[key] || []).length;
    const g = genericStates(key, custom?.morph ? 1 : nParts);
    if (custom) d = { ...custom, custom: Object.keys(custom.states), states: { ...custom.states, ...Object.fromEntries(Object.entries(g.st).filter(([k]) => !custom.states[k])) } };
    else d = { label: kebab(key), def: g.def, custom: [], states: g.st };
    defCache.set(key, d); return d;
  }

  const STROKES = { light: 1.5, regular: 2, bold: 2.5 };
  const TRIGGERS = ["in", "click", "hover", "loop", "loop-on-hover", "morph", "boomerang", "sequence"];
  const reduced = () => reduceQ.matches;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  function mount(host, opts = {}) {
    const o = { icon: "Bell", size: 24, stroke: 2, primary: "", secondary: "", trigger: "hover", state: "", speed: 1, target: null, ...opts };
    const svg = document.createElementNS(NS, "svg");
    for (const [k, v] of Object.entries({ viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", "stroke-linecap": "round", "stroke-linejoin": "round", "aria-hidden": "true" })) svg.setAttribute(k, v);
    svg.style.overflow = "visible";
    const g = document.createElementNS(NS, "g");
    svg.appendChild(g); host.appendChild(svg);
    let def, parts = [], morph = null, running = [], gen = 0, session = 0, hovering = false, target = null, io = null, offs = [];

    function build() {
      g.replaceChildren(); parts = []; morph?.destroy(); morph = null; cancel();
      def = defOf(o.icon);
      if (def.morph) {
        const p = document.createElementNS(NS, "path"); g.appendChild(p);
        morph = window.Morphicons.createMorph(p, N[o.icon]); parts = [p];
      } else {
        for (const [tag, a] of N[o.icon]) { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); g.appendChild(e); parts.push(e); }
      }
      style();
    }
    function style() {
      svg.setAttribute("width", o.size); svg.setAttribute("height", o.size);
      svg.setAttribute("stroke-width", typeof o.stroke === "string" ? STROKES[o.stroke] ?? 2 : o.stroke);
      svg.style.color = o.primary || "";
      parts.forEach((p, i) => { if (!morph && o.secondary && (def.accent || []).includes(i)) p.setAttribute("stroke", o.secondary); else p.removeAttribute("stroke"); });
    }
    const stateName = () => (o.state && (o.state === "in-reveal" || def.states[o.state]) ? o.state : o.trigger === "in" ? "in-reveal" : def.def);
    const targetsOf = (t) => (t.parts === "all" ? [g] : t.parts === "each" ? parts : t.parts.map((i) => parts[i]).filter(Boolean));

    function cancel() { gen++; for (const a of running) a.cancel(); running = []; for (const p of parts) { p.removeAttribute("pathLength"); } }

    /* One run of a state. Resolves when it has finished (or was superseded). */
    function run(name, { hold = false, iterations = 1 } = {}) {
      const my = ++gen; for (const a of running) a.cancel(); running = [];
      if (name === "in-reveal") return reveal(my);
      const st = def.states[name]; if (!st) return Promise.resolve();
      if (st.morph) {
        if (reduced()) { morph.set(N[def.morph]); return Promise.resolve(); }
        morph.morphTo(N[def.morph], "smooth");
        return hold ? Promise.resolve() : sleep(650 / o.speed).then(() => { if (my === gen) { morph.morphTo(N[o.icon], "smooth"); return sleep(650 / o.speed); } });
      }
      if (st.redraw) return reveal(my);
      if (reduced()) return Promise.resolve();
      const loop = iterations === Infinity;
      for (const t of st.tracks) {
        targetsOf(t).forEach((el, i) => {
          if (t.origin === "self") { el.style.transformBox = "fill-box"; el.style.transformOrigin = "center"; }
          else if (t.origin) { el.style.transformBox = "view-box"; el.style.transformOrigin = `${t.origin[0]}px ${t.origin[1]}px`; }
          if (t.dash) el.setAttribute("pathLength", "1");
          const frames = t.frames.map((k) => ({ easing: st.linear ? "linear" : t.ease || EIO, ...k }));
          const a = el.animate(frames, { duration: st.d, delay: (t.delay || 0) + (t.stagger || 0) * i, endDelay: loop ? st.loop || 0 : 0, iterations, fill: hold ? "forwards" : "none", easing: "linear" });
          a.playbackRate = o.speed; running.push(a);
        });
      }
      if (hold) {
        // play to the state's peak and rest there (morph / hold-style triggers)
        const peakT = (st.peak ?? 0.5) * st.d;
        return new Promise((res) => { const tick = () => { if (my !== gen) return res(); if ((running[0]?.currentTime ?? peakT) >= peakT) { running.forEach((a) => a.pause()); return res(); } requestAnimationFrame(tick); }; requestAnimationFrame(tick); });
      }
      return Promise.all(running.map((a) => a.finished.catch(() => {}))).then(() => { if (my === gen) { running.forEach((a) => a.cancel()); running = []; parts.forEach((p) => { if (p.getAttribute("pathLength") === "1") p.removeAttribute("pathLength"); }); } });
    }
    /* Undo a held state: morph back, or play the frozen animations backwards to 0. */
    function release() {
      const st = def.states[stateName()];
      if (st?.morph) { if (reduced()) { morph.set(N[o.icon]); return; } morph.morphTo(N[o.icon], "smooth"); return; }
      const my = gen;
      for (const a of running) { a.playbackRate = -o.speed; a.play(); }
      Promise.all(running.map((a) => a.finished.catch(() => {}))).then(() => { if (my === gen) { running.forEach((a) => a.cancel()); running = []; } });
    }
    /* Draw-on reveal: every stroke writes itself, 90 ms apart. */
    function reveal(my) {
      if (reduced()) return Promise.resolve();
      // A morph icon is one <path> with several subpaths, and Chrome restarts the
      // dash pattern at every subpath — so they would all "draw" at once. Split it
      // into one temporary path per stroke for the reveal, then hand back.
      let list = parts, temp = null;
      if (morph) {
        const main = parts[0];
        temp = main.getAttribute("d").split(/(?=M)/).map((d) => { const e = document.createElementNS(NS, "path"); e.setAttribute("d", d); g.appendChild(e); return e; });
        main.style.visibility = "hidden"; list = temp;
        const undo = () => { temp.forEach((e) => e.remove()); main.style.visibility = ""; };
        return runReveal(list, my).then(undo, undo);
      }
      return runReveal(list, my);
    }
    function runReveal(list, my) {
      list.forEach((el, i) => {
        el.setAttribute("pathLength", "1");
        const a = el.animate([{ strokeDasharray: "1 1", strokeDashoffset: 1, opacity: 0 }, { strokeDasharray: "1 1", strokeDashoffset: 0.97, opacity: 1, offset: 0.04 }, { strokeDasharray: "1 1", strokeDashoffset: 0, opacity: 1 }], { duration: 650, delay: i * 90, easing: EO, fill: "backwards" });
        a.playbackRate = o.speed; running.push(a);
      });
      return Promise.all(running.map((a) => a.finished.catch(() => {}))).then(() => { if (my === gen) { running.forEach((a) => a.cancel()); running = []; list.forEach((el) => el.removeAttribute("pathLength")); } });
    }

    /* ── triggers ── */
    function wire() {
      unwire();
      target = typeof o.target === "string" ? host.closest(o.target) || document.querySelector(o.target) : o.target || host;
      const on = (ev, fn) => { target.addEventListener(ev, fn); offs.push(() => target.removeEventListener(ev, fn)); };
      const busy = () => running.length > 0 && running.some((a) => a.playState === "running");
      const name = stateName();
      const isLoopState = name.startsWith("loop-");
      switch (o.trigger) {
        case "hover": on("pointerenter", () => { if (!busy()) run(name); }); break;
        case "click": on("click", () => run(name)); break;
        case "loop": { const me = session; if (isLoopState) run(name, { iterations: Infinity }); else (async () => { await sleep(300); while (me === session) { await run(name); if (me !== session) break; await sleep(700 / o.speed); } })(); break; }
        case "loop-on-hover": { const me = session; on("pointerenter", async () => { if (hovering) return; hovering = true; while (hovering && me === session) { await run(name); } }); on("pointerleave", () => { hovering = false; }); break; }
        case "morph": on("pointerenter", () => run(name, { hold: true })); on("pointerleave", () => release()); break;
        case "boomerang": on("pointerenter", () => { if (!busy()) run(name); }); break;
        case "in": case "sequence": {
          io = new IntersectionObserver((es) => { if (!es.some((e) => e.isIntersecting)) return; io.disconnect(); io = null;
            if (o.trigger === "in") run("in-reveal");
            else (async () => { const me = session; await run("in-reveal"); const hov = def.states[def.def]?.morph || def.def.startsWith("hover-") ? def.def : Object.keys(def.states).find((k) => k.startsWith("hover-")) || def.def; while (me === session) { await sleep(500 / o.speed); if (me !== session) break; await run(hov); await sleep(900 / o.speed); } })();
          }, { threshold: 0.5 });
          io.observe(host); break;
        }
      }
    }
    function unwire() { session++; offs.forEach((x) => x()); offs = []; io?.disconnect(); io = null; hovering = false; cancel(); if (morph) morph.set(N[o.icon]); }

    build(); wire();
    return {
      el: svg,
      get options() { return { ...o }; },
      states: () => ["in-reveal", ...Object.keys(def.states)],
      play: (name) => run(name || stateName()),
      /* Morph icons as a two-state toggle (save / unsave, play / pause): true = the other shape. */
      toggle(on) { if (!morph) return; const to = N[on ? def.morph : o.icon]; if (reduced()) morph.set(to); else morph.morphTo(to, "smooth"); },
      set(next) { const rebuild = next.icon && next.icon !== o.icon; Object.assign(o, next); if (rebuild) build(); else style(); wire(); },
      destroy() { unwire(); morph?.destroy(); svg.remove(); },
    };
  }

  const info = (k) => { const d = defOf(k); return { key: k, label: d.label, def: d.def, states: ["in-reveal", ...Object.keys(d.states)], custom: d.custom, morph: !!d.morph }; };
  return { mount, DEF, TRIGGERS, STROKES, GENERIC, info, kebab,
    /* icons with a custom motion (the curated set) */
    icons: () => Object.keys(DEF).filter((k) => N[k]).map(info),
    /* every icon in the loaded data, custom or not */
    all: () => Object.keys(N) };
})();
