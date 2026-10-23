// 用法：node scripts/easyui-kit/build.mjs [id ...]   （不给 id = 全部）
// 上游源码 clone 在 scratchpad/easyui（gitignore；没有就 git clone --depth 1 https://github.com/Surajmaurya1/easyui.git 再 npm i）。
// 本目录是唯一真相：mount / theme-shim / overrides 每次构建前同步进 clone 的 ms/ 里再打包（相对 import 才对得上）。
// 产物：public/effects/_easyui/{js,easyui.css,fonts,img,LICENSE.txt} + public/effects/<id>.html
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
import { PATCHES } from './patches.mjs';

const KIT = import.meta.dirname;
const SITE = path.resolve(KIT, '../..');
const ROOT = path.join(SITE, 'scratchpad/easyui');
if (!fs.existsSync(path.join(ROOT, 'node_modules'))) throw new Error(`需要上游 clone：${ROOT}（git clone + npm i）`);
const { build } = createRequire(path.join(ROOT, 'package.json'))('esbuild');

// 把本目录的挂载壳同步进 clone（生成物，别在那边改）
const GEN = path.join(ROOT, 'ms');
fs.rmSync(GEN, { recursive: true, force: true });
fs.mkdirSync(GEN, { recursive: true });
for (const f of ['mount.tsx', 'theme-shim.tsx', 'overrides']) fs.cpSync(path.join(KIT, f), path.join(GEN, f), { recursive: true });
const OUT = path.join(SITE, 'public/effects/_easyui');
const SKIP = new Set(['magnetic-button', 'liquid-toggle', 'pull-to-refresh']); // 设计库已有同名条目

const routes = fs.readFileSync(path.join(ROOT, 'src/components/docs/detail/demo-route-registry.ts'), 'utf8');
const allIds = [...routes.matchAll(/^\s+'([a-z0-9-]+)': \{ aliases/gm)].map((m) => m[1]);
const metaSrc = fs.readFileSync(path.join(ROOT, 'src/components/registry/components-data.ts'), 'utf8');
const metas = JSON.parse(metaSrc.slice(metaSrc.indexOf('= [') + 2, metaSrc.lastIndexOf(']') + 1));
const metaById = Object.fromEntries(metas.map((m) => [m.id, m]));

const want = process.argv.slice(2);
const ids = (want.length ? want : allIds).filter((id) => !SKIP.has(id));
for (const id of ids) if (!allIds.includes(id)) throw new Error(`unknown id ${id}`);

// —— 入口：每条一个 —— 只内联本条需要的 meta 字段，别把 300KB 的全量清单打进去
const ENT = path.join(GEN, '.entries');
fs.rmSync(ENT, { recursive: true, force: true });
fs.mkdirSync(ENT, { recursive: true });
for (const id of ids) {
  const m = metaById[id] ?? { id, name: id };
  const meta = { id: m.id, name: m.name, tagline: m.tagline, category: m.category };
  fs.writeFileSync(path.join(ENT, `${id}.tsx`),
    // overrides/<id>.tsx 存在就用它代替原站的 demo（原站 demo 依赖整站外壳的那几条）
    fs.existsSync(path.join(GEN, 'overrides', `${id}.tsx`))
      ? `import { mount } from '../mount';\nimport Demo from '../overrides/${id}';\nmount(${JSON.stringify(meta)}, Demo);\n`
      : `import { mount } from '../mount';\nimport Demo from '../../src/components/docs/detail/demos/items/${id}.demo';\nmount(${JSON.stringify(meta)}, Demo);\n`);
}

// 全量构建先清空，免得旧哈希 chunk 越积越多
if (!want.length) fs.rmSync(path.join(OUT, 'js'), { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'js'), { recursive: true });
await build({
  entryPoints: ids.map((id) => ({ in: path.join(ENT, `${id}.tsx`), out: id })),
  outdir: path.join(OUT, 'js'),
  bundle: true, splitting: true, format: 'esm', minify: true, target: 'es2020',
  jsx: 'automatic', chunkNames: 'chunks/[name]-[hash]',
  alias: { '@': path.join(ROOT, 'src') },
  define: { 'process.env.NODE_ENV': '"production"', 'import.meta.env.DEV': 'false', 'import.meta.env.PROD': 'true', 'import.meta.env.MODE': '"production"' },
  loader: { '.svg': 'dataurl', '.png': 'dataurl', '.jpg': 'dataurl', '.webp': 'dataurl', '.woff2': 'file' },
  logLevel: 'warning',
  plugins: [{
    name: 'theme-shim',
    setup(b) {
      b.onResolve({ filter: /lib\/theme\/useTheme$/ }, () => ({ path: path.join(GEN, 'theme-shim.tsx') }));
    },
  }, {
    name: 'patches',
    setup(b) {
      for (const [rel, edits] of Object.entries(PATCHES)) {
        const abs = path.join(ROOT, rel);
        const esc = abs.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        b.onLoad({ filter: new RegExp(`^${esc}$`) }, () => {
          let src = fs.readFileSync(abs, 'utf8');
          for (const [from, to] of edits) {
            if (!src.includes(from)) throw new Error(`patch not found in ${rel}: ${from.slice(0, 60)}`);
            src = src.split(from).join(to);
          }
          return { contents: src, loader: 'tsx' };
        });
      }
    },
  }],
});

// —— 外链图片落地：unsplash / pravatar → /effects/_easyui/img/<hash>.jpg ——
const IMG = path.join(OUT, 'img');
fs.mkdirSync(IMG, { recursive: true });
const jsFiles = [];
(function walk(d) { for (const f of fs.readdirSync(d)) { const p = path.join(d, f); fs.statSync(p).isDirectory() ? walk(p) : p.endsWith('.js') && jsFiles.push(p); } })(path.join(OUT, 'js'));
const urlRe = /https:\/\/(?:images\.unsplash\.com|i\.pravatar\.cc)\/[^"'`\s)\\]+/g;
const urls = new Set();
for (const f of jsFiles) for (const u of fs.readFileSync(f, 'utf8').match(urlRe) ?? []) urls.add(u);
const local = {};
for (const u of urls) {
  const name = crypto.createHash('sha1').update(u).digest('hex').slice(0, 12) + '.jpg';
  const dest = path.join(IMG, name);
  if (!fs.existsSync(dest)) {
    const res = await fetch(u);
    if (!res.ok) throw new Error(`download ${res.status} ${u}`);
    fs.writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
  }
  local[u] = `/effects/_easyui/img/${name}`;
}
for (const f of jsFiles) {
  let s = fs.readFileSync(f, 'utf8');
  const t = s.replace(urlRe, (u) => local[u] ?? u);
  if (t !== s) fs.writeFileSync(f, t);
}

// —— CSS：原版 index.css 整套（Tailwind v4 + tokens + 字体）——
const cssOut = path.join(OUT, 'easyui.css');
execFileSync(path.join(ROOT, 'node_modules/.bin/tailwindcss'), ['-i', 'src/styles/index.css', '-o', cssOut, '--minify'], { cwd: ROOT, stdio: 'inherit' });
fs.writeFileSync(cssOut, fs.readFileSync(cssOut, 'utf8').replaceAll("url(/fonts/", "url(/effects/_easyui/fonts/").replaceAll("url('/fonts/", "url('/effects/_easyui/fonts/"));
fs.cpSync(path.join(ROOT, 'public/fonts'), path.join(OUT, 'fonts'), { recursive: true });
fs.copyFileSync(path.join(ROOT, 'LICENSE'), path.join(OUT, 'LICENSE.txt'));

// —— 每条一个样板页 ——
for (const id of ids) {
  const name = metaById[id]?.name ?? id;
  fs.writeFileSync(path.join(SITE, 'public/effects', `${id}.html`), `<!doctype html>
<!-- ${name} — from EasyUI (https://easyui.site) by Suraj Maurya, MIT License: /effects/_easyui/LICENSE.txt -->
<html lang="en" class="dark" style="color-scheme:dark">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${name}</title>
<link rel="stylesheet" href="/effects/_easyui/easyui.css">
<style>html,body{margin:0;min-height:100%;background:#18181B}</style>
</head>
<body>
<div id="root"></div>
<script type="module" src="/effects/_easyui/js/${id}.js"></script>
</body>
</html>
`);
}
// —— 「代码」栏用的原版源码：每条主组件 TSX 一份，带 MIT 署名头 ——
const reg = JSON.parse(fs.readFileSync(path.join(ROOT, 'registry.json'), 'utf8'));
const regItems = Object.fromEntries((reg.items ?? reg).map((x) => [x.name, x]));
const SRC = path.join(OUT, 'src');
fs.mkdirSync(SRC, { recursive: true });
// 🩸 合并写入：只重打几条时别把其余条目的路径冲掉（10-23 踩过：127 条代码栏变成了挂载壳）
const cfPath = path.join(KIT, 'code-files.json');
const codeFiles = fs.existsSync(cfPath) ? JSON.parse(fs.readFileSync(cfPath, 'utf8')) : {};
for (const id of ids) {
  const main = regItems[id]?.files?.find((f) => f.path.startsWith('src/components/ui/'));
  if (!main) { console.warn(`no registry source for ${id}`); continue; }
  const file = path.basename(main.path);
  const body = fs.readFileSync(path.join(ROOT, main.path), 'utf8');
  fs.writeFileSync(path.join(SRC, file),
    `// ${file} — from EasyUI (https://easyui.site) by Suraj Maurya.\n// MIT License — see /effects/_easyui/LICENSE.txt\n// Install: npx shadcn@latest add Surajmaurya1/easyui/${id}\n\n${body.trimEnd()}\n`);
  codeFiles[id] = `_easyui/src/${file}`;
}
fs.writeFileSync(cfPath, JSON.stringify(codeFiles, null, 1));
console.log(`built ${ids.length} · images ${urls.size} · sources ${Object.keys(codeFiles).length}`);
