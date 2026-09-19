var d={glassEnabled:!0,speed:1,radius:.72,contourDeform:0,bandDensity:2,chromaticShift:.42,metalScale:.77,metalStretch:.23,metalAngle:65,metalOffset:0,metalPhase:0,metalEvolution:1,metalRoughness:.22,metalDepth:.25,particleDensity:.72,ribbonCount:5,ribbonWidth:.42,ribbonTwist:1.25,ribbonFold:.55,ribbonBreath:.3,particleSize:1.2,particleBloom:.7,zoom:.3,warp:3,ridgeAmt:.5,sharp:2.2,shade:.3,sheen:.36,gloss:.28,glassOpacity:.42,shellMidAlpha:.2,shellEdgeAlpha:.22,exposure:1,edgeSoftness:.005,edgeGlow:0,colorA:"#F7FBFF",colorB:"#D6E8F7",colorC:"#A8C8F0",colorD:"#6F9EE8",highlightColor:"#FFFFFF",shellInner:"#FFFFFF",shellMid:"#D6E8F7",shellEdge:"#6F9EE8",sheenColor:"#EAF4FF",specColor:"#DCEAFF",canvasColor:"#000000",glowColor:"#6F9EE8"},_={siri:{...d,speed:.82,zoom:.36,warp:3.2,ridgeAmt:.5,sharp:2.2,shade:.12,sheen:.28,gloss:.24,glassOpacity:.44,shellMidAlpha:.18,shellEdgeAlpha:.18,exposure:2,colorA:"#FFD86B",colorB:"#82F4FF",colorC:"#FF7BD5",colorD:"#8E6CFF",shellMid:"#9BF4FF",shellEdge:"#C5A9FF",canvasColor:"#030409",glowColor:"#956CFF"},voiceWave:{...d,speed:.95,radius:.7,contourDeform:.1,zoom:.36,warp:2.6,ridgeAmt:.46,shade:.08,sheen:.22,gloss:.36,glassOpacity:.48,shellMidAlpha:.18,shellEdgeAlpha:.2,exposure:1.35,colorA:"#09030E",colorB:"#CE2CCB",colorC:"#FF5C71",colorD:"#7B53FF",highlightColor:"#FFD9F0",shellMid:"#E48BFF",shellEdge:"#FF7890",sheenColor:"#FFF1FA",specColor:"#E7D9FF",canvasColor:"#020105",glowColor:"#CE2CCB"},aurora:{...d,speed:3,contourDeform:.08,zoom:.4,warp:4.2,ridgeAmt:.62,sharp:2.1,shade:.18,exposure:1.18,colorA:"#030816",colorB:"#20F0B6",colorC:"#32A8FF",colorD:"#A34BFF",shellMid:"#32A8FF",shellEdge:"#20F0B6",canvasColor:"#010207",glowColor:"#20F0B6"},plasma:{...d,speed:1.32,contourDeform:.05,zoom:.55,warp:5.4,ridgeAmt:.78,sharp:4.2,shade:.16,exposure:1.25,colorA:"#06020E",colorB:"#0099FF",colorC:"#258BFF",colorD:"#1375FF",shellInner:"#FFFFFF",shellMid:"#1951C2",shellEdge:"#00E9FF",sheenColor:"#EAF4FF",specColor:"#DCEAFF",canvasColor:"#020105",glowColor:"#0099FF"},chrome:{...d,speed:2,zoom:.36,warp:3.8,ridgeAmt:.44,sharp:5.2,shade:.58,exposure:1.08,colorA:"#FFFFFF",colorB:"#B9C0CA",colorC:"#343A43",colorD:"#030405",shellMid:"#B9C0CA",shellEdge:"#FFFFFF",canvasColor:"#050608",glowColor:"#FFFFFF"},opal:{...d,speed:1.5,zoom:.3,warp:2.8,ridgeAmt:.36,sharp:2,shade:.1,sheen:.3,gloss:.26,glassOpacity:.38,shellMidAlpha:.2,shellEdgeAlpha:.2,exposure:1.12,colorA:"#FFF6E8",colorB:"#6EF2CF",colorC:"#FF91D8",colorD:"#756BFF",shellMid:"#CDE5FF",shellEdge:"#D9C8FF",canvasColor:"#07080D",glowColor:"#9E8CFF"},spectrum:{...d,speed:1.8,contourDeform:.03,zoom:.46,warp:4.4,ridgeAmt:.72,shade:.06,sheen:.26,gloss:.24,glassOpacity:.4,shellMidAlpha:.18,shellEdgeAlpha:.18,exposure:1.5,colorA:"#FFFFFF",colorB:"#1677FF",colorC:"#F249A0",colorD:"#35E6B2",shellMid:"#66E8FF",shellEdge:"#D26CFF",canvasColor:"#03040A",glowColor:"#1677FF"},frost:{...d,speed:2.22,contourDeform:.04,zoom:.36,warp:3.7,ridgeAmt:.45,sharp:2.05,shade:.3,sheen:.34,gloss:.28,glassOpacity:.42,shellMidAlpha:.2,shellEdgeAlpha:.22,exposure:1,colorA:"#F7FBFF",colorB:"#D6E8F7",colorC:"#A8C8F0",colorD:"#6F9EE8",shellMid:"#D6E8F7",shellEdge:"#6F9EE8",canvasColor:"#000000",glowColor:"#6F9EE8"},blueDrop:{...d,speed:.9,radius:.74,contourDeform:.08,zoom:.48,warp:2.65,ridgeAmt:.42,sharp:2.4,shade:.16,sheen:.22,gloss:.42,glassOpacity:.66,shellMidAlpha:.32,shellEdgeAlpha:.24,exposure:1.24,colorA:"#020B1D",colorB:"#0756B8",colorC:"#1EC8FF",colorD:"#DDFBFF",highlightColor:"#EAFBFF",shellInner:"#F6FDFF",shellMid:"#4FD7FF",shellEdge:"#466DFF",sheenColor:"#DDFBFF",specColor:"#A8D9FF",canvasColor:"#010207",glowColor:"#168DFF"},violetEmber:{...d,speed:1.12,radius:.72,contourDeform:.04,zoom:.58,warp:4.7,ridgeAmt:.73,sharp:3.3,shade:.18,sheen:.2,gloss:.34,glassOpacity:.62,shellMidAlpha:.28,shellEdgeAlpha:.24,exposure:1.28,colorA:"#100016",colorB:"#4A0E8F",colorC:"#A52EFF",colorD:"#F1A7FF",highlightColor:"#FFD6FF",shellInner:"#FCF5FF",shellMid:"#C257FF",shellEdge:"#6C2DFF",sheenColor:"#F8E6FF",specColor:"#D4B7FF",canvasColor:"#030006",glowColor:"#A52EFF"},refractiveBlob:{...d,speed:.76,radius:.73,contourDeform:.16,zoom:.46,warp:3.65,ridgeAmt:.58,sharp:2.7,shade:.14,sheen:.14,gloss:.52,glassOpacity:.82,shellMidAlpha:.42,shellEdgeAlpha:.2,exposure:1.2,colorA:"#1B102B",colorB:"#7056A8",colorC:"#BFA5F5",colorD:"#F1E8FF",highlightColor:"#FFFFFF",shellInner:"#F6F0FF",shellMid:"#D9C7FF",shellEdge:"#B59AE8",sheenColor:"#FFFFFF",specColor:"#E9DEFF",canvasColor:"#050208",glowColor:"#B18CFF"},particleRibbon:{...d,glassEnabled:!0,speed:.72,radius:.66,particleDensity:1,ribbonCount:4,ribbonWidth:.48,ribbonTwist:1.15,ribbonFold:.6,ribbonBreath:.38,particleSize:1.12,particleBloom:1.22,shade:.12,sheen:.28,gloss:.24,glassOpacity:.44,shellMidAlpha:.18,shellEdgeAlpha:.18,exposure:1.48,colorA:"#63F1FF",colorB:"#4A9DFF",colorC:"#8566FF",colorD:"#F15DE1",highlightColor:"#F5FBFF",shellInner:"#FFFFFF",shellMid:"#9BF4FF",shellEdge:"#C5A9FF",sheenColor:"#EAF4FF",specColor:"#DCEAFF",canvasColor:"#010208",glowColor:"#765CFF"},chromaticMetal:{...d,speed:1.12,radius:.72,bandDensity:2,chromaticShift:.42,metalScale:.77,metalStretch:.23,metalAngle:65,metalOffset:0,metalPhase:0,metalEvolution:1,metalRoughness:.16,metalDepth:.38,shade:.1,sheen:.14,gloss:.46,glassOpacity:.54,shellMidAlpha:.2,shellEdgeAlpha:.16,exposure:1.08,colorA:"#FBFCFB",colorB:"#7F8683",colorC:"#D6DAD8",colorD:"#33373A",highlightColor:"#FFFFFF",shellInner:"#F7FCFF",shellMid:"#6EDCFF",shellEdge:"#FF806D",sheenColor:"#F7FCFF",specColor:"#D9F3FF",canvasColor:"#050606",glowColor:"#BDEFFF"}},U=["siri","voiceWave","particleRibbon","blueDrop","violetEmber","refractiveBlob","chromaticMetal","aurora","frost","chrome","opal","spectrum","plasma"],w={siri:9,voiceWave:19,aurora:10,plasma:11,chrome:12,opal:13,spectrum:14,frost:15,blueDrop:20,violetEmber:21,refractiveBlob:23,particleRibbon:24,chromaticMetal:22},Se={style:"siri",..._.siri},Je={...Se};for(let e of U)if(!Number.isInteger(w[e]))throw new Error(`\u9884\u8BBE\u7F3A\u5C11\u6D41\u573A\u6620\u5C04\uFF1A${e}`);var se=["speed","contourDeform","bandDensity","chromaticShift","metalStretch","metalEvolution","metalRoughness","metalDepth","ribbonWidth","ribbonTwist","ribbonFold","ribbonBreath","zoom","warp","ridgeAmt","sharp","shade","exposure","edgeGlow"],K=["colorA","colorB","colorC","colorD","highlightColor","glowColor"],W=[...se,...K];var Ee=.22,qe=.65,De={siri:{numeric:{speed:{scale:.3},contourDeform:{scale:.3},zoom:{scale:.94},warp:{scale:.52},ridgeAmt:{scale:.48},sharp:{scale:.9},exposure:{scale:.68}},colors:{colorA:"#B5A674",colorB:"#5E8794",colorC:"#9A648A",colorD:"#635B8A",highlightColor:"#B6C4D2",glowColor:"#6C688F"}},voiceWave:{numeric:{speed:{scale:.28},contourDeform:{scale:.3},zoom:{scale:.92},warp:{scale:.46},ridgeAmt:{scale:.42},exposure:{scale:.62}},colors:{colorA:"#08050B",colorB:"#6A2F69",colorC:"#8C4652",colorD:"#55467F",highlightColor:"#B58AA5",glowColor:"#6C3E72"}},blueDrop:{numeric:{speed:{scale:.3},contourDeform:{scale:.35},zoom:{scale:.93},warp:{scale:.5},ridgeAmt:{scale:.46},sharp:{scale:.82},exposure:{scale:.66}},colors:{colorA:"#020812",colorB:"#0A2C5A",colorC:"#24678A",colorD:"#A4C3CA",highlightColor:"#9FC8D5",glowColor:"#1F5076"}},violetEmber:{numeric:{speed:{scale:.28},contourDeform:{scale:.3},zoom:{scale:.92},warp:{scale:.46},ridgeAmt:{scale:.42},sharp:{scale:.78},exposure:{scale:.64}},colors:{colorA:"#0B0310",colorB:"#2B1748",colorC:"#593078",colorD:"#9B78A8",highlightColor:"#BCA6C2",glowColor:"#593273"}},refractiveBlob:{numeric:{speed:{scale:.3},contourDeform:{scale:.32},zoom:{scale:.94},warp:{scale:.5},ridgeAmt:{scale:.44},sharp:{scale:.82},exposure:{scale:.68}},colors:{colorA:"#0F0B16",colorB:"#403552",colorC:"#776990",colorD:"#AEA4BD",highlightColor:"#C9C4D1",glowColor:"#6E6185"}},particleRibbon:{numeric:{speed:{scale:.28},ribbonWidth:{scale:.62},ribbonTwist:{scale:.42},ribbonFold:{scale:.35},ribbonBreath:{scale:.18},exposure:{scale:.68}},colors:{colorA:"#3A6068",colorB:"#375D78",colorC:"#594E83",colorD:"#854C7A",highlightColor:"#B9CCD1",glowColor:"#514C78"}},chromaticMetal:{numeric:{speed:{scale:.3},bandDensity:{scale:.62},chromaticShift:{scale:.35},metalStretch:{scale:.48},metalEvolution:{scale:.32},metalRoughness:{scale:1.35},metalDepth:{scale:.55},exposure:{scale:.72}},colors:{colorA:"#B8BCBA",colorB:"#666B69",colorC:"#9EA3A1",colorD:"#282B2D",highlightColor:"#D1D5D3",glowColor:"#78898F"}},aurora:{numeric:{speed:{scale:.22},contourDeform:{scale:.3},zoom:{scale:.92},warp:{scale:.42},ridgeAmt:{scale:.38},sharp:{scale:.85},exposure:{scale:.62}},colors:{colorA:"#02050C",colorB:"#1D6659",colorC:"#285D78",colorD:"#533E75",highlightColor:"#92B6B3",glowColor:"#286A62"}},frost:{numeric:{speed:{scale:.26},contourDeform:{scale:.28},zoom:{scale:.94},warp:{scale:.5},ridgeAmt:{scale:.46},sharp:{scale:.78},exposure:{scale:.72}},colors:{colorA:"#C3CDD5",colorB:"#9AABB8",colorC:"#768D9E",colorD:"#536985",highlightColor:"#D6DEE5",glowColor:"#697D91"}},chrome:{numeric:{speed:{scale:.28},contourDeform:{scale:.35},zoom:{scale:.92},warp:{scale:.48},sharp:{scale:.74},exposure:{scale:.72}},colors:{colorA:"#A7AAA9",colorB:"#6E7273",colorC:"#363A3D",colorD:"#101213",highlightColor:"#CBCFCE",glowColor:"#747A7B"}},opal:{numeric:{speed:{scale:.3},contourDeform:{scale:.32},zoom:{scale:.94},warp:{scale:.52},ridgeAmt:{scale:.48},exposure:{scale:.68}},colors:{colorA:"#C9C3BC",colorB:"#6E9E91",colorC:"#A17496",colorD:"#68608E",highlightColor:"#E1DCD5",glowColor:"#82799B"}},spectrum:{numeric:{speed:{scale:.27},contourDeform:{scale:.3},zoom:{scale:.92},warp:{scale:.44},ridgeAmt:{scale:.38},exposure:{scale:.62}},colors:{colorA:"#B4BBC2",colorB:"#285D8F",colorC:"#91506F",colorD:"#3F8873",highlightColor:"#D8DDE1",glowColor:"#386789"}},plasma:{numeric:{speed:{scale:.26},contourDeform:{scale:.28},zoom:{scale:.9},warp:{scale:.42},ridgeAmt:{scale:.36},sharp:{scale:.68},exposure:{scale:.6}},colors:{colorA:"#04020A",colorB:"#084772",colorC:"#1C5790",colorD:"#174B84",highlightColor:"#A5BBD0",glowColor:"#14577F"}}},Pe=new Set(W);function Be(e){return Pe.has(e)}function le(e){let o=Object.fromEntries(W.map(a=>[a,e[a]])),r={...e};for(let a of W)delete r[a];return{shared:r,profile:o}}function Re(e){let o={...e},r=De[e.style];for(let[a,t]of Object.entries(r.numeric))o[a]=e[a]*t.scale+(t.offset??0);for(let a of K)o[a]=r.colors[a];return o}function Oe(e,o=qe,r=Ee){if(!Number.isFinite(o)||o<0)throw new RangeError(`Invalid orb transition duration: ${o}`);if(!Number.isFinite(r)||r<0)throw new RangeError(`Invalid orb activation duration: ${r}`);let a=le(e),t=le(Re(e));return{activationDuration:r,shared:a.shared,profiles:{idle:t.profile,thinking:a.profile},transitionDuration:o}}function V(e){return Oe({style:e,..._[e]})}function ie(e,o){return{...e.shared,...e.profiles[o]}}function T(e,o,r,a){return Be(r)?{...e,profiles:{...e.profiles,[o]:{...e.profiles[o],[r]:a}}}:{...e,shared:{...e.shared,[r]:a}}}function ae(e){if(!/^#[0-9a-f]{6}$/i.test(e))throw new Error(`Invalid orb color: ${e}`);return[Number.parseInt(e.slice(1,3),16)/255,Number.parseInt(e.slice(3,5),16)/255,Number.parseInt(e.slice(5,7),16)/255]}function H(e){return e<=.04045?e/12.92:((e+.055)/1.055)**2.4}function ke(e){return e<=.0031308?e*12.92:1.055*e**(1/2.4)-.055}function Te(e,o,r){if(r===0)return e;if(r===1)return o;let a=ae(e),t=ae(o);return`#${a.map((i,s)=>{let n=H(i)+(H(t[s])-H(i))*r;return Math.min(255,Math.max(0,Math.round(ke(n)*255)))}).map(i=>i.toString(16).padStart(2,"0")).join("")}`.toUpperCase()}function Me(e){let o=Math.min(1,Math.max(0,e));return o*o*(3-2*o)}function ze(e){return 1-(1-Math.min(1,Math.max(0,e)))**3}function Le(e,o,r){let a=Math.min(1,Math.max(0,r));if(a===0)return{...e};if(a===1)return{...o};let t={...o};for(let l of se)t[l]=e[l]+(o[l]-e[l])*a;for(let l of K)t[l]=Te(e[l],o[l],a);return t}function ne(e){let o=e.state,r={...e.params},a={...e.params},t=e.state,l=0,i=0;function s(n){if(i===0)return{...a};let u=Math.max(0,n-l)/i,f=t==="thinking"?ze(u):Me(u);return Le(r,a,f)}return{sample(n,c){return n.state!==o?(r=s(c),a={...n.params},t=n.state,l=c,i=Math.max(0,(n.state==="thinking"?n.activationDuration:n.transitionDuration)*1e3),o=n.state):a={...n.params},s(c)}}}var ce=136,ue=40,rt=ue+40,Ge=["#F7FBFF","#EFF6FD","#E0EEF9","#D4E6F7","#BBD5F3","#A6C7F0","#87B0EB","#6F9EE8","#6F9EE8","#6F9EE8","#6F9EE8","#6F9EE8"];function Ne(e){let o=e.slice(1);return[Number.parseInt(o.slice(0,2),16)/255,Number.parseInt(o.slice(2,4),16)/255,Number.parseInt(o.slice(4,6),16)/255,1]}function pe(e,o,r,a,t){e.fill(0),e[0]=o,e[1]=r,e[2]=a,e.set([t.speed,t.radius,t.zoom,t.warp,t.ridgeAmt,t.sharp,t.shade,t.sheen,t.gloss,t.shellMidAlpha,t.shellEdgeAlpha,t.exposure,w[t.style],t.edgeSoftness,t.edgeGlow,0,t.glassEnabled?1:0,t.glassOpacity,t.contourDeform,t.bandDensity,t.chromaticShift,t.metalScale,t.metalStretch,t.metalAngle,t.metalOffset,t.metalPhase,t.metalEvolution,t.metalRoughness,t.metalDepth,t.particleDensity,t.ribbonCount,t.ribbonWidth,t.ribbonTwist,t.ribbonFold,t.ribbonBreath,t.particleSize,t.particleBloom],3),[t.colorA,t.colorB,t.colorC,t.colorD,t.highlightColor,t.shellInner,t.shellMid,t.shellEdge,t.sheenColor,t.specColor,t.canvasColor,t.glowColor,...Ge].forEach((i,s)=>e.set(Ne(i),ue+s*4))}var de=`// Glass Liquid \u2014 curated flow programs with an optional glass shell.
//
// The local presets use independent spatial models for Siri-like sheets,
// symmetric colour waves, aurora curtains, frost flow, neural interference,
// liquid chrome, opal interference, a voice membrane, a blue liquid drop, and
// a violet molten core, plus a chromatic brushed-metal field. The legacy liquid
// bank remains below for compatibility with older shared shader
// code, but is not exposed as an editor preset.
//
// When enabled, the shell uses a signed-distance refraction profile around the
// boundary, asymmetric spectral separation, and two directional edge lights.
// The fluid is resampled through that profile, so glass changes the image rather
// than covering it with a translucent white face.
//
// ---------------------------------------------------------------------------
// Analytic optical diffusion without a convolution.
// ---------------------------------------------------------------------------
//
// The source used a thirteen-tap 5px frost blur. This port keeps one fluid
// evaluation and applies the equivalent gaussian in the frequency domain:
//
//  1. **Per-octave attenuation, inside \`lqFbm\`.** Convolving with a gaussian of
//     sigma \u03C3 scales a component at wavenumber k by exp(-k\xB2\u03C3\xB2/2). An fbm's
//     octaves have known wavenumbers \u2014 octave i sits at 2.03^i times the base \u2014
//     so each octave's amplitude is scaled by its own factor and the field is
//     sampled once. The mean is untouched (a blur preserves it), so only the
//     deviation from 0.5 is scaled and the \`s / m\` normaliser is unchanged.
//     Every caller passes the diffusion sigma in its own input units, so detail
//     attenuation continues to track \`zoom\`.
//
//  2. **Value-space quadrature at every pointwise nonlinearity.** This is the
//     part that is easy to get wrong. \`blur(ridge(f))\` is not \`ridge(blur(f))\`:
//     attenuating first and ridging after leaves filaments thin and hard where
//     the blur should have spread them, which is exactly how the earlier
//     analytic-edge version failed. So \`lqFbm\` also returns the standard
//     deviation of the detail the attenuation removed \u2014 within a gaussian
//     window an octave scaled by \u03B2 contributes variance \u221D (1 - \u03B2\xB2), NOT
//     (1 - \u03B2)\xB2 \u2014 and every nonlinearity applied to that field integrates it
//     back out with a three-point Gauss-Hermite rule (exact through the fourth
//     moment). Three evaluations of a function of one float, not three
//     evaluations of the noise. \`lqRidgeS\`/\`lqStepS\`/\`lqPowS\` below; Nectar's
//     branch has the fbm inside a \`sin\`, where the same integral is closed-form
//     (E[sin(A + c\u03B5)] = sin A \xB7 exp(-c\xB2\u03C3\xB2/2)), so it damps the sine instead.
//
//  3. **One continuous disc edge.** The fluid always reaches the sphere
//     boundary. Glass changes its sample coordinates near that boundary, so
//     toggling the shell cannot reveal a second hard-clipped silhouette.
//
// Deliberately NOT ported, and why:
//   - The liquid grain. It sits below display-pixel scale and adds noise rather
//     than useful optical detail, so Glass Liquid has no Grain parameter.
//   - The two contact-shadow ellipses under the ball and its outer
//     \`0 26px 50px -24px\` drop shadow. The Orbs family cut the source app's
//     floor at the user's request, and the export paints over \`Color.black\`.
//
// Scalar controls are packed after \`time\`; the colour bank starts on the next
// 16-byte boundary. The TypeScript writer mirrors this order exactly.
struct Uniforms {
  size:           vec2<f32>,
  time:           f32,
  speed:          f32,
  radius:         f32,
  zoom:           f32,
  warp:           f32,
  ridgeAmt:       f32,
  sharp:          f32,
  shade:          f32,
  sheen:          f32,
  gloss:          f32,
  shellMidAlpha:  f32,
  shellEdgeAlpha: f32,
  exposure:       f32,
  style:          f32,
  edgeSoftness:   f32,
  edgeGlow:       f32,
  paletteCount:   f32,
  glassEnabled:   f32,
  glassOpacity:   f32,
  contourDeform:  f32,
  bandDensity:    f32,
  chromaticShift: f32,
  metalScale:     f32,
  metalStretch:   f32,
  metalAngle:     f32,
  metalOffset:    f32,
  metalPhase:     f32,
  metalEvolution: f32,
  metalRoughness: f32,
  metalDepth:     f32,
  particleDensity: f32,
  ribbonCount:     f32,
  ribbonWidth:     f32,
  ribbonTwist:     f32,
  ribbonFold:      f32,
  ribbonBreath:    f32,
  particleSize:    f32,
  particleBloom:   f32,
  colorA:         vec4<f32>,
  colorB:         vec4<f32>,
  colorC:         vec4<f32>,
  colorD:         vec4<f32>,
  highlightColor: vec4<f32>,
  shellInner:     vec4<f32>,
  shellMid:       vec4<f32>,
  shellEdge:      vec4<f32>,
  sheenColor:     vec4<f32>,
  specColor:      vec4<f32>,
  canvasColor:    vec4<f32>,
  glowColor:      vec4<f32>,
  paletteStop0:    vec4<f32>,
  paletteStop1:    vec4<f32>,
  paletteStop2:    vec4<f32>,
  paletteStop3:    vec4<f32>,
  paletteStop4:    vec4<f32>,
  paletteStop5:    vec4<f32>,
  paletteStop6:    vec4<f32>,
  paletteStop7:    vec4<f32>,
  paletteStop8:    vec4<f32>,
  paletteStop9:    vec4<f32>,
  paletteStop10:   vec4<f32>,
  paletteStop11:   vec4<f32>,
};
@group(0) @binding(0) var<uniform> u: Uniforms;

// \u2500\u2500 The Orbs edge bank (WGSL) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// Two knobs every orb on the shelf carries: how soft its limb is, and how far
// it glows past it. See effects/_shared/edge.ts for the contract.
//
// THREE files must agree \u2014 edge.wgsl, edge.metal, edge.sksl. Change one, change
// all three, or the Code tab starts lying about what it ships.

// How much wider than the shipped feather the Edge softness slider is asking
// for. 0.005 is the width every orb was authored with, so this returns exactly
// 0 at the default and every edge expression collapses to the constant it
// replaced \u2014 the defaults are bit-identical to the render before the bank.
fn mfEdgeD(soft: f32) -> f32 {
  return soft - 0.005;
}

// The halo an orb throws past its own limb.
//
// ADDED, never subtracted: whatever the orb already paints out there \u2014 a
// studio wall, its own exp() bleed, the sheet's cones \u2014 survives untouched.
// That is what lets this be adopted by seventeen shaders whose backdrops have
// nothing in common.
//
// \`glow == 0\` returns \`col\` by an early exit rather than by adding zero. Both
// are exact, but the exit also skips the length() on the ~60% of the frame
// outside the ball, and 0 is the default.
fn mfEdgeGlow(col: vec3<f32>, uv: vec2<f32>, ctr: vec2<f32>, rad: f32,
              soft: f32, glow: f32, glowRGB: vec3<f32>) -> vec3<f32> {
  if (glow <= 0.0) { return col; }
  let r = length(uv - ctr);
  // Fenced to the outside of the limb by the same softness the limb uses, so
  // the halo starts where the ball stops however soft that boundary is. Without
  // it the exp() is 1 across the whole disc and washes the face flat.
  let outside = smoothstep(rad - max(soft, 0.0005), rad + max(soft, 0.0005), r);
  return col + glowRGB * (glow * exp(-max(r - rad, 0.0) * 11.0) * outside);
}


// \u2500\u2500 The Orbs palette-ramp bank (WGSL) \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
// The add/remove colour list, evaluated INSIDE the shader so every stop paints
// its own region of the ball instead of being averaged into a role colour.
// See effects/_shared/ramp.ts for the contract.
//
// THREE files must agree \u2014 ramp.wgsl, ramp.metal, ramp.sksl. Change one, change
// all three, or the Code tab starts lying about what it ships.

// One stop, picked without a dynamic array index.
//
// A \`var\` array indexed by a runtime value is the shape that spills to scratch
// memory on the GPUs this project cares about (PERFORMANCE.md); twelve selects
// stay in registers and are branchless on every backend. Written once here so
// no adopting shader has to.
fn mfRampPick(idx: f32,
              s0: vec3<f32>, s1: vec3<f32>, s2:  vec3<f32>, s3:  vec3<f32>,
              s4: vec3<f32>, s5: vec3<f32>, s6:  vec3<f32>, s7:  vec3<f32>,
              s8: vec3<f32>, s9: vec3<f32>, s10: vec3<f32>, s11: vec3<f32>) -> vec3<f32> {
  var r = s0;
  r = select(r, s1,  idx == 1.0);
  r = select(r, s2,  idx == 2.0);
  r = select(r, s3,  idx == 3.0);
  r = select(r, s4,  idx == 4.0);
  r = select(r, s5,  idx == 5.0);
  r = select(r, s6,  idx == 6.0);
  r = select(r, s7,  idx == 7.0);
  r = select(r, s8,  idx == 8.0);
  r = select(r, s9,  idx == 9.0);
  r = select(r, s10, idx == 10.0);
  r = select(r, s11, idx == 11.0);
  return r;
}

// The CYCLIC ramp: \`t\` wraps, and the last stop runs back into the first.
//
// This is the one a generated-colour orb wants. Prism's hue comes from a cosine
// of an unbounded scalar field, so its colour has always been periodic \u2014 a
// clamped ramp would flatten every band past t == 1 into one colour and throw
// the banding away. Wrapping keeps the field's structure exactly and only swaps
// what the structure is *coloured* with.
//
// NOT ONE BRANCH IN HERE, and that is load-bearing rather than tidy. An orb
// evaluates this next to a \`fract(sin(x) * 43758.5453)\` grain hash, which
// amplifies a last-bit change in its argument by ~44000x. Any \`if\` in this file
// or at a call site splits the fragment's basic block, the compiler stops
// folding \`uv / rad\` into its uses, and the hash turns that into speckle up to
// 33/255 \u2014 measured, on exactly the first cut of this bank. Straight-line code
// keeps the untouched render bit-identical. Same reasoning as the early-out
// guards every orb carries; see the note in orb-prism.wgsl.
fn mfRampCyc(tIn: f32, n: f32,
             s0: vec3<f32>, s1: vec3<f32>, s2:  vec3<f32>, s3:  vec3<f32>,
             s4: vec3<f32>, s5: vec3<f32>, s6:  vec3<f32>, s7:  vec3<f32>,
             s8: vec3<f32>, s9: vec3<f32>, s10: vec3<f32>, s11: vec3<f32>) -> vec3<f32> {
  let k  = clamp(floor(n + 0.5), 1.0, 12.0);
  let x  = fract(tIn) * k;
  let i0 = min(floor(x), k - 1.0);
  let i1 = select(i0 + 1.0, 0.0, i0 + 1.0 >= k);   // the wrap
  return mix(mfRampPick(i0, s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11),
             mfRampPick(i1, s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11),
             x - i0);
}

// The CLAMPED ramp: stop 0 at t == 0, the last stop at t == 1, held outside.
//
// This is the one an orb with an authored dark\u2192light body ramp wants \u2014 the
// four-stop Deep/Mid/Surge/Crest shape, where the ends really are ends.
//
// Branchless for the same reason as \`mfRampCyc\`. The single-stop case falls out
// of the arithmetic rather than needing an early return: k == 1 makes the span
// zero, so x is 0, i0 is 0 and the mix weight is 0 \u2014 s0, exactly.
fn mfRampLin(tIn: f32, n: f32,
             s0: vec3<f32>, s1: vec3<f32>, s2:  vec3<f32>, s3:  vec3<f32>,
             s4: vec3<f32>, s5: vec3<f32>, s6:  vec3<f32>, s7:  vec3<f32>,
             s8: vec3<f32>, s9: vec3<f32>, s10: vec3<f32>, s11: vec3<f32>) -> vec3<f32> {
  let k  = clamp(floor(n + 0.5), 1.0, 12.0);
  let x  = clamp(tIn, 0.0, 1.0) * (k - 1.0);
  let i0 = clamp(floor(x), 0.0, max(k - 2.0, 0.0));
  return mix(mfRampPick(i0,     s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11),
             mfRampPick(i0 + 1.0, s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11),
             x - i0);
}

// \u2500\u2500 The ramp as ONE value \u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500
//
// Thirteen uniforms is a reasonable thing for a shader to hold and a terrible
// thing for a helper to take. Several orbs make their body colour deep inside
// one \u2014 Glass\xB7Liquid's fluid, the studio orbs' environment mirrors \u2014 and in the
// MSL these files are transcribed against, a helper cannot read the stitchable
// entry point's arguments, so the palette has to be handed down. Bundled like
// this that is one parameter instead of thirteen, and the three languages stay
// line-for-line.
//
// The stops come back out by CONSTANT index only, so this is still not a
// dynamically indexed array and still cannot spill to scratch memory.
struct MfRamp {
  n:   f32,
  s0:  vec3<f32>, s1:  vec3<f32>, s2:  vec3<f32>, s3:  vec3<f32>,
  s4:  vec3<f32>, s5:  vec3<f32>, s6:  vec3<f32>, s7:  vec3<f32>,
  s8:  vec3<f32>, s9:  vec3<f32>, s10: vec3<f32>, s11: vec3<f32>,
};

fn mfRampOf(n: f32,
            s0: vec3<f32>, s1: vec3<f32>, s2:  vec3<f32>, s3:  vec3<f32>,
            s4: vec3<f32>, s5: vec3<f32>, s6:  vec3<f32>, s7:  vec3<f32>,
            s8: vec3<f32>, s9: vec3<f32>, s10: vec3<f32>, s11: vec3<f32>) -> MfRamp {
  return MfRamp(n, s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11);
}

fn mfRampCycR(t: f32, r: MfRamp) -> vec3<f32> {
  return mfRampCyc(t, r.n, r.s0, r.s1, r.s2, r.s3, r.s4, r.s5,
                   r.s6, r.s7, r.s8, r.s9, r.s10, r.s11);
}

fn mfRampLinR(t: f32, r: MfRamp) -> vec3<f32> {
  return mfRampLin(t, r.n, r.s0, r.s1, r.s2, r.s3, r.s4, r.s5,
                   r.s6, r.s7, r.s8, r.s9, r.s10, r.s11);
}


// Fluid geometry, in ball radii (|p| == 1 on the ball's edge, y up).
const GL_FU:   f32 = 0.88172043;   // canvas half-side = 0.82/0.93 R

// Pure fluid keeps tighter diffusion; enabling glass restores the source's 5px
// frosted diffusion inside the inset shell.
const GL_BSIG_CLEAR: f32 = 0.01800000;
const GL_BSIG_GLASS: f32 = 0.03990000;

// --- the three constants the frequency-domain blur is fitted on -------------
// A gaussian's response is exp(-k\xB2\u03C3\xB2/2), so GL_KA is k\xB2/2 for the wavenumber
// where smoothstep-interpolated value noise actually keeps its energy. The
// textbook choice \u2014 one cycle per noise cell, k = 2\u03C0, GL_KA = 19.74 \u2014 blurs too
// hard, because the smoothstep interpolation is itself a low-pass and pulls the
// effective k down to about 3.5. Fitted against the 13-tap render.
const GL_KA:  f32 = 6.0;
// (2.03)\xB2 \u2014 how \u03C3 grows, in its own octave's cells, from one octave to the next.
const GL_KG:  f32 = 4.1209;
// The warp field displaces the fluid rather than colouring it, so blurring the
// image does not attenuate it as strongly as the model says. Also fitted.
const GL_KWA: f32 = 0.5;
// One value-noise octave's standard deviation about its own mean, as a fraction
// of its range \u2014 the scale that turns "amplitude the attenuation removed" into
// "how far the removed detail typically pushed the value".
const GL_KR:  f32 = 0.32;
const GL_GH:  f32 = 1.73205081;   // sqrt(3), the 3-point Gauss-Hermite abscissa

// Pure fluid reaches the ball edge.
const GL_CLEAR_EA: f32 = 0.995;
const GL_CLEAR_EB: f32 = 1.04;

// ---------------------------------------------------------------------------
// The sheet's liquid noise bank. Five octaves, gain .5, normalised by the
// weight sum, and rotated every octave. This is NOT the bank the sheet's Prism
// screen uses (a different hash, gain .55, unnormalised, no rotation).
// ---------------------------------------------------------------------------
fn lqHash(pIn: vec2<f32>) -> f32 {
  var p = fract(pIn * vec2<f32>(123.34, 456.21));
  p = p + vec2<f32>(dot(p, p + vec2<f32>(45.32)));
  return fract(p.x * p.y);
}

fn lqNoise(p: vec2<f32>) -> f32 {
  let i = floor(p);
  var f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(lqHash(i), lqHash(i + vec2<f32>(1.0, 0.0)), f.x),
             mix(lqHash(i + vec2<f32>(0.0, 1.0)), lqHash(i + vec2<f32>(1.0, 1.0)), f.x), f.y);
}

// The fbm, pre-blurred. \`bs\` is the blur's sigma expressed in THIS call's input
// units \u2014 the caller scales it by whatever it scaled the domain by. Returns
// \`.x\` the attenuated value and \`.y\` the standard deviation of the detail the
// attenuation took out, which is what a following nonlinearity has to integrate
// over. Both are exact for a gaussian window: the surviving amplitude is \u03B2 and
// the variance that leaves is (1 - \u03B2\xB2), per octave, weighted by that octave's
// own share of the normalised sum.
fn lqFbm(pIn: vec2<f32>, bs: f32) -> vec2<f32> {
  var p = pIn;
  var s:  f32 = 0.0;
  var a:  f32 = 0.5;
  var m:  f32 = 0.0;
  var vr: f32 = 0.0;
  let e = -GL_KA * bs * bs;
  var g: f32 = 1.0;
  for (var i: i32 = 0; i < 5; i = i + 1) {
    let b = exp(e * g);
    s  = s  + a * (0.5 + b * (lqNoise(p) - 0.5));
    vr = vr + a * a * (1.0 - b * b);
    m  = m + a;
    a  = a * 0.5;
    g  = g * GL_KG;
    // GLSL's mat2(.8,.6,-.6,.8) is COLUMN-major \u2014 columns (.8,.6) and
    // (-.6,.8) \u2014 so the product is written out rather than constructed.
    p = vec2<f32>(0.8 * p.x - 0.6 * p.y, 0.6 * p.x + 0.8 * p.y) * 2.03;
  }
  return vec2<f32>(s / m, GL_KR * sqrt(vr) / m);
}

fn lqRidge(v: f32, k: f32) -> f32 {
  return pow(clamp(1.0 - abs(v * 2.0 - 1.0), 0.0, 1.0), k);
}

// The sheet's four-stop ramp, shared by every branch of every program.
fn lqRamp(v: f32, cA: vec3<f32>, cB: vec3<f32>, cC: vec3<f32>, cD: vec3<f32>) -> vec3<f32> {
  var c = mix(cA, cB, smoothstep(0.0, 0.45, v));
  c = mix(c, cC, smoothstep(0.38, 0.72, v));
  c = mix(c, cD, smoothstep(0.68, 1.0, v));
  // The editor's four colours are the default ramp. An optional custom palette
  // can replace them without changing the scalar field that produces \`v\`.
  return select(c, mfRampLin(v, u.paletteCount,
                             u.paletteStop0.rgb, u.paletteStop1.rgb, u.paletteStop2.rgb,
                             u.paletteStop3.rgb, u.paletteStop4.rgb, u.paletteStop5.rgb,
                             u.paletteStop6.rgb, u.paletteStop7.rgb, u.paletteStop8.rgb,
                             u.paletteStop9.rgb, u.paletteStop10.rgb, u.paletteStop11.rgb), u.paletteCount > 0.5);
}

// ---------------------------------------------------------------------------
// The three nonlinearities the fluid applies to a pre-blurred field, each
// integrated over the detail \`lqFbm\` attenuated away. Three-point
// Gauss-Hermite \u2014 nodes 0 and \xB1sqrt(3)\xB7sd, weights 4/6 and 1/6 \u2014 reproduces a
// gaussian's second AND fourth moments, which is what keeps a ridged filament
// spreading as it dims instead of just dimming. \`vs\` is an \`lqFbm\` result:
// \`.x\` the value, \`.y\` that standard deviation.
// ---------------------------------------------------------------------------
fn lqRidgeS(vs: vec2<f32>, k: f32) -> f32 {
  let d = GL_GH * vs.y;
  return (lqRidge(vs.x - d, k) + 4.0 * lqRidge(vs.x, k) + lqRidge(vs.x + d, k)) / 6.0;
}

fn lqStepS(vs: vec2<f32>, a: f32, b: f32) -> f32 {
  let d = GL_GH * vs.y;
  return (smoothstep(a, b, vs.x - d) + 4.0 * smoothstep(a, b, vs.x)
        + smoothstep(a, b, vs.x + d)) / 6.0;
}

fn lqPowS(vs: vec2<f32>, k: f32) -> f32 {
  let d = GL_GH * vs.y;
  return (pow(clamp(vs.x - d, 0.0, 1.0), k) + 4.0 * pow(clamp(vs.x, 0.0, 1.0), k)
        + pow(clamp(vs.x + d, 0.0, 1.0), k)) / 6.0;
}

// ---------------------------------------------------------------------------
// Curated local flow programs. Each preset owns a different spatial model;
// colour changes are secondary to silhouette, frequency, and motion structure.
// ---------------------------------------------------------------------------

fn glsFinishPresetFluid(colorIn: vec3<f32>, p: vec2<f32>) -> vec3<f32> {
  var color = colorIn;
  color = mix(color, u.highlightColor.rgb,
              u.shade * 0.22 * smoothstep(0.15, 1.15, dot(p, vec2<f32>(-0.32, 0.78))));
  color = color * (1.0 - u.shade * 0.34
                  * smoothstep(-0.1, 1.2, dot(p, vec2<f32>(0.45, -0.62))));
  color = color * (1.0 - u.shade * 0.22 * smoothstep(0.72, 1.08, length(p)));
  return clamp(color, vec3<f32>(0.0), vec3<f32>(1.0));
}

fn glsFinishEmissionFluid(colorIn: vec3<f32>, p: vec2<f32>) -> vec3<f32> {
  var color = colorIn;
  if (u.glassEnabled > 0.5) {
    color = mix(color, u.highlightColor.rgb,
                u.shade * 0.22 * smoothstep(0.15, 1.15, dot(p, vec2<f32>(-0.32, 0.78))));
  }
  color = color * (1.0 - u.shade * 0.34
                  * smoothstep(-0.1, 1.2, dot(p, vec2<f32>(0.45, -0.62))));
  color = color * (1.0 - u.shade * 0.22 * smoothstep(0.72, 1.08, length(p)));
  return clamp(color, vec3<f32>(0.0), vec3<f32>(1.0));
}

fn glsSiriBand(q: vec2<f32>, drift: f32, phaseOffset: f32, amplitude: f32,
               mainY: f32, envelope: f32, softness: f32) -> vec2<f32> {
  let y = amplitude * envelope * sin(q.x * 1.0 + drift + phaseOffset);
  let distanceToLine = abs(q.y - y);
  let line = 0.018 / (sqrt(distanceToLine * distanceToLine + softness * softness) + 0.026);
  let bandDistance = max(0.0, max(q.y - max(mainY, y), min(mainY, y) - q.y));
  let band = 0.018 / (bandDistance + 0.075);
  return vec2<f32>(line, band);
}

fn glsSiriFluid(p: vec2<f32>, t: f32) -> vec3<f32> {
  // The reference wave is a main sinusoid plus four chromatically separated
  // waves. Their enclosed bands carry colour while the shared crest stays hot.
  let scale = 0.74 + u.zoom * 0.34;
  let q = p / scale;
  let xNorm = q.x;
  let envelopeBase = cos(1.57079633 * min(abs(0.9 * xNorm), 1.0));
  let envelope = envelopeBase * envelopeBase;
  let low = 0.5 + 0.5 * cos(t * 0.37);
  let mid = 0.5 + 0.5 * sin(t * 0.51 + 1.2);
  let high = 0.5 + 0.5 * cos(t * 0.73 + 2.1);
  let drift = t * 2.4;
  let mainAmplitude = 0.25 + u.ridgeAmt * 0.075 + low * 0.018;
  let bandAmplitude = mainAmplitude + mid * 0.025 + high * 0.018;
  let mainY = mainAmplitude * envelope * sin(q.x * 1.1 + drift);
  let separation = 1.85 + u.warp * 0.2 + mid * 0.28;
  let softness = 0.035 + (1.0 - u.ridgeAmt) * 0.018 + mid * 0.006;

  let band0 = glsSiriBand(q, drift, -separation, bandAmplitude, mainY, envelope, softness);
  let band1 = glsSiriBand(q, drift, -separation * 0.34, bandAmplitude, mainY, envelope, softness);
  let band2 = glsSiriBand(q, drift, separation * 0.34, bandAmplitude, mainY, envelope, softness);
  let band3 = glsSiriBand(q, drift, separation, bandAmplitude, mainY, envelope, softness);
  let w0 = band0.x + band0.y;
  let w1 = band1.x + band1.y;
  let w2 = band2.x + band2.y;
  let w3 = band3.x + band3.y;
  let total = w0 + w1 + w2 + w3;
  let dominant0 = w0 * w0;
  let dominant1 = w1 * w1;
  let dominant2 = w2 * w2;
  let dominant3 = w3 * w3;
  let dominantTotal = dominant0 + dominant1 + dominant2 + dominant3;
  let spectral = (u.colorA.rgb * dominant0 + u.colorC.rgb * dominant1
                + u.colorB.rgb * dominant2 + u.colorD.rgb * dominant3)
                / max(dominantTotal, 0.0001);
  let energy = (1.0 - exp(-total * 0.58)) * envelope;
  let mainDistance = abs(q.y - mainY);
  let whiteCore = exp(-mainDistance * mainDistance / 0.0028) * envelope;
  let glassFill = select(0.0, 1.0, u.glassEnabled > 0.5);
  let atmosphere = mix(u.colorD.rgb, u.colorB.rgb,
                       smoothstep(-0.7, 0.7, q.y)) * 0.018 * glassFill;
  var color = atmosphere + spectral * energy * 1.14;
  color = color + u.highlightColor.rgb * whiteCore * (0.18 + 0.1 * low);
  let emissionMask = mix(smoothstep(0.08, 0.25, energy + whiteCore * 0.12),
                         1.0, glassFill);
  color = color * emissionMask;
  color = color / (vec3<f32>(1.0) + color * 0.18);
  return glsFinishEmissionFluid(color, p);
}

fn glsSpectrumHeight(q: vec2<f32>, t: f32, frequency: f32,
                     phaseOffset: f32, amplitude: f32) -> f32 {
  let x = q.x * 2.15;
  let envelope = pow(4.0 / (4.0 + x * x), 4.0);
  let breathing = 0.82 + 0.18 * sin(t * 0.48 + phaseOffset * 0.7);
  let wave = abs(sin(frequency * x - t * 1.36 + phaseOffset));
  return envelope * amplitude * breathing * (0.28 + 0.72 * wave);
}

fn glsSpectrumLayer(q: vec2<f32>, height: f32, softness: f32) -> f32 {
  return (1.0 - smoothstep(max(height - softness, 0.0), height + softness, abs(q.y)))
         * smoothstep(0.0, 0.045, height);
}

fn glsSpectrumFluid(p: vec2<f32>, t: f32) -> vec3<f32> {
  // Three symmetric filled wave surfaces orbit a persistent support line. This
  // keeps the iOS 9 voice-field silhouette without depending on canvas strokes.
  let scale = 0.74 + u.zoom * 0.34;
  let q = p / scale;
  let amplitude = 0.26 + u.ridgeAmt * 0.27;
  let frequency = 0.72 + u.warp * 0.095;
  let softness = 0.026 + (1.0 - u.ridgeAmt) * 0.032;
  let h0 = glsSpectrumHeight(q, t, frequency * 0.82, -1.2, amplitude * 0.72);
  let h1 = glsSpectrumHeight(q, t, frequency, 0.45, amplitude);
  let h2 = glsSpectrumHeight(q, t, frequency * 1.17, 2.05, amplitude * 0.82);
  let l0 = glsSpectrumLayer(q, h0, softness);
  let l1 = glsSpectrumLayer(q, h1, softness);
  let l2 = glsSpectrumLayer(q, h2, softness);
  let spectrumX = q.x * 2.15;
  let envelope = pow(4.0 / (4.0 + spectrumX * spectrumX), 4.0);
  let support = exp(-q.y * q.y / 0.00072) * envelope;
  let total = l0 + l1 + l2;
  let spectral = (u.colorB.rgb * l0 + u.colorC.rgb * l1 + u.colorD.rgb * l2)
                 / max(total, 0.001);
  let glassFill = select(0.0, 1.0, u.glassEnabled > 0.5);
  var color = u.colorD.rgb * 0.025 * glassFill
            + spectral * (1.0 - exp(-total * 0.86));
  color = color + u.colorA.rgb * support * 0.58;
  color = color / (vec3<f32>(1.0) + color * 0.2);
  return glsFinishEmissionFluid(color, p);
}

fn glsAuroraLayer(p: vec2<f32>, t: f32, offset: f32) -> f32 {
  let drift = t * 0.18 + offset * 2.5;
  let wave1 = sin(p.x * (2.0 + u.warp * 0.13) + drift + offset * 6.0) * 0.25;
  let wave2 = sin(p.x * 3.7 + drift * 1.3 + offset * 4.0) * 0.12;
  let wave3 = sin(p.x * 7.2 + drift * 0.7 + offset * 8.0) * 0.055;
  let noiseValue = lqFbm(vec2<f32>(p.x * 1.6 + drift * 0.35,
                                   p.y * 0.8 + offset * 3.0), 0.018).x;
  let center = offset * 0.46 + wave1 + wave2 + wave3
               + (noiseValue - 0.5) * 0.28;
  let dist = abs(p.y - center);
  let glow = exp(-dist * dist * (13.0 - 5.0 * u.ridgeAmt));
  let shimmer = lqFbm(vec2<f32>(p.x * 4.0 + t * 0.22,
                                p.y * 7.0 + offset * 5.0), 0.012).x;
  return glow * (0.64 + 0.36 * shimmer);
}

fn glsAuroraFluid(p: vec2<f32>, t: f32) -> vec3<f32> {
  let q = p * (0.82 + u.zoom * 0.58);
  let l0 = glsAuroraLayer(q, t, -0.72);
  let l1 = glsAuroraLayer(q, t, 0.0);
  let l2 = glsAuroraLayer(q, t, 0.72);
  var color = u.colorA.rgb * (0.46 + 0.18 * (q.y + 1.0));
  color = color + u.colorB.rgb * l0 * 1.3;
  color = color + u.colorC.rgb * l1 * 1.15;
  color = color + u.colorD.rgb * l2 * 1.2;
  color = color + mix(u.colorB.rgb, u.colorD.rgb, 0.5) * min(l0 * l2, l1) * 0.65;

  let starUv = (q + vec2<f32>(1.0)) * 18.0;
  let starCell = floor(starUv);
  let starHash = lqHash(starCell);
  let starPoint = exp(-dot(fract(starUv) - vec2<f32>(0.5),
                            fract(starUv) - vec2<f32>(0.5)) * 90.0);
  let stars = step(0.965, starHash) * starPoint
              * (0.55 + 0.45 * sin(t * (1.0 + starHash * 2.0) + starHash * 6.28));
  color = color + u.highlightColor.rgb * stars * (1.0 - clamp(l0 + l1 + l2, 0.0, 1.0));
  color = color / (vec3<f32>(1.0) + color * 0.28);
  return glsFinishPresetFluid(color, p);
}

fn glsRotate(p: vec2<f32>, angle: f32) -> vec2<f32> {
  let c = cos(angle);
  let s = sin(angle);
  return vec2<f32>(c * p.x - s * p.y, s * p.x + c * p.y);
}

fn glsNeuroShape(pIn: vec2<f32>, t: f32) -> f32 {
  var p = pIn * (0.34 + 0.08 * u.zoom);
  var sineAccum = vec2<f32>(0.0);
  var result = vec2<f32>(0.0);
  var scale = 8.0;
  for (var j: i32 = 0; j < 11; j = j + 1) {
    p = glsRotate(p, 1.0);
    sineAccum = glsRotate(sineAccum, 1.0);
    let layer = p * scale + vec2<f32>(f32(j)) + sineAccum - vec2<f32>(t * 0.34);
    sineAccum = sineAccum + sin(layer);
    result = result + (vec2<f32>(0.5) + 0.5 * cos(layer)) / scale;
    scale = scale * 1.16;
  }
  return result.x + result.y;
}

fn glsPlasmaFluid(p: vec2<f32>, t: f32) -> vec3<f32> {
  let shape = glsNeuroShape(p, t);
  let phase = shape * (10.0 + u.warp) + p.x * 1.7 - p.y * 1.3 - t * 0.52;
  let ridgeWidth = 0.62 - 0.24 * u.ridgeAmt;
  let primary = pow(abs(cos(phase)), max(1.3, u.sharp * ridgeWidth));
  let secondary = pow(abs(cos(phase * 0.53 + atan2(p.y, p.x) * 2.0 + t * 0.21)),
                      max(1.6, u.sharp * (ridgeWidth + 0.1)));
  let filaments = max(primary, secondary * 0.64);
  let core = pow(primary, 4.0);
  let polarity = 0.5 + 0.5 * sin(phase * 0.37 + shape * 3.0);
  var color = mix(u.colorA.rgb * 0.42, u.colorD.rgb * 0.48, polarity * 0.46);
  color = mix(color, u.colorB.rgb, filaments * 0.72);
  color = mix(color, u.colorC.rgb, core * 0.68);
  color = color + u.highlightColor.rgb * pow(core, 3.0) * 0.16;
  color = color / (vec3<f32>(1.0) + color * 0.34);
  return glsFinishPresetFluid(color, p);
}

fn glsChromeFluid(p: vec2<f32>, t: f32) -> vec3<f32> {
  var q = p * (1.0 + u.zoom * 0.35);
  let amplitude = 0.028 * u.warp;
  for (var i: i32 = 1; i <= 9; i = i + 1) {
    let fi = f32(i);
    q.x = q.x + amplitude / fi * cos(fi * 2.7 * q.y + t * 0.46);
    q.y = q.y + amplitude / fi * cos(fi * 3.1 * q.x - t * 0.4);
  }
  let denominator = max(abs(sin(t * 0.24 - q.y - q.x)), 0.045);
  let flare = clamp(1.0 / denominator, 0.0, 18.0);
  let metal = smoothstep(1.15, 7.5, flare);
  let fold = 0.5 + 0.5 * cos((q.x - q.y) * (3.2 + u.sharp * 0.28) + t * 0.32);
  let value = clamp(metal * 0.74 + fold * 0.36, 0.0, 1.0);
  var color = lqRamp(value, u.colorD.rgb, u.colorC.rgb, u.colorB.rgb, u.colorA.rgb);
  color = mix(color, u.colorA.rgb, pow(metal, 5.0) * 0.62);
  return glsFinishPresetFluid(color, p);
}

fn glsChromaticMetalPhase(p: vec2<f32>, t: f32) -> f32 {
  let angle = u.metalAngle * 0.01745329252;
  let scale = max(u.metalScale, 0.05);
  let stretch = mix(0.48, 1.58, clamp(u.metalStretch, 0.0, 1.0));
  var q = glsRotate(p / scale, angle);
  q = vec2<f32>(q.x / stretch, q.y * stretch);

  // The reference advances continuously while local reflections evolve out of
  // phase. Travelling domain waves provide that deformation without rotating
  // the entire pattern as one rigid layer. Integer harmonics keep a clean loop.
  let cycle = t * 0.46 + u.metalPhase * 6.28318530718;
  let evolution = clamp(u.metalEvolution, 0.0, 2.0);
  q.x = q.x + sin(q.y * 1.86 - cycle) * 0.095 * evolution;
  q.x = q.x + sin((q.x + q.y) * 1.28 + cycle * 2.0 + 1.4) * 0.045 * evolution;
  q.y = q.y + sin(q.x * 1.52 + cycle + 0.8) * 0.07 * evolution;

  let repeats = max(u.bandDensity, 1.0);
  return q.x * repeats * 2.18
       + sin(q.y * (1.3 + repeats * 0.26) - cycle) * 0.56 * evolution
       + sin((q.x - q.y) * 1.34 + cycle * 2.0 + 1.7) * 0.27 * evolution
       + sin((q.x * 0.72 + q.y) * 2.1 - cycle * 3.0 + 0.35) * 0.11 * evolution
       + sin(cycle) * 0.1
       + sin(cycle * 3.0 + 0.7) * 0.035
       + cycle
       + u.metalOffset * 6.28318530718;
}

fn glsChromaticMetalTone(phase: f32) -> f32 {
  let wave = 0.5 + 0.5 * cos(phase);
  let roughness = clamp(u.metalRoughness, 0.0, 1.0);
  let depth = clamp(u.metalDepth, 0.0, 1.0);
  let edge = 0.025 + roughness * 0.18;
  let broadReflection = smoothstep(0.5 - edge, 0.5 + edge, wave);
  let hardReflection = pow(wave, mix(13.0, 4.0, roughness));
  let blackFold = pow(1.0 - wave, mix(9.0, 3.0, roughness));
  let body = mix(wave, broadReflection, 0.2 + depth * 0.3);
  return clamp(0.018 + body * (0.46 + depth * 0.12)
               + hardReflection * (0.3 + depth * 0.42)
               - blackFold * (0.07 + depth * 0.11), 0.0, 1.0);
}

fn glsChromaticMetalSample(p: vec2<f32>, t: f32) -> vec3<f32> {
  let phase = glsChromaticMetalPhase(p, t);
  let angle = u.metalAngle * 0.01745329252;
  let brushP = glsRotate(p / max(u.metalScale, 0.05), angle);
  let brushed = sin(brushP.y * 146.0 + sin(brushP.x * 11.0) * 0.58)
              + 0.48 * sin(brushP.y * 317.0 - brushP.x * 5.0);
  let brushAmount = 0.004 + clamp(u.metalRoughness, 0.0, 1.0) * 0.014;
  let tone = clamp(glsChromaticMetalTone(phase) + brushed * brushAmount, 0.0, 1.0);
  return lqRamp(tone, u.colorD.rgb, u.colorB.rgb, u.colorC.rgb, u.colorA.rgb);
}

fn glsChromaticMetalFluid(p: vec2<f32>, t: f32) -> vec3<f32> {
  let angle = u.metalAngle * 0.01745329252;
  let splitDirection = glsRotate(vec2<f32>(0.0, 1.0), angle);
  let split = splitDirection * u.chromaticShift * 0.045;
  let redSample = glsChromaticMetalSample(p + split, t);
  let neutral = glsChromaticMetalSample(p, t);
  let blueSample = glsChromaticMetalSample(p - split, t);
  let optical = vec3<f32>(redSample.r, neutral.g, blueSample.b);
  let fringe = clamp(length(optical - neutral) * 4.0, 0.0, 1.0);
  var color = mix(neutral, optical,
                  clamp(u.chromaticShift * (0.72 + fringe * 0.28), 0.0, 1.0));
  let centerTone = glsChromaticMetalTone(glsChromaticMetalPhase(p, t));
  let glint = pow(centerTone, mix(12.0, 5.0, clamp(u.metalRoughness, 0.0, 1.0)));
  color = mix(color, u.highlightColor.rgb,
              glint * clamp(u.metalDepth, 0.0, 1.0) * 0.06);

  // A second, sphere-scale reflection layer keeps the material metallic even
  // when the optional glass shell is disabled. It modulates the animated ramp
  // instead of raising exposure, preserving dark chrome between reflections.
  let radial2 = clamp(dot(p, p), 0.0, 1.0);
  let normal = normalize(vec3<f32>(p, sqrt(max(1.0 - radial2, 0.0))));
  let roughness = clamp(u.metalRoughness, 0.0, 1.0);
  let depth = clamp(u.metalDepth, 0.0, 1.0);
  let key = pow(max(dot(normal, normalize(vec3<f32>(-0.48, 0.62, 0.62))), 0.0),
                mix(7.0, 3.0, roughness));
  let fill = pow(max(dot(normal, normalize(vec3<f32>(0.7, -0.34, 0.63))), 0.0),
                 mix(10.0, 4.0, roughness));
  let limb = 1.0 - normal.z;
  let fresnel = pow(limb, 3.0);
  let rim = pow(limb, 10.0);
  color = color * (0.86 + normal.z * 0.14);
  color = mix(color, u.highlightColor.rgb, key * (0.05 + depth * 0.13));
  color = mix(color, u.colorC.rgb, fill * (0.025 + depth * 0.07));
  color = mix(color, u.colorD.rgb, fresnel * (0.12 + depth * 0.15));
  color = mix(color, u.highlightColor.rgb, rim * (0.035 + depth * 0.055));
  return glsFinishPresetFluid(color, p);
}

fn glsOpalFluid(p: vec2<f32>, t: f32) -> vec3<f32> {
  let q = p * (0.8 + u.zoom * 0.64);
  let complexity = 0.76 + u.warp * 0.085;
  var d = -t * 0.42;
  var a = 0.0;
  for (var i: i32 = 0; i < 8; i = i + 1) {
    let fi = f32(i);
    a = a + cos(fi - d - a * q.x * complexity);
    d = d + sin(q.y * fi * complexity + a);
  }
  d = d + t * 0.42;
  let c1 = cos(q * vec2<f32>(d, a)) * 0.6 + vec2<f32>(0.4);
  let c2 = cos(a + d) * 0.5 + 0.5;
  let interference = 0.5 + 0.5 * cos(vec3<f32>(c1.x, c1.y, c2)
                         * cos(vec3<f32>(d, a, 2.5)) * 0.5 + vec3<f32>(0.5));
  let tone = fract(interference.r * 0.37 + interference.g * 0.51
                   + interference.b * 0.73 + c1.x * 0.22 - c1.y * 0.15);
  var color = lqRamp(tone, u.colorB.rgb, u.colorC.rgb, u.colorD.rgb, u.colorA.rgb);
  color = mix(color, u.colorA.rgb, 0.16 + 0.1 * interference.b);
  color = color / (vec3<f32>(1.0) + color * 0.16);
  return glsFinishPresetFluid(color, p);
}

fn glsFrostFluid(p: vec2<f32>, t: f32) -> vec3<f32> {
  // The initial frost-style orb: a slow domain warp drives broad cloudy colour
  // bodies, while a second higher-frequency field contributes adjustable veins.
  var q = p * (0.66 + u.zoom * 0.92);
  q.y = q.y + t * 0.055;
  let blur = 0.011 + 0.006 * u.zoom;
  let warpField = vec2<f32>(
    lqFbm(q * 1.14 + vec2<f32>(t * 0.055, 0.0), blur).x,
    lqFbm(q * 1.14 + vec2<f32>(6.8, -t * 0.048), blur).x
  );
  let warped = q + (warpField - vec2<f32>(0.5)) * (0.28 + u.warp * 0.17);
  let body = lqFbm(warped * 1.48 + vec2<f32>(t * 0.032, -t * 0.02), blur * 1.48);
  let veins = lqRidgeS(
    lqFbm(warped * 2.36 + vec2<f32>(3.1, -t * 0.024), blur * 2.36),
    u.sharp
  );
  let value = mix(lqStepS(body, 0.1, 0.9),
                  clamp(veins * 0.8 + body.x * 0.46, 0.0, 1.0),
                  u.ridgeAmt);
  var color = lqRamp(value, u.colorA.rgb, u.colorB.rgb, u.colorC.rgb, u.colorD.rgb);
  color = mix(color, u.colorA.rgb, 0.08 * smoothstep(0.62, 0.92, body.x));
  return glsFinishPresetFluid(color, p);
}

fn glsVoiceWaveFluid(p: vec2<f32>, t: f32) -> vec3<f32> {
  // A single broad membrane stays phase-coherent across the sphere. Nearby
  // translucent layers add volume without splitting into separate Siri bands.
  let scale = 0.76 + u.zoom * 0.34;
  let q = p / scale;
  let rimEnvelope = pow(max(1.0 - q.x * q.x, 0.0), 0.72);
  let drift = t * 0.82;
  let amplitude = 0.2 + u.warp * 0.018;
  let mainY = rimEnvelope * (amplitude * sin(q.x * 1.48 + drift)
              + 0.055 * sin(q.x * 3.2 - drift * 0.43 + 1.1));
  let distance = q.y - mainY;
  let width = 0.11 + (1.0 - u.ridgeAmt) * 0.075;
  let membrane = exp(-distance * distance / max(width * width, 0.001)) * rimEnvelope;
  let upperVeil = exp(-(distance - 0.105) * (distance - 0.105)
                      / max(width * width * 2.4, 0.001)) * rimEnvelope;
  let lowerVeil = exp(-(distance + 0.115) * (distance + 0.115)
                      / max(width * width * 2.8, 0.001)) * rimEnvelope;
  let crest = exp(-distance * distance / 0.0026) * rimEnvelope;
  let depth = sqrt(max(1.0 - clamp(dot(p, p), 0.0, 1.0), 0.0));
  var color = mix(u.colorA.rgb * 0.7, u.colorD.rgb * 0.34,
                  smoothstep(-0.82, 0.82, q.y));
  color = mix(color, u.colorB.rgb, upperVeil * 0.7);
  color = mix(color, u.colorC.rgb, lowerVeil * 0.62);
  color = color + mix(u.colorB.rgb, u.colorC.rgb, 0.46) * membrane * 0.34;
  color = color + u.highlightColor.rgb * crest * 0.14;
  color = color * (0.58 + 0.42 * depth);
  return glsFinishPresetFluid(color, p);
}

fn glsBlueDropFluid(p: vec2<f32>, t: f32) -> vec3<f32> {
  // Slow diagonal advection keeps the broad liquid bodies coherent. The two
  // shear waves replace the reference orb's circular, looped point motion.
  let depth = sqrt(max(1.0 - clamp(dot(p, p), 0.0, 1.0), 0.0));
  var q = p * mix(0.72, 1.0, depth * 0.62 + 0.38);
  q = glsRotate(q, -0.24 + 0.06 * sin(t * 0.17));
  let scale = 1.0 + u.zoom * 1.12;
  let blur = 0.012 + 0.006 * u.zoom;
  let driftA = lqFbm(q * 1.28 + vec2<f32>(t * 0.095, -t * 0.034), blur * 1.28);
  let driftB = lqFbm(glsRotate(q, 1.08) * 1.62
                     + vec2<f32>(-t * 0.042, t * 0.078), blur * 1.62);
  var flowed = q + vec2<f32>(driftA.x - 0.5, driftB.x - 0.5)
                 * (0.24 + u.warp * 0.1);
  flowed.x = flowed.x + sin(flowed.y * 2.15 + t * 0.24) * (0.035 + u.warp * 0.012);
  flowed.y = flowed.y + sin(flowed.x * 1.38 - t * 0.18) * (0.045 + u.warp * 0.01);
  let body = lqFbm(flowed * scale + vec2<f32>(t * 0.025, -t * 0.018), blur * scale);
  let marble = lqRidgeS(lqFbm(flowed * (1.72 + u.zoom * 0.9)
                              + vec2<f32>(2.7, -t * 0.035),
                              blur * (1.72 + u.zoom * 0.9)),
                            0.8 + u.sharp * 0.46);
  let value = clamp(mix(body.x, body.x * 0.62 + marble * 0.58, u.ridgeAmt), 0.0, 1.0);
  var color = lqRamp(value, u.colorA.rgb, u.colorB.rgb, u.colorC.rgb, u.colorD.rgb);
  let light = pow(max(dot(normalize(vec3<f32>(p, depth)),
                          normalize(vec3<f32>(-0.48, 0.62, 0.92))), 0.0), 3.2);
  color = mix(color, u.highlightColor.rgb, light * (0.035 + 0.05 * u.shade));
  color = color * (0.74 + 0.26 * depth);
  return glsFinishPresetFluid(color, p);
}

fn glsVioletEmberFluid(p: vec2<f32>, t: f32) -> vec3<f32> {
  // A radial twist and two crossing drift fields make heavy molten folds. This
  // moves as a breathing spiral instead of the reference orb's closed circles.
  let scale = 1.08 + u.zoom * 1.18;
  let blur = 0.011 + 0.005 * u.zoom;
  let radius = length(p);
  let twist = t * 0.055 + radius * (0.72 + u.warp * 0.11)
              + 0.08 * sin(t * 0.31 + radius * 4.0);
  let q = glsRotate(p * scale, twist);
  let low = lqFbm(q * 1.18 + vec2<f32>(t * 0.068, -t * 0.105), blur * 1.18);
  let cross = lqFbm(glsRotate(q, -1.12) * 1.52
                    + vec2<f32>(-t * 0.094, t * 0.042)
                    + vec2<f32>(low.x * 1.35, -low.x * 0.72), blur * 1.52);
  let warped = q + vec2<f32>(low.x - 0.5, cross.x - 0.5)
                   * (0.3 + u.warp * 0.12);
  let melt = lqFbm(warped * 1.34
                   + vec2<f32>(cross.x * 1.48, low.x * 1.12), blur * 1.34);
  let veins = lqRidgeS(lqFbm(warped * (2.05 + u.zoom * 0.72)
                             + vec2<f32>(-2.1, t * 0.052),
                             blur * (2.05 + u.zoom * 0.72)),
                           0.82 + u.sharp * 0.58);
  let heat = smoothstep(0.18, 0.92,
                        melt.x * (0.72 - u.ridgeAmt * 0.16)
                        + veins * (0.32 + u.ridgeAmt * 0.5));
  var color = lqRamp(heat, u.colorA.rgb, u.colorB.rgb, u.colorC.rgb, u.colorD.rgb);
  let pulse = 0.94 + 0.06 * sin(t * 0.44 + melt.x * 5.0);
  color = color * pulse;
  color = mix(color, u.highlightColor.rgb, pow(veins, 4.0) * 0.045);
  return glsFinishPresetFluid(color, p);
}

fn glsRefractiveBlobFluid(p: vec2<f32>, t: f32) -> vec3<f32> {
  // Broad advected cells give the lens something legible to bend. A slower
  // caustic ribbon crosses those cells out of phase, so the material evolves
  // without looking like a texture rotating inside a fixed sphere.
  let radial2 = clamp(dot(p, p), 0.0, 1.0);
  let depth = sqrt(max(1.0 - radial2, 0.0));
  let scale = 0.82 + u.zoom * 1.08;
  let blur = 0.012 + 0.005 * u.zoom;
  var q = glsRotate(p * scale, 0.08 * sin(t * 0.17));
  let driftA = lqFbm(q * 1.16 + vec2<f32>(t * 0.052, -t * 0.078), blur * 1.16);
  let driftB = lqFbm(glsRotate(q, 1.21) * 1.34
                     + vec2<f32>(-t * 0.064, t * 0.041), blur * 1.34);
  q = q + vec2<f32>(driftA.x - 0.5, driftB.x - 0.5)
          * (0.34 + u.warp * 0.105);

  let body = lqFbm(q * 1.42 + vec2<f32>(driftB.x * 0.82, driftA.x * 0.66),
                   blur * 1.42);
  let ribbonPhase = q.y * (2.2 + u.warp * 0.11)
                  + sin(q.x * 1.72 - t * 0.19) * 0.92
                  + sin((q.x + q.y) * 1.08 + t * 0.13) * 0.46;
  let ribbon = pow(clamp(1.0 - abs(sin(ribbonPhase)), 0.0, 1.0),
                   0.82 + u.sharp * 0.23);
  let fold = lqRidgeS(lqFbm(q * 2.05 + vec2<f32>(2.8, -t * 0.037),
                            blur * 2.05), 0.9 + u.sharp * 0.32);
  let value = clamp(body.x * 0.5 + driftA.x * 0.16
                    + ribbon * (0.2 + u.ridgeAmt * 0.2)
                    + fold * u.ridgeAmt * 0.18, 0.0, 1.0);

  var color = lqRamp(value, u.colorA.rgb, u.colorB.rgb, u.colorC.rgb, u.colorD.rgb);
  let caustic = pow(ribbon, 3.1) * (0.24 + 0.28 * u.ridgeAmt)
               + pow(fold, 4.2) * 0.08;
  color = mix(color, u.colorD.rgb, clamp(caustic, 0.0, 0.52));
  color = color * (0.7 + depth * 0.3);
  let key = pow(max(dot(normalize(vec3<f32>(p, depth)),
                        normalize(vec3<f32>(-0.42, 0.58, 0.9))), 0.0), 4.0);
  color = mix(color, u.highlightColor.rgb, key * 0.055);
  return glsFinishPresetFluid(color, p);
}

fn glsParticleRibbonFluid(p: vec2<f32>, t: f32) -> vec3<f32> {
  // The visible body is emitted by the dedicated particle pipeline. Keeping
  // this branch empty lets the shared fullscreen pass contribute only the
  // optional glass shell and its transparent background contract.
  return vec3<f32>(0.0);
}

fn glsPresetFluid(p: vec2<f32>, style: i32, t: f32) -> vec3<f32> {
  if (style == 9) { return glsSiriFluid(p, t); }
  if (style == 10) { return glsAuroraFluid(p, t); }
  if (style == 11) { return glsPlasmaFluid(p, t); }
  if (style == 12) { return glsChromeFluid(p, t); }
  if (style == 13) { return glsOpalFluid(p, t); }
  if (style == 14) { return glsSpectrumFluid(p, t); }
  if (style == 15) { return glsFrostFluid(p, t); }
  if (style == 19) { return glsVoiceWaveFluid(p, t); }
  if (style == 20) { return glsBlueDropFluid(p, t); }
  if (style == 21) { return glsVioletEmberFluid(p, t); }
  if (style == 22) { return glsChromaticMetalFluid(p, t); }
  if (style == 23) { return glsRefractiveBlobFluid(p, t); }
  if (style == 24) { return glsParticleRibbonFluid(p, t); }
  return glsFrostFluid(p, t);
}

// ---------------------------------------------------------------------------
// The fluid, at one point, already blurred and straight (not premultiplied):
// the sheet's shader on \`fu\` \u2014 both programs, all four inner branches, and the
// shared shade tail \u2014 with the blur folded into the noise bank as above. The
// disc's own alpha is the caller's, because it is analytic now.
// ---------------------------------------------------------------------------
fn glsFluid(fu: vec2<f32>, md: i32, t: f32) -> vec3<f32> {
  let df = length(fu);

  let cA = u.colorA.rgb;
  let cB = u.colorB.rgb;
  let cC = u.colorC.rgb;
  let cD = u.colorD.rgb;

  // The blur's sigma, carried from fluid units into the fluid's own domains.
  // \`sp\` is it in pp/q units \u2014 the warp shifts q about but does not stretch it
  // on average, so pp and q share one. \`sw\` is the warp field's own, softened
  // by GL_KWA.
  let blurSigma = select(GL_BSIG_CLEAR, GL_BSIG_GLASS, u.glassEnabled > 0.5);
  let sp = blurSigma * u.zoom;
  let sw = sp * 1.1 * GL_KWA;

  var fcol: vec3<f32>;
  if (md < 0) {
    // progA \u2014 the warped body, the only branch with the slow vertical drift
    // and the only one that reads Ridge.
    var pp = fu * u.zoom;
    pp.y = pp.y + t * 0.05;
    let w = vec2<f32>(lqFbm(pp * 1.1 + vec2<f32>(0.0, t * 0.09), sw).x,
                      lqFbm(pp * 1.1 + vec2<f32>(7.7, -t * 0.07), sw).x);
    let q = pp + u.warp * (w - vec2<f32>(0.5));
    let body  = lqFbm(q * 1.5 + vec2<f32>(t * 0.04, 0.0), sp * 1.5);
    let veins = lqRidgeS(lqFbm(q * 2.2 + vec2<f32>(3.1), sp * 2.2), u.sharp);
    let v = mix(lqStepS(body, 0.12, 0.88),
                clamp(veins * 0.85 + 0.45 * body.x, 0.0, 1.0), u.ridgeAmt);
    fcol = lqRamp(v, cA, cB, cC, cD);
  } else {
    // progB \u2014 same warp, no vertical drift, four inner branches.
    let pp = fu * u.zoom;
    let w = vec2<f32>(lqFbm(pp * 1.1 + vec2<f32>(0.0, t * 0.09), sw).x,
                      lqFbm(pp * 1.1 + vec2<f32>(7.7, -t * 0.07), sw).x);
    let q = pp + u.warp * (w - vec2<f32>(0.5));
    if (md == 0) {
      // Nectar \u2014 a sine band the noise leans on. The fbm is INSIDE the sine, so
      // the removed detail integrates out in closed form rather than by
      // quadrature: E[sin(A + 6e)] = sin(A)\xB7exp(-18\xB7sd\xB2). The second term of
      // the exponent is the same integral for the sine's own \`q.x * 7.0\`, which
      // the blur attenuates by exp(-49\xB7sp\xB2/2).
      let n0 = lqFbm(q * 2.2, sp * 2.2);
      let damp = exp(-18.0 * n0.y * n0.y - 24.5 * sp * sp);
      var v = 0.5 + 0.5 * damp * sin(q.x * 7.0 + n0.x * 6.0 + t * 0.35);
      v = mix(v, lqFbm(q * 1.4 + vec2<f32>(t * 0.03), sp * 1.4).x, 0.25);
      fcol = lqRamp(v, cA, cB, cC, cD);
    } else if (md == 1) {
      // Lumen \u2014 two ridged fields multiplied into filaments. The two fields are
      // independent, so each integrates its own detail out before the product.
      let v = lqRidgeS(lqFbm(q * 1.4 + vec2<f32>(t * 0.06, 0.0), sp * 1.4), u.sharp)
            * lqRidgeS(lqFbm(q * 1.7 - vec2<f32>(0.0, t * 0.05), sp * 1.7), u.sharp);
      fcol = lqRamp(pow(v, 0.7), cA, cB, cC, cD);
    } else if (md == 6) {
      // Sprig \u2014 noise warped by noise, with a ridged edge darkening it.
      let v = lqFbm(q * 1.3 + vec2<f32>(1.5 * lqFbm(q * 2.6 + vec2<f32>(t * 0.025), sp * 2.6).x), sp * 1.3);
      let edge = lqRidgeS(lqFbm(q * 2.1 + vec2<f32>(7.0), sp * 2.1), 1.3);
      fcol = lqRamp(lqStepS(v, 0.1, 0.9), cA, cB, cC, cD);
      fcol = fcol * (1.0 - 0.18 * edge);
    } else {
      // Haze and Smoke \u2014 the same rising plume at two palettes.
      let q2 = q + vec2<f32>(0.0, -t * 0.14);
      let v = lqFbm(q2 * 1.6 + vec2<f32>(2.2 * lqFbm(q2 * 2.4 + vec2<f32>(0.0, -t * 0.05), sp * 2.4).x), sp * 1.6);
      fcol = lqRamp(lqPowS(v, 1.5), cA, cB, cC, cD);
    }
  }

  // The sheet's shared tail: a highlight up-left, a shadow down-right, and a
  // darkened limb. All three are far below the blur's cutoff, so they are the
  // sheet's own expressions untouched. The grain term the sheet ends on is not
  // ported \u2014 see the header. The two \`1 - shade*k*smoothstep(...)\` terms are
  // multiplicative darkening, not colours, so they stay literal.
  fcol = mix(fcol, u.highlightColor.rgb,
             u.shade * 0.3 * smoothstep(0.25, 1.25, dot(fu, vec2<f32>(-0.32, 0.78))));
  fcol = fcol * (1.0 - u.shade * 0.42 * smoothstep(-0.05, 1.25, dot(fu, vec2<f32>(0.45, -0.62))));
  fcol = fcol * (1.0 - u.shade * 0.3 * smoothstep(0.72, 1.0, df));
  return clamp(fcol, vec3<f32>(0.0), vec3<f32>(1.0));
}

// ---------------------------------------------------------------------------
// The shell.
// ---------------------------------------------------------------------------

// Source-over onto an opaque destination, straight (un-premultiplied) sRGB.
fn glsOver(dst: vec3<f32>, src: vec3<f32>, a: f32) -> vec3<f32> {
  let k = clamp(a, 0.0, 1.0);
  return src * k + dst * (1.0 - k);
}

fn glsRefractionProfile(t: f32) -> f32 {
  let depth = clamp(t, 0.0, 1.0);
  let circular = sqrt(max(1.0 - (1.0 - depth) * (1.0 - depth), 0.0));
  return 1.0 - circular;
}

fn glsHighlightLobe(normal: vec2<f32>, direction: vec2<f32>, cut: f32,
                     power: f32) -> f32 {
  let angular = clamp((dot(normal, direction) - cut) / max(1.0 - cut, 0.001),
                      0.0, 1.0);
  return pow(angular, power);
}

fn glsContourWave(angle: f32, t: f32) -> vec2<f32> {
  let style = i32(u.style + 0.5);
  if (style == 19) {
    let wave = sin(angle * 2.0 + t * 0.27) * 0.72
               + sin(angle * 4.0 - t * 0.16 + 2.1) * 0.28;
    let slope = cos(angle * 2.0 + t * 0.27) * 1.44
                + cos(angle * 4.0 - t * 0.16 + 2.1) * 1.12;
    return vec2<f32>(wave, slope);
  }
  let wave = sin(angle * 3.0 + t * 0.62) * 0.52
             + sin(angle * 5.0 - t * 0.41 + 1.7) * 0.31
             + sin(angle * 2.0 + t * 0.23 + 3.1) * 0.17;
  let slope = cos(angle * 3.0 + t * 0.62) * 1.56
              + cos(angle * 5.0 - t * 0.41 + 1.7) * 1.55
              + cos(angle * 2.0 + t * 0.23 + 3.1) * 0.34;
  return vec2<f32>(wave, slope);
}

fn glsContourStrength() -> f32 {
  if (u.style >= 18.5) { return 0.11; }
  return select(0.09, 0.16, u.style >= 15.5);
}

fn glsContourScale(uv: vec2<f32>, t: f32, amount: f32) -> f32 {
  if (amount <= 0.0) { return 1.0; }
  let contour = glsContourWave(atan2(uv.y, uv.x), t);
  return 1.0 + clamp(amount, 0.0, 1.0) * glsContourStrength() * contour.x;
}

fn glsContourNormal(uv: vec2<f32>, rad: f32, t: f32, amount: f32) -> vec2<f32> {
  let distance = length(uv);
  if (distance <= 0.0001) { return vec2<f32>(0.0); }
  let radial = uv / distance;
  let contour = glsContourWave(atan2(uv.y, uv.x), t);
  let slope = clamp(amount, 0.0, 1.0) * glsContourStrength() * contour.y;
  let tangent = vec2<f32>(-radial.y, radial.x);
  return normalize(radial - tangent * (rad * slope / distance));
}

fn glsRefractionNormal(base: vec2<f32>, p: vec2<f32>, t: f32,
                       style: i32) -> vec2<f32> {
  if (style != 23) { return base; }
  let tangent = vec2<f32>(-base.y, base.x);
  let a = lqFbm(p * 2.15 + vec2<f32>(t * 0.061, -t * 0.043), 0.018).x;
  let b = lqFbm(glsRotate(p, 1.37) * 2.55
                  + vec2<f32>(-t * 0.037, t * 0.052), 0.021).x;
  let wave = (a - b) * 0.76 + sin(atan2(p.y, p.x) * 3.0 + t * 0.21) * 0.08;
  return normalize(base + tangent * wave);
}

fn orbGlassLiquidAnim(uv01: vec2<f32>) -> vec4<f32> {
  // The runner hands uv01 with y down from the top, like stitchable MSL's
  // \`position\`; the orb was authored bottom-left, so flip back.
  let fc = vec2<f32>(uv01.x, 1.0 - uv01.y) * u.size;
  let uv = (2.0 * fc - u.size) / max(min(u.size.x, u.size.y), 1.0);

  let rad = max(u.radius, 0.05);
  let t = u.time * u.speed;
  let s = i32(u.style + 0.5);
  let emissionOnly = u.glassEnabled <= 0.5 && (s == 9 || s == 14 || s == 24);
  let contourRad = rad * glsContourScale(uv, t, u.contourDeform);

  // Nothing on this pixel \u2014 and here that is the whole fluid and the whole
  // shell skipped, over roughly 60% of the quad. 1.01 is the far edge of the
  // ball's own coverage, \`1 - smoothstep(0.99, 1.01, pd)\` on the last line of
  // this function, which is EXACTLY zero past it, so the full path already
  // returns opaque black here. An early-out, not a clip: the number is that
  // coverage term's own far edge, so do not "tidy" it to 1.0 \u2014 that would
  // shave the outer half of the limb's antialiasing.
  //
  // Tested on \`uv\` rather than on \`pd\` because \`|uv| > rad * 1.01\` IS
  // \`pd > 1.01\`, and it keeps \`p\` and \`pd\` in the same basic block as
  // everything that reads them \u2014 the shape the four sibling orbs of this port
  // need, where branching on \`d\` after computing it makes the compiler stop
  // folding \`uv / rad\` into its uses and the moved last bit comes back through
  // their grain hash as speckle up to 34/255. Glass Liquid has no grain and is
  // nearly immune either way: at 1024x1024 this costs under a dozen bytes of a
  // four-million-byte frame, off by 1/255. Those are the branch existing, not a
  // pixel wrongly skipped \u2014 a copy of this guard with a threshold it can never
  // reach diffs identically, and against it the guard is exactly 0/255.
  if (length(uv) > contourRad * (1.01 + mfEdgeD(u.edgeSoftness))) {
    // Off the ball entirely \u2014 but the halo lives out here, so hand back
    // what the edge bank paints on nothing. Exactly black at Glow 0.
    let halo = clamp(mfEdgeGlow(vec3<f32>(0.0), uv, vec2<f32>(0.0), contourRad,
                                u.edgeSoftness, u.edgeGlow, u.glowColor.rgb),
                     vec3<f32>(0.0), vec3<f32>(1.0));
    let haloAlpha = max(halo.r, max(halo.g, halo.b));
    return vec4<f32>(halo, haloAlpha);
  }

  let p   = uv / contourRad;     // deformed ball space: |p| == 1 on the edge
  let pd  = length(p);

  // ---- the fluid ------------------------------------------------------
  let fu = p / GL_FU;

  // Branch dispatch. Source indices 0/2/4/6 are progA (md < 0); the others are
  // progB at the sheet's own mode number. An if-chain avoids a runtime-indexed
  // lookup here.
  var md: i32 = -1;
  if (s == 1) { md = 1; }
  else if (s == 3 || s == 8) { md = 7; }
  else if (s == 5) { md = 6; }
  else if (s == 7) { md = 0; }

  let clearFa = 1.0 - smoothstep(GL_CLEAR_EA, GL_CLEAR_EB, pd);
  let contourNormal = glsContourNormal(uv, rad, t, u.contourDeform);
  let normal = glsRefractionNormal(contourNormal, p, t, s);
  let edgeDepth = max(1.0 - pd, 0.0);
  let refractionWidth = 0.015 + 0.95 * clamp(u.shellMidAlpha, 0.0, 1.0);
  let refractionT = edgeDepth / max(refractionWidth, 0.001);
  let refractionProfile = pow(glsRefractionProfile(refractionT), 0.68);
  let refractionAmount = 1.6 * clamp(u.glassOpacity, 0.0, 1.0)
                         * refractionProfile;
  let refractedP = p - normal * refractionAmount;
  var fcol = vec3<f32>(0.0);
  if (clearFa > 0.0) {
    if (s >= 9) {
      if (u.glassEnabled > 0.5) {
        // Three actual fluid evaluations produce optical dispersion. At the
        // outer boundary the reference lens pulls samples from deep inside the
        // orb; the channels converge continuously at the inner edge of the
        // refraction band.
        let channelSplit = 0.14 * clamp(u.gloss, 0.0, 2.0)
                           * clamp(u.glassOpacity, 0.0, 1.0)
                           * refractionProfile;
        let redSample = glsPresetFluid(refractedP - normal * channelSplit, s, t);
        let greenSample = glsPresetFluid(refractedP, s, t);
        let blueSample = glsPresetFluid(refractedP + normal * channelSplit, s, t);
        fcol = vec3<f32>(redSample.r, greenSample.g, blueSample.b);
      }
      else { fcol = glsPresetFluid(p, s, t); }
    }
    else { fcol = glsFluid(fu, md, t); }
  }

  // Voice-like presets become a true emissive layer when glass is disabled.
  // Their empty pixels no longer inherit the opaque circular canvas fill.
  let lum = dot(fcol, vec3<f32>(0.213, 0.715, 0.072));
  let clearSat = clamp(vec3<f32>(lum) + (fcol - vec3<f32>(lum)) * 1.22,
                       vec3<f32>(0.0), vec3<f32>(1.0));
  let particleGlassOverlay = s == 24;
  var col = select(
    glsOver(u.canvasColor.rgb, clearSat, 0.99 * clearFa),
    vec3<f32>(0.0),
    particleGlassOverlay,
  );
  if (emissionOnly) {
    let signal = max(clearSat.r, max(clearSat.g, clearSat.b));
    let emissionCoverage = smoothstep(0.025, 0.16, signal);
    col = clearSat * emissionCoverage;
  }
  if (u.glassEnabled > 0.5) {
    // Surface lighting stays on a thin arc. The broad visual change comes from
    // the refracted fluid above, not from a translucent white overlay.
    // Its weights still need enough contrast to keep the exposed colour and
    // highlight controls perceptible in the compact scene preview.
    let surfaceWidth = select(
      0.026 + 0.055 * clamp(u.shellEdgeAlpha, 0.0, 1.0),
      0.09 + 0.12 * clamp(u.shellEdgeAlpha, 0.0, 1.0),
      particleGlassOverlay,
    );
    let surfaceBand = (1.0 - smoothstep(0.0, surfaceWidth, edgeDepth)) * clearFa;
    let opticalRim = pow(surfaceBand, select(1.8, 1.3, particleGlassOverlay));
    let innerRimAlpha = select(
      opticalRim * u.glassOpacity * 0.45,
      opticalRim * u.glassOpacity * 0.14,
      particleGlassOverlay,
    );
    col = glsOver(col, u.shellInner.rgb, innerRimAlpha);

    let coolDirection = normalize(vec2<f32>(0.84, 0.54));
    let warmDirection = normalize(vec2<f32>(-0.62, -0.78));
    let coolSplit = glsHighlightLobe(normal, coolDirection, -0.32, 1.8);
    let warmSplit = glsHighlightLobe(normal, warmDirection, -0.28, 2.0);
    let dispersion = opticalRim * clamp(u.gloss, 0.0, 2.0)
                     * (0.8 + 0.8 * u.shellEdgeAlpha);
    col = glsOver(col, u.shellMid.rgb, dispersion * coolSplit);
    col = glsOver(col, u.shellEdge.rgb, dispersion * warmSplit);

    let edgeShadow = opticalRim * (0.015 + 0.15 * u.shellEdgeAlpha)
                     * (0.15 + 0.85 * max(dot(normal, vec2<f32>(0.45, -0.89)), 0.0));
    col = col * (1.0 - edgeShadow);

    let keyDirection = normalize(vec2<f32>(-0.68, 0.73));
    let fillDirection = normalize(vec2<f32>(0.74, -0.67));
    let key = opticalRim * glsHighlightLobe(normal, keyDirection, 0.2, 2.8)
              * clamp(u.sheen, 0.0, 2.0) * 1.4;
    let fill = opticalRim * glsHighlightLobe(normal, fillDirection, 0.4, 3.6)
               * clamp(u.sheen, 0.0, 2.0) * 1.0;
    col = glsOver(col, u.sheenColor.rgb, key);
    col = glsOver(col, u.specColor.rgb, fill);
  }

  // The ball's own edge, and nothing outside it \u2014 everything the effect does
  // not paint must be exactly 0 so the page shows through.
  let ballA = 1.0 - smoothstep(0.99 - mfEdgeD(u.edgeSoftness), 1.01 + mfEdgeD(u.edgeSoftness), pd);
  col = clamp(col * max(u.exposure, 0.0), vec3<f32>(0.0), vec3<f32>(1.0)) * ballA;
  // The Orbs edge bank \u2014 the Edge group's Glow. Adding zero is exactly
  // the render this file was diffed against, and zero is the default.
  let edged = mfEdgeGlow(col, uv, vec2<f32>(0.0), contourRad,
                         u.edgeSoftness, u.edgeGlow, u.glowColor.rgb);
  let finalColor = clamp(edged, vec3<f32>(0.0), vec3<f32>(1.0));
  let emissionAlpha = max(finalColor.r, max(finalColor.g, finalColor.b));
  let sphereAlpha = clamp(max(ballA, emissionAlpha), 0.0, 1.0);
  let finalAlpha = select(
    sphereAlpha,
    emissionAlpha,
    emissionOnly || particleGlassOverlay,
  );
  return vec4<f32>(finalColor, finalAlpha);
}
`;var _e=`
struct VOut {
  @builtin(position) pos: vec4<f32>,
  @location(0) uv: vec2<f32>,
};

@vertex
fn vs_main(@builtin(vertex_index) i: u32) -> VOut {
  var p = array<vec2<f32>, 3>(
    vec2<f32>(-1.0, -1.0),
    vec2<f32>( 3.0, -1.0),
    vec2<f32>(-1.0,  3.0),
  );
  var out: VOut;
  out.pos = vec4<f32>(p[i], 0.0, 1.0);
  let uv01 = (p[i] + vec2<f32>(1.0)) * 0.5;
  out.uv = vec2<f32>(uv01.x, 1.0 - uv01.y);
  return out;
}

@fragment
fn fs_main(in: VOut) -> @location(0) vec4<f32> {
  let c = orbGlassLiquidAnim(in.uv);

  let fc = vec2<f32>(in.uv.x, 1.0 - in.uv.y) * u.size;
  let uv = (2.0 * fc - u.size) / max(min(u.size.x, u.size.y), 1.0);
  let rad = max(u.radius, 0.05);
  let t = u.time * u.speed;
  let contourRad = rad * glsContourScale(uv, t, u.contourDeform);
  let q = (2.0 * fc - u.size) / u.size;
  let fitEnd = 1.0;
  let fitFeather = 2.0 / max(min(u.size.x, u.size.y), 1.0);
  let fitStart = min(mix(contourRad, fitEnd, 0.5), fitEnd - fitFeather);
  let fit = 1.0 - smoothstep(fitStart, fitEnd, max(abs(q.x), abs(q.y)));
  return vec4<f32>(c.rgb * fit, c.a * fit);
}

const PR_U_SEGMENTS: u32 = 384u;
const PR_V_SEGMENTS: u32 = 96u;
const PR_PARTICLES_PER_LAYER: u32 = PR_U_SEGMENTS * PR_V_SEGMENTS;

struct RibbonOut {
  @builtin(position) pos: vec4<f32>,
  @location(0) local: vec2<f32>,
  @location(1) color: vec3<f32>,
  @location(2) opacity: f32,
};

fn prHash(value: f32) -> f32 {
  return fract(sin(value * 12.9898 + 78.233) * 43758.5453);
}

fn prRotateX(p: vec3<f32>, angle: f32) -> vec3<f32> {
  let c = cos(angle);
  let s = sin(angle);
  return vec3<f32>(p.x, c * p.y - s * p.z, s * p.y + c * p.z);
}

fn prRotateY(p: vec3<f32>, angle: f32) -> vec3<f32> {
  let c = cos(angle);
  let s = sin(angle);
  return vec3<f32>(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}

fn prCurve(theta: f32, layer: f32, phase: f32) -> vec3<f32> {
  let local = theta + layer * 0.11;
  let foldPhase = 2.0 * local + phase * (0.72 + layer * 0.025);
  let fold = clamp(u.ribbonFold, 0.0, 1.2);
  let radial = 0.4 + (0.085 + fold * 0.04) * cos(foldPhase);
  let orbit = local + phase * 0.13
              + sin(local - phase * 0.22 + layer) * fold * 0.13;
  let vertical = (0.235 + fold * 0.085) * sin(foldPhase)
                 + 0.055 * sin(local * 3.0 - phase * 0.46 + layer * 0.7);
  return vec3<f32>(radial * cos(orbit), vertical, radial * sin(orbit));
}

fn prPalette(valueIn: f32) -> vec3<f32> {
  let value = fract(valueIn) * 4.0;
  if (value < 1.0) { return mix(u.colorA.rgb, u.colorB.rgb, value); }
  if (value < 2.0) { return mix(u.colorB.rgb, u.colorC.rgb, value - 1.0); }
  if (value < 3.0) { return mix(u.colorC.rgb, u.colorD.rgb, value - 2.0); }
  return mix(u.colorD.rgb, u.colorA.rgb, value - 3.0);
}

@vertex
fn ribbon_vs_main(
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32,
) -> RibbonOut {
  var corners = array<vec2<f32>, 6>(
    vec2<f32>(-1.0, -1.0), vec2<f32>(1.0, -1.0), vec2<f32>(-1.0, 1.0),
    vec2<f32>(-1.0, 1.0), vec2<f32>(1.0, -1.0), vec2<f32>(1.0, 1.0),
  );
  let layerIndex = instanceIndex / PR_PARTICLES_PER_LAYER;
  let particleIndex = instanceIndex % PR_PARTICLES_PER_LAYER;
  let uIndex = particleIndex / PR_V_SEGMENTS;
  let vIndex = particleIndex % PR_V_SEGMENTS;
  let layer = f32(layerIndex);
  let random = prHash(f32(instanceIndex));
  let activeLayer = layer < floor(clamp(u.ribbonCount, 2.0, 6.0) + 0.5);

  let uCoord = (f32(uIndex) + prHash(f32(instanceIndex) + 11.0) * 0.56)
               / f32(PR_U_SEGMENTS);
  let vCoord = (f32(vIndex) + prHash(f32(instanceIndex) + 29.0) * 0.46)
               / f32(PR_V_SEGMENTS);
  let strip = vCoord * 2.0 - 1.0;
  let t = u.time * u.speed;
  let phase = t * 0.48;
  let arc = fract(uCoord + layer * 0.211 - phase * 0.019);
  let arcLength = 0.76 + 0.055 * sin(t * 0.23 + layer * 1.71);
  let arcPosition = arc / arcLength;
  let arcEnvelope = smoothstep(0.0, 0.075, arcPosition)
                    * (1.0 - smoothstep(0.88, 1.0, arcPosition));
  let particleVisible = activeLayer
                        && arc <= arcLength
                        && random <= clamp(u.particleDensity, 0.2, 1.0);
  let theta = uCoord * 6.28318530718;
  let center = prCurve(theta, layer, phase);
  let ahead = prCurve(theta + 0.006, layer, phase);
  let tangent = normalize(ahead - center);
  let radial = normalize(center + vec3<f32>(0.001, 0.013, 0.007));
  let side = normalize(cross(tangent, radial));
  let surfaceNormal = normalize(cross(side, tangent));
  let twist = theta * (0.72 + u.ribbonTwist * 0.58)
              + phase * 0.74 + layer * 1.17;
  let ribbonDirection = normalize(side * cos(twist) + surfaceNormal * sin(twist));
  let widthEnvelope = (0.72 + 0.28 * pow(sin(theta * 1.5 + phase + layer), 2.0))
                      * mix(0.42, 1.0, sqrt(max(arcEnvelope, 0.0)));
  var position = center + ribbonDirection * strip * u.ribbonWidth * 0.5 * widthEnvelope;

  let pulse = sin(t * 0.73 + layer * 1.71)
              + 0.44 * sin(t * 1.17 + layer * 0.83 + 1.2);
  position *= 1.0 + u.ribbonBreath * pulse * 0.16;
  let layerCenter = layer
                    - (floor(clamp(u.ribbonCount, 2.0, 6.0) + 0.5) - 1.0) * 0.5;
  position = prRotateY(
    position,
    layerCenter * 0.24 + sin(t * 0.19 + layer * 1.3) * 0.055,
  );
  position = prRotateX(
    position,
    layerCenter * 0.14 + cos(t * 0.17 + layer * 0.9) * 0.04,
  );
  position = prRotateY(position, t * 0.105 + sin(t * 0.21) * 0.11);
  position = prRotateX(position, -0.2 + sin(t * 0.16 + layer * 0.1) * 0.16);

  let minSize = max(min(u.size.x, u.size.y), 1.0);
  let depthScale = 0.88 + position.z * 0.16;
  let orbPosition = position.xy * u.radius * 1.45 * depthScale;
  let clip = vec2<f32>(
    orbPosition.x * minSize / max(u.size.x, 1.0),
    orbPosition.y * minSize / max(u.size.y, 1.0),
  );
  let canvasParticleScale = clamp(minSize / 640.0, 0.22, 1.0);
  let pointPixels = max(0.6, u.particleSize)
                    * (1.5 + u.particleBloom * 2.5)
                    * (0.92 + position.z * 0.18)
                    * canvasParticleScale;
  let corner = corners[vertexIndex];
  let pointOffset = corner * pointPixels * 2.0 / max(u.size, vec2<f32>(1.0));

  let colorPhase = uCoord * 0.32 + layer * 0.19 + phase * 0.025
                   + position.z * 0.08;
  let stripEdge = smoothstep(0.58, 1.0, abs(strip));
  let front = clamp(0.78 + position.z * 0.54, 0.5, 1.24);
  let baseOpacity = mix(0.025, 0.009, clamp(u.shade / 1.5, 0.0, 1.0));
  var out: RibbonOut;
  out.pos = select(
    vec4<f32>(2.0, 2.0, 1.0, 1.0),
    vec4<f32>(clip + pointOffset, clamp(0.5 - position.z * 0.12, 0.05, 0.95), 1.0),
    particleVisible,
  );
  out.local = corner;
  out.color = pow(
    mix(prPalette(colorPhase), u.highlightColor.rgb, stripEdge * 0.56),
    vec3<f32>(0.72),
  ) * front;
  out.opacity = select(
    0.0,
    baseOpacity
      * (0.72 + stripEdge * 1.28)
      * arcEnvelope
      * pow(canvasParticleScale, 1.35),
    particleVisible,
  );
  return out;
}

@fragment
fn ribbon_fs_main(in: RibbonOut) -> @location(0) vec4<f32> {
  let distanceSquared = dot(in.local, in.local);
  if (distanceSquared > 1.0) { discard; }
  let core = exp(-distanceSquared * 4.8);
  let halo = exp(-distanceSquared * 1.35);
  let bloom = clamp(u.particleBloom, 0.0, 2.0);
  let intensity = in.opacity * (core * 1.9 + halo * bloom * 0.72)
                  * max(u.exposure, 0.0);
  let glowMix = clamp((halo - core * 0.45) * (0.18 + u.edgeGlow * 0.5), 0.0, 0.7);
  let color = mix(in.color, u.glowColor.rgb, glowMix);
  let alpha = clamp(intensity, 0.0, 1.0);
  return vec4<f32>(color * alpha, alpha);
}

@group(0) @binding(1) var ribbonTexture: texture_2d<f32>;
@group(0) @binding(2) var ribbonSampler: sampler;

fn prTextureUvFromOrb(p: vec2<f32>, contourRad: f32) -> vec2<f32> {
  let minSize = max(min(u.size.x, u.size.y), 1.0);
  let fc = (p * contourRad * minSize + u.size) * 0.5;
  return clamp(
    vec2<f32>(fc.x / max(u.size.x, 1.0), 1.0 - fc.y / max(u.size.y, 1.0)),
    vec2<f32>(0.0),
    vec2<f32>(1.0),
  );
}

fn prSampleRibbon(p: vec2<f32>, contourRad: f32) -> vec4<f32> {
  return textureSampleLevel(
    ribbonTexture,
    ribbonSampler,
    prTextureUvFromOrb(p, contourRad),
    0.0,
  );
}

@fragment
fn ribbon_composite_fs_main(in: VOut) -> @location(0) vec4<f32> {
  let direct = textureSampleLevel(ribbonTexture, ribbonSampler, in.uv, 0.0);
  if (u.glassEnabled <= 0.5) { return direct; }

  let fc = vec2<f32>(in.uv.x, 1.0 - in.uv.y) * u.size;
  let minSize = max(min(u.size.x, u.size.y), 1.0);
  let uv = (2.0 * fc - u.size) / minSize;
  let rad = max(u.radius, 0.05);
  let t = u.time * u.speed;
  let contourRad = rad * glsContourScale(uv, t, u.contourDeform);
  let shell = orbGlassLiquidAnim(in.uv);
  if (length(uv) > contourRad * (1.01 + mfEdgeD(u.edgeSoftness))) {
    return shell;
  }

  let p = uv / contourRad;
  let pd = length(p);
  let clearFa = 1.0 - smoothstep(GL_CLEAR_EA, GL_CLEAR_EB, pd);
  let normal = glsContourNormal(uv, rad, t, u.contourDeform);
  let edgeDepth = max(1.0 - pd, 0.0);
  let refractionWidth = 0.015 + 0.95 * clamp(u.shellMidAlpha, 0.0, 1.0);
  let refractionT = edgeDepth / max(refractionWidth, 0.001);
  let refractionProfile = pow(glsRefractionProfile(refractionT), 0.68);
  let refractionAmount = 1.6 * clamp(u.glassOpacity, 0.0, 1.0)
                         * refractionProfile;
  let refractedP = p - normal * refractionAmount;
  let channelSplit = 0.14 * clamp(u.gloss, 0.0, 2.0)
                     * clamp(u.glassOpacity, 0.0, 1.0)
                     * refractionProfile;
  let redSample = prSampleRibbon(refractedP - normal * channelSplit, contourRad);
  let greenSample = prSampleRibbon(refractedP, contourRad);
  let blueSample = prSampleRibbon(refractedP + normal * channelSplit, contourRad);
  let refractedAlpha = max(redSample.a, max(greenSample.a, blueSample.a)) * clearFa;
  let refracted = vec4<f32>(
    vec3<f32>(redSample.r, greenSample.g, blueSample.b) * clearFa,
    refractedAlpha,
  );
  return vec4<f32>(
    shell.rgb + refracted.rgb * (1.0 - shell.a),
    shell.a + refracted.a * (1.0 - shell.a),
  );
}
`,he=`${de}
${_e}`;var D=()=>({low:0,mid:0,high:0,all:0}),Ue=[[3,"all",0,.7,5],[6,"mid",.85,0,7],[21,"low",.075,0,1],[10,"high",.16,0,2],[14,"all",0,.12,4]],He={siri:.8,voiceWave:1,aurora:.65,plasma:.65,spectrum:.75,violetEmber:.7},We=Object.fromEntries(Object.entries(He).map(([e,o])=>[w[e],o]));function me(e,o){let r=We[Math.round(e[15])]??0;if(r)for(let[a,t,l,i,s]of Ue){let n=o[t],c=(Number.isFinite(n)?Math.max(0,Math.min(1,n)):0)*r;c&&(e[a]=Math.min(Math.max(s,e[a]),e[a]*(1+i*c)+l*c))}}var M=class{gain=.7;level=0;context=null;analyser=null;source=null;stream=null;player=null;url=null;generation=0;spectrum=new Uint8Array(0);waveform=new Float32Array(0);smoothed=D();stop(){this.generation++,this.stream?.getTracks().forEach(o=>o.stop()),this.source?.disconnect(),this.player&&(this.player.pause(),this.player.removeAttribute("src"),this.player.load()),this.url&&URL.revokeObjectURL(this.url),this.context?.close().catch(()=>{}),this.context=this.analyser=this.source=this.stream=this.player=this.url=null,this.smoothed=D(),this.level=0}async setup(){this.stop();let o=this.generation,r=new AudioContext;return this.context=r,this.analyser=r.createAnalyser(),this.analyser.fftSize=2048,this.analyser.smoothingTimeConstant=.65,this.spectrum=new Uint8Array(this.analyser.frequencyBinCount),this.waveform=new Float32Array(this.analyser.fftSize),await r.resume(),o}async microphone(o){let r=await this.setup();if(r!==this.generation)return!1;if(!navigator.mediaDevices?.getUserMedia)throw new Error("Microphone unavailable");let a=await navigator.mediaDevices.getUserMedia({audio:!0});return r!==this.generation?(a.getTracks().forEach(t=>t.stop()),!1):(this.stream=a,this.source=this.context.createMediaStreamSource(a),this.source.connect(this.analyser),a.getAudioTracks()[0].onended=()=>{this.stream===a&&(this.stop(),o())},!0)}async file(o,r){let a=await this.setup();if(a!==this.generation)return!1;let t=document.createElement("audio");return t.controls=!0,t.setAttribute("aria-label",o.name),r.replaceChildren(t),this.player=t,this.url=URL.createObjectURL(o),t.src=this.url,this.source=this.context.createMediaElementSource(t),this.source.connect(this.analyser),this.source.connect(this.context.destination),await t.play(),a===this.generation}read(o){let r=D(),a=this.analyser;if(a&&this.context?.state==="running"&&(this.stream?.active||this.player&&!this.player.paused&&!this.player.ended)){a.getByteFrequencyData(this.spectrum),a.getFloatTimeDomainData(this.waveform);let t=Math.sqrt(this.waveform.reduce((i,s)=>i+s*s,0)/this.waveform.length);r.all=Math.min(1,Math.max(0,t-.004)*5.5);let l=(i,s)=>{let n=y=>Math.max(0,Math.min(this.spectrum.length-1,Math.round(y/(this.context.sampleRate/2)*this.spectrum.length))),c=n(i),u=n(s),f=0;for(let y=c;y<=u;y++)f+=this.spectrum[y];return r.all===0?0:Math.min(1,f/(u-c+1)/255*2)};r.low=l(30,200),r.mid=l(200,2e3),r.high=l(2e3,16e3)}for(let t of["low","mid","high","all"]){let l=r[t]>this.smoothed[t]?.07:.24;this.smoothed[t]+=(r[t]-this.smoothed[t])*(1-Math.exp(-o/l)),this.smoothed[t]<1e-4&&(this.smoothed[t]=0)}return this.level=this.smoothed.all,Object.fromEntries(Object.entries(this.smoothed).map(([t,l])=>[t,Math.min(1,l*this.gain/.7)]))}};function fe({canvas:e,getTarget:o,getAudioBands:r,onError:a,onReady:t}){let l=!1,i=0,s=null,n=null,c=!1,u=!1,f=null,y=0;function B(x){l||u||(u=!0,cancelAnimationFrame(i),n?.destroy(),s?.destroy(),a(x))}async function ve(){if(!navigator.gpu)throw new Error("\u5F53\u524D\u6D4F\u89C8\u5668\u4E0D\u652F\u6301 WebGPU");let x=await navigator.gpu.requestAdapter();if(!x)throw new Error("\u672A\u627E\u5230\u53EF\u7528\u7684 WebGPU \u9002\u914D\u5668");if(s=await x.requestDevice(),l){s.destroy();return}let X=e.getContext("webgpu");if(!X)throw new Error("\u65E0\u6CD5\u521B\u5EFA WebGPU \u753B\u5E03\u4E0A\u4E0B\u6587");let Z=X,E=navigator.gpu.getPreferredCanvasFormat();Z.configure({device:s,format:E,alphaMode:"premultiplied"});let F=s.createShaderModule({label:"orb-glass-liquid",code:he}),J=(await F.getCompilationInfo()).messages.filter(p=>p.type==="error");if(J.length>0)throw new Error(J.map(p=>`${p.lineNum}:${p.linePos} ${p.message}`).join(`
`));let Q=s.createRenderPipeline({label:"orb-glass-liquid-pipeline",layout:"auto",vertex:{module:F,entryPoint:"vs_main"},fragment:{module:F,entryPoint:"fs_main",targets:[{format:E,blend:{color:{srcFactor:"one",dstFactor:"one-minus-src-alpha",operation:"add"},alpha:{srcFactor:"one",dstFactor:"one-minus-src-alpha",operation:"add"}}}]},primitive:{topology:"triangle-list"}}),ee=s.createRenderPipeline({label:"particle-ribbon-pipeline",layout:"auto",vertex:{module:F,entryPoint:"ribbon_vs_main"},fragment:{module:F,entryPoint:"ribbon_fs_main",targets:[{format:E,blend:{color:{srcFactor:"one",dstFactor:"one",operation:"add"},alpha:{srcFactor:"one",dstFactor:"one-minus-src-alpha",operation:"add"}}}]},primitive:{topology:"triangle-list"}}),te=s.createRenderPipeline({label:"particle-ribbon-glass-composite-pipeline",layout:"auto",vertex:{module:F,entryPoint:"vs_main"},fragment:{module:F,entryPoint:"ribbon_composite_fs_main",targets:[{format:E,blend:{color:{srcFactor:"one",dstFactor:"one-minus-src-alpha",operation:"add"},alpha:{srcFactor:"one",dstFactor:"one-minus-src-alpha",operation:"add"}}}]},primitive:{topology:"triangle-list"}}),C=new Float32Array(ce),R=s.createBuffer({size:C.byteLength,usage:GPUBufferUsage.UNIFORM|GPUBufferUsage.COPY_DST}),ye=s.createBindGroup({layout:Q.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:R}}]}),xe=s.createBindGroup({layout:ee.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:R}}]}),we=s.createSampler({addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge",magFilter:"linear",minFilter:"linear"}),O=null,Fe=ne(o());s.lost.then(p=>{B(new Error(`WebGPU \u8BBE\u5907\u5DF2\u65AD\u5F00\uFF1A${p.message||p.reason}`))}),s.addEventListener("uncapturederror",p=>{p.preventDefault(),B(new Error(`WebGPU \u6E32\u67D3\u9519\u8BEF\uFF1A${p.error.message}`))});function Ce(){let p=Math.min(window.devicePixelRatio||1,2),v=Math.max(1,Math.floor(e.clientWidth*p)),q=Math.max(1,Math.floor(e.clientHeight*p));(e.width!==v||e.height!==q)&&(e.width=v,e.height=q,n?.destroy(),n=null,O=null)}function Ae(){n&&O||(n=s.createTexture({label:"particle-ribbon-offscreen-texture",size:{width:e.width,height:e.height},format:E,usage:GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING}),O=s.createBindGroup({layout:te.getBindGroupLayout(0),entries:[{binding:0,resource:{buffer:R}},{binding:1,resource:n.createView()},{binding:2,resource:we}]}))}function oe(p){if(!(l||u||!s))try{Ce();let v=Fe.sample(o(),p),q=f===null?0:Math.min(.1,Math.max(0,(p-f)/1e3));f=p,pe(C,e.width,e.height,0,v),r&&me(C,r(q)),y+=q*Math.max(C[3],0),C[2]=y/Math.max(C[3],.001),s.queue.writeBuffer(R,0,C);let re=w[v.style]===w.particleRibbon,I=s.createCommandEncoder();if(re){Ae();let k=I.beginRenderPass({colorAttachments:[{view:n.createView(),clearValue:{r:0,g:0,b:0,a:0},loadOp:"clear",storeOp:"store"}]});k.setPipeline(ee),k.setBindGroup(0,xe),k.draw(6,221184,0,0),k.end()}let S=I.beginRenderPass({colorAttachments:[{view:Z.getCurrentTexture().createView(),clearValue:{r:0,g:0,b:0,a:0},loadOp:"clear",storeOp:"store"}]});re?(S.setPipeline(te),S.setBindGroup(0,O)):(S.setPipeline(Q),S.setBindGroup(0,ye)),S.draw(3,1,0,0),S.end(),s.queue.submit([I.finish()]),c||(c=!0,t()),i=requestAnimationFrame(oe)}catch(v){B(v instanceof Error?v:new Error(String(v)))}}i=requestAnimationFrame(oe)}return ve().catch(x=>{B(x instanceof Error?x:new Error(String(x)))}),()=>{l=!0,cancelAnimationFrame(i),n?.destroy(),s?.destroy()}}var N=e=>document.querySelector(e),be=N("#orb"),h=N("#bench"),ge=N("#stage"),z=N("#note"),Ve={siri:"Siri",voiceWave:"Voice",particleRibbon:"Ribbon",blueDrop:"Blue drop",violetEmber:"Violet",refractiveBlob:"Refract",chromaticMetal:"Chrome",aurora:"Aurora",frost:"Frost",chrome:"Metal",opal:"Opal",spectrum:"Spectrum",plasma:"Plasma"},$e=[{key:"speed",label:"Speed",min:0,max:3,step:.01},{key:"radius",label:"Radius",min:.3,max:.95,step:.01},{key:"contourDeform",label:"Contour",min:0,max:1,step:.01},{key:"zoom",label:"Zoom",min:.05,max:1,step:.01},{key:"warp",label:"Warp",min:0,max:6,step:.05},{key:"ridgeAmt",label:"Ridge",min:0,max:1,step:.01},{key:"sharp",label:"Sharp",min:.5,max:6,step:.05},{key:"shade",label:"Shade",min:0,max:1.5,step:.01},{key:"exposure",label:"Exposure",min:.2,max:3,step:.02},{key:"sheen",label:"Sheen",min:0,max:2,step:.02},{key:"gloss",label:"Gloss",min:0,max:2,step:.02},{key:"glassOpacity",label:"Glass",min:0,max:1,step:.01},{key:"edgeSoftness",label:"Edge soft",min:.005,max:.15,step:.005},{key:"edgeGlow",label:"Edge glow",min:0,max:1,step:.01}],je=[{key:"colorA",label:"A"},{key:"colorB",label:"B"},{key:"colorC",label:"C"},{key:"colorD",label:"D"},{key:"glowColor",label:"Glow"}],L="voiceWave",g="thinking",b=V(L),P=new M,A=!1,j=!0,$=0,Y=()=>ie(b,g),m=e=>{let o=document.createElement("template");return o.innerHTML=e.trim(),o.content.firstElementChild};function G(){h.innerHTML="<h2>Liquid orb<small>AI voice orb \xB7 WebGPU</small></h2>",h.append(m('<div class="grp">Preset</div>'));let e=m('<div class="pills"></div>');for(let l of U){let i=m(`<button type="button" class="${l===L?"on":""}">${Ve[l]}</button>`);i.onclick=()=>{L=l,b=V(L),G()},e.append(i)}h.append(e),h.append(m('<div class="grp">Switches</div>'));let o=(l,i,s,n)=>{let c=m(`<div class="sw"><span>${l}</span><span class="seg">${i.map(u=>`<button type="button" class="${u===s?"on":""}">${u}</button>`).join("")}</span></div>`);return c.querySelectorAll("button").forEach(u=>u.addEventListener("click",()=>{c.querySelectorAll("button").forEach(f=>f.classList.toggle("on",f===u)),n(u.textContent||"")})),c};h.append(o("State",["Idle","Thinking"],g==="idle"?"Idle":"Thinking",l=>{g=l==="Idle"?"idle":"thinking",G()})),h.append(o("Glass",["Off","On"],Y().glassEnabled?"On":"Off",l=>{b=T(b,g,"glassEnabled",l==="On")})),h.append(o("Audio",["Pulse","Mic","Off"],A?"Mic":j?"Pulse":"Off",async l=>{if(j=l==="Pulse",l==="Mic")try{A=await P.microphone(()=>{A=!1}),z.textContent=A?"Microphone on \u2014 talk to it":""}catch{A=!1,z.textContent="Microphone unavailable"}else P.stop(),A=!1,z.textContent=""}));let r=m('<label class="lv"><i style="--v:70%"></i><span>Sensitivity</span><b>70</b><input type="range" min="0" max="100" value="70"></label>');r.querySelector("input").addEventListener("input",l=>{let i=+l.target.value;P.gain=i/100,r.querySelector("i").style.setProperty("--v",i+"%"),r.querySelector("b").textContent=String(i)}),h.append(r),h.append(m(`<div class="grp">Levels \xB7 ${g}</div>`));let a=Y();for(let l of $e){let i=a[l.key],s=c=>((c-l.min)/(l.max-l.min)*100).toFixed(1)+"%",n=m(`<label class="lv"><i style="--v:${s(i)}"></i><span>${l.label}</span><b>${i.toFixed(2)}</b><input type="range" min="${l.min}" max="${l.max}" step="${l.step}" value="${i}"></label>`);n.querySelector("input").addEventListener("input",c=>{let u=+c.target.value;b=T(b,g,l.key,u),n.querySelector("i").style.setProperty("--v",s(u)),n.querySelector("b").textContent=u.toFixed(2)}),h.append(n)}h.append(m(`<div class="grp">Colours \xB7 ${g}</div>`));let t=m('<div class="colors"></div>');for(let l of je){let i=m(`<label class="clr"><input type="color" value="${a[l.key]}"><span>${l.label}</span></label>`);i.querySelector("input").addEventListener("input",s=>{b=T(b,g,l.key,s.target.value.toUpperCase())}),t.append(i)}h.append(t),h.append(m('<div class="credit">Shader, presets, states and audio mapping: <a href="https://github.com/LerSent001/orb" target="_blank" rel="noopener">LerSent001/orb</a> \xB7 MIT \xA9 2026 LerSent001. Bench and page: Mind Studio. Audio is analysed locally and never uploaded.</div>'))}G();be.addEventListener("pointerdown",()=>{g=g==="idle"?"thinking":"idle",G()});function Ye(e){if(A)return P.read(e);if(!j)return D();$+=e;let o=P.gain/.7,r=Math.max(0,Math.sin($*1.7)*.5+.3+.2*Math.sin($*5.3))*.55*o;return{low:r*.8,mid:r,high:r*.5,all:r}}fe({canvas:be,getTarget:()=>({state:g,params:Y(),activationDuration:b.activationDuration,transitionDuration:b.transitionDuration}),getAudioBands:Ye,onError:e=>{ge.classList.add("fail"),z.textContent="WebGPU is not available in this browser ("+e.message+"). Chrome 113+, Edge, Safari 26 or Firefox 141+ can render it."},onReady:()=>{ge.classList.add("ready")}});
