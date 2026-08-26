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
