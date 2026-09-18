// 把桌面上的网站模版搬进 public/templates/<slug>/…：
//   · `网站模版/`        7 个行业 × (原版 + editorial / night-glass / pop)，
//                        外加绿达康生鲜（中文 B2B，只有原版；店名换成虚构的）
//   · `网站模版Claude/`  同 7 个行业各一个 Claude Design 版 → <slug>/claude/
//
// 一次性脚本，但留在仓库里：以后桌面那边改了模版，重跑一遍就同步。
//   node scripts/import-templates.mjs [源目录] [Claude 版源目录]
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
const SRC_DC = process.argv[3] ?? join(process.env.HOME, "Desktop", "网站模版Claude");
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
  "Pokeria模版": "pokeria", // 09-18 自己写的（Mumi Poke），碗是 SVG 画的、没有照片
};
const STYLES = {
  "风格A-编辑杂志": "editorial",
  "风格B-夜间玻璃": "night-glass",
  "风格C-活力波普": "pop",
  // 手作的两套（目前只有 pokeria 有）：目录不存在就跳过
  "风格D-深海": "abisso",
  "风格E-市集": "mercato",
};
/**
 * Claude Design 版：`<NN-Name-中文>/<Name>.dc.html` + 同目录 support.js / image-slot.js。
 * 它们的图片位（<image-slot>）原本全空；把**首屏那一个**用同行业原版的 hero 照片填上，
 * 画廊位保持占位 —— 每个行业只有一张照片。
 */
const DC = {
  ramen: { dir: "01-Ramen-拉面店", file: "Ramen.dc.html", hero: ["hero-ramen"] },
  "all-you-can-eat": { dir: "02-AllYouCanEat-自助餐", file: "AllYouCanEat.dc.html", hero: ["hero-ayce"] },
  "sushi-takeaway": { dir: "03-SushiTakeaway-寿司外卖", file: "SushiTakeaway.dc.html", hero: ["hero-box"] },
  "nail-salon": { dir: "04-NailSalon-美甲店", file: "NailSalon.dc.html", hero: ["hero-1"] },
  "food-supplier": { dir: "05-FoodSupplier-食品供应商", file: "FoodSupplier.dc.html", hero: ["hero-supplier"] },
  "department-store": { dir: "06-Emporio-百货店", file: "Emporio.dc.html", hero: ["hero-emporio"] },
  "phone-repair": { dir: "07-PhoneRepair-手机维修", file: "PhoneRepair.dc.html", hero: ["hero-repair"] },
};
/**
 * 绿达康是给真实客户做的稿，上个人站要把店名换掉（内容本身页脚就写着「演示品牌与内容」，
 * 电话地址都是编的）。文件名里的 lvdakang 一起换，免得 URL 里还留着。
 */
const FRESH = { folder: "绿达康生鲜供应商模版", slug: "fresh-supply", from: "绿达康", to: "青禾鲜供", asset: ["lvdakang", "qinghe"] };

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

// 只清各模版目录，`_posters/`（截图海报）是另一条流水线产的，别一起删
if (existsSync(DST)) {
  for (const d of readdirSync(DST)) if (d !== "_posters") rmSync(join(DST, d), { recursive: true });
}
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

  // 只搬 CSS 里真正引用的图（pokeria 的碗是 SVG 画的，没有图，也就没有 assets 目录）
  const css = readFileSync(join(from, "styles.css"), "utf8");
  const used = [...css.matchAll(/url\(["']?\.\/assets\/([^"')]+)["']?\)/g)].map((m) => m[1]);
  if (used.length === 0 && existsSync(join(from, "assets"))) throw new Error(`${slug}: assets dir present but nothing referenced`);
  if (used.length) mkdirSync(join(to, "assets"), { recursive: true });
  for (const file of new Set(used)) cpSync(join(from, "assets", file), join(to, "assets", file));

  for (const [zh, style] of Object.entries(STYLES)) {
    if (!existsSync(join(from, zh))) continue;
    copyPage(join(from, zh), join(to, style), (html) => {
      const out = html.replace(/href="\.\.\/stili\.html"/g, `href="/templates/${slug}" target="_top"`);
      if (out === html) throw new Error(`${slug}/${style}: back-link not found`);
      return out;
    });
    pages++;
  }
}
// —— Claude 版 ——
for (const [slug, dc] of Object.entries(DC)) {
  const from = join(SRC_DC, dc.dir);
  const to = join(DST, slug, "claude");
  mkdirSync(to, { recursive: true });
  let html = readFileSync(join(from, dc.file), "utf8");
  const heroFile = readdirSync(join(DST, slug, "assets"))[0];
  for (const id of dc.hero) {
    const re = new RegExp(`<image-slot id="${id}"`);
    if (!re.test(html)) throw new Error(`${slug}/claude: slot ${id} not found`);
    html = html.replace(re, `<image-slot id="${id}" src="../assets/${heroFile}"`);
  }
  writeFileSync(join(to, "index.html"), html);
  for (const name of ["support.js", "image-slot.js"]) cpSync(join(from, name), join(to, name));
  pages++;
}

// —— 绿达康 → 青禾鲜供 ——
{
  const from = join(SRC, FRESH.folder);
  const to = join(DST, FRESH.slug);
  const [oldA, newA] = FRESH.asset;
  copyPage(from, to, (html) => {
    const out = html.split(FRESH.from).join(FRESH.to).split(oldA).join(newA);
    if (out.includes(FRESH.from)) throw new Error("fresh-supply: brand still present");
    return out;
  });
  // styles.css 里也引用了图；copyPage 只对 index.html 跑 rewrite
  const cssPath = join(to, "styles.css");
  writeFileSync(cssPath, readFileSync(cssPath, "utf8").split(oldA).join(newA));
  const js = join(to, "app.js");
  if (readFileSync(js, "utf8").includes(FRESH.from)) throw new Error("fresh-supply: brand in app.js");
  mkdirSync(join(to, "assets"), { recursive: true });
  for (const f of readdirSync(join(from, "assets"))) {
    if (!f.endsWith(".jpg")) continue; // 同样不搬 png 母图
    cpSync(join(from, "assets", f), join(to, "assets", f.split(oldA).join(newA)));
  }
  pages++;
}

console.log(`imported ${pages} pages into public/templates/`);
console.log(readdirSync(DST).join(" "));
