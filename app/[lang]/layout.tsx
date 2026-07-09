import type { Metadata } from "next";
import "../globals.css";
import { getDictionary, isLocale, locales, defaultLocale, type Locale } from "@/lib/i18n";

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
      languages: { en: "/en", "zh-CN": "/zh" },
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
    <html lang={t.htmlLang}>
      <body>{children}</body>
    </html>
  );
}
