import MsLogo from "./MsLogo";
import { apps } from "@/data/apps";
import type { Locale } from "@/lib/i18n";
import { getDictionary, locales, localeMeta } from "@/lib/i18n";

export default function Nav({ lang }: { lang: Locale }) {
  const t = getDictionary(lang);

  return (
    <nav>
      <div className="nav-inner">
        <a className="nav-logo" href={`/${lang}#top`}>
          <MsLogo />
          Mind Studio
        </a>
        <div className="nav-links">
          <a href={`/${lang}/work/m-desk`}>M Desk</a>
          {apps.map((app) => (
            <a key={app.id} href={`#${app.id}`}>
              {app.name}
            </a>
          ))}
        </div>
        {/*
          语言菜单。2 语言时这里是个「切到另一种」的单链接（`navLangSwitch`），
          12 语言就不成立了 —— 改成 <details> 下拉：纯 HTML，不需要客户端 JS，
          键盘可达，这个站也没有引入任何交互框架。
          每一项显示的是**该语言自己的名字**（localeMeta.label），
          因为看不懂当前语言的人正是要靠它找到自己那一行。
        */}
        <details className="nav-lang">
          <summary aria-label="Language">
            <span className="nav-lang-current">{localeMeta[lang].label}</span>
          </summary>
          <ul className="nav-lang-menu">
            {locales.map((loc) => (
              <li key={loc}>
                <a href={`/${loc}`} lang={localeMeta[loc].htmlLang}
                   aria-current={loc === lang ? "true" : undefined}>
                  {localeMeta[loc].label}
                </a>
              </li>
            ))}
          </ul>
        </details>
      </div>
    </nav>
  );
}
