import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CLIENTS_LANGS, clients, clientsCopy, posterPath } from "@/data/clients";
import { altsFor, defaultLocale, getDictionary, isLocale, locales, pick, type Locale } from "@/lib/i18n";

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
  return {
    title: `${pick(clientsCopy.title, locale)} · Mind Studio`,
    description: pick(clientsCopy.intro, locale),
    alternates: altsFor("/{lang}/clients", locale, CLIENTS_LANGS),
  };
}

/**
 * 客户样板总览：一排卡片，一张卡 = 一个客户的站（海报 + 店名 + 行业·城市）。
 * 跟 /templates 同一套卡片样式（tpl-grid / tpl-card），只是没有行业分组 ——
 * 客户站一只手数得过来，分组反而显得空。
 */
export default async function ClientsIndex({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <main className="prose-page tpl-page">
      <a className="eyebrow-link" href={`/${lang}`}>
        {t.backHome}
      </a>
      <h1>{pick(clientsCopy.title, lang)}</h1>
      <p className="prose-intro">{pick(clientsCopy.intro, lang)}</p>

      <ul className="tpl-grid">
        {clients.map((c) => (
          <li key={c.slug}>
            <a className="tpl-card" href={`/${lang}/clients/${c.slug}`}>
              <span className="tpl-card-shot" style={{ background: c.accent }}>
                <img
                  src={posterPath(c)}
                  alt={`${c.name} — ${pick(c.industry, lang)}`}
                  width={1200}
                  height={750}
                  loading="lazy"
                  decoding="async"
                />
              </span>
              <span className="tpl-card-body">
                <span className="tpl-card-name">{c.name}</span>
                <span className="tpl-card-meta">
                  {pick(c.industry, lang)} · {c.city}
                </span>
                <span className="tpl-card-styles">{pick(c.gist, lang)}</span>
              </span>
            </a>
          </li>
        ))}
      </ul>

      <p className="tpl-note">{pick(clientsCopy.note, lang)}</p>
    </main>
  );
}
