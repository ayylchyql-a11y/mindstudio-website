import type { MetadataRoute } from "next";
import { LAB_LOCKED } from "@/lib/lab-gate";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", ...(LAB_LOCKED ? { disallow: ["/*/lab", "/effects/"] } : {}) },
    sitemap: "https://mindstudioapps.com/sitemap.xml",
    host: "https://mindstudioapps.com",
  };
}
