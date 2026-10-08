/* Tiny helpers shared by the popup-panel replicas. */
window.Kit = (() => {
  // cubic-bezier(x1,y1,x2,y2) as a JS easing, so number counters ride the same curve as the CSS motion
  function bezier(x1, y1, x2, y2) {
    const ax = 3 * x1 - 3 * x2 + 1, bx = 3 * x2 - 6 * x1, cx = 3 * x1, ay = 3 * y1 - 3 * y2 + 1, by = 3 * y2 - 6 * y1, cy = 3 * y1;
    const X = (t) => ((ax * t + bx) * t + cx) * t, Y = (t) => ((ay * t + by) * t + cy) * t, dX = (t) => (3 * ax * t + 2 * bx) * t + cx;
    return (x) => {
      if (x <= 0) return 0; if (x >= 1) return 1;
      let t = x; for (let i = 0; i < 8; i++) { const e = X(t) - x, d = dX(t); if (Math.abs(e) < 1e-5 || !d) break; t -= e / d; }
      return Y(Math.min(1, Math.max(0, t)));
    };
  }
  const OUT = bezier(.2, .7, .2, 1);
  const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
  // run fn(progress 0..1) over ms after delay; returns a cancel function
  function tween(ms, fn, { delay = 0, ease = OUT } = {}) {
    let raf = 0, t0 = 0, dead = false;
    if (reduce()) { fn(1); return () => {}; }
    const start = () => { t0 = performance.now(); const step = (now) => { if (dead) return; const k = Math.min(1, (now - t0) / ms); fn(ease(k)); if (k < 1) raf = requestAnimationFrame(step); }; raf = requestAnimationFrame(step); };
    const to = setTimeout(start, delay);
    return () => { dead = true; clearTimeout(to); cancelAnimationFrame(raf); };
  }
  function count(el, from, to, ms, opt = {}) {
    const fmt = opt.fmt || ((v) => String(Math.round(v)));
    el.textContent = fmt(from);
    return tween(ms, (e) => (el.textContent = fmt(from + (to - from) * e)), opt);
  }
  // ?demo: run a timetable, but stop the moment a real person touches the page
  function demo(seq) {
    if (!/[?&]demo\b/.test(location.search)) return;
    const ids = seq.map(([ms, fn]) => setTimeout(fn, ms));
    addEventListener("pointerdown", (e) => { if (e.isTrusted) ids.forEach(clearTimeout); }, { once: true, capture: true });
  }
  return { bezier, OUT, reduce, tween, count, demo, $: (s, r = document) => r.querySelector(s), $$: (s, r = document) => [...r.querySelectorAll(s)] };
})();
