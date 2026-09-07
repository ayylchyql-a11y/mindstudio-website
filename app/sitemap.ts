import type { MetadataRoute } from "next";
import { apps } from "@/data/apps";
import { privacy } from "@/data/legal";
import { work } from "@/data/work";
import { notes } from "@/data/notes";
import { activeCategories, effectsIn } from "@/data/effects";
import { locales, type Locale } from "@/lib/i18n";

const BASE = "https://mindstudioapps.com";

/**
 * sitemap 只列 **canonical** URL。
 *
 * 🩸 2026-09-07：之前是「每个页面 × 12 种语言」一律铺满，420 条。但 /notes、/lab
 *    的正文、以及 legal / work / mdesk 的大部分文案本来就只写了一到三种语言，
 *    其余语言页读到的是同一份英文 —— 于是 Search Console 报
 *    「重复网页，Google 选择的规范网页与用户指定的不同」（它自己挑了 /en 那份）。
 *    sitemap 里再把那些非 canonical 的 URL 推给它，等于每次抓取都重复告诉它一遍。
 *    页面本身照常可访问、导航仍是本地语言，只是不再往 sitemap 里塞。
 *
 * 加语言/加板块时：`translated` 填**真的写了原文**的语言，别图省事写 locales。
 */
const FULL = locales;                                  // 12 语言都有原文
const EN_ONLY = ["en"] as const satisfies readonly Locale[];   // 正文只有英文
const EN_ZH = ["en", "zh"] as const satisfies readonly Locale[];
const EN_ZH_IT = ["en", "zh", "it"] as const satisfies readonly Locale[];

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  const add = (
    langs: readonly Locale[],
    path: (lang: Locale) => string,
    rest: Omit<MetadataRoute.Sitemap[number], "url">
  ) => {
    for (const lang of langs) entries.push({ url: `${BASE}${path(lang)}`, ...rest });
  };

  // —— 12 语言都有真译文的页面 ——
  add(FULL, (l) => `/${l}`, { changeFrequency: "monthly", priority: 1 });
  add(FULL, (l) => `/${l}/about`, { changeFrequency: "yearly", priority: 0.4 });
  add(FULL, (l) => `/${l}/privacy`, { changeFrequency: "yearly", priority: 0.3 });
  add(FULL, (l) => `/${l}/support`, { changeFrequency: "yearly", priority: 0.4 });

  for (const app of apps) {
    add(FULL, (l) => `/${l}/apps/${app.id}`, { changeFrequency: "monthly", priority: 0.8 });
    // 隐私政策原文只有 en / zh（data/legal.ts）
    if (privacy[app.id]) {
      add(EN_ZH, (l) => `/${l}/apps/${app.id}/privacy`, {
        changeFrequency: "yearly",
        priority: 0.3,
      });
    }
  }

  // —— 案例：正文 en / zh；M Desk 另有意大利语 ——
  add(EN_ZH_IT, (l) => `/${l}/work/m-desk`, { changeFrequency: "monthly", priority: 0.9 });
  for (const item of work) {
    add(EN_ZH, (l) => `/${l}/work/${item.id}`, { changeFrequency: "monthly", priority: 0.6 });
  }

  // —— 正文只有英文的两个板块（有意为之，见 data/notes.ts 与 data/effects.ts）——
  add(EN_ONLY, () => `/en/notes`, { changeFrequency: "weekly", priority: 0.7 });
  for (const note of notes) {
    add(EN_ONLY, () => `/en/notes/${note.slug}`, {
      lastModified: new Date(`${note.date}T00:00:00Z`),
      changeFrequency: "yearly",
      priority: 0.7,
    });
  }

  add(EN_ONLY, () => `/en/lab`, { changeFrequency: "weekly", priority: 0.7 });
  for (const cat of activeCategories()) {
    add(EN_ONLY, () => `/en/lab/${cat.id}`, { changeFrequency: "weekly", priority: 0.6 });
    for (const e of effectsIn(cat.id)) {
      add(EN_ONLY, () => `/en/lab/${cat.id}/${e.slug}`, {
        lastModified: new Date(`${e.date}T00:00:00Z`),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
