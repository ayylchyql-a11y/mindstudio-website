import MsLogo from "./MsLogo";
import { apps } from "@/data/apps";
import { labCopy } from "@/data/effects";
import type { Locale } from "@/lib/i18n";
import { getDictionary, locales, localeMeta, pick } from "@/lib/i18n";

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
          {/*
            导航上一半是产品（锚点跳到首页分区），一半是栏目（独立页面）。
            两者混在一排会读成「又一个 app」，所以中间放一道细分隔线。
            分隔线是 aria-hidden 的纯装饰 —— 屏幕阅读器听到的仍是一串链接。
          */}
          <span className="nav-sep" aria-hidden="true" />
          <a className="nav-section" href={`/${lang}/lab`}>
            {pick(labCopy.navLabel, lang)}
          </a>
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
