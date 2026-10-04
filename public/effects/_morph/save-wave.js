/* Save-wave ripple — Mind Studio, original implementation (2026-10-05).
 *
 * Written from scratch against a black-box measurement of the effect's
 * output (displacement field decoded from a coordinate-coloured source),
 * not from any upstream source. Same call shape the map demo already uses:
 *
 *   const r = createRipple({ source, output, onIdle }, params)  // null without WebGL
 *   r.splash(x, y, strength)   // CSS px relative to the output canvas
 *   r.resize()                 // after the source canvas changes size
 *   r.destroy()
 *
 * Model (one outward wave packet per splash, all packets summed; t in s):
 *   centre    c(t) = −0.02·λ + v·t                    v = 341·speed  px/s
 *   envelope  exp(−((r − c)/σ)²)                      σ = 0.5085·rings·λ
 *   carrier   cos(2π(r − c)/(0.953·λ) + 0.034)
 *   height    A·e^(−k·t)·smoothstep(5 ms, 88 ms, t)   A = 0.995·amplitude·refraction·strength (px), k = 1.17·decay
 * The signed value displaces the texture lookup along the radius (positive =
 * sample farther out). Red looks up at (1 + 0.25·dispersion) of that offset,
 * blue at (1 − 0.45·dispersion). Shine is a light falling from the upper
 * left (screen direction 55°, y down): with g = −(value / unit-strength
 * height)·(radial direction · light), lit faces gain shine·0.599·g² toward
 * white and faces turned away lose shine·0.0424·g². A packet retires once e^(−k·t) < 0.057 (≈1.96 s at the
 * demo's decay 1.25). Time runs from 8 ms before the splash call, so the
 * first painted frame already shows the wave starting to rise.
 *
 * Constants were fitted to the measured field (R² 0.992 over 0–1.9 s) at the
 * parameters the map demo passes; other parameter sets are scaled by the same
 * formulas but were not tuned against anything.
 */
window.createRipple = (function () {
  "use strict";
  var MAX = 8;

  var VS =
    "attribute vec2 aPos;" +
    "varying vec2 vUv;" +
    "void main(){ vUv = aPos * 0.5 + 0.5; gl_Position = vec4(aPos, 0.0, 1.0); }";

  var FS =
    "precision highp float;" +
    "uniform sampler2D uTex;" +
    "uniform vec2 uSize;" +            // CSS px
    "uniform int uCount;" +
    "uniform vec4 uWave[" + MAX + "];" + // x, y, centre radius, height (px)
    "uniform float uSigma[" + MAX + "];" +
    "uniform float uLambda;" +
    "uniform float uDispR;" +"uniform float uDispB;" +
    "uniform float uShine;" +
    "uniform float uUnit;" +            // height of a unit-strength wave at t = 0
    "varying vec2 vUv;" +
    "vec3 pick(vec2 q){ vec2 uv = clamp(q / uSize, 0.0, 1.0); return texture2D(uTex, vec2(uv.x, 1.0 - uv.y)).rgb; }" +
    "void main(){" +
    "  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uSize;" +
    "  vec2 off = vec2(0.0); float lit = 0.0;" +
    "  for (int i = 0; i < " + MAX + "; i++) {" +
    "    if (i >= uCount) break;" +
    "    vec4 w = uWave[i];" +
    "    vec2 d = p - w.xy; float r = length(d);" +
    "    vec2 dir = r > 0.001 ? d / r : vec2(0.0);" +
    "    float x = r - w.z; float s = uSigma[i];" +
    "    float v = w.w * exp(-(x * x) / (s * s)) * cos(6.2831853 * x / uLambda + 0.034);" +
    "    off += dir * v; lit -= v * dot(dir, vec2(0.5736, 0.8192));" +
    "  }" +
    "  vec3 c;" +
    "  c.r = pick(p + off * (1.0 + uDispR)).r;" +
    "  c.g = pick(p + off).g;" +
    "  c.b = pick(p + off * (1.0 - uDispB)).b;" +
    "  float g = lit / uUnit, hi = max(g, 0.0), lo = max(-g, 0.0);" +
    "  c += uShine * (0.599 * hi * hi - 0.0424 * lo * lo);" +
    "  gl_FragColor = vec4(clamp(c, 0.0, 1.0), 1.0);" +
    "}";

  function compile(gl, type, src) {
    var sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) { console.warn("ripple shader:", gl.getShaderInfoLog(sh)); return null; }
    return sh;
  }

  return function createRipple(io, params) {
    var source = io.source, output = io.output, onIdle = io.onIdle || function () {};
    var P = Object.assign({ amplitude: 0.36, speed: 0.8, wavelength: 100, rings: 2, decay: 1.25,
      refraction: 55, dispersion: 0.2, shine: 0.28, interval: 0 }, params || {});

    var gl = output.getContext("webgl", { alpha: true, premultipliedAlpha: false, antialias: false });
    if (!gl) return null;
    var vs = compile(gl, gl.VERTEX_SHADER, VS), fs = compile(gl, gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return null;
    var prog = gl.createProgram(); gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return null;
    gl.useProgram(prog);

    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var aPos = gl.getAttribLocation(prog, "aPos"); gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    var tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

    var U = {};
    ["uTex", "uSize", "uCount", "uLambda", "uDispR", "uDispB", "uShine", "uUnit"].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
    U.uWave = gl.getUniformLocation(prog, "uWave[0]");
    U.uSigma = gl.getUniformLocation(prog, "uSigma[0]");
    gl.uniform1i(U.uTex, 0);

    var waves = [], raf = 0, cssW = 1, cssH = 1, last = null, repeatAt = 0, alive = true;
    var waveArr = new Float32Array(MAX * 4), sigArr = new Float32Array(MAX);
    var now = function () { return performance.now(); };

    // The host may size its canvas after creating us (the map demo does), so
    // every frame re-checks the backing size and the CSS box before drawing.
    function sync() {
      if (output.width !== source.width || output.height !== source.height) {
        output.width = source.width; output.height = source.height;
      }
      cssW = output.clientWidth || source.width; cssH = output.clientHeight || source.height;
      gl.viewport(0, 0, output.width, output.height);
    }
    function resize() { sync(); if (waves.length) draw(now()); }

    var K = function () { return 1.17 * P.decay; };
    var unit = function () { return Math.max(0.995 * P.amplitude * P.refraction, 1e-3); };
    function height(w, s) {
      var u = Math.min(Math.max((s - 0.005) / 0.083, 0), 1);
      return w.h * Math.exp(-K() * s) * u * u * (3 - 2 * u);
    }
    function draw(t) {
      var lam = P.wavelength, v = 341 * P.speed, n = 0;
      waves = waves.filter(function (w) { return Math.exp(-K() * (t - w.t0) / 1000) >= 0.057; });
      for (var i = 0; i < waves.length && n < MAX; i++, n++) {
        var w = waves[waves.length - 1 - i], s = Math.max((t - w.t0) / 1000, 0);
        waveArr[n * 4] = w.x; waveArr[n * 4 + 1] = w.y;
        waveArr[n * 4 + 2] = -0.02 * lam + v * s;
        waveArr[n * 4 + 3] = height(w, s);
        sigArr[n] = Math.max(0.5085 * P.rings * lam, 4);
      }
      if (!n) { gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); return false; }
      sync();
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      gl.uniform2f(U.uSize, cssW, cssH);
      gl.uniform1i(U.uCount, n);
      gl.uniform4fv(U.uWave, waveArr);
      gl.uniform1fv(U.uSigma, sigArr);
      gl.uniform1f(U.uLambda, 0.953 * lam);
      gl.uniform1f(U.uDispR, 0.25 * P.dispersion);
      gl.uniform1f(U.uDispB, 0.45 * P.dispersion);
      gl.uniform1f(U.uShine, P.shine);
      gl.uniform1f(U.uUnit, unit());
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      return true;
    }

    function loop() {
      raf = 0; if (!alive) return;
      var t = now();
      if (P.interval > 0 && last && t >= repeatAt) { add(last.x, last.y, last.k, t); }
      if (draw(t) || (P.interval > 0 && last)) raf = requestAnimationFrame(loop);
      else onIdle();
    }

    function add(x, y, k, t) {
      waves.push({ x: x, y: y, t0: t - 8, h: unit() * k }); // the wave is already one frame old when first seen
      if (waves.length > MAX) waves.shift();
      if (P.interval > 0) repeatAt = t + P.interval * 1000;
    }

    resize();
    return {
      splash: function (x, y, strength) {
        if (!alive) return;
        var k = strength == null ? 1 : strength, t = now();
        last = { x: x, y: y, k: k };
        add(x, y, k, t); draw(t);
        if (!raf) raf = requestAnimationFrame(loop);
      },
      resize: resize,
      destroy: function () { alive = false; if (raf) cancelAnimationFrame(raf); waves = []; gl.deleteTexture(tex); gl.deleteProgram(prog); },
    };
  };
})();
