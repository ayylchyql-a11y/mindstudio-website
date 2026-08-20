import type { Locale } from "@/lib/i18n";
import { getDictionary } from "@/lib/i18n";

export default function PlayStoreBadge({ href, lang }: { href: string; lang: Locale }) {
  const t = getDictionary(lang);
  return (
    <a className="store-badge" href={href} target="_blank" rel="noopener">
      {/* 24x24 图形，行内尺寸压回方形，否则会被 .store-badge svg 的 17×20 拉长 */}
      <svg viewBox="0 0 24 24" aria-hidden="true" style={{ width: 18, height: 18 }}>
        <path d="M22.018 13.298l-3.919 2.218-3.515-3.493 3.543-3.521 3.891 2.202a1.49 1.49 0 0 1 0 2.594zM1.337.924a1.486 1.486 0 0 0-.112.568v21.017c0 .217.045.419.124.6l11.155-11.087L1.337.924zM12.207 10.5l2.968-2.95L2.53.995 12.207 10.5zm0 3l-9.68 9.505 12.648-6.555-2.968-2.95z" />
      </svg>
      <span>
        <small>{t.badgePlaySmall}</small>
        {t.badgePlayStore}
      </span>
    </a>
  );
}
