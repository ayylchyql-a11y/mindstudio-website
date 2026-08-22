import type { MetadataRoute } from "next";
import { apps } from "@/data/apps";
import { privacy } from "@/data/legal";
import { work } from "@/data/work";
import { notes } from "@/data/notes";
import { locales } from "@/lib/i18n";

const BASE = "https://mindstudioapps.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const lang of locales) {
    entries.push({ url: `${BASE}/${lang}`, changeFrequency: "monthly", priority: 1 });
    entries.push({ url: `${BASE}/${lang}/privacy`, changeFrequency: "yearly", priority: 0.3 });
    entries.push({ url: `${BASE}/${lang}/support`, changeFrequency: "yearly", priority: 0.4 });
    entries.push({ url: `${BASE}/${lang}/notes`, changeFrequency: "weekly", priority: 0.7 });

    for (const note of notes) {
      entries.push({
        url: `${BASE}/${lang}/notes/${note.slug}`,
        lastModified: new Date(`${note.date}T00:00:00Z`),
        changeFrequency: "yearly",
        priority: 0.7,
      });
    }

    for (const item of work) {
      entries.push({
        url: `${BASE}/${lang}/work/${item.id}`,
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }

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
