// 一眼千年 · score, synthesised live with Web Audio — no audio files.
//
// A slow guzheng-like line on the D gong pentatonic (D E F# A B), plucked strings made with
// Karplus–Strong, over a soft two-note drone, all through a long generated "cave" reverb.
// Each chapter moves the drone and the melody's centre to another note of the same scale, so the
// key never jumps but the colour changes; the last chapter adds high bells. Walking forward plays
// an upward 刮奏 (glissando) and a breath of wind timed to the camera move; walking back, a downward one.
// The page asks: Music.start(), .stop(), .setChapter(i), .step(dir, seconds), .onBar(fn), .running.
(() => {
  const BPM = 66, BEAT = 60 / BPM, BAR = BEAT * 4;
  // MIDI numbers of the D gong pentatonic from D2 to D6
  const PENTA = [0, 2, 4, 7, 9];
  const SCALE = [];
  for (let o = 38; o <= 86; o += 12) for (const s of PENTA) if (o + s <= 86) SCALE.push(o + s);
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  const idx = (m) => SCALE.indexOf(m);
  // per chapter: drone pair (MIDI) and the melody's home note
  const MOODS = [
    { drone: [47, 54], home: 71 },   // 丝路商队 — B (yu): desert, a little wistful
    { drone: [38, 45], home: 74 },   // 水边发现 — D (gong): open
    { drone: [45, 52], home: 76 },   // 初遇神鹿 — A (zhi): bright
    { drone: [40, 47], home: 71 },   // 随鹿前行 — E (shang): moving
    { drone: [47, 54], home: 69 },   // 救护幼鹿 — B, low and tender
    { drone: [45, 52], home: 78 },   // 踏石渡云 — A, higher
    { drone: [38, 45], home: 81, bells: true }, // 仰望飞天 — D, bells
  ];
  // rhythms in eighth notes within a bar; null = a resting bar
  const RHYTHMS = [[0, 3, 4, 6], [0, 2, 4], [0, 4, 6, 7], [0, 6], [0, 3, 6], [0, 1, 2, 4], null, [0, 4]];

  let ctx = null, master, wet, dry, droneGain, droneOsc = [], timer = 0, nextBar = 0, barNo = 0;
  let chapter = 0, cur = 74, running = false, barFns = [];
  const plucks = new Map();     // rounded base freq → AudioBuffer
  let rnd = 1;
  const rand = () => (rnd = (rnd * 16807) % 2147483647) / 2147483647;

  // ── instruments ────────────────────────────────────────────────────────────
  // Karplus–Strong string at an integer delay; the exact pitch is reached with playbackRate.
  function pluckBuffer(f) {
    const sr = ctx.sampleRate, N = Math.max(8, Math.round(sr / f));
    const key = N;
    if (plucks.has(key)) return { buf: plucks.get(key), f0: sr / (N + 0.5) };
    const len = Math.floor(sr * 3.2), out = new Float32Array(len), d = new Float32Array(N);
    let s = 0;
    for (let i = 0; i < N; i++) { s = s * 0.5 + (Math.random() * 2 - 1) * 0.5; d[i] = s; }   // softened noise burst
    const decay = 0.9965 - Math.min(0.006, f / 400000);
    let p = 0, prev = 0;
    for (let i = 0; i < len; i++) {
      const y = d[p];
      const nxt = d[(p + 1) % N];
      d[p] = decay * 0.5 * (y + nxt);
      p = (p + 1) % N;
      // pluck-position comb: a little nasal edge, like a guzheng string plucked near the bridge
      out[i] = y - 0.35 * prev; prev = y;
    }
    const buf = ctx.createBuffer(1, len, sr); buf.copyToChannel(out, 0);
    plucks.set(key, buf);
    return { buf, f0: sr / (N + 0.5) };
  }
  function pluck(m, t, vel = 0.5, opts = {}) {
    const f = hz(m), { buf, f0 } = pluckBuffer(f);
    const src = ctx.createBufferSource(); src.buffer = buf;
    const rate = f / f0;
    if (opts.bend) {                                        // 滑音: slide up into the note
      src.playbackRate.setValueAtTime(rate * Math.pow(2, -opts.bend / 12), t);
      src.playbackRate.linearRampToValueAtTime(rate, t + 0.18);
    } else src.playbackRate.setValueAtTime(rate, t);
    if (opts.vibrato) {                                     // 揉弦: gentle wobble on long notes
      const lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = 5.2; lg.gain.value = rate * 0.006;
      lfo.connect(lg).connect(src.playbackRate); lfo.start(t + 0.35); lfo.stop(t + 3);
    }
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel, t + 0.004);
    g.gain.setTargetAtTime(0, t + (opts.len ?? 2.2), 0.4);
    const pan = ctx.createStereoPanner(); pan.pan.value = opts.pan ?? (m - 66) / 40;
    src.connect(g).connect(pan); pan.connect(dry); pan.connect(wet);
    src.start(t); src.stop(t + 3.2);
  }
  function bell(m, t, vel = 0.12) {
    for (const [k, a] of [[1, 1], [2.76, 0.45], [5.4, 0.2]]) {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = "sine"; o.frequency.value = hz(m) * k;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vel * a, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 3.5 / k);
      o.connect(g); g.connect(wet); g.connect(dry);
      o.start(t); o.stop(t + 4);
    }
  }
  function wind(t, dur, up) {
    const len = Math.floor(ctx.sampleRate * (dur + 0.5)), b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = b;
    const bp = ctx.createBiquadFilter(); bp.type = "bandpass"; bp.Q.value = 1.2;
    bp.frequency.setValueAtTime(up ? 380 : 1600, t); bp.frequency.exponentialRampToValueAtTime(up ? 1900 : 340, t + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(0.11, t + dur * 0.45); g.gain.linearRampToValueAtTime(0, t + dur + 0.3);
    src.connect(bp).connect(g); g.connect(wet); g.connect(dry);
    src.start(t); src.stop(t + dur + 0.5);
  }

  // ── cave reverb: 3.4 s of decaying stereo noise, darker at the tail ──────────
  function caveImpulse() {
    const sr = ctx.sampleRate, len = Math.floor(sr * 3.4), b = ctx.createBuffer(2, len, sr);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c); let lp = 0;
      for (let i = 0; i < len; i++) {
        const t = i / len, k = 0.25 + 0.7 * t;              // the tail gets duller
        lp = lp * k + (Math.random() * 2 - 1) * (1 - k);
        d[i] = lp * Math.pow(1 - t, 2.4) * (i < sr * 0.012 ? i / (sr * 0.012) : 1);
      }
    }
    return b;
  }

  // ── drone ────────────────────────────────────────────────────────────────────
  function setDrone(pair, at, glide = 2.5) {
    pair.forEach((m, i) => {
      const o = droneOsc[i];
      o.a.frequency.setTargetAtTime(hz(m), at, glide / 3);
      o.b.frequency.setTargetAtTime(hz(m) * 1.003, at, glide / 3);
    });
  }

  // ── the melody, one bar at a time ─────────────────────────────────────────────
  function scheduleBar(t) {
    const mood = MOODS[chapter];
    const rhythm = barNo % 8 === 7 ? null : RHYTHMS[Math.floor(rand() * RHYTHMS.length)];
    // bass pluck on the downbeat, root / fifth
    pluck(mood.drone[barNo % 2 === 0 ? 0 : 1] + 12, t, 0.32, { len: 3, pan: -0.15 });
    if (rhythm) {
      rhythm.forEach((e, k) => {
        // random walk on the scale, pulled back towards the chapter's home note
        let i = idx(cur), h = idx(mood.home);
        const step = [-2, -1, -1, 0, 1, 1, 2][Math.floor(rand() * 7)];
        i += step + (i - h > 3 ? -1 : i - h < -3 ? 1 : 0);
        i = Math.max(idx(62), Math.min(idx(86), i));
        cur = SCALE[i];
        const last = k === rhythm.length - 1;
        const nt = t + e * BEAT / 2 + (rand() - 0.5) * 0.012;  // a hair of human timing
        pluck(cur, nt, 0.42 + rand() * 0.12, { bend: rand() < 0.18 ? 2 : 0, vibrato: last, len: last ? 2.8 : 1.6 });
        if (rand() < 0.12) pluck(cur + 12, nt + 0.01, 0.12, { len: 1.2 });   // a soft octave harmonic now and then
      });
    }
    if (mood.bells && barNo % 2 === 0) bell(SCALE[idx(mood.home) + (barNo % 4 === 0 ? 2 : 0)], t + BEAT * 2);
    barNo++;
  }
  function tick() {
    while (nextBar < ctx.currentTime + 0.25) {
      scheduleBar(nextBar);
      const at = nextBar;
      const ms = (at - ctx.currentTime) * 1000;
      setTimeout(() => barFns.forEach((fn) => fn(barNo)), Math.max(0, ms));
      nextBar += BAR;
    }
  }

  // ── public ───────────────────────────────────────────────────────────────────
  function build() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 3;
    master.connect(comp).connect(ctx.destination);
    dry = ctx.createGain(); dry.gain.value = 0.55; dry.connect(master);
    const rev = ctx.createConvolver(); rev.buffer = caveImpulse();
    wet = ctx.createGain(); wet.gain.value = 0.5; wet.connect(rev); rev.connect(master);
    droneGain = ctx.createGain(); droneGain.gain.value = 0.05;
    const lp = ctx.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 520;
    const breathe = ctx.createOscillator(), bg = ctx.createGain();    // the drone breathes every ~9 s
    breathe.frequency.value = 0.11; bg.gain.value = 0.02; breathe.connect(bg).connect(droneGain.gain); breathe.start();
    droneGain.connect(lp); lp.connect(master); lp.connect(wet);
    for (let i = 0; i < 2; i++) {
      const a = ctx.createOscillator(), b = ctx.createOscillator();
      a.type = "triangle"; b.type = "sine";
      a.connect(droneGain); b.connect(droneGain); a.start(); b.start();
      droneOsc.push({ a, b });
    }
    setDrone(MOODS[chapter].drone, ctx.currentTime, 0.01);
    document.addEventListener("visibilitychange", () => {
      if (!ctx) return;
      if (document.hidden) ctx.suspend(); else if (running) ctx.resume();
    });
  }
  const Music = {
    get running() { return running; },
    async start() {
      if (!ctx) build();
      await ctx.resume();
      if (running) return;
      running = true;
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(1.25, t + 2.5);
      nextBar = t + 0.15; barNo = 0;
      clearInterval(timer); timer = setInterval(tick, 60); tick();
    },
    stop() {
      if (!ctx || !running) return;
      running = false; clearInterval(timer);
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(0, t + 0.9);
      setTimeout(() => { if (!running) ctx.suspend(); }, 1000);
    },
    setChapter(i) {
      if (i === chapter) return;
      chapter = i;
      if (ctx) setDrone(MOODS[i].drone, ctx.currentTime);
    },
    // a camera move of `dur` seconds: glissando + wind; dir 1 forward, -1 back
    step(dir, dur) {
      if (!ctx || !running) return;
      const t = ctx.currentTime + 0.02, n = 9;
      const start = dir > 0 ? idx(62) : idx(86);
      for (let k = 0; k < n; k++) {
        const m = SCALE[start + dir * k];
        if (m) pluck(m, t + k * 0.055 * (1 + k * 0.05), 0.22 + k * 0.02 * (dir > 0 ? 1 : -0.5), { len: 1.4 });
      }
      wind(t, Math.max(0.8, dur * 0.9), dir > 0);
    },
    onBar(fn) { barFns.push(fn); },
    get output() { return master; },          // for recording / metering
  };
  window.Music = Music;
})();
