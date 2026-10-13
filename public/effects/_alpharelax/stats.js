/* StatsCalculator, ported line by line from the app, plus a seeded history to run it on.
   🩸 The app's "sleep day": anything before 04:00 belongs to the previous day, so a 23:40 → 00:20
   session is one night, not two. Every per-day figure below goes through sleepDay(). */
window.ARStats = (() => {
  const H = 3600e3, D = 24 * H, BOUNDARY = 4;
  const startOfDay = (ms) => { const d = new Date(ms); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const addDays = (ms, n) => { const d = new Date(ms); d.setDate(d.getDate() + n); return d.getTime(); };
  const addMonths = (ms, n) => { const d = new Date(ms); d.setMonth(d.getMonth() + n, 1); d.setHours(0, 0, 0, 0); return d.getTime(); };
  const sleepDay = (ms) => startOfDay(ms - BOUNDARY * H);
  const today = () => sleepDay(Date.now());
  const FIRST_WEEKDAY = 1; // Monday, as on a European / Chinese calendar

  const total = (rs) => rs.reduce((a, r) => a + r.dur, 0);
  const average = (rs) => (rs.length ? total(rs) / rs.length : 0);
  const completion = (rs) => (rs.length ? rs.filter((r) => r.completed).length / rs.length : 0);
  const days = (rs) => new Set(rs.map((r) => sleepDay(r.start)));

  function currentStreak(rs) {
    if (!rs.length) return 0;
    const set = days(rs); let cur = today(), n = 0;
    if (!set.has(cur)) cur = addDays(cur, -1);            // tonight not listened yet is not a broken streak
    while (set.has(cur)) { n++; cur = addDays(cur, -1); }
    return n;
  }
  function longestStreak(rs) {
    const ds = [...days(rs)].sort((a, b) => a - b); if (!ds.length) return 0;
    let best = 1, run = 1;
    for (let i = 1; i < ds.length; i++) { run = Math.round((ds[i] - ds[i - 1]) / D) === 1 ? run + 1 : 1; best = Math.max(best, run); }
    return best;
  }
  function bounds(range, offset = 0) {
    const t = today();
    if (range === "week") { const end = addDays(t, 1 + offset * 7); return [addDays(end, -7), end]; }
    if (range === "month") { const end = addDays(t, 1 + offset * 30); return [addDays(end, -30), end]; }
    if (range === "year") { const end = addMonths(t, 1 + offset * 12); return [addMonths(end, -12), end]; }
    return null;
  }
  function inRange(rs, range, offset = 0) {
    const b = bounds(range, offset); if (!b) return rs;
    return rs.filter((r) => r.start >= b[0] && r.start < b[1]);
  }
  function changeVsPrevious(rs, range) {
    if (range === "all") return null;
    const now = total(inRange(rs, range, 0)), prev = total(inRange(rs, range, -1));
    return prev > 0 ? (now - prev) / prev : null;
  }
  function buckets(rs, range) {
    const t = today();
    if (range === "week" || range === "month") {
      const n = range === "week" ? 7 : 30, out = [];
      for (let o = n - 1; o >= 0; o--) { const day = addDays(t, -o); out.push({ date: day, dur: total(rs.filter((r) => sleepDay(r.start) === day)) }); }
      return out;
    }
    const anchor = addMonths(t, 0), out = [];
    for (let o = 11; o >= 0; o--) { const m = addMonths(anchor, -o), next = addMonths(m, 1); out.push({ date: m, dur: total(rs.filter((r) => r.start >= m && r.start < next)) }); }
    return out;
  }
  function hourHistogram(rs) { const h = new Array(24).fill(0); rs.forEach((r) => h[new Date(r.start).getHours()]++); return h; }
  // 🩸 hours are circular: unroll around the 04:00 boundary before taking a median, and use the
  //    median absolute deviation so one afternoon nap doesn't blow up the "±".
  function bedtime(rs) {
    const v = rs.map((r) => { const d = new Date(r.start); return ((d.getHours() + d.getMinutes() / 60) - BOUNDARY + 24) % 24; });
    if (v.length < 3) return null;
    const s = [...v].sort((a, b) => a - b), med = s[s.length >> 1];
    const mad = s.map((x) => Math.abs(x - med)).sort((a, b) => a - b)[s.length >> 1];
    return { hour: (med + BOUNDARY) % 24, spread: mad * 60 };
  }
  function heatmap(rs, weeks = 17) {
    const t = today(), wd = (new Date(t).getDay() - FIRST_WEEKDAY + 7) % 7, lastCol = addDays(t, -wd);
    const by = new Map(); rs.forEach((r) => { const d = sleepDay(r.start); by.set(d, (by.get(d) || 0) + r.dur); });
    const out = [];
    for (let w = weeks - 1; w >= 0; w--) {
      const ws = addDays(lastCol, -w * 7), col = [];
      for (let d = 0; d < 7; d++) { const day = addDays(ws, d); col.push({ date: day, dur: day > t ? -1 : (by.get(day) || 0) }); }
      out.push(col);
    }
    return out;
  }
  function weekdayPattern(rs) {
    const tot = new Array(7).fill(0);
    rs.forEach((r) => { tot[(new Date(sleepDay(r.start)).getDay() - FIRST_WEEKDAY + 7) % 7] += r.dur; });
    const ref = today(), ti = (new Date(ref).getDay() - FIRST_WEEKDAY + 7) % 7;
    return tot.map((v, i) => ({ date: addDays(ref, i - ti), dur: v }));
  }
  // 🩸 by time, not by count: a 40-minute Sleep and a 20-minute Nap are not the same "one use"
  function usageByProgram(rs) {
    const m = new Map(); rs.forEach((r) => { const u = m.get(r.name) || { name: r.name, count: 0, dur: 0 }; u.count++; u.dur += r.dur; m.set(r.name, u); });
    return [...m.values()].sort((a, b) => b.dur - a.dur);
  }
  function topAmbient(rs) {
    const c = new Map(); rs.forEach((r) => Object.entries(r.amb || {}).forEach(([k, v]) => { if (v > 0) c.set(k, (c.get(k) || 0) + 1); }));
    return [...c.entries()].map(([id, count]) => ({ id, count })).sort((a, b) => b.count - a.count);
  }
  const bandOf = (hz) => (hz < 4 ? "δ 睡眠" : hz < 8 ? "θ 冥想" : hz < 13.5 ? "α 放松" : "β 专注");
  function bandEffectiveness(rs) {
    const g = new Map(); rs.filter((r) => r.beat != null).forEach((r) => { const k = bandOf(r.beat); g.set(k, [...(g.get(k) || []), r]); });
    return [...g.entries()].map(([key, xs]) => ({ key, count: xs.length, avg: average(xs), rate: completion(xs) })).sort((a, b) => b.avg - a.avg);
  }
  function nightsThisWeek(rs) { const start = addDays(today(), -6); return days(rs.filter((r) => sleepDay(r.start) >= start)).size; }

  // ---- a seeded four-month history ----
  function seed() {
    let s = 20260704 >>> 0;
    const rnd = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
    const gauss = () => { let u = 0; for (let i = 0; i < 6; i++) u += rnd(); return u - 3; };
    const PROG = { "深度放松": [30, 10, "binaural"], "专注": [45, 12, "binaural"], "入睡": [40, 4, "binaural"], "冥想": [20, 8, "isochronic"], "小憩": [20, 10, "binaural"] };
    const pick = (pairs) => { let x = rnd(), a = 0; for (const [v, p] of pairs) { a += p; if (x < a) return v; } return pairs[0][0]; };
    const out = [], t0 = today(), nowMs = Date.now();
    const add = (start, name, frac, amb) => {
      const [mins, beat, mode] = PROG[name], full = mins * 60;
      const done = frac >= .97, dur = Math.round(done ? full : full * frac);
      if (start + dur * 1000 > nowMs) return;
      out.push({ start, dur, completed: done, name, beat, mode, carrier: name === "入睡" ? 180 : 200, brain: .68, amb });
    };
    for (let o = 125; o >= 1; o--) {
      const day = addDays(t0, -o);
      const lastWeek = o <= 7, gap = o === 8;          // the last seven nights in a row; the night before that, a gap
      if (!gap && (lastWeek || rnd() < .72)) {
        const hour = 23.1 + gauss() * .55, start = day + hour * H;
        const name = pick([["入睡", .55], ["深度放松", .3], ["冥想", .15]]);
        const amb = {}; if (rnd() < .6) amb.rain = .55; if (rnd() < .22) amb.ocean = .4; if (rnd() < .16) amb.pinkNoise = .3; if (rnd() < .1) amb.stream = .35; if (rnd() < .07) amb.campfire = .3;
        add(start, name, rnd() < .62 ? 1 : .45 + rnd() * .45, amb);
      }
      if (!gap && rnd() < .3) {
        const nap = rnd() < .55, start = day + (nap ? 14 + rnd() * 1.5 : 9.5 + rnd() * 1.5) * H;
        add(start, nap ? "小憩" : "专注", rnd() < .5 ? 1 : .5 + rnd() * .4, rnd() < .4 ? { whiteNoise: .3 } : {});
      }
    }
    // today, if the day is old enough: one short focus block, so the daily ring is part-way round
    const td = startOfDay(nowMs), st = Math.max(td + 9 * H, nowMs - 3 * H);
    if (st + 18 * 60e3 < nowMs && new Date(st).getDate() === new Date(nowMs).getDate()) add(st, "专注", .4, {});
    return out;
  }

  return { seed, sleepDay, today, startOfDay, currentStreak, longestStreak, total, average, completion, inRange, changeVsPrevious, buckets, hourHistogram, bedtime, heatmap, weekdayPattern, usageByProgram, topAmbient, bandEffectiveness, nightsThisWeek, bandOf };
})();
