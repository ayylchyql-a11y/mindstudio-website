// A glass chrysanthemum, built from code — no video, no model file.
// ~150 spoon-shaped petals laid out on the golden angle; inner petals are milky and incurved,
// outer petals are clear blue glass that splay out and droop. bloom(t) opens them outer-first.
import * as T from "./three.min.js";

const GOLD = Math.PI * (3 - Math.sqrt(5));           // 137.5°
const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = (x) => Math.min(1, Math.max(0, x));
const smooth = (x) => { x = clamp01(x); return x * x * (3 - 2 * x); };
const easeInOut = (x) => { x = clamp01(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };

// deterministic noise so the flower is the same on every load
function rng(seed) { let s = seed >>> 0; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); }

/* one petal as a lofted surface. Local frame: spine runs along +Y from the origin,
   the inner (cupped) face looks toward −Z, which after placement is toward the flower's axis. */
function petalGeometry({ len, width, cup, curl, tipCurl = 0, point = .75, twist = 0, segU = 16, segV = 10, spoon = .56, ao = .3, warm = 0 }) {
  const spec_c = spoon;
  const pos = [], uv = [], idx = [], col = [];
  // integrate the spine: bend angle grows along the length (curl), with an extra flick at the tip
  const spine = [], ang = [];
  let y = 0, z = 0;
  for (let i = 0; i <= segU; i++) {
    const u = i / segU;
    const a = curl * u + tipCurl * Math.pow(u, 3);
    spine.push([y, z]); ang.push(a);
    const step = len / segU;
    y += Math.cos(a) * step; z -= Math.sin(a) * step;
  }
  for (let i = 0; i <= segU; i++) {
    const u = i / segU;
    // spoon: narrow claw at the base, widest past the middle, elliptical rounded tip; pointed species taper instead
    const c = spec_c;
    const body = u < c ? lerp(.22, 1, Math.pow(smooth(u / c), .7)) : (point > 1 ? 1 - (u - c) / (1 - c) : Math.sqrt(Math.max(0, 1 - Math.pow((u - c) / (1 - c), 2))));
    const half = width * body;
    const [sy, sz] = spine[i], a = ang[i];
    // spine tangent (0, cos a, −sin a); inner normal (0, −sin a, −cos a)
    const ny = -Math.sin(a), nz = -Math.cos(a);
    const tw = twist * u;
    for (let j = 0; j <= segV; j++) {
      const v = j / segV * 2 - 1;
      const x = v * half * Math.cos(tw);
      const off = cup * half * v * v + v * half * Math.sin(tw) * .4;   // edges lift toward the inside
      pos.push(x, sy + ny * off, sz + nz * off);
      uv.push(j / segV, u);
      // no shadows in this scene, so occlusion is painted in: the claw, buried among other petals, goes dark
      const lit = lerp(ao, 1, Math.pow(smooth(u * 1.25), .8)) * (1 - .12 * (1 - v * v));
      col.push(lit * lerp(1, 1.0, warm), lit * lerp(1, .9, warm), lit * lerp(1, .72, warm));
    }
  }
  const row = segV + 1;
  for (let i = 0; i < segU; i++) for (let j = 0; j < segV; j++) {
    const a = i * row + j, b = a + row;
    idx.push(a, b, a + 1, b, b + 1, a + 1);
  }
  const g = new T.BufferGeometry();
  g.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
  g.setAttribute("uv", new T.Float32BufferAttribute(uv, 2));
  g.setAttribute("color", new T.Float32BufferAttribute(col, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

/* glass glows at grazing angles: add a Fresnel rim to the emissive term so every petal edge lights up,
   which is what the eye reads as "crystal" far more than the refraction itself */
function rim(mat, color, k, pow = 3) {
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.rimColor = { value: new T.Color(color) };
    sh.uniforms.rimK = { value: k };
    sh.fragmentShader = sh.fragmentShader
      .replace("void main() {", "uniform vec3 rimColor; uniform float rimK;\nvoid main() {")
      .replace("#include <emissivemap_fragment>", `#include <emissivemap_fragment>
        float fr = 1.0 - abs(dot(normalize(normal), normalize(vViewPosition)));
        totalEmissiveRadiance += rimColor * rimK * pow(fr, ${pow.toFixed(1)});`);
  };
  mat.customProgramCacheKey = () => "rim" + color + k + pow;
  return mat;
}

export const SPECIES = {
  // the hero: a full incurved chrysanthemum — a ball of spoon petals over a skirt of long clear ones
  dahlia: { count: 250, seed: 7, radius: .26, dome: 100, inner: [.6, .12], outer: [.62, .15], openPitch: [8, 142], pitchPow: 2.5, closedPitch: [2, 16], curl: [1.5, .45], cup: [1.3, .8], point: .8, drop: .1, milkTo: .8, spoon: .66, warm: 1, atten: 2.4, milkTrans: .6, milkRough: .14, milkColor: 0xc8dcec, milkEnv: 1.1 },
  // card 1: an open cup of broad milky petals on a long stem
  lotus:  { count: 22, seed: 3, radius: .07, dome: 60, inner: [.36, .15], outer: [.56, .19], openPitch: [22, 88], pitchPow: 1.1, closedPitch: [8, 26], curl: [1.1, .45], cup: [1.1, .8], point: .8, drop: 0, milky: 1, spoon: .6, noSepals: 1, stemW: .6, aoIn: .55 },
  // card 2: narrow pointed blue petals
  star:   { count: 6, even: 1, seed: 11, radius: .05, dome: 40, inner: [.62, .13], outer: [.62, .13], openPitch: [74, 74], pitchPow: 1, closedPitch: [20, 26], curl: [.25, .25], cup: [.45, .45], point: 1.2, drop: 0, blue: 1, milkTo: 0, heart: 1, atten: 1.3, noSepals: 1, aoIn: .7, aoOut: .7 },
};

export function createFlower(spec = SPECIES.dahlia, env) {
  const r = rng(spec.seed);
  const head = new T.Group();
  const petals = [];

  // pearly inner petals: opaque, glossy, a little sheen — they read as milk glass under the clear ones
  const milky = new T.MeshPhysicalMaterial({
    color: spec.blue ? 0xb9d2f2 : (spec.milkColor ?? 0xe8edf5), roughness: spec.milkRough ?? .07, metalness: 0, clearcoat: 1, clearcoatRoughness: .02,
    transmission: spec.milkTrans ?? 0, thickness: .45, ior: 1.45, attenuationColor: new T.Color(0xd5deec), attenuationDistance: 1.1,
    sheen: .6, sheenColor: new T.Color(0xcfe0ff), sheenRoughness: .4, iridescence: .35, iridescenceIOR: 1.3,
    envMapIntensity: spec.milkEnv ?? .55, side: T.DoubleSide, vertexColors: true, specularIntensity: 1, ior: 1.5,
  });
  rim(milky, 0xf2f6ff, spec.rimMilk ?? .22, 3.2);
  // clear outer petals: real transmission (refracts what is behind), thin, blue-tinted, strong reflections
  const glass = new T.MeshPhysicalMaterial({
    color: spec.blue ? 0x9cc2f0 : 0xd2e2f8, roughness: .03, metalness: 0, transmission: 1, thickness: .35, ior: 1.5,
    attenuationColor: new T.Color(spec.blue ? 0x1f5bb0 : 0x1d4380), attenuationDistance: spec.atten ?? .32,
    clearcoat: 1, clearcoatRoughness: .02, specularIntensity: 1, envMapIntensity: 2.2, side: T.DoubleSide,
    iridescence: .25, iridescenceIOR: 1.25, vertexColors: true,
  });

  rim(glass, 0xcfe2ff, spec.rimGlass ?? .45, 3);

  for (let i = 0; i < spec.count; i++) {
    const s = spec.count === 1 ? 1 : i / (spec.count - 1);      // 0 = innermost, 1 = outermost
    const jitter = (r() - .5);
    const len = lerp(spec.inner[0], spec.outer[0], Math.pow(s, .8)) * (1 + jitter * .12);
    const width = lerp(spec.inner[1], spec.outer[1], s) * (1 + (r() - .5) * .15);
    const curl = lerp(spec.curl[0], spec.curl[1], s) + (r() - .5) * .25;
    const cup = lerp(spec.cup[0], spec.cup[1], s);
    const geo = petalGeometry({ len, width, cup, curl, tipCurl: s > .7 ? -.5 * (s - .7) / .3 * spec.drop : 0, point: spec.point, twist: spec.even ? 0 : (r() - .5) * .5, spoon: spec.spoon || .56,
      ao: lerp(spec.aoIn ?? .12, spec.aoOut ?? .55, s), warm: spec.warm ? Math.max(0, 1 - s / .35) * spec.warm : 0 });
    const isMilk = spec.milky ? true : s < (spec.milkTo ?? .55) + jitter * .1;
    const mesh = new T.Mesh(geo, isMilk ? milky : glass);
    mesh.castShadow = true; mesh.receiveShadow = true;
    const pivot = new T.Group();      // azimuth
    const tilt = new T.Group();       // pitch
    pivot.add(tilt); tilt.add(mesh);
    const phi = spec.even ? i / spec.count * Math.PI * 2 : i * GOLD + (r() - .5) * .12;
    pivot.rotation.y = phi;
    // bases sit on a dome: inner petals near the top of the receptacle, outer ones round its shoulder
    const th = Math.pow(s, .8) * spec.dome * Math.PI / 180;
    tilt.position.set(0, Math.cos(th) * spec.radius - spec.radius * .6, Math.sin(th) * spec.radius + .012);
    head.add(pivot);
    petals.push({
      tilt, s,
      open: (lerp(spec.openPitch[0], spec.openPitch[1], Math.pow(s, spec.pitchPow || 1.15)) + (r() - .5) * 9) * Math.PI / 180,
      closed: (lerp(spec.closedPitch[0], spec.closedPitch[1], s) + (r() - .5) * 4) * Math.PI / 180,
      delay: (1 - s) * .42 + r() * .06,
    });
  }

  // a glass stem and dark-blue sepals under the head
  const stemMat = new T.MeshPhysicalMaterial({ color: 0xa9c6ea, roughness: .05, transmission: 1, thickness: .3, ior: 1.45, attenuationColor: new T.Color(0x3f6fae), attenuationDistance: .6, clearcoat: 1, envMapIntensity: 1.6 });
  const stem = new T.Mesh(new T.CylinderGeometry(.022, .03, 3.2, 16, 1, false), stemMat);
  stem.position.y = -1.62;
  const sepalMat = new T.MeshPhysicalMaterial({ color: 0x3a6fb6, roughness: .08, transmission: .8, thickness: .2, ior: 1.5, attenuationColor: new T.Color(0x0f2f66), attenuationDistance: .25, clearcoat: 1, envMapIntensity: 1.8, side: T.DoubleSide });
  const sepals = new T.Group();
  for (let k = 0; k < 9; k++) {
    const g = petalGeometry({ len: .3 + r() * .1, width: .09, cup: .6, curl: -.3, point: 1.2, twist: (r() - .5) * .4, ao: 1 });
    const m = new T.Mesh(g, sepalMat);
    const piv = new T.Group(), tl = new T.Group();
    piv.rotation.y = k / 9 * Math.PI * 2 + r() * .3;
    tl.position.set(0, -.02, .05); tl.rotation.x = (128 + r() * 18) * Math.PI / 180;
    piv.add(tl); tl.add(m); sepals.add(piv);
  }

  // a gilded heart for the species that has one
  if (spec.heart) {
    const gold = new T.Mesh(new T.SphereGeometry(.07, 32, 16), new T.MeshPhysicalMaterial({ color: 0xe7b864, metalness: 1, roughness: .18, clearcoat: 1, envMapIntensity: 1.6 }));
    gold.position.y = .03; head.add(gold);
  }

  const flower = new T.Group();
  flower.add(head, stem);
  if (!spec.noSepals) flower.add(sepals);
  stem.scale.set(spec.stemW ?? 1, 1, spec.stemW ?? 1);

  // bloom: 0 = tight bud, 1 = fully open; outer petals start first, the centre opens last
  function bloom(t) {
    for (const p of petals) {
      const k = easeInOut((t - p.delay) / (1 - p.delay * .9));
      p.tilt.rotation.x = lerp(p.closed, p.open, k);
    }
    const g = smooth(t);
    head.scale.setScalar(lerp(.72, 1, g));
  }
  bloom(0);
  return { flower, head, bloom };
}

/* the reflections are what make it read as glass: a dark blue-grey room (so the petals pick up deep
   navy in their shadows) with a few long soft boxes for the bright streaks */
export function studio(renderer, o = {}) {
  const sc = new T.Scene();
  const room = new T.Mesh(new T.SphereGeometry(10, 32, 16), new T.MeshBasicMaterial({ color: o.room ?? 0x26354f, side: T.BackSide }));
  sc.add(room);
  const box = (w, h, x, y, z, k, col = 0xffffff) => {
    const m = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshBasicMaterial({ color: new T.Color(col).multiplyScalar(k), side: T.DoubleSide }));
    m.position.set(x, y, z); m.lookAt(0, 0, 0); sc.add(m);
  };
  box(7, 2, -2, 6, 3, o.k1 ?? 10);            // big overhead strip, front-left
  box(1.6, 7, -7, 1, 3, o.k2 ?? 7);          // tall left strip
  box(1.6, 7, 7, .5, -1, 3.2, 0xdfe9ff); // cool rim from the right/back
  box(4, .8, 2, -5, 4, .9, 0x9fb8e0);  // low bounce
  box(2.5, 2.5, 0, 2, -8, 1.2, 0xffe4bf); // warm back light
  if (o.strips !== false) {             // thin strips: the long streaks that run down glass petals
    const k = o.stripK ?? 2.2;
    box(.25, 8, -3.5, 1, 6.5, 9 * k); box(.25, 8, 4.5, 1, 6, 6 * k); box(8, .22, 0, 4.5, 6, 6 * k); box(.3, 7, 1.5, 0, -7.5, 5 * k, 0xcfe0ff);
    box(.18, 6, -6, 2, -4, 7 * k); box(6, .18, -1, -3, 6.5, 4 * k); box(.2, 5, 6.5, 3, 3, 8 * k);
  }
  const pm = new T.PMREMGenerator(renderer);
  const env = pm.fromScene(sc, .02).texture;
  pm.dispose();
  return env;
}

/* one warm key light from the upper left with soft shadows: the petals shading each other is most of
   what turns the head from plaster into a stack of glass. */
export function keyLight(scene, target, { intensity = 2.6, size = 2048 } = {}) {
  const k = new T.DirectionalLight(0xfff1df, intensity);
  k.position.set(-2.2, 3.2, 2.4);
  k.target = target;
  k.castShadow = true;
  k.shadow.mapSize.set(size, size);
  Object.assign(k.shadow.camera, { left: -1.2, right: 1.2, top: 1.2, bottom: -1.2, near: .5, far: 9 });
  k.shadow.bias = -.0004; k.shadow.normalBias = .01; k.shadow.radius = 4;
  scene.add(k, target);
  return k;
}

export { T };
