/**
 * 设计库每条效果的「橱窗」介绍 —— 公开页上、录屏下面的那一段。
 *
 * 写给两种读者：从 Google 搜到这里的人（所以要说清这是什么、用在哪、谁在用），
 * 和还没决定要不要联系我的潜在客户（所以要说它适合什么样的站）。
 *
 * 🩸 **只讲效果，不讲做法**。数值、结构、提示词都在门后面（data/effects.ts 的
 *    anatomy / tokens / prompt），这里一个都不许漏 —— 这段是任何人都看得到的。
 *
 * 只有英文：跟 anatomy / prompt 一个口径，目标查询本来就只有英文有量。
 * 每条一段，80 词上下；缺了哪条构建直接红（blurbOf 会抛）。
 */
const blurbs: Record<string, string> = {
  // ── creative ──
  "cyclone-369":
    "A real-time volumetric storm rendered entirely on the GPU, ported from a famous 369-character shader. It is the kind of piece that belongs on a landing page for a creative studio, an audio tool or anything that wants a living, slightly dangerous backdrop behind a single headline. Because it is a shader and not a video, it never loops visibly and costs nothing in bandwidth — the price is paid in GPU, which is why the sample also shows how to keep it cheap on phones.",
  "holo-card":
    "A collectible trading card you can turn in your hands: the artwork has real depth, and the foil reacts to the angle you hold it at instead of shimmering on a timer. Built for product reveals, membership tiers, NFT-style drops and loyalty cards — anywhere a single object has to feel valuable. The same technique carries over to credit-card mockups and premium subscription pages, where a card that responds to the pointer does more than any badge or gradient.",
  "liquid-orb":
    "The voice orb: a sphere of liquid glass that idles, thinks and breathes with sound, rendered in WebGPU. This is the visual language of AI assistants — the thing on screen while the model is listening — and it ships with a full bench of presets so the same orb can be tuned to a brand. It runs in M Translate's voice mode; on the web it suits assistant landing pages, voice-product demos and any interface that needs a face without drawing one.",

  // ── mobile-ui ──
  "mind-space-ai-os":
    "A working replica of an ambient AI phone interface: three screens where the sky takes the colour of whatever you are doing, context cards carry live widgets inside them, and a single prompt bar is the only control. It is a study in what an operating system looks like when the model is the interface. Useful as a reference for AI-first product concepts, pitch prototypes and anyone designing a phone experience where the background itself communicates state.",
  "ambient-hue-follows-focus":
    "The background of the screen is not a fixed theme — it takes the hue of whatever currently has focus and glides to it, so the whole mood shifts without any element being recoloured. A quiet trick used by music players, meditation apps and AI assistants to make the interface feel aware of what you are looking at. It works in any app with a few strong accent colours, and it is one of the cheapest ways to make a screen feel alive.",
  "glass-stack-flip-reorder":
    "Switch a filter and a stack of frosted cards re-sorts itself: each card slides from where it was to where it now belongs, the one that lands on top turns dark, and the background takes its colour. This is the motion you see in well-made task managers, inboxes and finance apps when a list changes order — the eye can follow every item instead of watching the list blink. Ideal for dashboards, feeds and any sorted collection on mobile.",
  "overlap-row":
    "A row of avatars, each tucked a third of the way under the previous one, with a '+3' for the rest. Tap it and they fan out one by one with names underneath; tap again and they tuck back. The pattern is everywhere — collaborators on a document, guests on a booking, members of a group chat — and this version is the well-behaved one, with the fan-out that makes a crowded row readable on a phone.",
  "progress-fill":
    "There is no progress bar. The card's own background fills from the left as items get ticked, the text sitting on top unchanged, and at the finish the whole card lifts and glows once. It suits habit trackers, checklists, onboarding steps and order status — anywhere a bar would be one more element competing for space. A strong pattern for apps that want progress to feel like a state of the object, not a widget next to it.",
  "accordion-row":
    "Four vertical strips side by side, each showing only an icon, a number and a rotated label. Tap one and it widens to reveal its detail while the other three narrow; tap another and the width slides over. A compact way to show several categories at once on a phone — spending by type, workouts by kind, tasks by project — without a tab bar or a second screen. Common in fitness and finance apps; unusual enough to make a summary screen memorable.",
  "card-tray":
    "A main card with a darker tray tucked under its bottom edge, showing a single teaser line. Tap the tray and it slides out from under the card to reveal the detail — the main card never moves. It is the pattern for 'there is a little more here': today's sessions under a stats card, recent transactions under a balance, sub-tasks under a task. Works anywhere a card wants a secondary layer without a modal or a new screen.",
  "magnify-row":
    "A dock of small icons. Hold and slide across it: the icon under your finger grows, its neighbours a little, and the whole row ripples along with you while a title shows which one you are on; let go to select. It is the macOS dock gesture brought to touch, and it makes a row of eight tiny targets usable with a thumb. Suited to app launchers, emoji and reaction pickers, tool palettes and any dense horizontal picker on mobile.",
  "pull-summary":
    "A one-line strip of three numbers sits at the top of a list. Pull it down and it grows under your finger into the full stats panel, the list sliding down to make room; let go past the threshold and it snaps open, otherwise it springs back. A gesture-driven alternative to a stats tab, used in fitness, habit and productivity apps where the summary matters but should not take permanent space above the list.",

  // ── web-effects ──
  "cursor-gaze-tracking":
    "A plush mascot whose eyes follow the cursor anywhere on the page, brows leaning a beat later, the head tilting a touch, and a blink every few seconds. Character-driven landing pages, error pages, kids' products and playful brands use this to make a static illustration feel like it is watching you. It is a small effect with a large payoff: visitors move the mouse just to see it react, and that is time on the page.",
  "scroll-pinned-hero-recomposition":
    "The hero stays pinned while scrolling takes it apart: the two hands slide away from their touch point, the ring swells, the centred headline empties out and four fragments arrive in the corners — one composition becoming another without a cut. This is the signature move of product-launch and agency sites, where the first screen has to tell a story before the visitor reaches any copy. Best with one strong hero image and a single sentence of message.",
  "cursor-miniature-parallax":
    "A glass terrarium with a tiny scene inside. Move the cursor and the layers shift by depth — rocks one way, moss the other, the glass highlight against all of them — and a flick makes the smallest creature hop. It is a diorama in a box, the kind of hero that suits craft brands, indie games, nature and wellness products, or any site that wants a moment of delight above the fold without a video.",
  "scroll-orbit-turntable":
    "Scroll walks the camera a full circle around a figure on a pedestal: the title fades as the orbit begins, notes surface at the angles they belong to, and the closing line lands as the figure comes back to face you. This is how product pages for sneakers, watches, headphones and collectibles present a single object — every angle, on the visitor's own pace. It works with a 3D model or a photographed turntable sequence.",
  "hover-door-bloom":
    "Hover the car and the door swings open with flowers pouring out; leave and it all rewinds from wherever it got to. A hover reveal with a proper undo, which is what separates it from the ones that snap back. Suited to art projects, campaign microsites, automotive and fashion pages — anywhere one image can carry a surprise. The same mechanism works for any 'open it' metaphor: a box, a book, a gift.",
  "hover-tinted-service-list":
    "A list where every row owns a colour: hover one and the whole section repaints to it, the row steps forward, and the price, blurb and preview card follow. It turns a plain services or pricing list into something people run the cursor down just to watch it change. Used on agency, studio and consultancy sites for the services block; also strong for menus, treatment lists and course catalogues where each item has its own identity.",
  "scroll-vortex-transit":
    "Scroll pushes the camera into a cloud tunnel: the hero fades, the bands balloon past the edges, the dark eye grows until it fills the frame, and the next chapter is what is on the other side. A chapter transition for storytelling sites, game and film promos, and long-form product pages that want a real 'and then' between sections. It reads as travel rather than as a page scrolling.",
  "click-drop-overgrowth":
    "A glowing sphere floats above a soft shape. Click and it drops, lands with a squash, and from the point of impact a dark fur creeps over the surface with sparks and small flowers riding the front. It is an interactive hero for brands that trade on mood — fragrance, skincare, generative art, fashion — where one gesture from the visitor changes the whole scene. Also a memorable 404 or loading moment.",
  "scroll-helix-flythrough":
    "Scroll is one continuous dolly along a glowing double helix: the camera passes through three stations — wide, close enough to see single rungs, wide again from the other side — and the copy swaps at each. Biotech, health-tech, genomics and pharma sites use this kind of guided fly-through to explain something invisible; the same structure works for any product with a 'how it works' that has three steps.",
  "cursor-luminous-gateway":
    "A glowing doorway on a dusk horizon. The whole scene creeps toward you over several seconds, mist rises off the ground, and the cursor tilts the layers apart by depth. It is an atmospheric hero for games, events, fantasy and sci-fi launches, immersive experiences and 'coming soon' pages — the doorway is a natural call to action. Works from layered illustration or a photograph split into planes.",
  "bin-eats-label":
    "A delete button whose own label is the thing being deleted: the lid opens, the letters tumble in one at a time, and what is left is a circular icon with a progress ring around it. A micro-interaction for destructive actions in web apps, admin panels and mobile-style interfaces — it makes 'delete' feel deliberate and gives the undo window a visible shape. Small enough to add to an existing product.",
  "scroll-scrubbed-sequence":
    "A pinned stage where scroll position picks the frame instead of a clock. Nothing plays on its own — the reader is the transport control, and letting go stops it dead. This is the technique behind Apple-style product pages where a device assembles itself as you scroll. It suits hardware, packaging, architecture and any object photographed as a sequence; it also works for illustrated stories.",
  "chapter-headline-roller":
    "Scroll crosses a chapter line and the headline rolls over: old lines climb out of a clip window while the new ones rise in behind them, one row lagging the next. A section transition for portfolio and editorial sites, case studies and long landing pages — the headline announces where you are without a sticky nav. Pairs well with the scroll-brightened paragraph next door.",
  "scroll-word-brighten":
    "A paragraph lit word by word as it scrolls, with a soft front several words wide — light moving across the text rather than a cursor stepping through it. The manifesto effect: personal sites, studio 'about' pages and product philosophies use it to make a single paragraph feel read aloud. It slows the visitor down on the one block of copy that matters and costs almost nothing to run.",
  "interactive-liquid-distortion":
    "A tilted band of glass follows the pointer and refracts whatever is behind it, leaning into the direction of travel and straightening when you stop — without WebGL. It gives a hero image or a headline a physical, wet-glass quality that reads as expensive. Fashion, beauty, architecture and design studios use it; it also makes a strong cursor-follow effect for photography portfolios where the image itself should stay untouched.",
  "fullscreen-expansion-transition":
    "Scroll opens a small card out to full bleed. The card never scales — the window cut out of it does — so the artwork and type inside stay pixel-exact the whole way. The effect behind 'tap a card, it becomes the page' on editorial and portfolio sites, gallery sites and case-study indexes. It is the transition that makes a grid of projects feel like one continuous space instead of a list of links.",
  "scroll-driven-scene-transition":
    "Scroll scrubs between full-bleed scenes: the outgoing panel rotates away in 3D as the next one swings in, with the caption cross-fading rather than being rewritten. A chapter transition for image-led sites — travel, hospitality, real estate, campaigns — where each section is one photograph and one line. It gives a long page the rhythm of a slideshow while keeping normal scrolling.",
  "scroll-3d-carousel":
    "Panels sit on a cylinder around the viewer and scroll rotates the ring. It is a gallery you move through rather than past: product ranges, team members, testimonials, a season's collection. The version here is built to stay cheap on long pages, so it can be one section among many rather than the whole site. Strong on both desktop and touch; on a phone it becomes a swipe-through drum.",
  "scroll-snap-gallery":
    "Flick the row sideways and it settles exactly on the next item. No script, and the browser keeps its own momentum physics, which is why a hand-written version never feels quite right. The pattern behind every horizontal card row — menus, product shelves, story chips, photo strips — and the right default for any site that wants a carousel without a carousel library. Works identically on trackpad and touch.",
  "staggered-character-reveal":
    "Every glyph rises out of its own mask, a few milliseconds apart, and the headline assembles itself in front of the visitor. The classic entrance for hero titles on agency, studio and launch sites; it also works for section headings that come in on scroll. This version is built so the text still wraps on narrow screens and still reads as one line to a screen reader — the two things most copies of the effect get wrong.",
  "section-stacking-transition":
    "Each section sticks at the top and the next one climbs over it. The one underneath is never pushed — it is covered, dimmed and pushed back a little, which is what makes a stack read as depth instead of as a list. A long-page structure used by product sites, annual reports and service pages with four or five big blocks; each section feels like a card laid on the last.",
  "magnetic-button":
    "The button leans toward the cursor before you reach it, then springs back when you leave. A tiny effect with an outsized feeling of quality — the one people mean when they say a site feels 'responsive'. Suited to primary calls to action on landing pages, portfolio and agency sites, and navigation icons. It costs almost nothing and is safe to add to an existing site.",
  "aurora-drift":
    "Two blurred colour blobs drifting on mismatched periods, so the composition never visibly loops. The ambient background of AI products, SaaS landing pages and app stores' feature pages — colour that moves slowly behind a headline without images, video or canvas. Works in light and dark, takes any two brand colours, and stays cheap enough to run on every page.",
  "shimmer-headline":
    "A gradient sliding behind the letters, clipped to the glyphs, so the headline catches a light passing over it. The 'premium' text treatment: used on pricing tiers, AI product names, launch banners and loading states. It is a pure-CSS effect with no runtime cost, and the same technique makes skeleton placeholders and metallic logo text.",
  "flip-stack-carousel":
    "A short stack of cards in perspective, in front of a marquee line. Every couple of seconds the front card swings open like a door on its left edge and is sent to the back while the rest step forward. An auto-playing showcase for testimonials, features, app screens or a portfolio, where a plain slider would look generic. It reads as a physical deck being dealt, which keeps eyes on it.",
  "particle-sphere-dissolve":
    "A sphere of thousands of points turns slowly and tilts with the pointer. Click, and every point lets go — the sphere thins into a field of dust while the headline fades in underneath; click again and it gathers back. A hero transition for AI, data, science and technology brands: the globe-of-particles motif, but with a moment of interaction that the visitor controls. Runs on the GPU and stays smooth on laptops.",
  "floating-parallax-field":
    "Eight images scattered in the dark at different depths. Each drifts on its own slow rhythm, and when the pointer moves the near ones travel further than the far ones — depth also sets their size and brightness, so the space reads before anything moves. A hero for photography, fashion, galleries, event and film sites: a handful of images presented as a space you look into rather than a grid you scan.",
  "logo-bloom-transition":
    "Page to page through the brand mark: on click a star-shaped patch of light grows out of the button, blurs into a full-screen bloom at the moment the pages swap underneath, and fades out over the new page. A page transition that turns the logo into the wipe, for brand sites, agencies and campaigns where navigation itself should carry identity. Also covers the 'cover carousel' — the same bloom between slides.",

  // ── chart-widgets ──
  "activity-rings":
    "Three concentric rings, one goal each. They draw from zero on load while the numbers count up in step, and the ring that beats its goal keeps going round in a darker tint instead of stopping at 100%. The Apple Watch pattern, rebuilt for the web and for apps: daily goals, habits, budgets, team targets. It is the most legible way to show three progress values at once in a small space.",
  "streak-heatmap":
    "A year laid out as a wall of squares, five shades from nothing to a lot. The wall appears column by column, a missed day is ticked underneath so the break is visible without counting, and clicking any square pops that day's detail out beside it. The GitHub-contributions pattern, adapted for habit trackers, fitness logs, learning apps and any product that wants consistency to be visible at a glance.",
  "score-gauge":
    "One number, shown as a half-circle in three coloured bands. The needle sweeps in from the left, goes a little past the target and settles back; the number counts with it and the verdict beneath takes the colour of the band the needle lands in. For credit scores, health and sleep scores, performance ratings, site speed reports — any single number that comes with a judgement attached.",
  "bar-chart-period-switch":
    "Week to month without a redraw: bars that exist in both periods slide to their new height, extra ones rise from the baseline, missing ones sink away. Tap a bar and it lights up with its value while the rest dim. A bar chart for finance, analytics and fitness apps where the user switches range constantly — the continuity is what lets them keep their place in the data.",
  "focus-blocks-timeline":
    "A day as one path stepping between three levels — break, normal, deep — each block coloured by level and placed by time. Move along it and a cursor follows, the header shows the exact time and phase, and the block under the cursor stays lit while the rest dim. For focus and time-tracking apps, sleep stages, energy levels, machine states — anything that changes level over a day.",
  "range-line-morph":
    "1W / 1M / 1Y on one line. Switching range does not redraw: every point slides to where it is in the new data, the area fill follows, and the headline number counts across. The line never blinks. The stock-app and crypto pattern for balance, portfolio and metric charts, where a flash on every switch makes a product feel cheap and continuity makes it feel considered.",
  "draggable-goal-line":
    "A dashed goal across a bar chart with a handle you can drag. As it moves, every bar that clears it lights up and every bar that falls under it goes dark, and the 'days on goal' count in the header follows in real time. For budgets, step counts, sales targets and sleep goals — it turns setting a goal into a conversation with the data instead of typing a number in a form.",
  "stacked-share-bar":
    "A whole day as one bar split by share, with hairline gaps so the pieces stay countable. The parts grow in one after another, and tapping one pulls it up out of the bar with its name and percentage above. A compact alternative to a pie chart for spending categories, time allocation, storage usage and traffic sources — it fits in a card and reads left to right.",
  "share-ring":
    "A donut for a handful of categories, drawn slice by slice clockwise on load with the total in the hole. Hover a slice or its legend row and the slice pushes outward while the centre swaps to that category's name and share. The everyday breakdown chart for budgets, portfolios, storage and survey results — this version does the hover and legend linking that most implementations skip.",
  "bubble-chart-nudge":
    "One circle per category, area by amount, packed together. Tap one and it grows to show its number while the neighbours it now overlaps are pushed straight away from it — only as far as they need, and the rest stay put. A friendly way to compare a dozen categories in a finance, nutrition or analytics app; the nudge keeps everything readable while one bubble is being inspected.",

  // ── dashboard ──
  "dashboard-floating-panel":
    "A restaurant back office with a sidebar that does not touch the screen edges: a floating island with rounded corners and one soft shadow. The plainest of the six sidebar systems, and the one that makes an admin panel stop looking like a form. All six run on real content — a live menu, an order board, thirty days of figures — so the comparison is between sidebars, not between mock-ups. Suited to any SaaS or admin product.",
  "dashboard-dark-rail":
    "The sidebar is the only dark thing on the page, so it carries all the weight: inactive items in quiet grey, the current one lit with an accent bar. The most common pattern in SaaS admin tools, here applied to a working restaurant back office with live data. A good default when the content area is dense and the navigation needs to stay out of the way.",
  "dashboard-glass-rail":
    "A blurred photograph under everything; the sidebar is frosted glass and the cards are the same glass a little more opaque so the numbers still read. The look of recent operating systems, applied to a back office. It suits hospitality, lifestyle and consumer-facing admin panels where the product itself is photogenic — and the sample is honest about what it costs on older machines.",
  "dashboard-rail-panel":
    "A narrow rail of module icons and a wider panel listing that module's own sections. Switching a module swaps the panel's list; picking a section filters the screen — orders by status, menu by category. The two-level navigation of large admin products (Slack, Linear, Notion-style), applied to a restaurant back office. The right choice when there are more than about eight destinations.",
  "dashboard-hover-expand":
    "Dark throughout. The rail rests narrow and opens wide on hover, labels fading in just after the width starts moving, so text never sits over the shrinking rail on the way out. The collapsing sidebar of dense tools — analytics, dev consoles, POS back offices — done with the timing that keeps it from flickering. Maximises content width without hiding the navigation.",
  "dashboard-grouped-nav":
    "Items grouped by area under tiny grey labels with generous space between groups. The list scrolls on its own between a pinned brand at the top and a pinned user area at the bottom, so the exit is always where the eye expects it. The pattern for admin products with many sections that fall into a few natural groups — here Sala, Gestione, Sistema for a restaurant.",

  // ── widgets (bencho.dev, MIT) ──
  "magnetic-select":
    "Seven chips in a cluster. Pick one and it swells while the others are shoved outward along the line that joins them, on springs that go wide before they go tall. A selector for tags, moods, sizes and filters that makes choosing feel physical. Rebuilt from Lorenzo Cabra's bencho.dev block, with the pull, bounce and give exposed on a bench so it can be tuned to a product's feel.",
  "liquid-toggle":
    "A toggle whose thumb is a drop of liquid: drag it and it stretches by exactly how fast you move, then fuses back into one body when it settles. The switch for settings screens and feature flags on products that have a soft, organic visual language. Rebuilt from bencho.dev with the spring and viscosity on a bench.",
  "slide-to-confirm":
    "A track with a round handle that follows the finger exactly; let go past the threshold and the handle morphs, growing backwards to cover the track it crossed. The 'slide to pay', 'slide to unlock', 'slide to delete' control — for payments, check-outs, deliveries and any action that should take a deliberate gesture rather than a tap. Rebuilt from bencho.dev.",
  "drag-stepper":
    "A − 24 + pill that is both a stepper and a slider, chosen by how long you hold: tap for one step, hold and the press turns into a sweep where dragging sideways moves the value. For quantities, durations, temperatures — anywhere a user sometimes wants ±1 and sometimes wants to fly to 90. Rebuilt from bencho.dev.",
  "slosh-slider":
    "A slider whose value has mass: the handle is rigid under your finger, but the fill sloshes behind it, overshoots into the end stop and rocks back before settling. For volume, brightness, temperature and any control where a bit of physicality reads as quality. Rebuilt from bencho.dev with viscosity, momentum, corner and tilt on a bench.",
  "radial-menu":
    "Press the + and a fan of tools opens over it; drag toward one and it is aimed, let go and it is chosen — opening, choosing and committing in one gesture. The pie menu of drawing and mapping apps, the compose button of social apps. Rebuilt from bencho.dev with stagger, tool count, radius and arc live.",
  "todo-tower":
    "A stack of todo cards that is a rigid-body simulation: drag one, throw it, watch the pile tip over when a card's centre of mass leaves the one beneath. A playful take on a task list for products that want a moment of joy — or a playground for physics-based UI. Rebuilt from bencho.dev with gravity, slip and card count live.",
  "range-dial":
    "A 24-hour ring of ticks with two handles for a span — bedtime to wake-up — that is free to cross midnight; the ticks inside darken and the centre reads the duration. The sleep-schedule control of health apps, also right for shift planning, quiet hours and booking windows. Rebuilt from bencho.dev with snapping and tick density live.",
  "escape-button":
    "A button that slides away from the cursor — and then stops. It dodges once per approach and gives in after a fixed number of tries, so the joke never becomes the dark pattern it imitates. For 404 pages, April fools, 'are you sure?' moments and marketing sites with a sense of humour. Rebuilt from bencho.dev.",
  "reorder-list":
    "A drag-to-reorder list where the held row is free rather than fenced to a rail, stretches along the axis it is thrown, and the rows briefly run together like liquid as they flow up to close a hole. For playlists, priorities, steps and any list the user arranges by hand. Rebuilt from bencho.dev.",
  "wheel-gauge":
    "A band of ticks over a wide sweep with a travelling wave whose amplitude grows with the reading — at zero it is a still gauge — and dragging around the ring sets the value. For humidity, volume, intensity and fan speed on smart-home and audio interfaces. Rebuilt from bencho.dev.",
  "checklist":
    "A checklist where each row is one spring and everything reads off it: the box fills from the centre, the tick is drawn not faded, the rule crosses the words in step — and when everything is ticked the floor goes out from under the list. For onboarding, tasks, packing lists and any 'done' moment worth celebrating. Rebuilt from bencho.dev.",
  "inline-confirm":
    "The button becomes its own dialog: 'Delete file' widens into 'Delete it? Delete / Keep', and after deleting the same footprint holds 'Deleted · Undo' with a burning timer. The destructive path with no modal and no toast — for admin panels, file managers, settings screens and any product tired of confirmation pop-ups. Rebuilt from bencho.dev.",
  "progress-ticks":
    "A percentage drawn as forty thin bars: the lit ones rise and fall like a waveform up to the reading, the rest stay flat and faint. Hover scrubs the value and it springs back; click to set. For upload progress, audio scrubbers, battery and storage meters in products with an instrument-panel aesthetic. Rebuilt from bencho.dev.",
  "tilt-card":
    "Every tilt card on the internet rises to meet the cursor. This one sinks: the point you are over goes away, the far side comes up, a dark dent tracks the pointer and the shadow tightens because a pressed thing has less air under it. For product cards, pricing tiers and feature tiles that should feel like buttons you are pressing. Rebuilt from bencho.dev.",
  "pull-to-refresh":
    "A balance card you pull down: droplets are drawn together as you pull and fuse into one body exactly at the threshold — the refresh is armed while your finger is still down, not on release. The pull-to-refresh of banking, feed and mail apps, with a visual that tells you exactly when you have pulled far enough. Rebuilt from bencho.dev.",
  "ring-carousel":
    "A carousel that is a ring, not a row: nothing ever leaves the frame and the swipe never runs out. The front card is big, the back rides up as it shrinks. For album covers, product colourways, avatars and any small set the user cycles through with a thumb. Rebuilt from bencho.dev.",
  "canvas-toolbar":
    "A floating tool pill — select, hand, frame, shape, pen, text — where the shape slot remembers whichever shape you last chose; hold it for the tray of shapes. The toolbar of design and whiteboard tools (Figma, tldraw, Excalidraw), rebuilt as a component with the hold-to-open tray. Rebuilt from bencho.dev.",
  "notify-me":
    "Press the button and the bell swings while the button stays down — the confirmation is the control itself, nothing to read, nothing to dismiss. For 'notify me', 'follow', 'remind me' and waitlist buttons on launch pages and product listings. Rebuilt from bencho.dev.",
  "selection-list":
    "A list of people with a round check on each row and a 'Send N requests' button that counts them; the order you clicked never leaks into the list. The multi-select pattern of invites, contact pickers and bulk actions — done so that the count and the selection can never disagree. Rebuilt from bencho.dev.",
  "assignees":
    "A pill of faces that grows when someone is added and nobody moves — there is simply more room; a grid mode packs four into the footprint of one. The assignee picker of project tools (Linear, Asana, Notion), rebuilt as a component. Rebuilt from bencho.dev.",
  "oklch-palette":
    "A palette generator that builds a ramp in one hue family — light to deep, an accent set in — and swaps every swatch at once through a circle with a liquid blur riding the motion. For theme pickers, brand tools and design-system documentation that wants colour to feel generated rather than listed. Rebuilt from bencho.dev.",
  "command-bar":
    "An input whose send button is part of the same body of liquid: type, and the button walks out from under the bar's right edge, necking thinner until it separates. The prompt bar of AI chat products and command palettes, with a transition that makes the send affordance appear rather than pop. Rebuilt from bencho.dev.",
  "dragging-ball":
    "One body deformed by its own speed: the ball lengthens into its direction of travel, swells on hover, pinches when grabbed and rounds back out on a spring when released. A study in what 'grab' should feel like — for drag handles, tokens, avatars and playful onboarding. Rebuilt from bencho.dev.",
  "create-menu":
    "The pill does not open a panel next to itself — it is the panel, seen small: press, and it spreads into the menu with width, height and corner on one curve. The '+' create button of notes, tasks and social apps, done as a single shape. Rebuilt from bencho.dev.",
  "aspect-ratio":
    "Three formats — 4:3, 1:1, 3:4 — with the same area, so switching reads as the same amount of picture held a different way, never as the picture growing. The crop and format picker of camera, story and post-composer screens. Rebuilt from bencho.dev.",
  "now-playing":
    "A player bar that opens into a card, driven by one number, with the cover as the hinge and the corners staying concentric all the way. The mini-player to full-player transition of music and podcast apps, rebuilt as one component. Rebuilt from bencho.dev.",
  "icon-bar":
    "A row (or column) of icons whose active pill moves in two phases: the leading edge jumps and the pill stretches to span both slots, then the trailing edge catches up with a slight overshoot. The tab bar and segmented control of mobile apps and toolbars — the stretch is what makes the switch feel tracked rather than teleported. Rebuilt from bencho.dev.",
};

/** 缺了哪条这里就抛 —— 两棵路由树在构建期都会调它，等于每条效果都有一道闸。 */
export function blurbOf(slug: string): string {
  const b = blurbs[slug];
  if (!b) throw new Error(`data/effect-blurbs.ts: no blurb for "${slug}"`);
  return b;
}
