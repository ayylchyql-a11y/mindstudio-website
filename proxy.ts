import { NextResponse, type NextRequest } from "next/server";
import { locales, defaultLocale } from "@/lib/i18n";

function pickLocale(req: NextRequest): string {
  const header = req.headers.get("accept-language") ?? "";
  const preferred = header.split(",").map((part) => part.split(";")[0].trim().toLowerCase());
  for (const lang of preferred) {
    if (lang.startsWith("zh")) return "zh";
    if (lang.startsWith("en")) return "en";
  }
  return defaultLocale;
}

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const hasLocale = locales.some(
    (loc) => pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)
  );
  if (hasLocale) return NextResponse.next();

  const locale = pickLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
