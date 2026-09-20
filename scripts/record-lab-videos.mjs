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
const GPU_SLUGS = new Set(["liquid-orb"]);

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
  return `http://127.0.0.1:${PORT}/effects/${e.bundleDir ? `${e.slug}/index.html` : `${e.slug}.html`}`;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * 在样板里找「该碰的那个东西」：stage 里光标是 pointer/grab/resize 的元素，
 * 避开调参面板（.bench / .seg / .grp / input[type=range]），取离 stage 中心最近的一个。
 * 找不到就退回视口中心。第一版是一律点视口中心，25 条小组件的录像里什么都没发生。
 */
async function findTarget(page, W, H) {
  return page.evaluate(([W, H]) => {
    const stage = document.querySelector(".stage, .win, .room, main, body") || document.body;
    const sr = stage.getBoundingClientRect();
    const scx = sr.left + sr.width / 2, scy = sr.top + sr.height / 2;
    const ok = new Set(["pointer", "grab", "grabbing", "ew-resize", "ns-resize", "move", "col-resize", "row-resize"]);
    let best = null, bestD = Infinity;
    for (const el of stage.querySelectorAll("*")) {
      if (el.closest(".bench, .seg, .grp, .credit, .hint, .replay, #replay")) continue;
      if (el.matches("input[type=range], select, textarea")) continue;
      const cs = getComputedStyle(el);
      if (!ok.has(cs.cursor)) continue;
      const r = el.getBoundingClientRect();
      if (r.width < 8 || r.height < 8 || r.width > W * 0.9) continue;
      if (r.right <= 0 || r.bottom <= 0 || r.left >= W || r.top >= H) continue;
      // 父子都可点时要子的（更具体），所以按面积小者优先、再按距离
      const d = Math.hypot(r.left + r.width / 2 - scx, r.top + r.height / 2 - scy) + Math.sqrt(r.width * r.height) * 0.3;
      if (d < bestD) { bestD = d; best = { x: r.left + r.width / 2, y: r.top + r.height / 2, w: r.width, h: r.height }; }
    }
    return best;
  }, [W, H]);
}

async function drive(page, e) {
  const W = WIDTH, H = e.height;
  const t = (await findTarget(page, W, H)) || { x: W / 2, y: H / 2, w: 0, h: 0 };
  const cx = t.x, cy = t.y;
  switch (e.plays) {
    case "hover": {
      // 先在中间停一下（让「静止态」也被录到），再扫过四角与中心，最后停在目标上
      await page.mouse.move(W / 2, H / 2, { steps: 10 });
      await sleep(900);
      const path = [
        [W * 0.25, H * 0.3], [cx, cy], [W * 0.75, H * 0.3], [W * 0.75, H * 0.7],
        [cx, cy], [W * 0.25, H * 0.7], [cx, cy], [cx + 40, cy - 30], [cx, cy],
      ];
      for (const [x, y] of path) {
        await page.mouse.move(x, y, { steps: 30 });
        await sleep(250);
      }
      await sleep(600);
      return;
    }
    case "scroll": {
      await sleep(900);
      const ticks = Math.round(5000 / 50);
      for (let i = 0; i < ticks; i++) { await page.mouse.wheel(0, 40); await sleep(50); }
      await sleep(600);
      for (let i = 0; i < ticks / 2; i++) { await page.mouse.wheel(0, -80); await sleep(50); }
      await sleep(500);
      return;
    }
    case "click": {
      // 点一下 → 等 → 按住拖一段再拖回（滑杆/拨盘/拖排序靠这个）→ 再点一下
      await page.mouse.move(cx, cy, { steps: 12 });
      await sleep(1000);
      await page.mouse.click(cx, cy);
      await sleep(1800);
      const dx = Math.min(160, W - cx - 20);
      await page.mouse.move(cx, cy, { steps: 6 });
      await page.mouse.down();
      await page.mouse.move(cx + dx, cy + 18, { steps: 28 });
      await sleep(350);
      await page.mouse.move(cx + dx * 0.35, cy, { steps: 22 });
      await page.mouse.up();
      await sleep(1500);
      await page.mouse.click(cx, cy);
      await sleep(1500);
      return;
    }
    default: {
      // 自演的：进场动画在开头一两秒就演完了，8 秒录像里剩下的全是终态。
      // 样板带「重播」按钮（#replay / .replay）的话，3.5 秒处点一下，让动画再来一遍。
      await sleep(3500);
      // 没有重播按钮的（activity-rings 这类）就整页重载 —— 进场动画自然再来一遍。
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
    "-y", "-loglevel", "error", "-ss", "0.6", "-t", String(SECONDS), "-i", webm,
    "-vf", `scale=${WIDTH}:-2,fps=24`, "-c:v", "libx264", "-crf", "30", "-preset", "medium",
    "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-an", mp4,
  ]);
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
  // 🩸 无头 Chromium 没有 WebGPU（liquid-orb 录出来是一屏「WebGPU is not available」）。
  //    有头模式 + 这两个开关就有了；有头会在屏幕上闪一下窗口，所以只对需要的开。
  const needsGpu = todo.some((e) => GPU_SLUGS.has(e.slug));
  const browser = await chromium.launch(needsGpu ? { headless: false, args: ["--enable-unsafe-webgpu", "--enable-features=Vulkan"] } : {});
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
