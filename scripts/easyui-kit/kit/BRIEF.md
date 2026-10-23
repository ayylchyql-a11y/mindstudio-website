# Brief: write design-library entries for EasyUI components

You are writing catalogue entries for Mind Studio's "AI design library" (mindstudioapps.com/lab).
The components themselves are EasyUI (MIT, by Suraj Maurya) bundled 1:1 — they already work.
Your job is ONLY the library text for each component id you are given.

## Where to read
Repo clone: /Users/ming/Desktop/mindstudio-website/scratchpad/easyui
- Component source: src/components/ui/<File>.tsx  (find the file via registry.json → items[].name == id → files[0].path)
- The demo actually shown: src/components/docs/detail/demos/items/<id>.demo.tsx (some delegate to src/components/docs/detail/demos/<id>.demo.tsx or demo-shared.tsx)
- Live page you can look at: http://localhost:3921/effects/<id>.html (dark theme; already running)
Read the source for REAL numbers: spring stiffness/damping/mass, durations, delays, easing arrays, sizes, radii, colours, thresholds.

## Hard rules
1. ORIGINAL PROSE. Do not copy or lightly reword EasyUI's own description / tagline / features / usage text from *.meta.ts or components-data.ts. Read the code and describe what it does in your own words.
2. No vague words ("smooth", "premium", "modern", "silky", "Apple-grade", "seamless") — say what moves, how far, how long, with which curve.
3. Do not name third-party brands in our prose (Stripe, Apple, Ferrari, PayPal, Dribbble, etc.). Note: the wallet-balance cards are rebranded Lumen / Fernway / Harbor and the car caption says "supercar" in our build.
4. Do not edit any file except your own output JSON.
5. anatomy / tokens / prompt / caveats / blurb are English. title and gist come in en + zh (simplified) + zh-tw (traditional, not just character-converted — use Taiwan wording).

## Output
Write a JSON array to the output path you were given. One object per id, in the given order:
{
  "id": "<id>",
  "plays": "self" | "hover" | "click" | "scroll",   // what a visitor must do for it to move. "self" only if it animates on its own after load.
  "accent": "#rrggbb",                              // the component's own main colour (not grey unless it is truly monochrome)
  "title": { "en": "...", "zh": "...", "zh-tw": "..." },   // short, 2–5 words; en may keep the EasyUI name
  "gist":  { "en": "...", "zh": "...", "zh-tw": "..." },   // 2–3 sentences: what you see and what happens when you interact
  "anatomy": ["...", "..."],      // 3–5 items. Start each with <b>Short label.</b> then how it is built, readable enough to rebuild it. <code>…</code> allowed. Include accessibility / reduced-motion behaviour if the code has it.
  "tokens": [{"label": "...", "value": "..."}],    // 3–6 copyable values taken from the source (springs, durations, sizes, colours)
  "prompt": "...",                // one paragraph an AI could rebuild it from: layout, sizes, colours, every timing/spring value, interaction states, a11y. Concrete numbers only.
  "caveats": ["..."],             // optional, 0–2 real limitations (e.g. canvas cost, needs pointer, no keyboard path). Omit if none.
  "blurb": "..."                  // 50–80 words for the public showcase: what it is and where it fits on a website/app. NO numbers, NO implementation details.
}

Style reference (an existing entry, for tone and density only — different component): /tmp/kit/example-entry.ts
Validate your file parses as JSON before finishing (python3 -c "import json;json.load(open(PATH))").
Reply with just: the output path, the number of entries, and any id you could not complete and why.
