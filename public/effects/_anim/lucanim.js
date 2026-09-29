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
