import type { MetadataRoute } from "next";
import { apps } from "@/data/apps";
import { privacy } from "@/data/legal";
import { locales } from "@/lib/i18n";

const BASE = "https://mindstudioapps.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const lang of locales) {
    entries.push({ url: `${BASE}/${lang}`, changeFrequency: "monthly", priority: 1 });
    entries.push({ url: `${BASE}/${lang}/privacy`, changeFrequency: "yearly", priority: 0.3 });
    entries.push({ url: `${BASE}/${lang}/support`, changeFrequency: "yearly", priority: 0.4 });

    for (const app of apps) {
      entries.push({
        url: `${BASE}/${lang}/apps/${app.id}`,
        changeFrequency: "monthly",
        priority: 0.8,
      });
      if (privacy[app.id]) {
        entries.push({
          url: `${BASE}/${lang}/apps/${app.id}/privacy`,
          changeFrequency: "yearly",
          priority: 0.3,
        });
      }
    }
  }

  return entries;
}
