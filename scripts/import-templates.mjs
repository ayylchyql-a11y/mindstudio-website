// 把桌面上 `网站模版/` 里的 7 套意大利语商铺模版（各 4 种设计）搬进
// public/templates/<slug>/{,editorial,night-glass,pop}/ 。
//
// 一次性脚本，但留在仓库里：以后桌面那边改了模版，重跑一遍就同步。
//   node scripts/import-templates.mjs [源目录]
//
// 搬的时候只动三处：
//   1. 目录名从中文改成 slug（URL 里不出现中文、也不出现「风格A」这种编号）
//   2. 模版自带的「Torna alla collezione / ← Tutti gli stili」回链本来指向
//      桌面那套 gallery(../ 与 ../stili.html)，那两个页面不上线 —— 改指本站
//      的板块页，并加 target="_top" 让它从 iframe 里跳出来
//   3. 只搬被引用的 .jpg，不搬 assets 里那份 2MB 的 .png 母图（CSS 里没人用它）
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SRC = process.argv[2] ?? join(process.env.HOME, "Desktop", "网站模版");
const DST = join(process.cwd(), "public", "templates");

/** 桌面目录名 → slug。顺序无所谓，展示顺序在 data/templates.ts 里定。 */
const FOLDERS = {
  "拉面模版": "ramen",
  "ALL YOU CAN EAT模版": "all-you-can-eat",
  "寿司外卖模版": "sushi-takeaway",
  "美甲店模版": "nail-salon",
  "食品供应商模版": "food-supplier",
  "百货店模版": "department-store",
  "手机维修店模版": "phone-repair",
};
const STYLES = {
  "风格A-编辑杂志": "editorial",
  "风格B-夜间玻璃": "night-glass",
  "风格C-活力波普": "pop",
};

function copyPage(from, to, rewrite) {
  mkdirSync(to, { recursive: true });
  for (const name of ["index.html", "styles.css", "app.js"]) {
    const p = join(from, name);
    if (!existsSync(p)) throw new Error(`missing ${p}`);
    let text = readFileSync(p, "utf8");
    if (name === "index.html") text = rewrite(text);
    if (name === "styles.css") {
      // 拉面原版 CSS 第 9 行留着一条指向不存在路径的 url()，被第 24 行覆盖，
      // 但仍是一处死引用 —— 去掉，免得以后有人顺着它找图。
      text = text.replace(/background-image:url\("\.\.\/\.\.\/assets\/[^"]*"\);?/g, "");
    }
    writeFileSync(join(to, name), text);
  }
}

if (existsSync(DST)) rmSync(DST, { recursive: true });
let pages = 0;
for (const [folder, slug] of Object.entries(FOLDERS)) {
  const from = join(SRC, folder);
  const to = join(DST, slug);

  copyPage(from, to, (html) => {
    const out = html.replace(/href="\.\.\/"/g, 'href="/templates" target="_top"');
    if (out === html) throw new Error(`${slug}: back-link not found in original`);
    return out;
  });
  pages++;

  // 只搬 CSS 里真正引用的图
  const css = readFileSync(join(from, "styles.css"), "utf8");
  const used = [...css.matchAll(/url\(["']?\.\/assets\/([^"')]+)["']?\)/g)].map((m) => m[1]);
  if (used.length === 0) throw new Error(`${slug}: no asset referenced`);
  mkdirSync(join(to, "assets"), { recursive: true });
  for (const file of new Set(used)) cpSync(join(from, "assets", file), join(to, "assets", file));

  for (const [zh, style] of Object.entries(STYLES)) {
    copyPage(join(from, zh), join(to, style), (html) => {
      const out = html.replace(/href="\.\.\/stili\.html"/g, `href="/templates/${slug}" target="_top"`);
      if (out === html) throw new Error(`${slug}/${style}: back-link not found`);
      return out;
    });
    pages++;
  }
}
console.log(`imported ${pages} pages into public/templates/`);
console.log(readdirSync(DST).join(" "));
