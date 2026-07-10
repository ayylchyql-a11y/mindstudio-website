import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://mindstudioapps.com/sitemap.xml",
    host: "https://mindstudioapps.com",
  };
}
