import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

export default function DetailNav({
  lang,
  label,
}: {
  lang: Locale;
  /** 案例页回的是首页而不是 App 列表，标题要跟着换 */
  label?: string;
}) {
  const t = getDictionary(lang);
  return (
    <a className="detail-back" href={`/${lang}`}>
      {label ?? t.backToApps}
    </a>
  );
}
