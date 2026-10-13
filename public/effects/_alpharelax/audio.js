/* The app's sound, synthesised live with Web Audio.
   Binaural: carrier in the left ear, carrier + beat in the right — the brain hears the difference as the beat.
   Isochronic: one carrier tone whose loudness pulses at the beat rate (no headphones needed).
   Ambient layers are procedural noise (the app plays recorded loops; these are close stand-ins). */
window.ARAudio = (() => {
  let ctx = null, master = null, brain = null, layers = {}, running = false;
  const state = { mode: "binaural", carrier: 200, beat: 10, brainVol: 0.68, amb: {} };

  function ensure() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
    return ctx;
  }

  // ---- noise buffers ----
  function noise(kind, secs = 6) {
    const n = Math.floor(ctx.sampleRate * secs), buf = ctx.createBuffer(2, n, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, last = 0;
      for (let i = 0; i < n; i++) {
        const w = Math.random() * 2 - 1;
        if (kind === "white") d[i] = w * .5;
        else if (kind === "pink") {           // Paul Kellet's refined pink filter
          b0 = .99886 * b0 + w * .0555179; b1 = .99332 * b1 + w * .0750759; b2 = .969 * b2 + w * .153852;
          b3 = .8665 * b3 + w * .3104856; b4 = .55 * b4 + w * .5329522; b5 = -.7616 * b5 - w * .016898;
          d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * .5362) * .11; b6 = w * .115926;
        } else {                               // brown: integrated white
          last = (last + .02 * w) / 1.02; d[i] = last * 3.2;
        }
      }
    }
    return buf;
  }
  const bufs = {};
  const src = (kind) => { const s = ctx.createBufferSource(); s.buffer = bufs[kind] || (bufs[kind] = noise(kind)); s.loop = true; return s; };
  const filt = (type, f, q = .7) => { const x = ctx.createBiquadFilter(); x.type = type; x.frequency.value = f; x.Q.value = q; return x; };
  const lfo = (hz, depth, target) => { const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = hz; g.gain.value = depth; o.connect(g).connect(target); o.start(); return o; };

  // each ambient layer: a chain ending in its own gain node
  const RECIPES = {
    whiteNoise: (out) => { const s = src("white"); s.connect(out); return [s]; },
    pinkNoise: (out) => { const s = src("pink"); s.connect(out); return [s]; },
    rain: (out) => { const s = src("white"), hp = filt("highpass", 900), lp = filt("lowpass", 7000), g = ctx.createGain(); g.gain.value = .7; lfo(.17, .12, g.gain); s.connect(hp).connect(lp).connect(g).connect(out); return [s]; },
    ocean: (out) => { const s = src("pink"), lp = filt("lowpass", 520), g = ctx.createGain(); g.gain.value = .55; const o = lfo(.085, .45, g.gain); s.connect(lp).connect(g).connect(out); return [s, o]; },
    campfire: (out) => {
      const s = src("brown"), lp = filt("lowpass", 700), g = ctx.createGain(); g.gain.value = .9; s.connect(lp).connect(g).connect(out);
      // crackles: short bright bursts at random moments
      const pop = () => {
        if (!running) return;
        const b = src("white"), bp = filt("bandpass", 1800 + Math.random() * 2500, 2), e = ctx.createGain(), t = ctx.currentTime;
        e.gain.setValueAtTime(0, t); e.gain.linearRampToValueAtTime(.5 + Math.random() * .6, t + .004); e.gain.exponentialRampToValueAtTime(.001, t + .04 + Math.random() * .06);
        b.connect(bp).connect(e).connect(out); b.start(t, Math.random() * 4); b.stop(t + .15);
        g._t = setTimeout(pop, 60 + Math.random() * 380);
      };
      pop(); return [s, { stop: () => clearTimeout(g._t) }];
    },
    wind: (out) => { const s = src("pink"), bp = filt("bandpass", 420, .9), g = ctx.createGain(); g.gain.value = 1.1; const o = lfo(.06, 260, bp.frequency); const o2 = lfo(.11, .35, g.gain); s.connect(bp).connect(g).connect(out); return [s, o, o2]; },
    stream: (out) => { const s = src("white"), bp = filt("bandpass", 1700, .55), hp = filt("highpass", 400), g = ctx.createGain(); g.gain.value = .55; const o = lfo(3.1, .1, g.gain); s.connect(hp).connect(bp).connect(g).connect(out); return [s, o]; },
  };

  // ---- brainwave ----
  function buildBrain() {
    const out = ctx.createGain(); out.gain.value = state.brainVol * .16; out.connect(master);
    const nodes = [];
    if (state.mode === "binaural") {
      const l = ctx.createOscillator(), r = ctx.createOscillator(), m = ctx.createChannelMerger(2);
      l.frequency.value = state.carrier; r.frequency.value = state.carrier + state.beat;
      l.connect(m, 0, 0); r.connect(m, 0, 1); m.connect(out); l.start(); r.start(); nodes.push(l, r);
      return { out, nodes, set() { const t = ctx.currentTime; l.frequency.setTargetAtTime(state.carrier, t, .05); r.frequency.setTargetAtTime(state.carrier + state.beat, t, .05); } };
    }
    const o = ctx.createOscillator(), amp = ctx.createGain(), mod = ctx.createOscillator(), shape = ctx.createWaveShaper(), depth = ctx.createGain();
    // a soft square: sine through tanh, so each pulse has a clear on/off edge without clicking
    const curve = new Float32Array(256); for (let i = 0; i < 256; i++) curve[i] = Math.tanh((i / 127.5 - 1) * 6) * .5;
    shape.curve = curve; amp.gain.value = .5; depth.gain.value = 1;
    o.frequency.value = state.carrier; mod.frequency.value = state.beat;
    mod.connect(shape).connect(depth).connect(amp.gain); o.connect(amp).connect(out); o.start(); mod.start(); nodes.push(o, mod);
    return { out, nodes, set() { const t = ctx.currentTime; o.frequency.setTargetAtTime(state.carrier, t, .05); mod.frequency.setTargetAtTime(state.beat, t, .05); } };
  }

  function buildLayer(id) {
    const g = ctx.createGain(); g.gain.value = (state.amb[id] || 0) * .42; g.connect(master);
    return { g, nodes: RECIPES[id](g) };
  }

  function teardown() {
    if (brain) { brain.nodes.forEach((n) => { try { n.stop(); } catch (_) {} }); brain.out.disconnect(); brain = null; }
    Object.values(layers).forEach((L) => { L.nodes.forEach((n) => { try { n.stop(); } catch (_) {} }); L.g.disconnect(); });
    layers = {};
  }

  function start() {
    if (!ensure()) return;
    ctx.resume();
    teardown(); running = true;
    brain = buildBrain();
    Object.keys(RECIPES).forEach((id) => { if ((state.amb[id] || 0) > 0) layers[id] = buildLayer(id); });
    const t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(1, t + .6);
  }
  function stop() {
    if (!ctx || !running) return;
    running = false;
    const t = ctx.currentTime; master.gain.cancelScheduledValues(t); master.gain.setValueAtTime(master.gain.value, t); master.gain.linearRampToValueAtTime(0, t + .4);
    setTimeout(() => { if (!running) teardown(); }, 450);
  }
  const pause = stop, resume = start;

  function set(patch) {
    const modeChanged = patch.mode && patch.mode !== state.mode;
    Object.assign(state, patch);
    if (patch.amb) state.amb = { ...state.amb, ...patch.amb };
    if (!running || !ctx) return;
    if (modeChanged) { const old = brain; brain = buildBrain(); old.out.gain.setTargetAtTime(0, ctx.currentTime, .05); setTimeout(() => { old.nodes.forEach((n) => { try { n.stop(); } catch (_) {} }); old.out.disconnect(); }, 300); }
    else if (brain) brain.set();
    if (brain) brain.out.gain.setTargetAtTime(state.brainVol * .16, ctx.currentTime, .05);
    Object.keys(RECIPES).forEach((id) => {
      const v = state.amb[id] || 0;
      if (v > 0 && !layers[id]) layers[id] = buildLayer(id);
      if (layers[id]) layers[id].g.gain.setTargetAtTime(v * .42, ctx.currentTime, .05);
    });
  }

  // the end chime: a soft two-partial bell
  function chime() {
    if (!ensure()) return;
    ctx.resume();
    const t = ctx.currentTime;
    [[880, .22], [1318.5, .1]].forEach(([f, v]) => {
      const o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = f;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + 1.6);
      o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + 1.7);
    });
  }

  return { start, stop, pause, resume, set, chime, state, get running() { return running; } };
})();
