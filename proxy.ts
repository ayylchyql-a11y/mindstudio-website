import { NextResponse, type NextRequest } from "next/server";
import { locales, defaultLocale, type Locale } from "@/lib/i18n";

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

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

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
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
