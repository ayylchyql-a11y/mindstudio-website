import type { Metadata } from "next";
import "../globals.css";
import { defaultLocale, getDictionary, hreflangMap, isLocale, localeMeta, locales, type Locale } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const t = getDictionary(locale);
  const url = `https://mindstudioapps.com/${locale}`;
  return {
    metadataBase: new URL("https://mindstudioapps.com"),
    title: t.metaTitle,
    description: t.metaDescription,
    icons: { icon: "/logo.svg" },
    // Search Console 所有权验证。文件法（public/google32cd…html）才是主验证手段
    // —— proxy.ts 的 matcher 排除了带点的路径，所以那个文件不会被语言重定向劫走。
    // 这个 meta 是双保险：它出现在 /en /zh 等每个语言页上，而根路径 `/` 本身
    // 是 307 到语言页的，Google 抓根路径时拿到的是重定向。
    verification: { google: "Fgw2ZLEeaINrqkfHJZBW8HNJJZL_33atgUXjZUaDTo8" },
    alternates: {
      canonical: url,
      languages: hreflangMap("/{lang}"),
    },
    openGraph: {
      title: t.metaTitle,
      description: t.metaDescription,
      url,
      siteName: "Mind Studio",
      type: "website",
    },
  };
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const t = getDictionary(locale);
  return (
    // dir 必须跟着语言走：阿拉伯语不加 dir="rtl" 的话整页是左对齐的，
    // 标点位置也全错（不是"看着别扭"，是读不了）。
    <html lang={t.htmlLang} dir={localeMeta[locale].dir}>
      <body>{children}</body>
    </html>
  );
}
