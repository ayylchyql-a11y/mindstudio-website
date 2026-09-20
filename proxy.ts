import { NextResponse, type NextRequest } from "next/server";
import { locales, defaultLocale, type Locale } from "@/lib/i18n";
import { LAB_COOKIE, LAB_LOCKED, isGatedPath, labPassword, labToken, toFullPath } from "@/lib/lab-gate";

/**
 * 把 `Accept-Language` 里最靠前、我们又支持的那种语言挑出来。
 *
 * 🩸 两语言时这里是「一律去 /en」，12 语言就不该这样了 —— 从意大利 TikTok
 *    点进来的人应该直接落到 /it，而不是先看一屏英文再自己去菜单里找。
 *
 * 匹配规则（从具体到宽泛）：
 *   `zh-TW` / `zh-Hant-HK` → zh-tw ·  `zh-CN` / `zh` → zh ·  `pt-BR` → pt · 其余取主语言段
 */
function negotiate(header: string | null): Locale {
  if (!header) return defaultLocale;
  const wanted = header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((p) => p.trim().startsWith("q="));
      return { tag: tag.trim().toLowerCase(), q: q ? Number(q.split("=")[1]) || 0 : 1 };
    })
    .filter((x) => x.tag)
    .sort((a, b) => b.q - a.q);

  for (const { tag } of wanted) {
    if ((locales as readonly string[]).includes(tag)) return tag as Locale;
    // 繁体：zh-tw / zh-hk / zh-mo / 任何带 hant 的
    if (tag.startsWith("zh")) {
      return /(^|-)(tw|hk|mo|hant)(-|$)/.test(tag) ? "zh-tw" : "zh";
    }
    const base = tag.split("-")[0];
    if ((locales as readonly string[]).includes(base)) return base as Locale;
  }
  return defaultLocale;
}

/** 密码门的那一页。纯 HTML，不走 React —— proxy 里直接吐，什么都不依赖。 */
function gatePage(pathname: string, wrong: boolean): string {
  const lang = pathname.split("/")[1] || "en";
  const t = ({
    zh: { title: "完整版设计库", body: "可交互样板、参数、提示词与源码是客户专享。输入密码继续。", ph: "密码", btn: "进入", wrong: "密码不对" },
    "zh-tw": { title: "完整版設計庫", body: "可互動樣板、參數、提示詞與原始碼是客戶專享。輸入密碼繼續。", ph: "密碼", btn: "進入", wrong: "密碼不對" },
    it: { title: "Libreria completa", body: "Sample interattivi, numeri, prompt e sorgente sono riservati ai clienti. Inserisci la password per continuare.", ph: "Password", btn: "Entra", wrong: "Password errata" },
  } as Record<string, { title: string; body: string; ph: string; btn: string; wrong: string }>)[lang] ?? { title: "Full library", body: "Live samples, numbers, prompts and source are for clients. Enter the password to continue.", ph: "Password", btn: "Enter", wrong: "Wrong password" };
  const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
  return `<!doctype html><html lang="${esc(lang)}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>${esc(t.title)} · Mind Studio</title>
<style>*{box-sizing:border-box;margin:0}body{min-height:100vh;display:grid;place-items:center;padding:24px;background:#f5f5f7;color:#1d1d1f;font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text",sans-serif;-webkit-font-smoothing:antialiased}
form{width:min(360px,100%);background:#fff;border:1px solid #0000000f;border-radius:20px;padding:28px 26px;box-shadow:0 20px 50px -30px #0006}h1{font-size:20px;font-weight:650;letter-spacing:-.02em}p{margin-top:8px;font-size:14px;line-height:1.55;color:#6e6e73}
input{width:100%;margin-top:18px;height:44px;padding:0 14px;border:1px solid #0000001f;border-radius:12px;font:inherit;font-size:15px;background:#f5f5f7}input:focus{outline:2px solid #2f6fff;border-color:transparent}
button{width:100%;margin-top:10px;height:44px;border:0;border-radius:12px;background:#1d1d1f;color:#fff;font:inherit;font-size:14.5px;font-weight:600;cursor:pointer}.w{margin-top:10px;font-size:13px;color:#d0342c}
@media(prefers-color-scheme:dark){body{background:#0b0b0d;color:#f5f5f7}form{background:#141416;border-color:#ffffff14}p{color:#98989d}input{background:#0b0b0d;border-color:#ffffff1f;color:#f5f5f7}button{background:#f5f5f7;color:#1d1d1f}}</style></head>
<body><form method="post" action="/api/lab-unlock"><h1>${esc(t.title)}</h1><p>${esc(t.body)}</p><input type="password" name="password" placeholder="${esc(t.ph)}" autofocus autocomplete="current-password" required><input type="hidden" name="next" value="${esc(pathname)}">${wrong ? `<div class="w">${esc(t.wrong)}</div>` : ""}<button type="submit">${esc(t.btn)}</button></form></body></html>`;
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // —— 设计库密码门（lib/lab-gate.ts）——
  // 门后面的是：完整版路由树 /xx/lab-unlocked/**，和没开放的样板文件 /effects/*.html。
  // 公开的 /xx/lab/** 本身不拦；带对 cookie 来访时**改写**到完整版（地址栏不变）。
  if (LAB_LOCKED) {
    const key = req.cookies.get(LAB_COOKIE)?.value;
    const unlocked = key === (await labToken(labPassword()));
    if (!unlocked && isGatedPath(pathname)) {
      return new NextResponse(gatePage(pathname, req.nextUrl.searchParams.get("wrong") === "1"), {
        status: 401,
        headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" },
      });
    }
    if (unlocked) {
      const full = toFullPath(pathname);
      if (full) {
        const url = req.nextUrl.clone();
        url.pathname = full;
        // 🩸 完整版是按人下发的，别让 CDN / 浏览器把它缓存后端给下一个没 cookie 的人
        const res = NextResponse.rewrite(url);
        res.headers.set("cache-control", "private, no-store");
        res.headers.set("x-robots-tag", "noindex");
        return res;
      }
    }
  }
  // 样板文件本来不经过 proxy（matcher 排除带点号的路径），只为这道门才进来的：
  // 过了门（或不归门管的 js/css/图片）一律放行，别被下面的语言重定向带去 /en/effects/…
  if (pathname.startsWith("/effects/")) return NextResponse.next();

  const hasLocale = locales.some(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)
  );
  if (hasLocale) return NextResponse.next();

  const url = req.nextUrl.clone();
  const target = negotiate(req.headers.get("accept-language"));
  url.pathname = `/${target}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // 第二条是给密码门的：样板文件 /effects/*.html 带点号，第一条排除了它们
  matcher: ["/((?!api|_next|.*\\..*).*)", "/effects/:path*"],
};
