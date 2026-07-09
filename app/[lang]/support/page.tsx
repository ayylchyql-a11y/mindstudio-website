/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { apps } from "@/data/apps";
import { privacy } from "@/data/legal";
import { locales, isLocale, defaultLocale, getDictionary, type Locale } from "@/lib/i18n";

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
  return {
    title: `${t.supportTitle} · Mind Studio`,
    alternates: { canonical: `https://mindstudioapps.com/${locale}/support` },
  };
}

export default async function SupportPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const t = getDictionary(lang);

  return (
    <main className="prose-page">
      <a className="eyebrow-link" href={`/${lang}`}>
        {t.backHome}
      </a>
      <h1>{t.supportTitle}</h1>
      <p className="prose-intro">{t.supportIntro}</p>

      <div className="support-block">
        <h2>{t.supportContactHeading}</h2>
        <p>
          {t.supportContactBody.split("ayylchyql@gmail.com")[0]}
          <a href="mailto:ayylchyql@gmail.com">ayylchyql@gmail.com</a>
          {t.supportContactBody.split("ayylchyql@gmail.com")[1]}
        </p>
      </div>

      <h2>{t.supportPrivacyHeading}</h2>
      <div className="legal-list">
        {apps
          .filter((app) => privacy[app.id])
          .map((app) => (
            <a key={app.id} className="legal-row" href={`/${lang}/apps/${app.id}/privacy`}>
              <img src={app.icon} alt={`${app.name} icon`} />
              <span className="grow">
                <span className="nm">{app.name}</span>
              </span>
              <span className="go">{t.viewPrivacy}</span>
            </a>
          ))}
      </div>
    </main>
  );
}
