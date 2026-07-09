import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apps, getApp } from "@/data/apps";
import { getPrivacy } from "@/data/legal";
import { locales, isLocale, defaultLocale, getDictionary, type Locale } from "@/lib/i18n";

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
    alternates: { canonical: `https://mindstudioapps.com/${locale}/apps/${id}/privacy` },
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
      <p className="updated">{doc.updated[lang]}</p>
      <p className="prose-intro">{doc.intro[lang]}</p>

      {doc.sections.map((s, i) => (
        <section key={i}>
          <h2>{s.heading[lang]}</h2>
          {s.body.map((p, j) => (
            <p key={j}>{p[lang]}</p>
          ))}
        </section>
      ))}
    </main>
  );
}
