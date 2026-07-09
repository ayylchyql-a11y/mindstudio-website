import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

export default function DetailNav({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);
  return (
    <a className="detail-back" href={`/${lang}`}>
      {t.backToApps}
    </a>
  );
}
