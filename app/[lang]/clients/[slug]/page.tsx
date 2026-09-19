import type { Metadata } from "next";
import { notFound } from "next/navigation";
import TemplateViewer from "@/components/TemplateViewer";
import { CLIENTS_LANGS, altPagePath, clientBySlug, clients, clientsCopy, pagePath, posterPath } from "@/data/clients";
import { altsFor, defaultLocale, getDictionary, isLocale, locales, pick, type Locale } from "@/lib/i18n";

export function generateStaticParams() {
  return locales.flatMap((lang) => clients.map((c) => ({ lang, slug: c.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}): Promise<Metadata> {
  const { lang, slug } = await params;
  const locale: Locale = isLocale(lang) ? lang : defaultLocale;
  const c = clientBySlug(slug);
  if (!c) return {};
  const alternates = altsFor(`/{lang}/clients/${slug}`, locale, CLIENTS_LANGS);
  const title = `${c.name} — ${pick(c.industry, locale)}`;
  return {
    title: `${title} · ${pick(clientsCopy.title, locale)} · Mind Studio`,
    description: pick(c.gist, locale),
    alternates,
    openGraph: {
      title,
      description: pick(c.gist, locale),
      url: alternates.canonical,
      siteName: "Mind Studio",
      type: "website",
      images: [{ url: `https://mindstudioapps.com${posterPath(c)}`, width: 1200, height: 750 }],
    },
  };
}

/**
 * 一个客户站一页：取景框里跑真的站（TemplateViewer，只有一种设计所以没有 tab），
 * 下面是来龙去脉、里面做了什么、其它客户站。版式与 /templates/[slug] 相同。
 */
export default async function ClientPage({
  params,
}: {
  params: Promise<{ lang: string; slug: string }>;
}) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const c = clientBySlug(slug);
  if (!c) notFound();
  const t = getDictionary(lang);
  const siblings = clients.filter((x) => x.slug !== c.slug);

  const designs = [
    { id: "delivered", brand: c.name, style: pick(clientsCopy.delivered, lang), gist: pick(c.gist, lang), src: pagePath(c), poster: posterPath(c) },
    ...(c.alt ?? []).map((a) => ({ id: a.id, brand: c.name, style: pick(a.title, lang), gist: pick(a.gist, lang), src: altPagePath(c, a.dir), poster: posterPath(c, a.id) })),
  ];

  return (
    <main className="prose-page tpl-page tpl-detail" style={{ ["--accent-line" as string]: c.accent }}>
      <a className="eyebrow-link" href={`/${lang}/clients`}>
        {pick(clientsCopy.title, lang)}
      </a>
      <h1>{c.name}</h1>
      <p className="updated">
        {pick(c.industry, lang)} · {c.city}
      </p>
      <p className="prose-intro">{pick(c.gist, lang)}</p>

      <div className="tpl-stage">
        <TemplateViewer designs={designs} openLabel={pick(clientsCopy.openFull, lang)} />
      </div>

      {c.liveUrl ? (
        <p className="tpl-cta">
          <a href={c.liveUrl} target="_blank" rel="noopener">{pick(clientsCopy.live, lang)} ↗</a>
        </p>
      ) : null}

      <h2>{pick(clientsCopy.storyTitle, lang)}</h2>
      {c.story.map((p, i) => (
        <p key={i}>{pick(p, lang)}</p>
      ))}

      <h2>{pick(clientsCopy.featuresTitle, lang)}</h2>
      <ul className="note-ul">
        {c.features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>

      <p className="tpl-note">{pick(clientsCopy.note, lang)}</p>

      <p className="tpl-cta">
        {pick(clientsCopy.cta, lang)} <a href={`mailto:ayylchyql@gmail.com?subject=${encodeURIComponent(c.name)}`}>ayylchyql@gmail.com</a>
      </p>

      <aside className="note-tail">
        {siblings.length ? (
          <div className="fx-siblings">
            {siblings.map((s) => (
              <a key={s.slug} href={`/${lang}/clients/${s.slug}`}>
                {s.name} · {pick(s.industry, lang)}
              </a>
            ))}
          </div>
        ) : null}
        <p className="tpl-tail-links">
          <a href={`/${lang}/clients`}>{pick(clientsCopy.all, lang)}</a>
          <span aria-hidden="true"> · </span>
          <a href={`/${lang}`}>{t.backHome}</a>
        </p>
      </aside>
    </main>
  );
}
