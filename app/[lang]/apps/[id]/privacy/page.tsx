import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apps, getApp } from "@/data/apps";
import { getPrivacy } from "@/data/legal";
import { altsFor, defaultLocale, getDictionary, isLocale, locales, pick, type Locale } from "@/lib/i18n";

/** data/legal.ts 里真正写了原文的语言。其余靠 pick() 回落到英文。 */
const LEGAL_LOCALES = ["en", "zh"] as const satisfies readonly Locale[];

export function generateStaticParams() {
  return locales.flatMap((lang) => apps.map((app) => ({ lang, id: app.id })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}): Promise<Metadata> {
  const { lang, id } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const app = getApp(id);
  const t = getDictionary(locale);
  if (!app) return {};
  return {
    title: `${app.name} — ${t.privacyLabel} · Mind Studio`,
    // 法律文本有意只写 en / zh 两份（见 data/legal.ts），其余十种语言读到的
    // 就是英文原文 —— 那十个 URL 的 canonical 归到 /en，zh-tw 归到 /zh。
    alternates: altsFor(`/{lang}/apps/${id}/privacy`, locale, LEGAL_LOCALES),
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = await params;
  if (!isLocale(lang)) notFound();
  const app = getApp(id);
  const doc = getPrivacy(id);
  if (!app || !doc) notFound();

  const t = getDictionary(lang);

  return (
    <main className="prose-page" style={{ ["--accent-line" as string]: app.accent }}>
      <a className="eyebrow-link" href={`/${lang}/apps/${id}`}>
        {app.name}
      </a>
      <h1>
        {app.name} — {t.privacyLabel}
      </h1>
      <p className="updated">{pick(doc.updated, lang)}</p>
      <p className="prose-intro">{pick(doc.intro, lang)}</p>

      {doc.sections.map((s, i) => (
        <section key={i}>
          <h2>{pick(s.heading, lang)}</h2>
          {s.body.map((p, j) => (
            <p key={j}>{pick(p, lang)}</p>
          ))}
        </section>
      ))}
    </main>
  );
}
