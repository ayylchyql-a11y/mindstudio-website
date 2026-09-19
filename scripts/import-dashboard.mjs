// 把桌面的 Dashboard 模版（M Desk 后台，6 种侧边栏）搬进设计库：
//   ~/Desktop/网站模版/Dashboard模版/{index.html,风格X-*/}  →  public/effects/dashboard-<style>/ (bundleDir)
//   共用资源 assets/ → public/effects/_mdesk/，页面里的 assets 路径统一改写成 ../_mdesk/
// 用户 09-19 拍板：Dashboard 属于设计库(/lab)，不属于网页设计(/templates)。
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const SRC = process.argv[2] ?? join(process.env.HOME, "Desktop", "网站模版", "Dashboard模版");
const DST = join(process.cwd(), "public", "effects");
const STYLES = { ".": "floating-panel", "风格B-深色重底": "dark-rail", "风格C-磨砂玻璃": "glass-rail", "风格D-双层图标轨": "rail-panel", "风格E-折叠展开": "hover-expand", "风格F-分组收口": "grouped-nav" };

// shared assets
const shared = join(DST, "_mdesk");
rmSync(shared, { recursive: true, force: true }); mkdirSync(shared, { recursive: true });
for (const f of readdirSync(join(SRC, "assets"))) cpSync(join(SRC, "assets", f), join(shared, f));

for (const [dir, style] of Object.entries(STYLES)) {
  const from = join(SRC, dir), to = join(DST, `dashboard-${style}`);
  const poster = join(to, "poster.jpg"), keep = existsSync(poster) ? readFileSync(poster) : null;
  rmSync(to, { recursive: true, force: true }); mkdirSync(to, { recursive: true });
  for (const name of ["index.html", "styles.css", "app.js"]) {
    let text = readFileSync(join(from, name), "utf8");
    // assets: root page uses assets/…, design folders ../assets/… → all become ../_mdesk/
    text = text.replace(/"\.\.\/assets\//g, '"../_mdesk/').replace(/"assets\//g, '"../_mdesk/').replace(/url\("\.\.\/assets\//g, 'url("../_mdesk/');
    // back-links point at the library, not the templates section
    text = text.replace(/href="\.\.\/(stili\.html)?"/g, 'href="/lab/dashboard" target="_top"').replace(/← Tutti (i template|gli stili)/g, "← Altri design");
    if (/["(]\.?\.?\/?assets\//.test(text)) throw new Error(`${style}/${name}: assets path left`);
    writeFileSync(join(to, name), text);
  }
  if (keep) writeFileSync(poster, keep);
}
console.log("imported 6 dashboards →", Object.values(STYLES).map((s) => `dashboard-${s}`).join(" "));
