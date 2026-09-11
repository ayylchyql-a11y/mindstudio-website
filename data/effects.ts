import type { Localized } from "@/lib/i18n";

/**
 * Lab = 设计效果库。
 *
 * 每条 effect 对应一个**自包含的 HTML 文件** `public/effects/<slug>.html`，
 * 页面上用 <iframe> 加载。为什么必须是 iframe 而不是直接渲染进页面：
 * 本站没有 Tailwind、全局选择器很多（`* {}`、裸 `a {}`、裸 `footer {}`…），
 * 从别处扒来的效果代码一旦进主文档，两边会互相污染，而且是**一边好一边坏**
 * 那种难查的污染。iframe 给每条效果一个干净的文档，代价只是一次 HTTP 请求。
 *
 * 🩸 **代码不写在这个文件里**：详情页展示的源码是构建时从
 *    `public/effects/<slug>.html` 读出来的（见 `lib/effect-source.ts`）。
 *    在这里再抄一份 = 两处真相，改了 demo 忘了改展示，页面上给的代码就是错的。
 */

export type CategoryId = "web-effects" | "creative";

export interface Category {
  id: CategoryId;
  title: Localized;
  /** 分类页的引子，也进 <meta description> */
  intro: Localized;
  /** 分类的强调色，用在标题的圆点与卡片底 */
  accent: string;
}

/**
 * 分类是**固定的一小撮**，不是每来一条效果就加一个。
 * 分不进去的说明这个分类体系需要调整，不是需要第六个分类。
 */
export const categories: Category[] = [
  {
    id: "web-effects",
    title: {
      en: "Web design effects",
      zh: "网页设计特效",
      "zh-tw": "網頁設計特效",
      ja: "Web デザインエフェクト",
      ko: "웹 디자인 이펙트",
      it: "Effetti web",
    },
    intro: {
      en: "Interface effects pulled apart and rebuilt: what each one is made of, the exact numbers, and a prompt that reproduces it. Scroll-driven transitions, pointer-driven materials, type that arrives one glyph at a time.",
      zh: "把网页界面的特效拆开重做一遍：它由什么构成、精确到多少的数值、以及一句能把它复现出来的提示词。滚动驱动的转场、跟着指针走的材质、一个字一个字进场的标题。",
      "zh-tw": "把網頁介面的特效拆開重做一遍：它由什麼構成、精確到多少的數值、以及一句能把它複現出來的提示詞。捲動驅動的轉場、跟著指標走的材質、一個字一個字進場的標題。",
    },
    accent: "#2f6fff",
  },
  {
    id: "creative",
    title: {
      en: "Creative work",
      zh: "创意设计",
      "zh-tw": "創意設計",
      ja: "クリエイティブ",
      ko: "크리에이티브",
      it: "Lavori creativi",
    },
    intro: {
      en: "Finished pieces rather than parts \u2014 visual work you can just look at. Each one still carries the same three things as next door: what it is made of, the exact numbers, and a prompt that rebuilds it.",
      zh: "\u8fd9\u91cc\u653e\u7684\u662f\u6210\u54c1\u800c\u4e0d\u662f\u96f6\u4ef6\u2014\u2014\u505a\u5b8c\u5c31\u80fd\u76f4\u63a5\u770b\u7684\u89c6\u89c9\u4f5c\u54c1\u3002\u4f46\u548c\u9694\u58c1\u4e00\u6837\uff0c\u6bcf\u4e00\u4ef6\u4ecd\u7136\u5199\u6e05\u695a\u5b83\u7531\u4ec0\u4e48\u6784\u6210\u3001\u7cbe\u786e\u5230\u591a\u5c11\u7684\u6570\u503c\u3001\u4ee5\u53ca\u4e00\u53e5\u80fd\u628a\u5b83\u91cd\u505a\u4e00\u904d\u7684\u63d0\u793a\u8bcd\u3002",
      "zh-tw": "\u9019\u88e1\u653e\u7684\u662f\u6210\u54c1\u800c\u4e0d\u662f\u96f6\u4ef6\u2014\u2014\u505a\u5b8c\u5c31\u80fd\u76f4\u63a5\u770b\u7684\u8996\u89ba\u4f5c\u54c1\u3002\u4f46\u548c\u9694\u58c1\u4e00\u6a23\uff0c\u6bcf\u4e00\u4ef6\u4ecd\u7136\u5beb\u6e05\u695a\u5b83\u7531\u4ec0\u9ebc\u69cb\u6210\u3001\u7cbe\u78ba\u5230\u591a\u5c11\u7684\u6578\u503c\u3001\u4ee5\u53ca\u4e00\u53e5\u80fd\u628a\u5b83\u91cd\u505a\u4e00\u904d\u7684\u63d0\u793a\u8a5e\u3002",
    },
    accent: "#c9922e",
  },
];

export interface Effect {
  slug: string;
  category: CategoryId;
  /** ISO date，进 sitemap 的 lastModified */
  date: string;
  title: Localized;
  /** 一句话说清这效果解决什么问题。列表卡片 + <meta description> 都用它。 */
  gist: Localized;
  /** demo iframe 的高度(px)。样板自身不该出现滚动条，超了就调这里。 */
  height: number;
  /**
   * 这条效果**要人做什么它才动**。总览页的轮播预览靠它决定顺序和提示：
   * `self` 一加载就自己演（自演的排最前，落地时卡片是活的）；
   * `hover` / `scroll` 在小预览里是静止画面 —— 底栏标出来，
   * 否则看着像效果坏了。
   * 🩸这个字段是**量出来的**，不是拍脑袋填的：14 条里只有 3 条 self。
   * `click` 是 09-11 那批加的：沉浸式漂浮那条要点一下才落球。
   */
  plays: "self" | "hover" | "scroll" | "click";
  /** 卡片占位底与详情页点缀色。取效果本身的主色，不是分类色。 */
  accent: string;
  /**
   * 成品作品不是单文件 demo —— 它带着自己的资源目录
   * （`public/effects/<slug>/index.html` + assets）。
   * 置 true 时 demo 路径改指目录，详情页**也不再贴源码**：
   * 那是个 1MB 的打包产物，贴出来对读的人没有任何意义，
   * 该讲的是怎么做出来的（anatomy / tokens / prompt）。
   */
  bundleDir?: true;
  /**
   * 总览页轮播用的静态海报（`/effects/<slug>/poster.jpg`）。
   * 🩸重的作品必须给它：轮播是一进 /lab 就自动播的，
   * 没有海报就等于让每个访客先下载几 MB 才看到第一屏。
   */
  poster?: string;
  /** 怎么做到的 —— 按「读的人要照着写一遍」的粒度写，允许 <code>。英文。 */
  anatomy: string[];
  /** 可以直接抄走的数值。左边是参数名，右边是值。 */
  tokens: { label: string; value: string }[];
  /**
   * ⭐ 给 AI 的提示词 —— 这个库真正值钱的字段。
   * 写死具体数值(600ms / cubic-bezier / blur(80px))，
   * 绝不写「丝滑」「现代感」这种词：那样每次生成出来的都不一样。
   */
  prompt: string;
  /** 什么情况下会不生效、会退化成什么样。没有就别硬凑。 */
  caveats?: string[];
  /** 出处。从别人视频里扒来的一定要填，这是能挂出去的前提。 */
  source?: { label: string; url?: string; at?: string };
}

export const effects: Effect[] = [
  {
    slug: "holo-card",
    category: "creative",
    date: "2026-09-08",
    plays: "self",
    bundleDir: true,
    poster: "/effects/holo-card/poster.jpg",
    title: {
      en: "Holographic card",
      zh: "全息闪卡",
      "zh-tw": "全息閃卡",
    },
    gist: {
      en: "A collectible card you can turn in your hands: four registered layers slide against each other for depth, and a foil spectrum whose phase follows the viewing angle rather than a clock.",
      zh: "一张可以拿在手里转的收藏卡：四层图相互错位做出景深，箔面的光谱跟着视角走而不是跟着时间走。",
      "zh-tw": "一張可以拿在手裡轉的收藏卡：四層圖相互錯位做出景深，箔面的光譜跟著視角走而不是跟著時間走。",
    },
    height: 760,
    accent: "#c9922e",
    anatomy: [
      "Four layers registered on <b>one 1024\u00d71536 canvas</b> \u2014 subject (real alpha), background, line art, typography. Everything downstream samples all four with the same UV, so a one-pixel misalignment shows up as a coloured fringe the moment the card tilts.",
      "The subject is cut with the operating system\u2019s own subject-lift (<code>VNGenerateForegroundInstanceMaskRequest</code>), not a colour key \u2014 it keeps hair, a spear tip and the soft edge of a flowing cape. <b>No image model is involved in the cut-out</b>, only in generating the artwork.",
      "Parallax is not UV-centering. The viewing direction is transformed <i>into the card plane</i>, divided by a bounded normal component, then the UV is offset by signed depth. Subject <b>+0.28</b>, background <b>\u22120.20</b> \u2014 the opposite signs are what make it read as depth instead of the whole picture sliding.",
      "Foil is mapped bands (scale 0.55, distortion 7, mapping Y 32\u00b0) pushed through a pink\u2192yellow\u2192blue\u2192white ramp in Overlay. <b>The spectrum phase is driven by viewing angle, not by time</b> \u2014 that single choice is the difference between a foil and a shimmer.",
      "Every BSDF is <code>Metallic=1, Roughness=1</code>. Bronze, gold and armour come alive; flat unsaturated areas go grey. Pick artwork that has metal in it \u2014 the material is doing the work, not a filter.",
    ],
    tokens: [
      { label: "canvas", value: "1024 \u00d7 1536 (2:3)" },
      { label: "subjectScale", value: "1.25" },
      { label: "subjectDepth", value: "0.28" },
      { label: "backgroundDepth", value: "\u22120.20" },
      { label: "foil", value: "0.65" },
      { label: "safeArea", value: "scale 1.12, offset (\u22120.06, \u22120.085)" },
      { label: "subject height", value: "65% of card" },
      { label: "line-art ink", value: "under 4% of the subject" },
    ],
    prompt:
      "Build a holographic collectible card that reacts to being turned. Two halves: the artwork prep, and the shader that is the actual look. The shader is what ships — Blender is only used to author the .blend and a still.\n\nSTAGE 1 — ARTWORK\nGenerate 2:3 portrait, 1024x1536: one hero subject, strong readable silhouette, bronze/metal surfaces (the material is metallic — flat unsaturated colour goes grey), dark stormy background with a single bright light source. Landscape art forces a ~2x upscale, so ask for portrait up front.\n\nSTAGE 2 — FOUR REGISTERED LAYERS, one 1024x1536 canvas, pixel-aligned\nsubject.png  cut with real alpha (macOS Vision VNGenerateForegroundInstanceMaskRequest, not a colour key). Scale so the subject is 65% of card height; place its top at y=300 and its base near y=1300, i.e. between the two rules.\nbackground.jpg  ERASE THE SUBJECT FIRST (fill its mask with a 55px-blur copy of the scene), then blur 28px, brightness x0.88, saturation x1.15. Do not crush it darker: at x0.38 the layer disappears and the whole background parallax does nothing.\nlineart.png  difference-of-Gaussians, sigma 1.2 and 3.0, difference x14, values above 170 pushed to pure white, everything outside the subject mask forced white. Keep ink under 4%.\ntext.png  typography on transparent; title 88px at y=87, subtitle 25px at y=49, technique 69px centred at y=1346, rules at y=245 and y=1280.\n\nSTAGE 3 — GEOMETRY\nRounded rectangle 6.3 x 9.45 units, corner radius 0.20, thickness 0.045; UV = co/size + 0.5. A separate edge ring of width 0.060 and an inner gold ring 6.13 x 9.28 of width 0.018. Text plane at zero depth, 0.014 in front.\n\nSTAGE 4 — FRONT SHADER (this is the effect)\nvarying vUv = vec2(uv.x, 1.0 - uv.y);\nuniforms: uView (camera direction transformed INTO card space), uScale 1.25, uDepth 0.28, uBgDepth -0.20, uFoil 0.65, uFit, uTime.\n\nparallax(uv, depth) = uv + uView.xy / max(abs(uView.z), 0.4) * depth * 0.10\n  The clamp at 0.4 is what stops the UV exploding at grazing angles.\nsu = (parallax(uv, uDepth) - 0.5) * uScale / uFit + 0.5\nbu = parallax(uv, uBgDepth)\ncol = mix(background(bu), subject(su).rgb, subject(su).a)\n  Opposite depth signs are what make it read as depth instead of the whole picture sliding.\n\nfoil:\nphase    = uv.x*0.85 + uv.y*0.55 + uView.x*1.5 - uView.y*0.9\nspectrum = 0.66 + 0.25*cos(6.28318*(phase + vec3(0.0, 0.33, 0.67)))\nband     = pow(0.5 + 0.5*sin((uv.x*0.72 + uv.y*0.45 + uView.x*1.2 + uView.y*0.6)*6.283), 10.0)\n  phase and band both take uView, never uTime — that is the whole difference between a foil and a shimmer.\n\ncol *= 1.0 - uFoil*0.21*(1.0-spectrum)*(0.2 + band*0.8)\ncol += spectrum*uFoil*band*(0.065 + 0.11*(1.0 - luminance(col)))\nedge = 1.0 - smoothstep(0.015, 0.06, min(min(uv.x,1.0-uv.x), min(uv.y,1.0-uv.y)))\ncol  = mix(col, spectrum*0.75 + 0.21, edge*uFoil*0.3)\ncell = floor(uv*vec2(480.0,720.0))\nflake = step(0.994, hash(cell)) * pow(0.5+0.5*sin(hash(cell+8.0)*30.0 + uView.x*20.0 + uTime*0.6), 10.0)\ncol += spectrum*flake*uFoil*0.13\nline = 1.0 - smoothstep(0.06, 0.25, lineart(su).r)\ncol += line*subject(su).a*band*uFoil*0.055\ncol  = mix(col, text(uv).rgb, text(uv).a)\ngl_FragColor = vec4(pow(clamp(col,0.0,1.0), vec3(2.2)), 1.0)\n\nSTAGE 5 — EDGE SHADER AND INTERACTION\nedge colour = mix(vec3(0.66,0.69,0.67), spectrum*0.6 + 0.35, uFoil*0.7)\nDrag rotates the card; recompute uView every frame in card-local space and TEST BOTH DIRECTIONS — if uView.x does not change sign between a left and a right drag, the parallax is fake.",
    caveats: [
      "Landscape source art has to be upscaled about 2\u00d7 to fill a 2:3 card. Illustration survives that; a photograph does not.",
      "A still render freezes the foil band at one angle \u2014 it can sit right across a dark area and read as a grey wash. <b>Judge colour on the interactive version at several angles, never on the still.</b>",
      "<code>Metallic=1</code> means dark, unsaturated regions reflect their surroundings and drift toward grey. That is the material working as intended, not a bug.",
      "Needs WebGL2. Model plus textures are about 2\u202fMB, so this one loads from a poster instead of auto-playing in the overview carousel.",
    ],
    source: {
      label: "Viewer built on RuiC-card-skill by HRuiCcc \u00b7 MIT",
      url: "https://github.com/HRuiCcc/RuiC-card-skill",
    },
  },
  {
    slug: "hover-door-bloom",
    category: "web-effects",
    date: "2026-09-11",
    plays: "hover",
    title: { en: "Hover-triggered door bloom", zh: "悬停触发的车门绽放", "zh-tw": "懸停觸發的車門綻放" },
    gist: {
      en: "Hover the car and the door swings open with flowers pouring out; leave and it all rewinds from wherever it got to. One clock that runs both ways.",
      zh: "指针停在车上，车门打开、花从车里涌出来；指针一离开，整段从当前位置倒着放回去。一个能正走也能倒走的时钟。",
      "zh-tw": "指標停在車上，車門打開、花從車裡湧出來；指標一離開，整段從當前位置倒著放回去。一個能正走也能倒走的時鐘。",
    },
    height: 400,
    accent: "#b8174a",
    anatomy: [
      "The original is a rendered clip: <code>video.play()</code> on <code>pointerenter</code>, <code>playbackRate = -1</code> on <code>pointerleave</code>. The property that matters is that leaving mid-way <b>rewinds from where it is</b> — it never snaps to frame 0. Frame-diffing the source shows the door part-way closed at 0.8s, re-opening at 1.0s: the clip reverses and resumes from the same spot.",
      "This sample has no clip, so it keeps one number <code>t</code> in 0…1 and moves it at ±1/1500 per ms in a <code>requestAnimationFrame</code> loop. Hover sets the direction to +1, leaving sets it to −1; the loop stops when <code>t</code> hits either end. With a real asset the whole integration is <code>video.currentTime = t * video.duration</code>.",
      "Every part reads its own <b>slice</b> of the clock: door 0–0.45, bonnet 0.08–0.55, and each bloom a private window inside 0.30–1. So the sequence — door first, bonnet a beat behind, flowers spilling one after another — is data, not a chain of callbacks.",
      "The door is an HTML element, not an SVG group: Safari ignores 3D transforms on SVG children, and a door swing is <code>rotateY(-56deg)</code> around <code>transform-origin: 100% 50%</code> (the hinge edge) under a 640px perspective on the car. The cabin interior is painted <b>over</b> the body in the SVG and hidden by the closed door.",
      "JS writes only custom properties: <code>--door</code>, <code>--hood</code>, and one <code>--k</code> per bloom. The transforms stay in CSS (<code>translate(calc(var(--dx) * var(--k)))</code> …), so the blooms' directions and sizes are declared per element and the script never touches a transform string.",
      "Blooms use an ease-out-back on arrival — they overshoot by 1.7 and settle — because petals that stop dead read as icons scaling in. The door uses a plain cubic ease-out: hinges do not overshoot.",
      "Hover only exists on a fine pointer. On touch the same element toggles the clock on tap, and the hint changes to say so.",
    ],
    tokens: [
      { label: "Clock", value: "1500ms forward · same speed reversed" },
      { label: "Door", value: "rotateY −56° · slice 0–0.45 · ease-out cubic" },
      { label: "Bonnet", value: "rotate −16° (2D, hinge at rear edge) · slice 0.08–0.55" },
      { label: "Blooms", value: "13 · windows inside 0.30–1 · ease-out back (c = 1.70158)" },
      { label: "Perspective", value: "640px on the car, origin 50% 40%" },
      { label: "Reverse", value: "from current t, never from 0" },
    ],
    prompt:
      "Build a hover-triggered 'door bloom' hero in vanilla HTML/CSS/JS. A pale studio background, a serif magenta headline, and a side-view car built from inline SVG. Make the car door a separate absolutely-positioned HTML div containing its own SVG piece, with transform-origin: 100% 50% and transform: rotateY(calc(var(--door) * -56deg)), inside a parent with perspective: 640px; SVG children cannot take 3D transforms in Safari. Paint the cabin interior in the body SVG on top of the body so the open door reveals it. Implement ONE progress clock t in 0..1 advanced in requestAnimationFrame at ±1/1500 per millisecond: pointerenter on the car sets direction +1, pointerleave sets −1, and the loop stops at either end — leaving mid-way MUST rewind from the current t, never jump to 0. Each animated part reads a slice of t: door slice(t, 0, .45) with ease-out cubic; bonnet slice(t, .08, .55) rotating −16° about its rear edge; 13 blooms (circles with radial gradients and rotated leaf shapes) each with a private window inside 0.30..1 and an ease-out-back curve (c = 1.70158). JS writes only custom properties (--door, --hood, one --k per bloom); the transforms live in CSS as translate(calc(var(--dx) * var(--k))) scale(calc(var(--s) * var(--k))). Give the door a drop-shadow that grows with its angle. On a coarse pointer (no hover), toggle the clock on tap instead. Under prefers-reduced-motion jump straight to the end state.",
    caveats: [
      "A real <code>&lt;video&gt;</code> only reverses cleanly if its keyframe interval is short (encode with a keyframe every 5–10 frames). <code>playbackRate = -1</code> on a normally-encoded clip stutters, and Safari ignores negative rates for some codecs entirely — a canvas frame sequence driven by the same clock is the reliable path.",
      "The hover target must be the <b>resting</b> car, not the animated parts: a bloom that scales out past the pointer and then shrinks back under it fires enter/leave in a loop. Here the blooms have <code>pointer-events: none</code>.",
      "The stylised car is illustration, not the rendered asset in the source. The point of the sample is the reversible clock and the slicing; swap the SVG for a clip or frame sequence and nothing else changes.",
    ],
    source: { label: "@优卓UX上岸社 (Douyin) · 「动效描述」第 3 集 · Art.Car", at: "0:00" },
  },
  {
    slug: "hover-tinted-service-list",
    category: "web-effects",
    date: "2026-09-11",
    plays: "hover",
    title: { en: "Hover-tinted service list", zh: "悬停换色的服务清单", "zh-tw": "懸停換色的服務清單" },
    gist: {
      en: "A list where every row owns a colour: hover one and the whole section repaints to it, the row steps forward, and the price, blurb and preview card follow.",
      zh: "每一行自带一个颜色：指针停在哪行，整块区域就染成哪行的色，那一行往前站一步，右边的价格、说明和预览卡跟着换。",
      "zh-tw": "每一行自帶一個顏色：指標停在哪行，整塊區域就染成哪行的色，那一行往前站一步，右邊的價格、說明和預覽卡跟著換。",
    },
    height: 400,
    accent: "#4c3ff2",
    anatomy: [
      "The section's background is a single custom property, <code>--tint</code>, with <code>transition: background-color 600ms</code>. A row hover writes that one property and nothing else on the page knows colour exists. Frame-diffing the source: blue → red → orange → green → teal, one full repaint per row crossing.",
      "Rows rest at <code>opacity: .42</code>; the active one goes to 1 and steps 6px to the right. The step is the part people feel — a colour change alone reads as the page doing something, the translate reads as <i>this row</i> doing it.",
      "Listen on <code>pointerenter</code> per row, not <code>pointermove</code>: one event per row crossing instead of one per pixel, and no work at all while the pointer sits still.",
      "The right column does not morph. Price and blurb fade <b>out</b> (220ms, 4px down), get replaced, then fade back in. A single cross-fade shows half of one price on top of half of another, which is unreadable for the whole 220ms.",
      "The preview card leans 4° in the direction the pointer travelled (down the list = clockwise) and settles over 500ms. It is set with a custom property and reset 60ms later, so the settle is a CSS transition, not a keyframe.",
      "The active row is kept on leave. The section never returns to a 'no selection' state — it lands on row 1 at load so the right column is never empty.",
      "Rows are focusable and <code>focus</code> drives the same <code>select()</code>: keyboard users get the whole effect, including the repaint.",
    ],
    tokens: [
      { label: "Section repaint", value: "600ms cubic-bezier(.22,.61,.36,1)" },
      { label: "Row rest / active", value: "opacity .42 → 1 · translateX 6px · 300ms" },
      { label: "Text swap", value: "out 220ms → replace → in 220ms" },
      { label: "Card lean", value: "±4° · settle 500ms" },
      { label: "Trigger", value: "pointerenter + focus, per row" },
    ],
    prompt:
      "Build a hover-tinted service list in vanilla HTML/CSS/JS. The page body declares --tint and uses it as background-color with transition: background-color 600ms cubic-bezier(.22,.61,.36,1). Left column: 8 rows (serif, 21px) each with a category label and a duration; rows rest at opacity .42, the active row is opacity 1 and translateX(6px), both transitioned 300ms. Each row has its own colour, price, blurb and gradient artwork in a data array. On pointerenter (not pointermove) and on focus, call select(i): write the row's colour into --tint on the body, toggle an 'on' class so only that row is active, and update the right column. Right column: a 30px serif price, a 7.5px blurb, a white 'Book Service' button, and a 132×96 white preview card whose inner area shows the row's gradient. Swap the price and blurb by adding a class that fades them out (opacity 0, translateY 4px, 220ms), replacing the text after 220ms, then removing the class; never cross-fade in place. Lean the card ±4° in the direction of travel via a custom property and reset it 60ms later so it settles over a 500ms transition. Keep the last hovered row active on pointer leave and select row 1 at load. Make rows focusable (tabindex 0). Under prefers-reduced-motion drop every transition.",
    caveats: [
      "Transitioning <code>background-color</code> on the <b>body</b> repaints the whole viewport for 600ms. Fine for a section; on a page with a big fixed backdrop-filter or heavy shadows it will show as jank — scope the tint to the section element instead.",
      "Eight saturated tints and dark text: check contrast for every one. #e0a12a (the amber row) is the borderline case here at 21px serif; below ~18px it would fail.",
      "Row hover on a list this dense means the tint changes on every pass of the pointer across it, which is a lot of colour when someone is just moving to the right column. A 60–80ms enter delay before committing the select is the usual fix on a real page; the sample leaves it instant so the mechanism is visible.",
    ],
    source: { label: "@优卓UX上岸社 (Douyin) · 「动效描述」第 3 集 · Art.Car services", at: "0:04" },
  },
  {
    slug: "scroll-vortex-transit",
    category: "web-effects",
    date: "2026-09-11",
    plays: "scroll",
    title: { en: "Scroll-driven vortex transit", zh: "滚动驱动的漩涡穿隧", "zh-tw": "捲動驅動的漩渦穿隧" },
    gist: {
      en: "Scroll pushes the camera into a cloud tunnel: the hero fades, the bands balloon past the edges, the dark eye grows until it fills the frame, and the next chapter is what is on the other side.",
      zh: "滚动把镜头推进一条云隧道：首屏标题淡出，云带从画面边缘胀出去，中央的黑洞越长越大直到占满整屏，下一章就在洞的另一头。",
      "zh-tw": "捲動把鏡頭推進一條雲隧道：首屏標題淡出，雲帶從畫面邊緣脹出去，中央的黑洞越長越大直到佔滿整屏，下一章就在洞的另一頭。",
    },
    height: 400,
    accent: "#7692bc",
    anatomy: [
      "Same skeleton as every scroll-driven piece here: a 420%-tall track, a sticky <code>100vh</code> stage, progress read from layout every time (<code>scrollTop / (trackHeight − viewport)</code>), never accumulated from wheel deltas.",
      "The source is a rendered clip scrubbed by scroll. The sample is procedural so the file stays self-contained: 42 rings stacked in depth, each a handful of arcs whose start, length, width and tint are decided <b>once</b> at load. Scroll moves the camera forward by up to 6 ring-depths; the projection <code>radius = focal / depth</code> is the entire tunnel illusion — near rings balloon past the frame, far ones crowd into the eye.",
      "🩸 Rings must be painted <b>far → near, sorted by depth after the camera offset</b>. Index order is not depth order once the modulo wraps; painting in index order puts a far ring on top of a near one for a few frames every time the camera passes a ring boundary, which reads as a flicker with no obvious cause.",
      "Bands are three concentric strokes (widths 1 / 0.62 / 0.3, alphas 0.22 / 0.3 / 0.42) rather than one — a single hard stroke reads as a machined ring, and clouds have no edge. Ring centres also wander on a slow sine with depth so the tunnel bends instead of drilling straight.",
      "Near bands thin out as their radius approaches the frame diagonal (alpha × (1 − 0.95·k)). Without that, every ring the camera passes through paints a near-vertical arc at the screen edge for a moment, and the edges strobe.",
      "The eye is a radial gradient whose radius grows with <code>eye²</code> over progress 0.62–0.9 — quadratic so it lingers small and then swallows the frame. The hero drifts up 40px and fades over 0–0.3; the next chapter fades in over 0.86–1 with its labels rising 14px, so the two never share the screen.",
      "A very slow idle spin (0.00004 rad/ms) keeps the picture alive while the reader is not scrolling, and is disabled under reduced motion — where the sample only repaints on scroll.",
    ],
    tokens: [
      { label: "Scroll distance", value: "420% of the viewport" },
      { label: "Rings · arcs", value: "42 · 9 per ring" },
      { label: "Camera travel", value: "6 ring-depths, smoothstep over 0.08–0.86" },
      { label: "Projection", value: "r = 0.58·min(W,H) / (0.25 + 0.22·z)" },
      { label: "Eye", value: "grows with eye² over 0.62–0.9" },
      { label: "Hero out / chapter in", value: "0–0.3 · 0.86–1" },
    ],
    prompt:
      "Build a scroll-driven vortex transit in vanilla HTML/CSS/JS. A scroll container with a 420%-tall track and a sticky stage (height: 100vh, never 100%) holding a full-size canvas; derive progress p from layout every time (scrollTop / (trackHeight - clientHeight)), never accumulate wheel deltas, and register the scroll listener passive. On the canvas draw a procedural cloud tunnel: 42 rings, each with 9 arcs whose start angle, arc length (0.8-3.0 rad), width factor, tint (72% steel blue rgb(118,146,188), 28% dust rgb(196,140,84)) and alpha are generated once from a seeded PRNG. The camera moves forward cam = smoothstep(slice(p, .08, .86)) * 6 ring-depths; each ring's depth is z = ((i - cam) mod 42), depth = 0.25 + 0.22 z, radius = 0.58 * min(W,H) / depth. Sort rings by z descending BEFORE painting (index order is not depth order after the modulo). Offset ring centres by sin(0.42 z + .6) * 10% and cos(0.37 z) * 7% of the focal length so the tunnel bends. Draw each arc as three concentric round-capped strokes (width 1 / .62 / .3 of 0.17·r·w, alpha .22 / .3 / .42 of the band alpha), fade far rings by (1 - z/42), and fade near rings to 5% as their radius approaches 0.75 of the frame diagonal; skip rings beyond that. Rotate arcs by 0.475 z + 0.11 i plus a 0.00004 rad/ms idle drift. Paint a black radial 'eye' at the centre whose radius grows with eye² where eye = slice(p, .62, .9), plus a vignette. Overlay an HTML hero (nav, eyebrow, three-part serif headline, lede) that translates up 40px and fades over p 0-0.3, and a next chapter (six scattered uppercase labels + a serif headline) that fades in over p 0.86-1 with labels rising 14px. Back the canvas at min(devicePixelRatio, 2). Under prefers-reduced-motion disable the idle drift and repaint only on scroll.",
    caveats: [
      "This is a stand-in for a rendered clip, not a recreation of one. The mechanism (sticky stage, layout-derived progress, depth-sorted projection, hero out / chapter in) is what transfers; with a real asset replace the ring loop with <code>video.currentTime = p * duration</code> and keep everything else.",
      "~1100 arcs × 3 strokes per frame is fine at 760×400, and fine at 1440×900 on a laptop. On a 4K canvas at DPR 2 it is not; cap the backing store at DPR 2 (done here) and consider dropping the ring count on large stages.",
      "The eye is opaque black by 0.9, so the next chapter must sit on the same black — a lighter chapter background would flash through the eye's soft edge.",
    ],
    source: { label: "@优卓UX上岸社 (Douyin) · 「动效描述」第 3 集 · Void Atlas", at: "0:06" },
  },
  {
    slug: "click-drop-overgrowth",
    category: "web-effects",
    date: "2026-09-11",
    plays: "click",
    title: { en: "Immersive float: drop and overgrow", zh: "沉浸式漂浮：落球与蔓生", "zh-tw": "沉浸式漂浮：落球與蔓生" },
    gist: {
      en: "A glowing sphere floats above a soft shape. Click and it drops, lands with a squash, and from the point of impact a dark fur creeps over the surface with sparks and small flowers riding the front.",
      zh: "一颗发光球悬在一段柔软的形体上方。点一下它就落下、砸出一记压扁，然后从接触点开始，一层深色绒毛沿着表面蔓延开来，火星和小花跟在蔓延的前沿上。",
      "zh-tw": "一顆發光球懸在一段柔軟的形體上方。點一下它就落下、砸出一記壓扁，然後從接觸點開始，一層深色絨毛沿著表面蔓延開來，火星和小花跟在蔓延的前沿上。",
    },
    height: 400,
    accent: "#ff9a4a",
    anatomy: [
      "Three phases in one state machine: <b>float</b> (a 900ms sine bob), <b>drop</b> (gravity 3.2 heights/s², integrated per frame), <b>settle</b> (a squash that decays at 4.5/s, and the growth clock starts). The click only flips float → drop; everything after is physics and time.",
      "The 'limb' is one cubic Bézier stroked 28% of the height wide with round caps. Its shading is three more strokes of the same path — a shadow band offset down, the body, two highlight bands offset up-left at 55% and 85% alpha. A tube lit from the top-left is just a light band offset from a dark band.",
      "The landing point is computed, not hard-coded: the curve is sampled 360 times, the sample nearest the sphere's x is found, and the contact is that point minus half the tube width. Change the curve and the sphere still lands on it.",
      "<b>The overgrowth is a clip.</b> The same tube is drawn again in dark colours, 6% wider, inside <code>ctx.clip()</code> of a circle centred on the contact point whose radius grows at 0.30 heights per second from the moment of impact. Speckles (3 per sample, inside the silhouette) give the fur its texture; they are pre-generated and only ever drawn inside the clip.",
      "Fibres are fixed points on the silhouette (both sides, 65% kept) with a length and tilt decided at load. A fibre inside the front draws at full length; within 12% of the height of the front it draws at partial length — so the front is where things are still growing, not a hard line. 5% of fibres carry a three-dot flower that pops once the fibre is 60% grown.",
      "Spores lift off only from fibres in the partially-grown band (6% chance per fibre per frame), drift up at 12–34 px/s and fade over 1.2–2.8s. Two colours, orange and lilac, to match the source frames.",
      "Second click resets everything; under reduced motion the click jumps straight to the fully overgrown state with no spores.",
    ],
    tokens: [
      { label: "Gravity", value: "3.2 × height / s²" },
      { label: "Squash on impact", value: "scaleX 1.14 · scaleY 0.8 · decays at 4.5/s" },
      { label: "Growth front", value: "0.30 × height / s from the contact point" },
      { label: "Front softness", value: "fibres grow over the last 12% of height" },
      { label: "Fibres · speckles", value: "~470 · ~1080, generated once" },
      { label: "Spores", value: "1.2–2.8s life · 12–34 px/s upward" },
    ],
    prompt:
      "Build a click-to-drop overgrowth scene on a single full-size canvas in vanilla JS. Backdrop: vertical gradient #2b2064 → #0f0a2a with a violet radial haze. Draw a 'limb': one cubic Bézier (control points as fractions of width/height) stroked with round caps at a width of 0.28 × height, shaded with three extra strokes of the same path (a dark band offset down 10% of the width, then highlight bands offset up-left at 58% and 26% of the width, 55% and 85% alpha). Sample the curve 360 times with unit normals. An orange sphere (radius 0.105 × height, radial gradient #fff1dc → #ffb166 → #e2672a, plus a wide orange glow) floats at 16% of the height with a 900ms sine bob. On pointerdown switch to a drop phase: integrate vy += 3.2 × height × dt, y += vy × dt, and land when the sphere reaches the tube's top surface directly under it (find the nearest sample by x, subtract half the tube width). On impact set squash = 1 and decay it at 4.5 per second, applying scale(1 + .14 squash, 1 − .2 squash) about the contact point; start a growth clock. Every frame after impact, ctx.clip() to a circle at the contact point with radius = elapsed × 0.30 × height and redraw the tube inside it 6% wider in #1a1030 / #2a1a44 / #0b0618, plus ~1000 pre-generated speckles inside the silhouette. Draw pre-generated fibres rooted on both sides of the silhouette (length 1.2–4.7% of height, random tilt) only when their distance to the contact point is inside the radius, scaling their length by min(1, (radius − d) / (0.12 × height)); 5% of fibres grow a three-dot orange flower once 60% grown. From fibres less than half grown, spawn spores at 6% per frame that rise 12–34 px/s and fade over 1.2–2.8 s, coloured #ffb066 or #d9c9ff. A second click resets. Under prefers-reduced-motion the click jumps to the fully grown state with no spores. Overlay an HTML headline at the bottom: an italic serif eyebrow and two 42px uppercase serif words at the left and right edges.",
    caveats: [
      "The growth is radial from the contact point, which is right for one blob. Along a long thin shape it would reach the far end at the same moment it reaches the near end of the next bend; a real build measures distance <b>along the curve</b> (the sample index) instead of Euclidean distance.",
      "Everything is redrawn every frame, including the pre-generated speckles once the clip is open. At 760×400 that is trivial; on a full-viewport hero at DPR 2 with more speckles, move the fur to an offscreen canvas rendered once and only redraw the clip.",
      "The 'click anywhere' affordance is a hint label, not a control. Keyboard users have no way in — add a real button that calls the same handler on a production page.",
    ],
    source: { label: "@优卓UX上岸社 (Douyin) · 「动效描述」第 3 集 · Visions So", at: "0:12" },
  },
  {
    slug: "scroll-helix-flythrough",
    category: "web-effects",
    date: "2026-09-11",
    plays: "scroll",
    title: { en: "Scroll-driven helix flow", zh: "滚动驱动的旋流光", "zh-tw": "捲動驅動的旋流光" },
    gist: {
      en: "Scroll is one continuous dolly along a glowing double helix. The camera passes through three stations — wide, close enough to see single rungs, wide again from the other side — and the copy swaps at each.",
      zh: "滚动是沿着一条发光双螺旋的一次连续推轨。镜头经过三个站位 —— 远景、近到能看清单根横档、再从另一侧回到远景 —— 每到一站换一段文案。",
      "zh-tw": "捲動是沿著一條發光雙螺旋的一次連續推軌。鏡頭經過三個站位 —— 遠景、近到能看清單根橫檔、再從另一側回到遠景 —— 每到一站換一段文案。",
    },
    height: 400,
    accent: "#ff8c28",
    anatomy: [
      "The helix is geometry, not a picture: two strands winding around the x-axis (radius 78, one turn per 340 units, a point every 9), and a rung every 34 units split into two halves that stop 18% short of the axis. That gap is what makes it read as base pairs rather than a ladder.",
      "<b>Scroll is one dolly.</b> The camera's x is <code>p × length</code>, continuously. Yaw, pitch, roll and distance are keyframed at four <i>stations</i> (p = 0, 0.38, 0.72, 1) and smoothstepped between them, so the close-up in the middle is a place the scroll passes through, not a separate scene. Frame-diffing the source: wide → macro on single rungs → wide from a different angle, with the copy block moving corner to corner.",
      "Every strand segment and rung half is projected (translate → yaw → pitch → roll → perspective with focal 1.1 × height), given a depth, and the whole list is sorted far → near before painting. Without the sort, a near rung paints under a far strand the moment the camera turns.",
      "Rungs are three strokes each: a wide 22%-alpha glow, the orange body, and a thin hot core at 32% of the width — no <code>shadowBlur</code>, which would cost more than the whole scene. Strands are a dark body with a thin lighter highlight offset up-left.",
      "Stroke width is <code>base × screenScale</code> (screen scale ≈ 1/depth), so a rung 250 units from the lens is eight times thicker than one at 2000. Fog: alpha = clamp(1.25 − z/1500), far geometry sinks into the black rather than stopping at a draw distance.",
      "Copy blocks are <b>not scrubbed</b>. Each fades over an 8%-wide band of progress and holds in between, so the type is always fully legible or gone. Station 1 is bottom-left, station 2 top-right, station 3 bottom-right, mirroring the source.",
      "Repaint is skipped when progress moved less than 0.0004; the scroll handler only records progress and schedules one <code>requestAnimationFrame</code>.",
    ],
    tokens: [
      { label: "Scroll distance", value: "400% of the viewport" },
      { label: "Helix", value: "radius 78 · 340/turn · rung every 34 · gap 18%" },
      { label: "Stations (p)", value: "0 · 0.38 · 0.72 · 1" },
      { label: "Distance", value: "820 → 250 → 760 → 900" },
      { label: "Focal", value: "1.1 × stage height" },
      { label: "Rung glow", value: "3 strokes: 3.2w @ .22 · 1w · .32w hot core" },
      { label: "Copy bands", value: "out 0.24–0.32 · in 0.32–0.40 / out 0.62–0.70 · in 0.70–0.78" },
    ],
    prompt:
      "Build a scroll-driven helix fly-through in vanilla HTML/CSS/JS. Scroll container with a 400%-tall track and a sticky stage (height: 100vh, never 100%) holding a canvas backed at min(devicePixelRatio, 2). Progress p comes from layout (scrollTop / (trackHeight - clientHeight)), the listener is passive, and the handler only stores p and schedules one requestAnimationFrame. Geometry: two strands along the x-axis from −1400 to 3200, radius 78, one full turn per 340 units, a sample every 9 units; a rung every 34 units split into two halves running from each strand to 18% short of the axis. Camera: x = p × (length − 700) + 350 continuously; yaw / pitch / roll / distance keyframed at four stations {p: 0, yaw .62, pitch .36, dist 820, roll 0}, {.38, 1.05, .10, 250, .5}, {.72, −.45, −.28, 760, −.2}, {1, −.70, −.10, 900, −.35} and interpolated with smoothstep between neighbours. Project every point: translate by −camX, rotate yaw about y, pitch about x, roll about z, add dist to z, discard if z < 40, scale = 1.1 × height / z. Build a list of strand segments and rung halves with their mean depth, sort far → near, then paint: rungs as three round-capped strokes (width 9 × scale × height/400: glow at 3.2× width and rgba(255,110,20,.22), body rgb(255,140,40), hot core at .32× width rgb(255,225,170)), strands as a dark rgb(52,52,60) stroke 13 × scale × height/400 wide with a thin rgb(150,150,165) highlight offset up-left. Multiply every alpha by fog = clamp(1.25 − z/1500, 0, 1). Skip the repaint when |p − lastPainted| < 0.0004. Three HTML copy blocks (headline, blurb, outlined button) at bottom-left, top-right and bottom-right, each with opacity from its own progress band: block 1 = 1 − slice(p, .24, .32); block 2 = slice(p, .32, .40) × (1 − slice(p, .62, .70)); block 3 = slice(p, .70, .78), plus a 12px translateY as they fade. Do not scrub the text with scroll.",
    caveats: [
      "The close station (distance 250) puts geometry within 40 units of the lens at some yaw angles; those segments are culled, which is visible as a rung end vanishing if the station is tuned tighter. Keep the near clip or fade segments out as z → 40.",
      "Segment count is fixed (~1000 strand segments + ~270 rung halves), so cost is constant regardless of scroll speed — but sorting per frame is O(n log n). Above ~5000 segments switch to bucketing by depth.",
      "The copy bands and the camera stations are tuned together (station 2 at 0.38, block 2 in at 0.32–0.40). Moving one without the other leaves text arriving before the camera does.",
      "Under reduced motion the scene still scrubs with scroll — there is no autonomous motion to remove — but a page that wants to be gentle should pin the camera at station 1 and let the copy fade only.",
    ],
    source: { label: "@优卓UX上岸社 (Douyin) · 「动效描述」第 3 集 · GeneTrace", at: "0:20" },
  },
  {
    slug: "cursor-luminous-gateway",
    category: "web-effects",
    date: "2026-09-11",
    /* 一加载就推轨+起雾+标题入场，光标只是加层视差 —— 轮播里是活的 */
    plays: "self",
    title: { en: "Cursor-driven luminous gateway", zh: "光标驱动的辉光流转", "zh-tw": "游標驅動的輝光流轉" },
    gist: {
      en: "A glowing doorway on a dusk horizon. The whole scene creeps toward you over 16 seconds, mist rises off the ground, and the cursor tilts the layers apart by depth.",
      zh: "黄昏地平线上立着一扇发光的门。整个场景用 16 秒缓缓向你推近，雾从地面升起，光标一动，各层按各自的景深错开。",
      "zh-tw": "黃昏地平線上立著一扇發光的門。整個場景用 16 秒緩緩向你推近，霧從地面升起，游標一動，各層按各自的景深錯開。",
    },
    height: 400,
    accent: "#ff9a5a",
    anatomy: [
      "Three motions, three owners. The <b>dolly</b> is one CSS animation on the scene wrapper: <code>scale(1) → scale(1.11)</code> over 16s with a strong ease-out, origin at the horizon (50% 62%) so the push feels aimed at the door. The <b>mist</b> is CSS keyframes on three sheets. The <b>parallax</b> is the only thing JavaScript touches.",
      "JS writes two numbers, <code>--px</code> and <code>--py</code> in −1…1, eased toward the pointer at 8% per frame. Every layer multiplies them by its own <code>--d</code> in CSS (<code>translate(calc(var(--px) * var(--d)), …)</code>): sky 4px, far ridge 10px, gate 14px, near ridge 18px, water 22px, mist 30px. Adding a layer is one custom property, not another line of script.",
      "Every layer is 12% larger than the frame (<code>inset: -6%</code>) so neither the parallax nor the dolly ever exposes an edge.",
      "The door is a white rectangle with four stacked <code>box-shadow</code>s (14px white, 60px peach, 180px orange, 320px deep orange) — that is the bloom — plus a blurred ellipse below it for light on the ground and a masked radial column on the water for the reflection, with 1px ripples inside the same mask. It also tilts <code>rotateY(±6°)</code> with <code>--px</code>, which sells it as an object standing in the scene.",
      "Mist sheets fade up from 0 to .55 over 7s (delays 0.8 / 1.9 / 3.2s) — the source's 'ground gradually reveals itself' — then drift ±6% on 26 / 19 / 33-second alternating loops so the pattern never repeats.",
      "Headline lines rise out of an <code>overflow: hidden</code> window (900ms, 140ms stagger) with the second line in a ghost weight, as in the source; the paragraph and button fade in at 700ms.",
      "The pointer leaving the document fires no further <code>pointermove</code>, so a document <code>mouseout</code> with <code>relatedTarget === null</code> eases the scene back to centre. Parallax is gated behind <code>(pointer: fine)</code> and off under reduced motion, where the dolly and mist drift are also removed.",
    ],
    tokens: [
      { label: "Dolly", value: "scale 1 → 1.11 · 16s cubic-bezier(.16,.6,.3,1) · origin 50% 62%" },
      { label: "Parallax depths", value: "4 / 10 / 14 / 18 / 22 / 30 px" },
      { label: "Pointer easing", value: "8% per frame" },
      { label: "Door bloom", value: "14 · 60 · 180 · 320px shadows" },
      { label: "Mist", value: "rise 7s to .55 · drift ±6% on 26/19/33s" },
      { label: "Headline", value: "900ms cubic-bezier(.22,.61,.36,1) · 140ms stagger" },
    ],
    prompt:
      "Build a cursor-driven luminous gateway hero in vanilla HTML/CSS/JS. A .scene wrapper with inset: -6% and transform-origin: 50% 62% animates scale(1) → scale(1.11) over 16s cubic-bezier(.16,.6,.3,1) forwards. Inside it, absolutely positioned layers each declare a depth --d and share one transform: translate(calc(var(--px, 0) * var(--d)), calc(var(--py, 0) * var(--d) * .6)). Layers, back to front: sky (--d 4px; linear gradient #150f3a → #34205a 36% → #8a3f5a 54% → #f28a55 64% → #ffb07a 68%, plus a peach radial glow at 50% 66% and a faint star field on the top half), a far ridge (--d 10px; jagged SVG polygon with a vertical gradient fill), a near ridge (--d 18px; darker polygon), the gate (--d 14px), water (--d 22px; from 66% down, dark gradient, a masked radial reflection column with 1px repeating ripples), and mist (--d 30px). The door is a 4.6%-wide, 29%-tall white rectangle at top 38%, with box-shadow: 0 0 14px 4px #ffffffe6, 0 0 60px 18px #ffb27acc, 0 0 180px 60px #ff8a4a66, 0 0 320px 120px #ff6a2a33, a rotateY(calc(var(--px) * 6deg)) tilt, and a blurred ::after ellipse below it for light on the ground. Mist: three 140%-wide blurred (14px) radial-gradient sheets low in the frame, animated from opacity 0 / translateY(18px) to opacity .55 over 7s with delays .8s, 1.9s, 3.2s, then drifting margin-left −6% → 6% on 26s, 19s and 33s alternate loops. Headline: two lines each in an overflow: hidden window, rising from translateY(110%) over 900ms cubic-bezier(.22,.61,.36,1) with a 140ms stagger, the second line at 52% white; paragraph and button fade in after 700ms. JS: on pointermove set targets tx = clientX/innerWidth*2−1 and ty likewise, ease x += (tx − x) * .08 per requestAnimationFrame, write --px/--py on the scene, and stop the loop once within .001. On a document mouseout with relatedTarget null, ease back to 0,0. Enable only under (pointer: fine) and not under prefers-reduced-motion, where the dolly and mist drift are also disabled.",
    caveats: [
      "Four stacked large-radius box-shadows on a moving element repaint every frame the parallax runs. On a full-viewport hero at DPR 2 this shows on integrated GPUs — promote the gate layer with <code>will-change: transform</code> (done) and keep the biggest shadow under ~350px.",
      "The dolly runs once from page load and never resets; on a route change inside an SPA the animation will not replay unless the element is re-mounted.",
      "Mist over the water dims the reflection. The sheets here are lowered and capped at .55 opacity for that reason; push them up and the door's reflection disappears, which was the first version of this sample.",
      "The sky's saturated orange band does not meet contrast for the small paragraph if the copy is moved down; keep text on the dark upper third.",
    ],
    source: { label: "@优卓UX上岸社 (Douyin) · 「动效描述」第 3 集 · Gateway", at: "0:26" },
  },
  {
    slug: "bin-eats-label",
    category: "web-effects",
    date: "2026-09-08",
    plays: "hover",
    title: {
      en: "The bin eats the label",
      zh: "垃圾桶吃掉文字",
      "zh-tw": "垃圾桶吃掉文字",
    },
    gist: {
      en: "A delete button whose own label is the thing being deleted: the lid opens, the letters tumble in one at a time, and what is left is a circular icon with a progress ring around it.",
      zh: "一颗删除按钮，被删掉的东西就是它自己的文字：盖子掀开，字母一个一个翻着掉进桶里，剩下的是一颗圆形图标和绕着它走的进度环。",
      "zh-tw": "一顆刪除按鈕，被刪掉的東西就是它自己的文字：蓋子掀開，字母一個一個翻著掉進桶裡，剩下的是一顆圓形圖示和繞著它走的進度環。",
    },
    height: 300,
    accent: "#8e33c4",
    anatomy: [
      "The label is split into one <code>&lt;span&gt;</code> per glyph at runtime, and each span gets its own <code>--fly</code> (the horizontal distance from where that glyph sits to the bin's mouth, read once at click time) plus a <code>--spin</code> that alternates direction. Six glyphs, <b>125ms apart</b>, <b>300ms</b> of flight each — that spacing is the whole character of the effect. Fire them together and it is a fade; space them further and the button feels broken.",
      "The glyph transition eases <b>in</b>, not out: <code>cubic-bezier(0.55, 0, 0.85, 0.35)</code>. Things being sucked into something accelerate. Every other transition in this file eases out; this is the one that must not.",
      "<b>The bin opens before anything goes in.</b> The lid rotates <code>-38deg</code> around a hinge at its left end (<code>transform-origin: 3px 6px</code>) over 150ms, and the first glyph waits <code>LID + 30ms</code> before leaving. Without that beat the lid and the first letter move together and it reads as the label falling through a closed lid.",
      "Collapsing the pill animates <b>width only</b> — height, padding and border-radius never move, and the icon is positioned at <code>left: (height − icon) / 2</code> so it is already at the circle's centre before the width starts shrinking. The icon therefore does not travel at all, which is what sells \"the label was eaten\" over \"the button resized\".",
      "<b>The ring cannot live inside the button.</b> The button needs <code>overflow: hidden</code> to clip the glyphs mid-flight, and the ring sits 7px outside the button box — put it inside and it is clipped away entirely. It goes on a wrapping <code>.slot</code> instead. Note what this failure looks like: <code>stroke-dashoffset</code> animates correctly the whole time, so every measurement passes while nothing renders.",
      "The ring's <code>transition-delay</code> equals the collapse duration, so the sweep starts after the circle has settled rather than during the shrink — two events instead of one blurry one. It runs <b>linear</b>: a progress indicator that eases is a progress indicator that lies about where it is.",
      "The completed ring is held for <b>120ms</b> before the button expands. Expanding on the frame the sweep lands means the full circle never renders once, and the whole sequence reads as having given up at 99%.",
      "The refuse level inside the bin is a <code>&lt;rect&gt;</code> under a <code>clipPath</code>, scaled on Y one notch per glyph as each one lands. <b>Each button needs its own clipPath id</b> — two buttons in one document with the same id means the second silently uses the first's clip.",
      "<code>.eating</code> stays on through the collapse and the ring, and comes off only when the button expands. Removing it once the eating is visually over — the obvious place — starts all six glyphs transitioning back to <code>opacity: 1</code> inside the circle, where <code>overflow: hidden</code> hides the mistake and the state is quietly wrong for the entire ring phase.",
    ],
    tokens: [
      { label: "Lid", value: "-38deg over 150ms, hinged at the bar's left end" },
      { label: "Glyph stagger", value: "125ms · 6 glyphs = 750ms of eating" },
      { label: "Glyph flight", value: "300ms cubic-bezier(0.55, 0, 0.85, 0.35) (ease-IN)" },
      { label: "Pill → circle", value: "330ms cubic-bezier(0.22, 1, 0.36, 1)" },
      { label: "Progress ring", value: "900ms linear, delayed by the collapse" },
      { label: "Ring hold", value: "120ms at full before expanding" },
      { label: "Circle → pill", value: "290ms, same ease" },
      { label: "Full cycle", value: "~2.9s" },
    ],
    prompt:
      "Build a delete button in vanilla HTML/CSS/JS where the trash icon eats the label. Markup: a wrapper span.slot containing a button; the button holds an inline SVG bin (a separate .lid group and a .fill rect clipped by a clipPath) and a .label whose text 'Delete' is split into one span per character at runtime. The button is a 232x62px pill, border-radius 31px, overflow: hidden, and the bin is absolutely positioned at left: (62-26)/2 px so it already sits at the centre of the collapsed circle. On click: (1) rotate .lid -38deg with transform-origin at the left end of the lid bar over 150ms; (2) after 180ms, fly the glyphs into the bin one at a time, 125ms apart, each transitioning transform over 300ms with cubic-bezier(0.55, 0, 0.85, 0.35) — an ease-IN, because things being sucked in accelerate — to translate(var(--fly), 6px) rotate(var(--spin)) scale(0.55) with opacity going to 0 over 120ms after a 180ms delay; --fly is that glyph's horizontal distance to the bin mouth measured once at click time, --spin alternates sign and grows 170deg + 26deg per index; (3) scale the .fill rect up on Y one notch per glyph as each lands; (4) 180ms after the last glyph, collapse the button to a 62px circle by animating WIDTH ONLY over 330ms cubic-bezier(0.22, 1, 0.36, 1) — do not animate height, padding or border-radius; (5) show an SVG progress ring on the .slot wrapper (inset -7px, rotated -90deg, stroke-dasharray = circumference) and animate stroke-dashoffset to 0 over 900ms LINEAR with a transition-delay equal to the collapse duration; (6) hold the completed ring 120ms, then expand back to the pill over 290ms and restore the label in the same frame. The ring must be on the wrapper, not inside the button: the button's overflow: hidden would clip it away entirely while stroke-dashoffset still animates, so nothing renders and no measurement catches it. Give each button's clipPath a unique id. Keep a running flag so a second click mid-sequence is ignored. Under prefers-reduced-motion: reduce, set all transition durations to 1ms and drop the glyph transform so the label just goes, but keep the pill → circle → ring → pill state changes so the button still says work is happening.",
    caveats: [
      "The label is <code>aria-hidden</code> and the accessible name comes from <code>aria-label</code> on the button — otherwise the name would flicker as glyphs leave the DOM's text content.",
      "The letters fly to where the bin is <b>at click time</b>. If the button can reflow mid-sequence (a resize, a font swapping in), the destinations go stale and the glyphs land beside the bin instead of in it.",
      "This is a confirmation pattern, so it owes the user a way out. As built, the ring is decorative — it runs for a fixed 900ms and nothing can stop it. Wire it to the real request, and give it an undo: a ring that cannot be cancelled is a countdown that lies.",
      "Six glyphs is about the limit. \"Delete permanently\" at the same 125ms stagger would take 2.5 seconds just to eat, and the user is waiting on a destructive action the whole time.",
      "The ring is a <b>fixed square centred on the button</b>, not <code>inset: -7px</code>. An <code>&lt;svg&gt;</code> with insets on all four sides takes its height from its own 1:1 viewBox and the <i>pill's</i> width, so at rest the ring quietly becomes a 246×246 circle hanging 85px below. It is invisible there — until the button expands, when the ring fades out with no delay while growing back into that shape, and you see a huge misplaced circle for about 120ms on the way out.",
      "The <code>.slot</code> keeps the pill's full width while the button inside it is a circle. Without that, the flex row reflows on every click and the <i>other</i> button slides 85px sideways: collapsing one button is supposed to be a local event, not a layout event.",
      "<b>Yes, this animates <code>width</code>, and that is a layout-animating property.</b> The usual advice — use <code>transform</code> — does not apply here: <code>scaleX</code> would squash the bin icon and stretch the border-radius into an ellipse, and the whole point of the collapse is that neither moves. The cost is real but bounded: two elements, one 330ms run per click, nothing scroll-driven. Reach for <code>transform</code> the moment this pattern lands in a list where several can collapse at once.",
    ],
    source: {
      label: "抖音 @程序员八阿哥 · Delete Button — The Bin Eats The Label",
      at: "2026-09-08",
    },
  },
  {
    slug: "scroll-scrubbed-sequence",
    category: "web-effects",
    date: "2026-09-06",
    plays: "scroll",
    title: { en: "Scroll-scrubbed frame sequence", zh: "滚动擦洗的帧序列", "zh-tw": "捲動擦洗的影格序列" },
    gist: {
      en: "A pinned stage where scroll position picks the frame instead of a clock. Nothing plays on its own — the reader is the transport control, and letting go stops it dead.",
      zh: "钉住一屏，用滚动位置挑帧，而不是让时间轴自己走。没有任何东西自己在播 —— 读者就是那个播放进度条，手一停画面就停。",
      "zh-tw": "釘住一屏，用捲動位置挑影格，而不是讓時間軸自己走。沒有任何東西自己在播 —— 讀者就是那個播放進度條，手一停畫面就停。",
    },
    height: 400,
    accent: "#ffb066",
    anatomy: [
      "Scroll position becomes a number in 0…1, and that number picks a frame: <code>i = floor(p × N)</code>. That is the entire effect. Everything below is about making it not stutter.",
      "The progress comes from <b>where the section actually is</b>, never from accumulating <code>wheel</code> deltas: <code>p = clamp(-section.getBoundingClientRect().top / (section.scrollHeight − innerHeight), 0, 1)</code>. Accumulated deltas drift out of sync with the page the first time someone drags the scrollbar, uses Home/End, or lands on a deep link — and the drift is silent and permanent.",
      "The section is a tall track with a <code>position: sticky</code> stage inside it. It never calls <code>preventDefault</code> on the wheel: the page scrolls normally the whole time, which is why the scrollbar, keyboard paging and momentum all still behave.",
      "<b>One paint per animation frame, not one per scroll event.</b> A trackpad fires scroll far faster than the display refreshes; painting inline spends the frame budget drawing pictures nobody ever sees. Scroll only records the target index; a <code>requestAnimationFrame</code> callback draws it.",
      "Repainting is skipped entirely when the index has not changed. With 40 frames across a 460% track, most scroll events resolve to the frame already on screen.",
      "This sample synthesises each frame on a <code>&lt;canvas&gt;</code> so the file stays self-contained. With a real asset only the last line changes: <code>ctx.drawImage(images[i], …)</code> for a JPEG sequence, or <code>video.currentTime = p * video.duration</code> for a video. The scroll → progress math above it is identical.",
      "For the <code>&lt;video&gt;</code> variant: read <code>duration</code> only after <code>loadedmetadata</code>, throttle the seeks to about 24–30 per second, and set <code>muted playsinline preload=\"auto\"</code> with a <code>poster</code>. Seeking faster than that queues seeks the decoder cannot retire, and the picture lags the scroll by a growing margin.",
    ],
    tokens: [
      { label: "Scroll distance", value: "460% of the viewport" },
      { label: "Frames", value: "40" },
      { label: "Progress", value: "−rect.top / (scrollHeight − innerHeight)" },
      { label: "Paint budget", value: "1 per rAF, skipped if index unchanged" },
      { label: "Video seek rate", value: "24–30 /s (video variant)" },
      { label: "Canvas backing", value: "min(devicePixelRatio, 2)" },
    ],
    prompt:
      "Build a scroll-scrubbed frame sequence in vanilla HTML/CSS/JS. Markup: a scroll container holding a track 460% of the viewport height, with a sticky stage inside it — the stage MUST be height: 100vh, not height: 100%, because 100% resolves against the 460%-tall track. Never call preventDefault on wheel and never accumulate wheel deltaY; derive progress from layout every time: p = clamp(-section.getBoundingClientRect().top / (section.scrollHeight - window.innerHeight), 0, 1). Map it to a frame with i = Math.min(N - 1, Math.floor(p * N)) for N = 40. Register the scroll listener passive; in the handler only store the target index and schedule one requestAnimationFrame; paint inside that callback and return early if the index equals the one already drawn. Back the canvas at min(devicePixelRatio, 2) and rebuild it on resize. If you use a <video> instead of a canvas, set muted, playsinline, preload=\"auto\" and a poster, read duration only after the loadedmetadata event, set currentTime = p * duration, and throttle seeks to 24-30 per second. Show a small monospace readout of progress and frame number so the mechanism is visible. Everything must work when scrolling backwards, when scrolling very fast, and after a window resize.",
    caveats: [
      "A real video only scrubs smoothly if its keyframe interval is short. Encode at roughly one keyframe every 5–10 frames; a normally-encoded clip has one every few seconds, and every seek in between decodes from the last keyframe forward — it feels like the video is stuck, and the code looks fine.",
      "iOS Safari will not seek a <code>&lt;video&gt;</code> that has never been played, and it ignores <code>preload</code> on a metered connection. A poster image plus a canvas sequence is the reliable path on phones; the video path needs a real fallback there, not a promise.",
      "Scroll-scrubbed media has no state a reduced-motion user can opt out of — there is no animation to disable, only content that will not appear. Under <code>prefers-reduced-motion: reduce</code>, pin it to a representative frame and let the section scroll past normally.",
      "460% of viewport height buys about four thumb-flicks on a phone with nothing else on screen. On small viewports cut the track, not the frame count — a short sequence over a long track just makes each frame linger.",
    ],
    source: { label: "@派大鑫 (Douyin) · “这是我 Vibe Coding 的个人站”", at: "0:00 & 1:09" },
  },
  {
    slug: "chapter-headline-roller",
    category: "web-effects",
    date: "2026-09-06",
    plays: "scroll",
    title: { en: "Chapter headline roller", zh: "章节标题的行遮罩换行", "zh-tw": "章節標題的行遮罩換行" },
    gist: {
      en: "Scroll crosses a chapter line and the headline rolls over: old lines climb out of a clip window while the new ones rise in behind them, one row lagging the next.",
      zh: "滚动越过章节线，标题就翻一次：旧的两行从遮罩窗口里往上退场，新的两行从下方顶进来，第二行比第一行慢半拍。",
      "zh-tw": "捲動越過章節線，標題就翻一次：舊的兩行從遮罩視窗裡往上退場，新的兩行從下方頂進來，第二行比第一行慢半拍。",
    },
    height: 400,
    accent: "#1c6f6a",
    anatomy: [
      "<b>One clip window per line, not one around the block.</b> A single window makes the two lines a rigid pair, and the stagger — the second row arriving 90ms after the first — is the entire reason this reads as type rather than as a moving rectangle.",
      "🩸 The type size has to sit on the <b>row</b>, because the window height is <code>1.06em</code>. Leave the row at the inherited 16px and the window comes out 17px tall while the text inside it is 54px: you see a horizontal sliver of the headline, and <code>translateY(-110%)</code> is no longer far enough to clear the window either. Nothing errors. <b>I shipped exactly this and only caught it by measuring the window against the text.</b>",
      "Every chapter's line exists as its own element, stacked. All three states come from one rule — <code>past</code> is <code>translateY(-110%)</code>, <code>now</code> is 0, the untouched default is <code>translateY(110%)</code> — so scrolling back up plays the reverse for free. Rewriting the text of a single element leaves nothing to cross with: the outgoing line has to still be on screen while the new one arrives.",
      "The headline is <b>deliberately not scrubbed</b>. The picture behind it is continuous with scroll; the type is discrete states with a CSS transition. Type dragged frame-by-frame by the scrollbar is unreadable, and a scrubbed live region makes a screen reader announce every intermediate string.",
      "Hysteresis on the chapter boundary. Resting exactly on an edge — which trackpad inertia does constantly — otherwise flips the headline back and forth on sub-pixel deltas. The new chapter is committed only once progress is more than 0.04 past the edge that was crossed.",
      "Only the settled chapter is <code>aria-hidden=\"false\"</code>. All four chapters are in the DOM at once; without this a screen reader reads the whole set as one run-on sentence.",
      "Backdrops are one layer per chapter cross-faded over 700ms, matched to the 620ms roll so the room changes with the words rather than after them.",
    ],
    tokens: [
      { label: "Scroll distance", value: "440% of the viewport" },
      { label: "Chapters", value: "4" },
      { label: "Roll", value: "620ms cubic-bezier(.22,.61,.36,1)" },
      { label: "Row stagger", value: "90ms on the second line" },
      { label: "Travel", value: "±110% of the line box" },
      { label: "Boundary dead zone", value: "0.04 of total progress" },
      { label: "Backdrop cross-fade", value: "700ms" },
    ],
    prompt:
      "Build a scroll-driven chapter headline roller in vanilla HTML/CSS/JS. A scroll container with a 440%-tall track and a sticky stage (height: 100vh, never 100%). Four chapters, each with an eyebrow and a two-line headline. Give EACH line its own overflow: hidden window — never one window around both lines — and put the font-size and line-height on that window element itself with height: 1.06em, so the clip box matches the text; leaving the row at the inherited font size silently produces a 17px window around 54px text. Render every chapter's line as its own absolutely positioned span inside its window and drive them from one class: past = translateY(-110%) opacity 0, now = translateY(0) opacity 1, default = translateY(110%) opacity 0, transitioning transform 620ms cubic-bezier(.22,.61,.36,1) and opacity 420ms linear, with transition-delay 90ms on the second line only. Do NOT scrub the type with scroll progress — pick a discrete chapter index and let CSS transition between states. Compute chapter = min(n-1, floor(p * n)) but commit it only when |p - boundary| > 0.04 so resting on a boundary does not flicker. Set aria-hidden true on every chapter except the settled one. Cross-fade one full-bleed background layer per chapter over 700ms. Register the scroll listener passive.",
    caveats: [
      "<code>overflow: hidden</code> on the line windows clips descenders and any accent that sits above the cap line — <code>Ç</code>, <code>Å</code>, a Vietnamese double diacritic. 1.06em is tight enough to cut them in most faces. Check the effect in every language the page ships before trusting the number.",
      "Four chapters that only advance on scroll means the last three are unreachable by keyboard alone unless the page still scrolls normally. Do not add <code>preventDefault</code> to the wheel handler to \"smooth\" it; that is what breaks Home, End, Page Down and find-in-page.",
      "Under <code>prefers-reduced-motion: reduce</code> the roll should become a cross-fade, not disappear. Removing the transition entirely makes the headline change instantly with no relationship to the scroll, which reads as a glitch rather than as calm.",
    ],
    source: { label: "@派大鑫 (Douyin) · “这是我 Vibe Coding 的个人站”", at: "0:06" },
  },
  {
    slug: "scroll-word-brighten",
    category: "web-effects",
    date: "2026-09-06",
    plays: "scroll",
    title: { en: "Scroll-brightened paragraph", zh: "随滚动逐词点亮的段落", "zh-tw": "隨捲動逐詞點亮的段落" },
    gist: {
      en: "A paragraph lit word by word as it scrolls, with a soft front several words wide — light moving across the text rather than a cursor stepping through it.",
      zh: "段落随滚动一个词一个词点亮，亮边有宽度、一次覆盖好几个词 —— 是光扫过文字，不是一个光标在逐词跳。",
      "zh-tw": "段落隨捲動一個詞一個詞點亮，亮邊有寬度、一次覆蓋好幾個詞 —— 是光掃過文字，不是一個游標在逐詞跳。",
    },
    height: 400,
    accent: "#c99a3f",
    anatomy: [
      "<b>The front has width.</b> Lighting exactly one word at a time reads as a cursor stepping through the text. Six words in partial brightness reads as light moving across it: <code>t = clamp((head − i) / 6, 0, 1)</code>, where <code>head = p × (n + 6)</code>.",
      "🩸 <b>The dim state is applied by JS, never declared in CSS.</b> Ship <code>opacity: .16</code> in the stylesheet and the day the script does not run — an error three lines up, a blocked bundle, an old browser — the paragraph is an invisible block of text. Full brightness is the resting state; dimming is something the effect does to it.",
      "Split on <b>words</b>, never on characters. Per-character spans break find-in-page, break double-click-to-select, and make a screen reader spell the sentence out one letter at a time. Nothing here needs finer than a word.",
      "The whitespace between words stays as text nodes in the paragraph rather than inside the spans, so copying the text out gives back the original sentence and line-breaking still works normally.",
      "Words fade to <code>0.16</code>, not to 0. A word at zero is a hole in the paragraph and the block visibly reflows in the reader's peripheral vision; at 0.16 the shape of the sentence is intact and only its emphasis moves.",
      "Progress is divided by 0.82 so the last word lights while the paragraph is still comfortably on screen. Mapping the front to the full scroll range finishes the sentence exactly as it leaves the viewport, which nobody ever sees.",
      "<code>prefers-reduced-motion: reduce</code> pins every word to full opacity with <code>!important</code> and the script returns early — the paragraph is just a paragraph.",
    ],
    tokens: [
      { label: "Scroll distance", value: "340% of the viewport" },
      { label: "Front width", value: "6 words" },
      { label: "Dim floor", value: "0.16 opacity" },
      { label: "Progress range", value: "0 → 0.82 of the track" },
      { label: "Split unit", value: "word (/(\\s+)/, spaces kept outside)" },
    ],
    prompt:
      "Build a scroll-driven word-by-word brightening paragraph in vanilla HTML/CSS/JS. A scroll container with a 340%-tall track and a sticky stage (height: 100vh, never 100%) holding one paragraph. Put the paragraph in the HTML as plain readable text at full brightness — do NOT declare a dim state in CSS, or the text becomes invisible whenever the script fails to run. In JS split the text on /(\\s+)/, wrap each word in a span, and append the whitespace back as plain text nodes so copy, find-in-page and line-breaking are unaffected; never split per character. On scroll compute p = clamp(scrollTop / max / 0.82, 0, 1), then head = p * (wordCount + 6) + 2, and set each word's opacity to 0.16 + 0.84 * clamp((head - i) / 6, 0, 1) — the divisor 6 is what gives the brightening front a width instead of stepping one word at a time. Fade to 0.16, never to 0, so the paragraph does not develop holes. Under prefers-reduced-motion: reduce force every word to opacity 1 with !important and return from the scroll handler immediately. Register the scroll listener passive.",
    caveats: [
      "The dimmed words are decorative but still real text: at 0.16 opacity on a dark ground they are far below any contrast threshold. That is defensible only while they are transient — if the reader can stop the page with words still dim (a short viewport, an interrupted scroll), they are unreadable content, not an effect. Test at 360px wide before shipping.",
      "One span per word on a long article is thousands of style writes per scroll event. Past a few hundred words, update only the words currently in view, or move the whole thing to a CSS scroll-driven animation with a <code>view()</code> timeline and no JS at all.",
      "Chinese and Japanese have no spaces, so the word split degrades to one span for the entire sentence and the effect vanishes with no error. Segment with <code>Intl.Segmenter</code> and <code>granularity: \"word\"</code> for those languages.",
    ],
    source: { label: "@派大鑫 (Douyin) · “这是我 Vibe Coding 的个人站”", at: "0:10" },
  },
  {
    slug: "interactive-liquid-distortion",
    category: "web-effects",
    date: "2026-09-05",
    plays: "hover",
    title: { en: "Interactive liquid distortion", zh: "交互式流体扭曲", "zh-tw": "互動式流體扭曲" },
    gist: {
      en: "A tilted band of glass follows the pointer and refracts whatever is behind it, leaning into the direction of travel and straightening again when you stop. No WebGL — a clipped duplicate of the scene does the displacement.",
      zh: "一条倾斜的玻璃带跟着指针走，把身后的东西折射位移；朝移动方向倾倒，停下就自己扶正。没用 WebGL —— 位移是靠一份被裁剪的场景副本做的。",
      "zh-tw": "一條傾斜的玻璃帶跟著指標走，把身後的東西折射位移；朝移動方向傾倒，停下就自己扶正。沒用 WebGL —— 位移是靠一份被裁剪的場景副本做的。",
    },
    height: 340,
    accent: "#b93bff",
    anatomy: [
      "The scene is written <b>twice</b>: once as the page, once inside the lens. The lens copy is full-size and merely <code>clip-path</code>-ed to a tilted band — not a small rotated box. That matters: a rotated box needs its contents counter-transformed to stay registered with the original, and any error there shows up as a visible seam along the band.",
      "The refraction is one declaration on the copy: <code>scale(1.07) translateX(calc(var(--tilt) * -0.85))</code>. Pushing the duplicate <i>against</i> the lean is what makes the content behind the band look bent. Everything else on the page is decoration.",
      "The lean comes from <b>velocity, not position</b>. The band trails the pointer through a lerp, and the tilt is read from how far it moved this frame — so it leans while you drag and settles upright when you stop, which is the part that reads as liquid.",
      "Velocity is sampled once per animation frame, not per <code>pointermove</code>. Pointer events arrive in bursts (and coalesced), so measuring per event makes the lean jitter on some machines and not others.",
      "Chromatic aberration is faked with two 1.5px hairlines — cyan on one edge, magenta on the other. Splitting the actual colour channels would need a filter pass per channel for a difference nobody sees at this size.",
      "The iridescent sheen is <code>mix-blend-mode: <b>screen</b></code>, not <code>color-dodge</code>. Dodge divides by the inverse of the backdrop, so over the near-black that makes up most of this scene it returns near-black — the sheen is simply absent, and it reads as a gradient that failed to load. <code>screen</code> brightens toward the source colour whatever sits underneath. <b>I shipped the dodge version first and only caught it by looking at a screenshot.</b>",
    ],
    tokens: [
      { label: "Band width", value: "92px (half = 46px)" },
      { label: "Max lean", value: "±34px top vs bottom" },
      { label: "Follow easing", value: "lerp 0.12/frame (lower = heavier)" },
      { label: "Displacement", value: "scale(1.07), translateX = tilt × −0.85" },
      { label: "Edges", value: "1.5px, #00e5ff / #ff2ea8" },
      { label: "Sheen", value: "5-stop gradient, screen, 0.30" },
    ],
    prompt:
      "Build an interactive liquid-glass distortion in vanilla HTML/CSS/JS, no WebGL and no libraries. Render the scene twice: the page itself, and an identical full-size copy inside a .lens element that is clipped with clip-path: polygon() to a vertical band 92px wide whose top and bottom edges are offset in opposite directions by a --tilt variable. Do not rotate the lens box — clip a full-size element, so the copy inside needs no counter-transform. Apply transform: scale(1.07) translateX(calc(var(--tilt) * -0.85)) and filter: saturate(1.5) contrast(1.06) to the copy: that offset is the refraction. Overlay a five-stop iridescent linear-gradient at mix-blend-mode: screen (NOT color-dodge, which returns near-black over a dark backdrop and makes the sheen vanish), opacity 0.30, and draw two 1.5px hairlines along the band edges, #00e5ff on the left and #ff2ea8 on the right, rotated to match the lean. In JS, lerp the band's x toward the pointer at 0.12 per animation frame, and derive --tilt from the per-frame velocity (clamped to ±34px, itself eased at 0.1) so the band leans into movement and straightens when the pointer stops — sample velocity once per requestAnimationFrame, never per pointermove event. Under prefers-reduced-motion: reduce, park the band with a fixed tilt instead of hiding it.",
    caveats: [
      "Two copies of the scene means two of everything. Fine for a hero; if the scene contains a video, an iframe or a live canvas, the duplicate is a second decode and you should reach for a real displacement shader instead.",
      "The copy must be <b>identical</b>, including fonts and any animation phase. A web font that swaps in a moment later, or a duplicated CSS animation started at a different time, produces a band where the content does not line up — and it looks like a rendering bug rather than an authoring one.",
      "<code>mix-blend-mode</code> forces the band onto its own compositing layer. On a page that already has many layers this is one more, and it is the first thing to profile if scrolling gets choppy.",
    ],
    source: { label: "@菜心视觉设计 (Douyin) · effects catalogued from a screen recording of alche.jp", at: "0:07" },
  },
  {
    slug: "fullscreen-expansion-transition",
    category: "web-effects",
    date: "2026-09-05",
    plays: "scroll",
    title: { en: "Fullscreen expansion transition", zh: "全屏扩展转场", "zh-tw": "全螢幕擴展轉場" },
    gist: {
      en: "Scroll opens a small card out to full bleed. The card never scales — the window cut out of it does — so the artwork and type inside stay pixel-exact the whole way.",
      zh: "滚动把一张小卡片撑开成通栏。卡片本身从不缩放，变的是从它上面裁出来的那个窗口 —— 所以里面的图和字全程都是精确的。",
      "zh-tw": "捲動把一張小卡片撐開成通欄。卡片本身從不縮放，變的是從它上面裁出來的那個視窗 —— 所以裡面的圖和字全程都是精確的。",
    },
    height: 400,
    accent: "#ff375f",
    anatomy: [
      "The card is <b>always full-bleed</b>. What animates is <code>clip-path: inset()</code> — the window cut out of it — going from a centred rectangle with an 18px radius to <code>inset(0)</code> with no radius.",
      "This is the whole reason to prefer clipping over scaling a small card up. A scaled card stretches everything inside it, so every child needs a counter-scale, and text is resampled at every intermediate size. Clipping leaves the contents rendered at their final size from the first frame.",
      "JS computes exactly one number — scroll progress 0→1 — and writes it to <code>--p</code> on the stage. Every visual decision lives in CSS against that variable, so the entire transition can be inspected by typing a number into devtools instead of stepping through a scroll handler.",
      "🩸 <b>Never write <code>--p: 0</code> on the element that consumes it</b> as a \"default\". The value is set on the stage and inherits down; a local declaration <i>shadows</i> the inherited one, and the card sits frozen at 0 while <code>--p</code> on the stage animates perfectly. Nothing errors, and devtools cheerfully shows you both values on two different elements. Use <code>var(--p, 0)</code> instead — a fallback only applies when the property is genuinely unset. This cost me a debugging round on this very sample.",
      "The push-in on the artwork ends at <code>scale(1)</code>, not at 1.02 or 0.98. Landing on exactly 1 means the final resting frame is an unscaled render; anything else leaves the hero permanently slightly soft.",
      "The backdrop wordmark moves at a different rate to the card. Without that second rate the expansion reads as a box getting bigger rather than as the camera moving in.",
      "The scroll listener is <code>{ passive: true }</code> — it never calls <code>preventDefault</code>, and declaring that lets the browser begin scrolling without waiting to find out.",
    ],
    tokens: [
      { label: "Scroll distance", value: "320% of the viewport" },
      { label: "Start window", value: "inset(26% 32%) round 18px" },
      { label: "End window", value: "inset(0) round 0" },
      { label: "Artwork push-in", value: "scale 1.14 → 1.00" },
      { label: "Backdrop rate", value: "−14% translate, scale +0.25" },
    ],
    prompt:
      "Build a scroll-driven fullscreen expansion transition in vanilla HTML/CSS/JS. Use a scroll container with a track 320% of the viewport height and a sticky stage. The media card must be absolutely positioned full-bleed at all times; animate only its clip-path, from inset(26% 32% round 18px) at progress 0 to inset(0 round 0) at progress 1 — do NOT scale a small card up, because that stretches its contents and resamples the type at every intermediate size. In JS compute a single scroll progress value 0→1 and write it to a CSS custom property --p; express every visual change in CSS as a calc() against --p. Give the artwork inside the card a push-in from scale(1.14) to exactly scale(1.00) so the final frame is an unscaled render. Move a background wordmark at a different rate (translateX to −14%, scale to 1.25) so the effect reads as camera movement rather than a growing box. Register the scroll listener with { passive: true }.",
    caveats: [
      "The custom-property shadowing above is the kind of bug this whole format exists to record: the progress number was provably correct, the CSS was provably correct, and the thing still did not move.",
      "<code>clip-path</code> with percentages resolves against the element's own box, so the start window is a fixed fraction of the card, not of the viewport. On a very wide viewport the closed state gets wide too — clamp it with <code>min()</code> if the card must stay a fixed size.",
      "Sticky positioning fails silently if any ancestor has <code>overflow: hidden</code>. The stage stops sticking, the transition never scrubs, and nothing anywhere reports an error.",
      "Driving this from a scroll handler is universal but not free. <code>animation-timeline: scroll()</code> does the same thing off the main thread where it is supported — worth it if the page has several of these.",
    ],
    source: { label: "@菜心视觉设计 (Douyin) · effects catalogued from a screen recording of alche.jp", at: "0:15" },
  },
  {
    slug: "scroll-driven-scene-transition",
    category: "web-effects",
    date: "2026-09-05",
    plays: "scroll",
    title: { en: "Scroll-driven scene transition", zh: "滚动驱动的场景切换", "zh-tw": "捲動驅動的場景切換" },
    gist: {
      en: "Scroll scrubs between full-bleed scenes: the outgoing panel rotates away in 3D as the next one swings in, with the caption cross-fading rather than being rewritten.",
      zh: "滚动在几个整屏场景之间来回擦洗：当前面板带着 3D 旋转让开，下一块摆进来，图注是交叉淡入而不是被改写。",
      "zh-tw": "捲動在幾個整屏場景之間來回擦洗：當前面板帶著 3D 旋轉讓開，下一塊擺進來，圖註是交叉淡入而不是被改寫。",
    },
    height: 400,
    accent: "#29e0ff",
    anatomy: [
      "Scroll progress becomes a <b>continuous index</b> — 0 → 2 across three panels. The fractional part <i>is</i> the transition, which is what makes it scrub in both directions and stop wherever you stop. An integer index with a transition between values can only ever play forwards.",
      "Each panel positions itself from its distance to that index: <code>translateX(d × 68%) rotateY(d × −26deg) translateZ(−|d| × 190px)</code>. One expression covers incoming, centred and outgoing — there is no separate 'enter' and 'exit' state to keep in sync.",
      "<code>perspective</code> lives on the stage, not on the panels. Put it on each panel and every one gets its own vanishing point, so they rotate about themselves instead of about the room.",
      "Off-centre panels are dimmed with a <b>solid overlay</b>, not with <code>opacity</code>. Fading the panel itself lets the background show through and washes out its own contrast; a dark veil on top keeps the artwork saturated and just puts it in shadow.",
      "Panels more than 1.6 slots away are set to <code>visibility: hidden</code>, so at most three are ever composited no matter how long the list gets.",
      "The caption is one element per scene, cross-faded. Rewriting the text of a single element pops between scenes with no overlap — and it makes a screen reader announce every intermediate string as you scroll.",
    ],
    tokens: [
      { label: "Scroll distance", value: "420% of the viewport" },
      { label: "Perspective", value: "1400px, on the stage" },
      { label: "Panel offset", value: "translateX 68% per slot" },
      { label: "Rotation", value: "−26deg per slot" },
      { label: "Depth", value: "−190px at one slot away" },
      { label: "Veil", value: "solid #05050a, up to 0.68" },
    ],
    prompt:
      "Build a scroll-driven 3D scene transition in vanilla HTML/CSS/JS. A scroll container with a 420%-tall track and a sticky stage; put perspective: 1400px on the stage, never on the individual panels. Convert scroll progress into a CONTINUOUS index from 0 to (count − 1) and position every panel from its signed distance d to that index with a single expression: translateX(d * 68%) rotateY(d * -26deg) translateZ(-abs(d) * 190px). Do not use discrete states with CSS transitions — the fractional index is the transition, and that is what makes it scrub both ways. Dim off-centre panels with a solid dark overlay whose opacity rises with abs(d) up to 0.68, not with opacity on the panel itself, so the artwork keeps its contrast. Set visibility: hidden on panels more than 1.6 slots away. Render one caption element per scene and cross-fade them by abs(d); never rewrite the text of a single caption element. Set z-index from abs(d) and register the scroll listener passive.",
    caveats: [
      "Rotated panels are still hit-testable across their full projected area. If they carry links, a panel edge-on at 26 degrees can still swallow clicks meant for the centred one — add <code>pointer-events: none</code> to anything not centred.",
      "<code>rotateY</code> on a large panel renders through the GPU's texture sampler; on low-DPI external displays the artwork edges can shimmer during the scrub. A 1px inset border on the panel hides it.",
      "This eats 420% of viewport height in scroll for three panels. On a phone, where that is several thumb-flicks with nothing else on screen, cut the distance or the count — the effect that felt cinematic on a laptop reads as a page that will not end.",
    ],
    source: { label: "@菜心视觉设计 (Douyin) · effects catalogued from a screen recording of alche.jp", at: "0:24" },
  },
  {
    slug: "scroll-3d-carousel",
    category: "web-effects",
    date: "2026-09-05",
    plays: "scroll",
    title: { en: "Scroll-driven 3D carousel", zh: "滚动驱动的 3D 环形轮播", "zh-tw": "捲動驅動的 3D 環形輪播" },
    gist: {
      en: "Panels sit on a cylinder around the viewer and scroll rotates the ring. Each panel's place is set once at build time, so the per-frame cost is a single rotation on the parent.",
      zh: "面板绕着观察者排在一个圆柱上，滚动转动整个环。每块的位置只在初始化时算一次，所以每帧的开销就是父元素上的一个旋转。",
      "zh-tw": "面板繞著觀察者排在一個圓柱上，捲動轉動整個環。每塊的位置只在初始化時算一次，所以每幀的開銷就是父元素上的一個旋轉。",
    },
    height: 400,
    accent: "#7b2ff7",
    anatomy: [
      "Each panel is placed once: <code>rotateY(i × step) translateZ(radius)</code>. After that the <b>only</b> thing that changes per frame is one <code>rotateY</code> on the ring. Recomputing every panel each frame would do N times the work for an identical picture.",
      "The radius is derived, not guessed: <code>r = (w / 2) / tan(step / 2)</code> puts neighbours exactly edge to edge. Hard-coding a radius means the ring visibly re-spaces itself the moment the panel width changes at a breakpoint.",
      "<code>backface-visibility: hidden</code> is load-bearing. Without it the panels on the far side of the cylinder render mirrored through the near ones and the whole thing turns to soup — and it looks like a z-index problem, which is not where the fix is.",
      "<code>transform-style: preserve-3d</code> must be on the ring, or the children are flattened into the parent's plane and you get a row of skewed rectangles instead of a cylinder.",
      "The panels are dimmed by distance from the centre index, using a solid veil for the same reason as the scene transition: opacity on the panel itself would bleed the background through.",
    ],
    tokens: [
      { label: "Panels", value: "5" },
      { label: "Angle step", value: "360 / N = 72deg" },
      { label: "Radius", value: "(w/2) / tan(step/2) × 1.25" },
      { label: "Perspective", value: "1100px, on the stage" },
      { label: "Scroll distance", value: "500% of the viewport" },
      { label: "Dimming", value: "0.42 per slot, capped 0.8" },
    ],
    prompt:
      "Build a scroll-driven 3D circular carousel in vanilla HTML/CSS/JS. Put perspective: 1100px on a sticky stage and transform-style: preserve-3d on a ring element inside it. Place each of N panels ONCE at build time with transform: rotateY(i * 360/N deg) translateZ(radius), where radius is computed as (panelWidth / 2) / tan((360/N) / 2 in radians) * 1.25 so neighbours sit edge to edge — never hard-code the radius. Give every panel backface-visibility: hidden, without which the far side of the cylinder renders mirrored through the near side. On scroll, convert progress to a continuous index and set exactly one property: rotateY on the ring, equal to -index * step. Do not recompute the individual panel transforms per frame. Dim each panel with a solid dark overlay whose opacity is min(0.8, distanceFromCentre * 0.42). Recompute the radius on resize. Cross-fade one caption element per panel.",
    caveats: [
      "A cylinder wants the panel count and the step to agree. Five panels at 72 degrees is a ring you can spin forever; five panels at 40 degrees is an arc with a hole in the back, and you will see the hole.",
      "Perspective plus <code>preserve-3d</code> promotes every panel to its own layer. Five is comfortable; twenty is a memory problem on mobile Safari long before it is a frame-rate problem.",
      "The ring rotates about the viewport centre, so on a short viewport the top and bottom of the panels clip against the stage. Size the panel from the smaller of the two axes rather than from width alone.",
    ],
    source: { label: "@菜心视觉设计 (Douyin) · effects catalogued from a screen recording of alche.jp", at: "0:34" },
  },
  {
    slug: "scroll-snap-gallery",
    category: "web-effects",
    date: "2026-09-05",
    plays: "scroll",
    title: { en: "Scroll snap", zh: "滚动吸附", "zh-tw": "捲動吸附" },
    gist: {
      en: "Flick the row sideways and it settles exactly on the next item. Four CSS declarations, no JavaScript — and the browser keeps its own momentum physics, which is why a hand-written version never feels quite right.",
      zh: "横着一甩，它自己停在下一项正中。四条 CSS，零 JavaScript —— 而且惯性物理是浏览器自己的，这正是手写版本永远差一口气的原因。",
      "zh-tw": "橫著一甩，它自己停在下一項正中。四條 CSS，零 JavaScript —— 而且慣性物理是瀏覽器自己的，這正是手寫版本永遠差一口氣的原因。",
    },
    height: 380,
    accent: "#00c2a8",
    anatomy: [
      "<code>scroll-snap-type: x mandatory</code> on the scroller — which axis snaps, and that it always must. <code>proximity</code> instead means the browser snaps only when it feels like it, which reads as an intermittent bug rather than a softer setting.",
      "<code>scroll-snap-align: center</code> on each child — which part of the child lines up with the snap position.",
      "<code>scroll-padding-inline: 22%</code> — where 'centred' actually is. This is the one people leave out, and then wonder why the first and last items cannot reach the middle.",
      "<code>scroll-snap-stop: always</code> — a fast flick advances one item instead of skipping three. Without it a gallery is unusable on a trackpad, and perfectly fine on the mouse the developer tested with.",
      "🩸 The slide width is <code>flex: 0 0 100%</code>, not <code>56%</code>. A flex-basis percentage resolves against the container's <b>content box</b>, and the 22% <code>padding-inline</code> has already taken its bite — so <code>56%</code> would quietly hand you 56% of 56%, about a third of the rail, and the slides come out half the size you asked for. 100% of the content box <i>is</i> the 56% of the rail you wanted, and the neighbours peek by exactly the padding.",
      "<b>The snapping itself has no JavaScript.</b> The script in the sample only lights the dots. Handing this to the browser means you inherit its momentum curve, its rubber-banding and its accessibility behaviour for free — all of which a wheel-event reimplementation has to fake, and none of which it fakes convincingly.",
    ],
    tokens: [
      { label: "Snap", value: "x mandatory" },
      { label: "Align", value: "center" },
      { label: "Scroll padding", value: "22% inline" },
      { label: "Slide width", value: "100% of content box = 56% of rail" },
      { label: "Gap", value: "16px" },
      { label: "Skip guard", value: "scroll-snap-stop: always" },
    ],
    prompt:
      "Build a horizontal snapping gallery in pure CSS with no JavaScript for the snapping itself. On the flex scroll container set overflow-x: auto, scroll-snap-type: x mandatory (not proximity), scroll-padding-inline: 22% and scroll-behavior: smooth, with padding-inline of 22% so the first and last items can reach the centre. On each slide set flex: 0 0 100% — NOT 56%: a flex-basis percentage resolves against the container's content box, which the padding has already reduced, so 100% of that content box is the 56% of the rail you actually want — plus scroll-snap-align: center and scroll-snap-stop: always so a fast flick advances exactly one item. Hide the scrollbar with scrollbar-width: none and ::-webkit-scrollbar { display: none }. Do not reimplement momentum or snapping in a wheel handler — the browser's own physics is the point. Any JavaScript should be limited to secondary UI such as pagination dots, which find the nearest slide centre to the container's scroll midpoint. Set scroll-behavior: auto under prefers-reduced-motion: reduce.",
    caveats: [
      "Hiding the scrollbar removes the only affordance that the row scrolls at all. Keep a visible cue — dots, a peeking next slide, an arrow — or people will never touch it.",
      "<code>mandatory</code> can trap a user: if a slide is taller than the viewport on a cross-axis snap, they can never rest between items to read it. That is what <code>proximity</code> is genuinely for.",
      "<code>scroll-snap-stop: always</code> is unsupported in older Safari — it degrades to skipping, not to breaking, which is the right way round but is worth knowing before you rely on one-at-a-time.",
    ],
    source: { label: "@菜心视觉设计 (Douyin) · effects catalogued from a screen recording of alche.jp", at: "0:42" },
  },
  {
    slug: "staggered-character-reveal",
    category: "web-effects",
    date: "2026-09-05",
    plays: "self",
    title: { en: "Staggered character reveal", zh: "逐字错峰入场", "zh-tw": "逐字錯峰入場" },
    gist: {
      en: "Every glyph rises out of its own mask, 26ms apart. The interesting decisions are all in the splitting: per word so the text still wraps, and one aria-label so a screen reader does not read it letter by letter.",
      zh: "每个字从自己的遮罩里升起来，间隔 26ms。真正要拿捏的全在「怎么拆」：按词拆，文字才还能换行；补一个 aria-label，读屏才不会一个字母一个字母地念。",
      "zh-tw": "每個字從自己的遮罩裡升起來，間隔 26ms。真正要拿捏的全在「怎麼拆」：按詞拆，文字才還能換行；補一個 aria-label，讀螢幕才不會一個字母一個字母地念。",
    },
    height: 300,
    accent: "#ff9f0a",
    anatomy: [
      "The mask is <b>per word</b>, not per line. A line-level mask looks identical until the copy reflows at a narrower width — then the mask is still the old line's height and the text is cut in half. This is the single most common way this effect ships broken.",
      "Each character is <code>translateY(110%)</code> inside its word's <code>overflow: hidden</code> box. 110% rather than 100% covers the line-height slack, so nothing peeks above the mask before it starts.",
      "The word mask gets <code>padding-bottom: 0.16em; margin-bottom: -0.16em</code>. Without it the mask is sized to the line box and shaves the descenders off g, y and p — a clipping you will stare at for a while before you see it.",
      "The stagger is <code>transition-delay: calc(var(--i) * 26ms)</code> with the index written on each span. Under 20ms the line reads as one block; over about 40ms the last word arrives late enough that the eye has already moved on.",
      "Easing is <code>cubic-bezier(0.16, 1, 0.3, 1)</code> over 620ms — a hard deceleration. Opacity runs on a much shorter 300ms linear ramp, so glyphs are fully opaque well before they stop moving; matching the two durations makes the text look like it is fading rather than arriving.",
      "Splitting text into dozens of spans destroys it for assistive tech. The parent gets <code>aria-label</code> with the original sentence and the pieces are <code>aria-hidden</code>, putting it back to one string.",
      "Replay removes the class, forces a reflow with <code>void document.body.offsetWidth</code>, then re-adds it. Without that read the two class changes coalesce into no change at all and the replay silently does nothing.",
    ],
    tokens: [
      { label: "Stagger", value: "26ms per character" },
      { label: "Duration", value: "620ms" },
      { label: "Easing", value: "cubic-bezier(0.16, 1, 0.3, 1)" },
      { label: "Travel", value: "translateY(110%) → 0" },
      { label: "Opacity", value: "300ms linear (shorter on purpose)" },
      { label: "Descender pad", value: "0.16em" },
    ],
    prompt:
      "Build a staggered character reveal in vanilla HTML/CSS/JS. Split the text into WORDS first and characters inside each word — never split the whole string into characters, or a line break can land mid-word. Wrap each word in a span with overflow: hidden, display: inline-block, vertical-align: top, plus padding-bottom: 0.16em and margin-bottom: -0.16em so descenders are not clipped by the mask. Each character span starts at translateY(110%) and opacity 0; when the parent gets a .go class they animate to none/1 with transition: transform 620ms cubic-bezier(0.16, 1, 0.3, 1), opacity 300ms linear and transition-delay: calc(var(--i) * 26ms), where --i is the running character index. Keep the opacity ramp deliberately shorter than the movement. Set aria-label on the parent to the original sentence and aria-hidden on every generated span, so screen readers read one string rather than individual letters. Trigger on IntersectionObserver at threshold 0.4. For replay, remove the class, force a reflow by reading document.body.offsetWidth, then re-add it. Under prefers-reduced-motion: reduce, render the text in its final state with no transition.",
    caveats: [
      "26ms × character count is the real duration. A 60-character headline takes 620ms + 1.56s before the last glyph lands — fine for a hero, far too slow for anything a user is waiting on. Stagger by word for long copy.",
      "The split runs on <code>textContent</code>, so any inline markup inside the heading (a link, a <code>&lt;br&gt;</code>, an <code>&lt;em&gt;</code>) is destroyed. Walk text nodes instead if the copy is authored by anyone but you.",
      "If a web font swaps in after the split, every word mask was measured against the fallback metrics and the glyphs jump. Split after <code>document.fonts.ready</code> when the headline uses a custom face.",
    ],
    source: { label: "@菜心视觉设计 (Douyin) · effects catalogued from a screen recording of alche.jp", at: "0:47" },
  },
  {
    slug: "section-stacking-transition",
    category: "web-effects",
    date: "2026-09-05",
    plays: "scroll",
    title: { en: "Section stacking transition", zh: "滚动叠层转场", "zh-tw": "捲動疊層轉場" },
    gist: {
      en: "Each section sticks at the top and the next one climbs over it. The one underneath is never pushed — it is covered, dimmed and pushed back 6%, which is what makes a stack read as depth instead of as a list.",
      zh: "每一屏吸在顶部，下一屏爬上来盖住它。下面那层从不被推走 —— 它是被盖住、压暗、后退 6%，这才让「叠层」读起来像纵深而不是一个列表。",
      "zh-tw": "每一屏吸在頂部，下一屏爬上來蓋住它。下面那層從不被推走 —— 它是被蓋住、壓暗、後退 6%，這才讓「疊層」讀起來像縱深而不是一個列表。",
    },
    height: 400,
    accent: "#9a8bff",
    anatomy: [
      "Every section is <code>position: sticky; top: 0; height: 100%</code>. That is the entire mechanism — each one parks at the top and the next scrolls up over it in normal document order. No transforms are needed to move anything.",
      "The section underneath <b>does not move</b>. Translating it up as it is covered is the instinct, and it is wrong: two things moving at once reads as a list scrolling past, not as one card landing on another.",
      "Depth comes from two cheap cues on the covered section — a dark veil to 0.62 and <code>scale(1 - k × 0.06)</code> on its contents. 6% is small enough to feel like distance rather than like the card shrinking.",
      "<code>k</code> is measured from the next section's own <code>getBoundingClientRect().top</code> divided by the viewport height, giving 0 while it is off-screen and 1 when it has fully covered. Deriving it from the covering element rather than from a global scroll offset means it stays correct however the sections are sized.",
      "Each section needs <code>isolation: isolate</code>. Without it the sticky siblings bleed through each other's rounded corners — one of those artefacts that only shows on the exact overlap frame.",
      "The last section carries no transition and simply rests. A stack that ends mid-transition leaves the page looking like it failed to finish loading.",
    ],
    tokens: [
      { label: "Mechanism", value: "position: sticky; top: 0; height: 100%" },
      { label: "Corner", value: "18px 18px 0 0" },
      { label: "Veil", value: "solid #05050a → 0.62" },
      { label: "Push back", value: "scale(1 − k × 0.06)" },
      { label: "Progress k", value: "1 − nextRect.top / viewportHeight" },
    ],
    prompt:
      "Build a section stacking transition in vanilla HTML/CSS/JS. Give every full-height section position: sticky; top: 0; height: 100vh; border-radius: 18px 18px 0 0; overflow: hidden and isolation: isolate — the isolation is required or sticky siblings bleed through each other's rounded corners. The section being covered must NOT move: do not translate it. Instead compute, for each section, k = clamp(0, 1 - nextSection.getBoundingClientRect().top / viewportHeight, 1) and use it for two things only — a solid dark overlay at opacity k * 0.62, and scale(1 - k * 0.06) on that section's contents. Derive k from the covering element's own rect rather than from a global scroll offset so it stays correct at any section height. Give the last section no transition so the stack comes to rest. Register the scroll listener with { passive: true }.",
    caveats: [
      "<b>The video this came from cuts to black right after the title card</b>, so unlike the other six entries here this sample is a reconstruction of the named pattern rather than a match to observed frames. The mechanism is the standard one; the exact numbers are mine.",
      "Sticky dies silently inside any ancestor with <code>overflow: hidden</code>. The sections simply scroll away as normal and there is no error anywhere — always the first thing to check when a stack does not stack.",
      "A stack of N sections costs N × 100vh of scrolling to get through. Four is a section; ten is a hostage situation.",
      "Sticky elements are repainted on every scroll frame. Keep what is inside them cheap — a stack of four sections each containing a video is a very different proposition from four gradients.",
    ],
    source: { label: "@菜心视觉设计 (Douyin) · title card only, the recording ends before the demo", at: "0:55" },
  },
  {
    slug: "magnetic-button",
    category: "web-effects",
    date: "2026-09-05",
    plays: "hover",
    title: {
      en: "Magnetic button",
      zh: "磁吸按钮",
      "zh-tw": "磁吸按鈕",
    },
    gist: {
      en: "The button leans toward the cursor before you reach it, then springs back when you leave. Costs two CSS variables and a pointermove listener.",
      zh: "指针还没碰到，按钮就先朝它偏过来；离开时弹回原位。成本是两个 CSS 变量加一个 pointermove 监听。",
    },
    height: 260,
    accent: "#1d1d1f",
    anatomy: [
      "JS writes only two custom properties, <code>--mx</code> and <code>--my</code>. The <code>transform</code> stays in the stylesheet, which leaves <code>:active</code> free to own <code>scale</code> — if JS owned the whole transform, the press feedback would keep getting overwritten mid-drag.",
      "A <code>.tracking</code> class zeroes the <b>transform's</b> transition-duration while the pointer is inside the catchment area — the other transitioned properties (the glow, the border) keep theirs, which is why the duration list has three values. Without this the button trails the cursor by the transition duration and feels like it is on elastic.",
      "The release is where the easing lives: 450ms of <code>cubic-bezier(0.23, 1, 0.32, 1)</code>, a strong ease-out that overshoots nothing but decelerates hard.",
      "Gated behind <code>(pointer: fine)</code>. On touch there is no hover — the pointer arrives already pressed, so the effect would only ever fire as a flicker at tap time.",
      "<code>getBoundingClientRect()</code> reports the <b>transformed</b> box, so measuring the cursor offset against it measures against a button that has already moved toward the cursor. The two then chase each other to an equilibrium and the actual pull collapses to a fraction of <code>PULL</code>. Subtracting the currently applied translation recovers the resting centre.",
      "The release has to be handled twice. The obvious path is the next <code>pointermove</code> landing outside the catchment area — but if the pointer leaves the document there <b>is</b> no next event, and the button stays stuck at its last offset. The second path is a document-level <code>mouseout</code> whose <code>relatedTarget</code> is <code>null</code>, which is the signal that the pointer left the document rather than merely crossing into another element. <b>Not <code>pointerleave</code></b>: measured here, it does not fire for this case at all.",
    ],
    tokens: [
      { label: "Catchment radius", value: "60px beyond the button box" },
      { label: "Pull strength", value: "0.35 × offset from centre" },
      { label: "Release", value: "450ms cubic-bezier(0.23, 1, 0.32, 1)" },
      { label: "Press", value: "scale(0.96)" },
      { label: "Release triggers", value: "pointermove outside · mouseout w/ null relatedTarget · blur" },
    ],
    prompt:
      "Build a magnetic button in vanilla HTML/CSS/JS. On pointermove, if the cursor is within 60px of the button's bounding box, translate the button by 35% of the cursor's offset from the button centre; outside that range translate back to 0,0. Write the offsets into two CSS custom properties (--mx, --my) and apply them with transform: translate(var(--mx), var(--my)) declared in CSS — do not set the transform from JavaScript. While tracking, set transition-duration to 0ms; on release, transition transform over 450ms cubic-bezier(0.23, 1, 0.32, 1). Add :active { scale: 0.96 }. Measure the cursor offset against the button's RESTING centre: getBoundingClientRect returns the already-transformed box, so subtract the translation currently applied before computing the offset, otherwise the button chases the cursor and the pull collapses. Reset to 0,0 both on a pointermove outside the catchment area and on a document-level mouseout whose relatedTarget is null (the pointer leaving the document fires no further pointermove, so without this the button stays stuck). Only enable the effect when matchMedia('(pointer: fine)') matches and prefers-reduced-motion is not 'reduce'.",
    caveats: [
      "A global <code>pointermove</code> listener fires on every mouse move on the page. With one button that is nothing; with thirty of them on a grid, delegate to a single listener and hit-test, or the main thread will show it.",
      "Pulling the button away from its own box means the pointer can end up hovering the button while sitting over empty space — fine for a big CTA, confusing in a dense toolbar.",
      "<b>Both of the bugs above were found by driving the thing with a real cursor, not by reading the code.</b> Each one is invisible to the test that moves the mouse in a single jump: one needs continuous movement to show up, the other needs the pointer to actually leave. Without the reset the button sticks in its pulled position whenever the cursor exits the document — which on a full-page layout takes a deliberate flick to the browser chrome, but in an embed like the one above happens every single time. Nothing errors; the button just quietly stops being centred.",
    ],
  },
  {
    slug: "aurora-drift",
    category: "web-effects",
    date: "2026-09-05",
    plays: "self",
    title: {
      en: "Aurora drift",
      zh: "极光漂移",
      "zh-tw": "極光漂移",
    },
    gist: {
      en: "Two blurred colour blobs drifting on mismatched periods, so the composition never visibly loops. Two pseudo-elements, no images, no canvas.",
      zh: "两团模糊色斑用互不整除的周期各自漂移，所以整体图案不会肉眼可见地循环。两个伪元素搞定，不用图、不用 canvas。",
    },
    height: 300,
    accent: "#bf5af2",
    anatomy: [
      "Two <code>::before</code> / <code>::after</code> circles, each a <code>radial-gradient</code> fading to transparent at 70%, then <code>filter: blur(90px)</code> over the top. The blur is what turns two hard circles into light.",
      "Periods are <b>18s and 22s</b>. Equal durations — or one a multiple of the other — make the pair return to the same arrangement every cycle, and the loop becomes visible. Mismatched periods take minutes to repeat.",
      "Only <code>transform</code> is animated. Animating <code>top</code>/<code>left</code> would re-run a 90px blur every frame; a transform hands the already-blurred layer to the compositor and just moves it.",
      "<code>overflow: hidden</code> on the container is load-bearing: the blobs are positioned outside the box on purpose, and without it they add scrollbars.",
    ],
    tokens: [
      { label: "Blob size", value: "420px / 460px" },
      { label: "Blur", value: "90px" },
      { label: "Opacity", value: "0.55" },
      { label: "Periods", value: "18s / 22s, ease-in-out alternate" },
      { label: "Travel", value: "≤80px, scale ≤1.12" },
    ],
    prompt:
      "Create an ambient background using two pseudo-elements on a container. Each is a circle (420px and 460px) filled with a radial-gradient from a pastel colour to transparent at 70%, with filter: blur(90px) and opacity 0.55, positioned so they overflow opposite corners of the container. Animate each with a different period — 18s and 22s, ease-in-out, infinite alternate — moving them by no more than 80px with translate() and scaling to at most 1.12. Animate transform only, never top/left. Set overflow: hidden and isolation: isolate on the container, put the blobs at z-index: -1, and disable both animations under prefers-reduced-motion: reduce.",
    caveats: [
      "<code>blur(90px)</code> over a large area is genuinely expensive on low-end Android. If the page also scrolls, check it on a real device before shipping — the cost shows up as scroll jank, not as a dropped animation.",
      "Content sitting on top needs its own stacking context (<code>isolation: isolate</code>), or a child with a negative z-index elsewhere can slip behind the blobs.",
    ],
  },
  {
    slug: "shimmer-headline",
    category: "web-effects",
    date: "2026-09-05",
    plays: "self",
    title: {
      en: "Shimmer headline",
      zh: "流光标题",
      "zh-tw": "流光標題",
    },
    gist: {
      en: "A gradient sliding behind the letters, clipped to the glyphs. Three CSS properties do the whole thing; the interesting decisions are the timing function and where the gradient loops.",
      zh: "一条渐变在字母后面滑动，裁进字形里。三个 CSS 属性就是全部；真正要拿捏的是缓动函数和渐变在哪儿接缝。",
    },
    height: 260,
    accent: "#0a84ff",
    anatomy: [
      "<code>background-clip: text</code> plus <code>color: transparent</code> turns the letters into a window onto the background. Nothing about the text moves — the cloth behind it does.",
      "<code>background-size: 320% 100%</code> gives the gradient room to travel. The animation moves <code>background-position</code> across exactly that 320%.",
      "The first and last colour stops are the same (<code>#0a84ff</code>), so arriving at 320% lands back on the starting appearance and the loop has no visible seam.",
      "<b>linear</b>, not <code>ease</code>. This is light moving at constant speed, not a gesture with a start and a stop; <code>ease</code> makes it hesitate at both ends and reads as a stutter.",
    ],
    tokens: [
      { label: "Gradient", value: "100deg, 6 stops, first = last" },
      { label: "background-size", value: "320% 100%" },
      { label: "Duration", value: "8s linear infinite" },
      { label: "Reduced motion", value: "freeze at background-position: 30%" },
    ],
    prompt:
      "Animate a headline with a gradient shimmer. Apply a linear-gradient(100deg, ...) with six colour stops where the first and last stop are the same colour, set background-size: 320% 100%, background-clip: text (with the -webkit- prefix) and color: transparent. Animate background-position from 0 to 320% 0 over 8s with a linear timing function, infinite. Do not use ease — the motion must be constant-speed. Under prefers-reduced-motion: reduce, disable the animation and freeze background-position at 30% so the text keeps its colour instead of going transparent.",
    caveats: [
      "If the animation is disabled without also freezing a <code>background-position</code>, some engines leave the text fully transparent — an invisible headline is a far worse accessibility outcome than the motion was.",
      "Gradient text has no reliable contrast ratio. Keep it for display type that is decorative; never run body copy or anything a screen reader user needs to find visually through this.",
    ],
  },
];

export function effectsIn(category: CategoryId): Effect[] {
  return effects
    .filter((e) => e.category === category)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

/** 没有效果的分类不出现在 /lab 上 —— 空分类页比没有分类页更伤。 */
export function activeCategories(): Category[] {
  return categories.filter((c) => effectsIn(c.id).length > 0);
}

export function categoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}

export function effectBySlug(category: string, slug: string): Effect | undefined {
  return effects.find((e) => e.category === category && e.slug === slug);
}

/** demo 文件路径由 slug 推导，不在数据里手写 —— 手写就会有拼错的那天。 */
export function demoPath(e: Effect): string {
  return e.bundleDir ? `/effects/${e.slug}/index.html` : `/effects/${e.slug}.html`;
}

/**
 * /lab 的界面文案。
 *
 * 没有并进 `lib/i18n.ts` 的 `Dictionary`，因为那个类型是严格的
 * `Record<Locale, …>` —— 加一个键要同时改 12 个语言块。这里用 `Localized`
 * （只有 en 必填、其余回落），加一句话就是加一行。
 */
export const labCopy = {
  navLabel: { en: "AI Library", zh: "AI 设计库", "zh-tw": "AI 設計庫", ja: "AI ライブラリ", ko: "AI 라이브러리", it: "Libreria AI" },
  title: { en: "AI Library", zh: "AI 设计库", "zh-tw": "AI 設計庫", ja: "AI ライブラリ", ko: "AI 라이브러리", it: "Libreria AI" },
  intro: {
    en: "A working reference, not a gallery. Every sample here runs in the page — hover it, scroll it, replay it — and each one comes with the numbers it was built from, the whole source file, and a prompt that reproduces it from scratch.",
    zh: "这是一份能用的参考，不是灵感墙。这里每个样板都在页面里真的跑着 —— 可以碰、可以滚、可以重播；每一条都附带它是用什么数值搭出来的、完整源文件、以及一句能从零把它复现出来的提示词。",
    "zh-tw": "這是一份能用的參考，不是靈感牆。這裡每個樣板都在頁面裡真的跑著 —— 可以碰、可以捲、可以重播；每一條都附帶它是用什麼數值搭出來的、完整原始檔、以及一句能從零把它複現出來的提示詞。",
  },
  englishOnly: {
    en: "",
    zh: "拆解与提示词是英文的 —— 提示词本来就该用英文喂给模型。",
    "zh-tw": "拆解與提示詞是英文的 —— 提示詞本來就該用英文餵給模型。",
  },
  count: { en: "effects", zh: "条效果", "zh-tw": "條效果", it: "effetti" },
  replay: { en: "Replay", zh: "重播", "zh-tw": "重播", ja: "リプレイ", ko: "다시", it: "Riavvia" },
  copy: { en: "Copy", zh: "复制", "zh-tw": "複製", ja: "コピー", ko: "복사", it: "Copia" },
  copied: { en: "Copied", zh: "已复制", "zh-tw": "已複製", ja: "コピー済み", ko: "복사됨", it: "Copiato" },
  howTitle: { en: "How it works", zh: "怎么做到的", "zh-tw": "怎麼做到的" },
  tokensTitle: { en: "Numbers", zh: "参数", "zh-tw": "參數" },
  promptTitle: { en: "Prompt", zh: "提示词", "zh-tw": "提示詞" },
  promptHint: {
    en: "Paste this into any coding model to get the effect from scratch. It states every number explicitly — vague words like “smooth” or “modern” produce a different result every time.",
    zh: "把这段丢给任意一个写代码的模型，就能从零长出这个效果。它把每个数值都写死了 ——「丝滑」「现代感」这种词每次生成出来的都不一样。",
    "zh-tw": "把這段丟給任意一個寫程式的模型，就能從零長出這個效果。它把每個數值都寫死了 ——「絲滑」「現代感」這種詞每次生成出來的都不一樣。",
  },
  sourceTitle: { en: "Source", zh: "源码", "zh-tw": "原始碼" },
  /** 卡片上那两个小按钮 */
  codeBtn: { en: "Code", zh: "代码", "zh-tw": "程式碼", ja: "コード", ko: "코드", it: "Codice" },
  promptBtn: { en: "Prompt", zh: "提示词", "zh-tw": "提示詞", ja: "プロンプト", ko: "프롬프트", it: "Prompt" },
  sourceHint: {
    en: "The whole file. It is what the sample above is running — copy it into an .html file and it works with nothing else.",
    zh: "整个文件。上面那个样板跑的就是它 —— 存成 .html 打开就能用，不需要别的任何东西。",
    "zh-tw": "整個檔案。上面那個樣板跑的就是它 —— 存成 .html 打開就能用，不需要別的任何東西。",
  },
  caveatsTitle: { en: "Where it breaks", zh: "会翻车的地方", "zh-tw": "會翻車的地方" },
  fromTitle: { en: "Seen in", zh: "出处", "zh-tw": "出處" },
  allCategories: { en: "All categories", zh: "全部分类", "zh-tw": "全部分類" },
  /** 总览页每张模块卡里那个轮播 */
  previewOf: { en: "Preview", zh: "预览", "zh-tw": "預覽", ja: "プレビュー", ko: "미리보기", it: "Anteprima" },
  goToSlide: { en: "Show", zh: "看", "zh-tw": "看", ja: "表示", ko: "보기", it: "Mostra" },
  /** 预览里静止的那些：说清楚它要人做什么，否则看着像坏了 */
  needsHover: { en: "hover it", zh: "要悬停", "zh-tw": "要停留", ja: "ホバー", ko: "호버", it: "passa sopra" },
  needsScroll: { en: "scroll it", zh: "要滚动", "zh-tw": "要捲動", ja: "スクロール", ko: "스크롤", it: "scorri" },
  needsClick: { en: "click it", zh: "要点击", "zh-tw": "要點擊", ja: "クリック", ko: "클릭", it: "clicca" },
  /** 有海报的重作品：轮播里是静态图，点开才是真的 */
  openToPlay: { en: "open to play", zh: "\u70b9\u5f00\u53ef\u73a9", "zh-tw": "\u9ede\u958b\u53ef\u73a9", ja: "\u958b\u3044\u3066\u64cd\u4f5c", ko: "\uc5f4\uc5b4\uc11c \uc870\uc791", it: "apri per interagire" },
} satisfies Record<string, Localized>;
