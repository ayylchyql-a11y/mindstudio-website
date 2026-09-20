import { labCopy } from "@/data/effects";
import { LAB_FULL_SEGMENT } from "@/lib/lab-open";
import { pick, type Locale } from "@/lib/i18n";

/**
 * 公开（橱窗）页的收尾：招揽一句 → /servizi，再一行说明完整版在门后。
 *
 * `fullPath` 是这一页在完整版路由树里的地址（`/xx/lab-unlocked/...`）：
 * 没 cookie 点过去会撞上密码门，输对了直接落到这一页的完整版。
 * 这是公开页上**唯一**通往门口的路 —— 门本身不在导航里。
 */
export default function LabCta({ lang, fullPath }: { lang: Locale; fullPath: string }) {
  return (
    <>
      <aside className="fx-cta">
        <p className="fx-cta-title">{pick(labCopy.ctaTitle, lang)}</p>
        <p className="fx-cta-body">{pick(labCopy.ctaBody, lang)}</p>
        <a className="fx-cta-btn" href={`/${lang}/servizi`}>
          {pick(labCopy.ctaBtn, lang)}
        </a>
      </aside>
      <p className="fx-full-note">
        {pick(labCopy.fullLibrary, lang)}{" "}
        <a href={fullPath} rel="nofollow">{pick(labCopy.fullLibraryLink, lang)}</a>
      </p>
    </>
  );
}

export function fullPathFor(lang: Locale, rest: string): string {
  return `/${lang}/${LAB_FULL_SEGMENT}${rest}`;
}
