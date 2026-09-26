// 给设计库每条效果录一段 8 秒的「橱窗」视频 + 一张海报。
//
//   node scripts/record-lab-videos.mjs            # 全部
//   node scripts/record-lab-videos.mjs magnetic-button shimmer-headline   # 只录这几条
//
// 产物：public/lab-video/<slug>.mp4（H.264, 960 宽, 24fps, 无声）+ <slug>.jpg（第 2 秒那一帧）。
//
// 为什么要视频：/lab 2026-09-20 起改成「橱窗」—— 公开页只给看不给碰，
// 真正的 demo / 参数 / 提示词 / 源码在密码门后面。视频是「看得到、拿不走」的那层。
//
// 驱动方式按 data/effects.ts 里的 `plays` 分四种：self 什么都不做；hover 指针
// 在画面里扫一圈；scroll 慢慢滚下去再滚回来；click 点中心再点右下。都是通用脚本，
// 不是逐条手写 —— 录完在 contact sheet 里过一遍，不对劲的单独重录。
//
// 🩸 样板由本地静态服务器提供（public/ 目录），不是走 next dev：
//    走 next dev 会撞上密码门（/effects/*.html 没 cookie 是 401）。
// 🩸 录像用 Playwright 自带的 recordVideo（webm），再用 ffmpeg-static 转 mp4；
//    本机没有 ffmpeg，别去 brew。

import { chromium } from "playwright";
import ffmpeg from "ffmpeg-static";
import { execFileSync, spawn } from "node:child_process";
import { mkdirSync, readFileSync, rmSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const PUBLIC = join(ROOT, "public");
const OUT = join(PUBLIC, "lab-video");
const TMP = join(ROOT, ".lab-video-tmp");
const PORT = 8765;
const WIDTH = 960;
const SECONDS = 8;
/** 个别样板的 plays 标的是「怎么看」不是「怎么驱动」：bin-eats-label 标 hover，真要点一下才吃标签。 */
const DRIVE_OVERRIDE = { "bin-eats-label": "click", "command-bar": "type", "dashboard-ambient-ai": "ask", "dashboard-terminal": "ask", "dashboard-keyboard": "keys", "snap-to-guide": "self", "stretch-header": "self" };
/** 「ask」类：往提示词栏里打两句话、各回车一次（天空 AI 那条是意大利语后台，打英文会穿帮）。 */
const ASK_TEXT = { "dashboard-ambient-ai": ["Come va oggi?", "Metti in pausa gli ordini 20 minuti"], "dashboard-terminal": ["ordini attesa", "conferma tutti"] };
/** 「keys」类：按键序列（字符串 = 按键，数字 = 等待 ms）。键盘优先那条：J/K 走行、Enter 开详情、C 推进。 */
const KEY_SEQ = { "dashboard-keyboard": ["j", "j", 500, "Enter", 1500, "j", 400, "j", 400, "Enter", 1200, "Escape", 500, "c", 900] };
/** 一直在自己转的那几条：正放接倒放拼成 16 秒，循环点就没有跳一下的接缝。
 *  有指针/交互的不能这么干 —— 倒放的鼠标动作看着像坏了。 */
/** 一段完整流程的样板：自己演、不能在 3.5 秒处重载（重载就永远只录到开头），录多长单独给。
 *  slate-card-order 带 `?clip`：同一套流程、停顿压短，17 秒从首页走到盖章。 */
const LONG_SELF = { "slate-card-order": { secs: 17, query: "?clip" }, "receipt-print-stamp": { secs: 8 }, "flip-card-carousel": { secs: 8 } };
const secsOf = (slug) => LONG_SELF[slug]?.secs ?? SECONDS;
const PALINDROME = new Set(["cyclone-369", "aurora-drift", "holo-card", "shimmer-headline"]);

// data/effects.ts 是 TS，这里不想拖一个编译器进来 —— 正则把三个字段抠出来就够了。
// 字段顺序在文件里是固定的（slug → category → date → plays → … → height）。
function loadEffects() {
  const src = readFileSync(join(ROOT, "data/effects.ts"), "utf8");
  // 每条效果以 4 空格缩进的 `slug:` 开头；切成块后在块内找各字段（都带同样缩进，
  // 免得撞上 prompt 文本里的 "height: 300" 这种字样）。
  const starts = [...src.matchAll(/\n    slug: "([^"]+)"/g)];
  return starts.map((m, i) => {
    const block = src.slice(m.index, starts[i + 1]?.index ?? src.length);
    const field = (name) => block.match(new RegExp(`\\n    ${name}: "?([\\w-]+)"?`))?.[1];
    return {
      slug: m[1],
      category: field("category"),
      plays: field("plays"),
      bundleDir: /\n    bundleDir: true/.test(block),
      height: Number(field("height")),
    };
  });
}

function demoUrl(e) {
  return `http://127.0.0.1:${PORT}/effects/${e.bundleDir ? `${e.slug}/index.html` : `${e.slug}.html`}${LONG_SELF[e.slug]?.query ?? ""}`;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * 在样板里找「该碰的那个东西」：stage 里光标是 pointer/grab/resize 的元素，
 * 避开调参面板（.bench / .seg / .grp / input[type=range]），取离 stage 中心最近的一个。
 * 找不到就退回视口中心。第一版是一律点视口中心，25 条小组件的录像里什么都没发生。
 */
async function findTarget(page, W, H, scope) {
  return page.evaluate(([W, H, scope]) => {
    const stage = document.querySelector(scope) || document.body;
    const sr = stage.getBoundingClientRect();
    const scx = sr.left + sr.width / 2, scy = sr.top + sr.height / 2;
    const ok = new Set(["pointer", "grab", "grabbing", "ew-resize", "ns-resize", "move", "col-resize", "row-resize"]);
    let best = null, bestD = Infinity;
    // 两轮：先找光标是 pointer/grab 的；一个都没有（range-line-morph 的 1W/1M/1Y 没设光标）
    // 再退一步认 button / [role=button]
    for (const pass of [0, 1]) {
    if (pass === 1 && best) break;
    for (const el of stage.querySelectorAll(pass === 0 ? "*" : "button, [role=button]")) {
      if (el.closest(".bench, .seg, .grp, .credit, .hint, .replay, #replay")) continue;
      if (el.matches("input[type=range], select, textarea")) continue;
      const cs = getComputedStyle(el);
      if (pass === 0 && !ok.has(cs.cursor)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 8 || r.height < 8 || r.width > W * 0.9) continue;
      if (r.right <= 0 || r.bottom <= 0 || r.left >= W || r.top >= H) continue;
      // 父子都可点时要子的（更具体），所以按面积小者优先、再按距离
      const d = Math.hypot(r.left + r.width / 2 - scx, r.top + r.height / 2 - scy) + Math.sqrt(r.width * r.height) * 0.3;
      if (d < bestD) { bestD = d; best = { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; }
    }
    }
    return best;
  }, [W, H, scope]);
}

/** 60Hz 地把指针沿一条路径挪过去。page.mouse.move 的 steps 是一口气发完的，没有时间维度，
 *  跟着指针走的效果会一顿一顿；这里每 16ms 发一个点。 */
async function glide(page, from, to, ms) {
  const n = Math.max(2, Math.round(ms / 16));
  for (let i = 1; i <= n; i++) {
    const t = i / n, k = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2; // easeInOut
    await page.mouse.move(from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k);
    await sleep(16);
  }
}

/** 页面里用 rAF 平滑滚动（找真正在滚的那个元素：窗口，或最大的 overflow 容器）。
 *  第一版是 50ms 一个 wheel tick：滚动是一格一格跳的，滚动驱动的效果录出来全在抖。 */
async function smoothScroll(page, ms, toFrac) {
  await page.evaluate(([ms, toFrac]) => new Promise((res) => {
    let el = document.scrollingElement;
    if (el.scrollHeight - el.clientHeight < 10) {
      let best = null, bestH = 0;
      for (const x of document.querySelectorAll("*")) {
        const cs = getComputedStyle(x);
        if (!/(auto|scroll)/.test(cs.overflowY)) continue;
        const h = x.scrollHeight - x.clientHeight;
        if (h > bestH) { bestH = h; best = x; }
      }
      el = best || el;
    }
    const max = el.scrollHeight - el.clientHeight;
    const from = el.scrollTop, to = max * toFrac;
    const t0 = performance.now();
    (function step(now) {
      const t = Math.min(1, (now - t0) / ms);
      const k = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      el.scrollTop = from + (to - from) * k;
      if (t < 1) requestAnimationFrame(step); else res();
    })(t0);
  }), [ms, toFrac]);
}

async function drive(page, e) {
  const W = WIDTH, H = e.height;
  // 后台样板要点的是侧边栏（nav/aside），别的样板是舞台区（.stage 等）
  // 样板自己标了 [data-showcase] 的（整页后台设计：热力图/目标线那块）优先；老的侧栏后台点侧栏；其它点舞台区
  const showcase = await page.$("[data-showcase]");
  if (showcase) { await showcase.scrollIntoViewIfNeeded(); await sleep(400); }   // 编辑风的订单列表在首屏之下：不滚过去，8 秒里鼠标扫的全是标题
  const scope = showcase ? "[data-showcase]" : e.category === "dashboard" ? "nav, aside, .sidebar, .rail" : ".stage, .win, .room, main, body";
  const t = (await findTarget(page, W, H, scope)) || { x: W / 2, y: H / 2, w: 0, h: 0 };
  const cx = t.x, cy = t.y;
  if (LONG_SELF[e.slug]) { await sleep(secsOf(e.slug) * 1000 + 800); return; }
  switch (DRIVE_OVERRIDE[e.slug] ?? e.plays) {
    case "hover": {
      // 先停在中间（静止态也要录到），再一笔画出一条平滑的 8 字，最后落在目标上
      await page.mouse.move(W / 2, H / 2);
      await sleep(900);
      const pts = [[W / 2, H / 2], [W * 0.25, H * 0.3], [cx, cy], [W * 0.75, H * 0.3], [W * 0.78, H * 0.7], [cx, cy], [W * 0.04, H * 0.5], [W * 0.25, H * 0.7], [cx, cy]];
      for (let i = 1; i < pts.length; i++) await glide(page, pts[i - 1], pts[i], 800);
      await sleep(700);
      return;
    }
    case "scroll": {
      await page.mouse.move(W / 2, H / 2);
      await sleep(900);
      await smoothScroll(page, 5200, 1);
      await sleep(500);
      await smoothScroll(page, 1600, 0.35);
      await sleep(500);
      return;
    }
    case "keys": {
      await page.mouse.move(W / 2, H / 2);
      await sleep(800);
      for (const k of KEY_SEQ[e.slug] || ["j", "Enter"]) { if (typeof k === "number") await sleep(k); else { await page.keyboard.press(k); await sleep(120); } }
      return;
    }
    case "ask": {
      const lines = ASK_TEXT[e.slug] || ["Come va oggi?"];
      await page.mouse.move(W / 2, H / 2);
      await sleep(900);
      for (const line of lines) {
        const input = await page.$("#q, input[type=text], input:not([type])");
        if (input) await input.click();
        await page.keyboard.type(line, { delay: 42 });
        await sleep(250);
        await page.keyboard.press("Enter");
        await sleep(1700);
      }
      return;
    }
    case "type": {
      // 输入类（command-bar）：点进输入框、一个字一个字打，再清掉重打
      await glide(page, [W / 2, H / 2], [cx, cy], 500);
      const input = await page.$("input[type=text], input:not([type]), textarea, [contenteditable]");
      if (input) await input.click();
      await sleep(600);
      await page.keyboard.type("Summarise this thread for me", { delay: 70 });
      await sleep(1800);
      for (let i = 0; i < 28; i++) { await page.keyboard.press("Backspace"); await sleep(35); }
      await sleep(600);
      await page.keyboard.type("Draft a reply", { delay: 80 });
      await sleep(1200);
      return;
    }
    case "click": {
      // 点一下 → 等 → 按住平滑拖一段再拖回（滑杆/拨盘/拖排序靠这个）→ 再点一下
      await glide(page, [W / 2, H / 2], [cx, cy], 500);
      await sleep(700);
      await page.mouse.click(cx, cy);
      await sleep(1800);
      const dx = Math.min(160, W - cx - 20);
      await page.mouse.move(cx, cy);
      await page.mouse.down();
      await glide(page, [cx, cy], [cx + dx, cy + 18], 700);
      await sleep(300);
      await glide(page, [cx + dx, cy + 18], [cx + dx * 0.35, cy], 600);
      await page.mouse.up();
      await sleep(1400);
      await page.mouse.click(cx, cy);
      await sleep(1400);
      return;
    }
    default: {
      // 自演的：进场动画在开头一两秒就演完了，8 秒录像里剩下的全是终态。
      // 样板带「重播」按钮（#replay / .replay）的话，3.5 秒处点一下，让动画再来一遍；
      // 没有重播按钮的（activity-rings 这类）就整页重载 —— 进场动画自然再来一遍。
      await sleep(3500);
      const replay = await page.$("#replay, .replay");
      if (replay) await replay.click().catch(() => {});
      else await page.reload({ waitUntil: "load" });
      await sleep(SECONDS * 1000 - 3500 + 800);
    }
  }
}

async function record(browser, e) {
  const ctx = await browser.newContext({
    viewport: { width: WIDTH, height: e.height },
    deviceScaleFactor: 1,
    recordVideo: { dir: TMP, size: { width: WIDTH, height: e.height } },
    reducedMotion: "no-preference",
    colorScheme: "light",
  });
  const page = await ctx.newPage();
  // 小组件（bencho 块）右侧带一条调参面板：在 960 宽录下来、再 cover 进 500 宽的卡片，
  // 面板会被裁得只剩半个词。橱窗视频只要控件本身 —— 录的时候把面板藏掉、stage 独占整幅。
  if (e.category === "widgets") {
    await page.addInitScript(() => {
      document.addEventListener("DOMContentLoaded", () => {
        const st = document.createElement("style");
        st.textContent = ".bench{display:none!important}.wrap{grid-template-columns:1fr!important}";
        document.head.appendChild(st);
      });
    });
  }
  await page.goto(demoUrl(e), { waitUntil: "load" });
  await page.waitForTimeout(700);
  await drive(page, e);
  const video = page.video();
  await ctx.close();
  const webm = await video.path();

  const mp4 = join(OUT, `${e.slug}.mp4`);
  const jpg = join(OUT, `${e.slug}.jpg`);
  // 掐掉开头 0.6 秒（首帧是空白/正在布局），定长 8 秒。
  // 高度取偶数：yuv420p 要求宽高都能被 2 整除，样板有 370 这种奇数高。
  execFileSync(ffmpeg, [
    "-y", "-loglevel", "error", "-ss", "0.6", "-t", String(secsOf(e.slug)), "-i", webm,
    "-vf", `scale=${WIDTH}:-2`, "-vsync", "cfr", "-r", "25", "-c:v", "libx264", "-crf", "28", "-preset", "medium",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", mp4,
  ]);
  if (PALINDROME.has(e.slug)) {
    const tmp = join(TMP, `${e.slug}.pal.mp4`);
    execFileSync(ffmpeg, [
      "-y", "-loglevel", "error", "-i", mp4,
      "-filter_complex", "[0:v]split[a][b];[b]reverse[r];[a][r]concat=n=2:v=1[out]", "-map", "[out]",
      "-c:v", "libx264", "-crf", "28", "-preset", "medium", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", tmp,
    ]);
    execFileSync("mv", [tmp, mp4]);
  }
  execFileSync(ffmpeg, ["-y", "-loglevel", "error", "-ss", "2", "-i", mp4, "-frames:v", "1", "-q:v", "4", jpg]);
  rmSync(webm, { force: true });
  return { mp4: statSync(mp4).size, jpg: statSync(jpg).size };
}

async function main() {
  const only = new Set(process.argv.slice(2));
  const all = loadEffects();
  const todo = only.size ? all.filter((e) => only.has(e.slug)) : all;
  if (!todo.length) throw new Error("nothing to record");
  mkdirSync(OUT, { recursive: true });
  mkdirSync(TMP, { recursive: true });

  const server = spawn("python3", ["-m", "http.server", String(PORT), "--bind", "127.0.0.1", "--directory", PUBLIC], { stdio: "ignore" });
  await sleep(800);
  // 🩸 默认的 headless_shell 没有 GPU：cyclone-369 这类 WebGL 只有 15fps，录出来一卡一卡；
  //    liquid-orb 的 WebGPU 干脆不可用。走「新无头」（channel: chromium）+ 这几个开关，
  //    实测 rAF 61fps、navigator.gpu 在，也不用弹窗口。
  const browser = await chromium.launch({
    channel: "chromium",
    args: ["--enable-gpu", "--ignore-gpu-blocklist", "--use-angle=metal", "--enable-unsafe-webgpu"],
  });
  try {
    for (const e of todo) {
      const t0 = Date.now();
      try {
        const sz = await record(browser, e);
        console.log(`${e.slug.padEnd(36)} ${e.plays.padEnd(6)} ${(sz.mp4 / 1024).toFixed(0).padStart(5)} KB  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
      } catch (err) {
        console.log(`${e.slug.padEnd(36)} FAILED ${err.message.split("\n")[0]}`);
      }
    }
  } finally {
    await browser.close();
    server.kill();
    if (existsSync(TMP)) rmSync(TMP, { recursive: true, force: true });
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
