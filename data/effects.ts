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

export type CategoryId = "motion" | "scroll" | "background" | "text" | "surface" | "feedback";

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
    id: "motion",
    title: { en: "Motion", zh: "动效", "zh-tw": "動效", ja: "モーション", it: "Movimento" },
    intro: {
      en: "Things that move when you touch them. Durations, easing curves and the exact distances — the parts that decide whether an interaction feels alive or merely animated.",
      zh: "碰它一下会动的东西。时长、缓动曲线、精确到像素的位移 —— 决定一个交互是「活的」还是「只是有动画」的那部分。",
    },
    accent: "#2f6fff",
  },
  {
    id: "scroll",
    title: { en: "Scroll", zh: "滚动驱动", "zh-tw": "捲動驅動", ja: "スクロール", it: "Scroll" },
    intro: {
      en: "The scrollbar as a timeline. Scrubbing a transition with the wheel instead of playing it on a timer is what separates a site that responds from a site that merely animates — and it is where most of the cost hides.",
      zh: "把滚动条当时间轴。用滚轮擦洗一段转场、而不是让它按定时器自己播完，是「会回应你」和「只是有动画」的分界线 —— 也是开销最容易失控的地方。",
      "zh-tw": "把捲軸當時間軸。用滾輪擦洗一段轉場、而不是讓它按計時器自己播完，是「會回應你」和「只是有動畫」的分界線 —— 也是開銷最容易失控的地方。",
    },
    accent: "#ff375f",
  },
  {
    id: "background",
    title: { en: "Backgrounds", zh: "背景", "zh-tw": "背景", ja: "背景", it: "Sfondi" },
    intro: {
      en: "Gradients, grain, drifting light. Everything that sits behind the content and sets the mood without asking for attention.",
      zh: "渐变、噪点、漂移的光。所有待在内容后面、负责定调子又不抢注意力的东西。",
    },
    accent: "#bf5af2",
  },
  {
    id: "text",
    title: { en: "Type", zh: "文字", "zh-tw": "文字", ja: "タイポ", it: "Testo" },
    intro: {
      en: "Headline treatments, reveals, variable-font tricks. Type carries most of the personality of a page, and most of it is done with three or four properties.",
      zh: "标题处理、逐字进场、可变字体的花活。一个页面的气质大半由文字决定，而这大半又只用到三四个属性。",
    },
    accent: "#ff9f0a",
  },
  {
    id: "surface",
    title: { en: "Surfaces", zh: "材质", "zh-tw": "材質", ja: "マテリアル", it: "Superfici" },
    intro: {
      en: "Glass, depth, borders that catch the light. How a rectangle stops being a rectangle and starts being an object.",
      zh: "玻璃、纵深、会反光的描边。一个矩形怎样才不再是矩形、而开始像一个物体。",
    },
    accent: "#00c2a8",
  },
  {
    id: "feedback",
    title: { en: "Feedback", zh: "反馈", "zh-tw": "回饋", ja: "フィードバック", it: "Feedback" },
    intro: {
      en: "Loading, empty, success, error. The states a design is judged on but rarely shown in.",
      zh: "加载、空、成功、失败。评价一个设计好坏靠的是这些状态，而稿子里通常一个都没有。",
    },
    accent: "#7c6cff",
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
  /** 卡片占位底与详情页点缀色。取效果本身的主色，不是分类色。 */
  accent: string;
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
    slug: "interactive-liquid-distortion",
    category: "surface",
    date: "2026-09-05",
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
    category: "scroll",
    date: "2026-09-05",
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
    category: "scroll",
    date: "2026-09-05",
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
    category: "scroll",
    date: "2026-09-05",
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
    category: "scroll",
    date: "2026-09-05",
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
    category: "text",
    date: "2026-09-05",
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
    category: "scroll",
    date: "2026-09-05",
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
    category: "motion",
    date: "2026-09-05",
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
      "A <code>.tracking</code> class sets <code>transition-duration: 0ms</code> while the pointer is inside the catchment area. Without it the button trails the cursor by the transition duration and feels like it is on elastic.",
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
    category: "background",
    date: "2026-09-05",
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
    category: "text",
    date: "2026-09-05",
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
  return `/effects/${e.slug}.html`;
}

/**
 * /lab 的界面文案。
 *
 * 没有并进 `lib/i18n.ts` 的 `Dictionary`，因为那个类型是严格的
 * `Record<Locale, …>` —— 加一个键要同时改 12 个语言块。这里用 `Localized`
 * （只有 en 必填、其余回落），加一句话就是加一行。
 */
export const labCopy = {
  navLabel: { en: "Lab", zh: "实验室", "zh-tw": "實驗室", ja: "ラボ", ko: "랩", it: "Lab" },
  title: { en: "Lab", zh: "实验室", "zh-tw": "實驗室", ja: "ラボ", ko: "랩", it: "Lab" },
  intro: {
    en: "Interface effects taken apart and rebuilt: what it is made of, the exact numbers, and a prompt that reproduces it. Every sample on this site is live — hover it, replay it, read the source.",
    zh: "把界面效果拆开重做一遍：它由什么构成、精确到多少的数值、以及一句能把它复现出来的提示词。这里每一个样板都是活的 —— 可以碰、可以重播、可以读源码。",
    "zh-tw": "把介面效果拆開重做一遍：它由什麼構成、精確到多少的數值、以及一句能把它複現出來的提示詞。這裡每一個樣板都是活的 —— 可以碰、可以重播、可以讀原始碼。",
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
  sourceHint: {
    en: "The whole file. It is what the sample above is running — copy it into an .html file and it works with nothing else.",
    zh: "整个文件。上面那个样板跑的就是它 —— 存成 .html 打开就能用，不需要别的任何东西。",
    "zh-tw": "整個檔案。上面那個樣板跑的就是它 —— 存成 .html 打開就能用，不需要別的任何東西。",
  },
  caveatsTitle: { en: "Where it breaks", zh: "会翻车的地方", "zh-tw": "會翻車的地方" },
  fromTitle: { en: "Seen in", zh: "出处", "zh-tw": "出處" },
  allCategories: { en: "All categories", zh: "全部分类", "zh-tw": "全部分類" },
} satisfies Record<string, Localized>;
