// 「名店风格」两个板块（寿司 10 + 披萨 10）的导入脚本。
// 源：~/Desktop/网站模版/名店模版/<slug>/{index.html,styles.css,app.js,assets/,poster.jpg,entry.json}
// 产物：public/templates/<slug>/…、public/templates/_posters/<slug>--original.jpg、data/templates-famous.ts
//
// 跟 import-templates.mjs 分开：那个脚本会全量清空 public/templates 再重建（会把桌面上
// 与线上不一致的 pokeria 一起覆盖掉）；这个只动名店这 20 个目录。
//   node scripts/import-famous-templates.mjs [源目录]
//
// _ref/（原站拆解截图）、_check/（验收脚本）、CREDITS.md、entry.json 不搬 —— 原站截图绝不能上线。
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";

const SRC = process.argv[2] ?? join(process.env.HOME, "Desktop", "网站模版", "名店模版");
const DST = join(process.cwd(), "public", "templates");
const OUT_TS = join(process.cwd(), "data", "templates-famous.ts");

/** 展示顺序 = 这里的顺序；group 由前缀决定 */
const ORDER = [
  "sushi-counter-washi", "sushi-monochrome", "sushi-global-house", "sushi-izakaya-seasons", "sushi-nikkei",
  "sushi-ocean-simple", "sushi-table-share", "sushi-kaiten-promo", "sushi-delivery-shop", "sushi-family-wordmark",
  "pizza-heritage-branches", "pizza-dark-territory", "pizza-split-noir", "pizza-type-poster", "pizza-brooklyn-script",
  "pizza-gingham-pop", "pizza-sourdough-chalk", "pizza-order-online", "pizza-cream-stamp", "pizza-al-taglio",
];
/** 原店名 —— 公开内容里一个都不许出现（构建前自检） */
const FORBIDDEN = [
  "jiro", "次郎", "masa nyc", "masayoshi", "takayama", "nobu", "matsuhisa", "zuma", "sushisamba", "sugarfish", "nozawa",
  "sticks'n'sushi", "sticksnsushi", "sushiro", "スシロー", "sushi shop", "sushishop", "uchi", "tyson cole",
  "da michele", "damichele", "condurro", "pepe in grani", "franco pepe", "masanielli", "martucci", "napoli on the road",
  "michele pascarella", "roberta's", "robertas", "pizza pilgrims", "pilgrims", "franco manca", "frank pepe", "pepespizzeria",
  "berberè", "berbere", "bonci",
];

const entries = [];
const missing = [];
for (const slug of ORDER) {
  const from = join(SRC, slug);
  if (!existsSync(join(from, "entry.json")) || !existsSync(join(from, "poster.jpg"))) { missing.push(slug); continue; }
  const entry = JSON.parse(readFileSync(join(from, "entry.json"), "utf8"));
  if (entry.slug !== slug) throw new Error(`${slug}: entry.slug = ${entry.slug}`);

  const to = join(DST, slug);
  if (existsSync(to)) rmSync(to, { recursive: true });
  mkdirSync(to, { recursive: true });

  let text = "";
  for (const name of ["index.html", "styles.css", "app.js"]) {
    const p = join(from, name);
    if (!existsSync(p)) throw new Error(`${slug}: missing ${name}`);
    let t = readFileSync(p, "utf8");
    if (name === "index.html") {
      const out = t.replace(/href="\.\.\/"/g, 'href="/templates" target="_top"');
      if (out === t) throw new Error(`${slug}: back-link href="../" not found`);
      t = out;
    }
    text += t + "\n";
    writeFileSync(join(to, name), t);
  }

  // assets：整个目录照搬（BRIEF 规定只放用到的图；图片名常是 JS 里拼出来的 `p-${id}`，按主名判断引用会漏搬）
  const assetsDir = join(from, "assets");
  let bytes = 0;
  if (existsSync(assetsDir)) {
    const files = readdirSync(assetsDir, { recursive: true }).filter((f) => statSync(join(assetsDir, f)).isFile());
    for (const f of files) {
      if (/\.(css|js|json)$/.test(f)) text += readFileSync(join(assetsDir, f), "utf8") + "\n";
      mkdirSync(join(to, "assets", f, ".."), { recursive: true });
      cpSync(join(assetsDir, f), join(to, "assets", f));
      bytes += statSync(join(assetsDir, f)).size;
    }
  }

  // 公开文本自检：原店名
  const pub = (text + JSON.stringify(entry)).toLowerCase();
  for (const w of FORBIDDEN) {
    const re = new RegExp(`(^|[^a-z])${w.replace(/[.*+?^${}()|[\]\\']/g, "\\$&")}([^a-z]|$)`, "i");
    if (re.test(pub)) throw new Error(`${slug}: public text contains original name "${w}"`);
  }

  mkdirSync(join(DST, "_posters"), { recursive: true });
  cpSync(join(from, "poster.jpg"), join(DST, "_posters", `${slug}--original.jpg`));
  entries.push({ ...entry, group: slug.startsWith("sushi-") ? "sushi-icons" : "pizza-icons" });
  console.log(`${slug.padEnd(26)} ${entry.name.padEnd(24)} assets ${(bytes / 1024).toFixed(0)} KB`);
}

const L = (o) => JSON.stringify(o);
const ts = `// 由 scripts/import-famous-templates.mjs 生成 —— 别手改，改桌面 名店模版/<slug>/entry.json 再重跑。
import type { SiteTemplate } from "@/data/templates";

export const famousTemplates: SiteTemplate[] = [
${entries
  .map(
    (e) => `  {
    slug: ${L(e.slug)},
    group: ${L(e.group)},
    date: "2026-11-15",
    name: ${L(e.name)},
    industry: ${L(e.industry)},
    city: ${L(e.city)},
    gist: ${L(e.gist)},
    features: ${L(e.features)},
    variants: {},
    accent: ${L(e.accent)},
    lang: "it",
  },`,
  )
  .join("\n")}
];
`;
writeFileSync(OUT_TS, ts);
try { execFileSync("npx", ["prettier", "--write", OUT_TS], { stdio: "ignore" }); } catch {}
console.log(`\n${entries.length} imported → data/templates-famous.ts${missing.length ? `\nnot ready: ${missing.join(" ")}` : ""}`);
