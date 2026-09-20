import type { MetadataRoute } from "next";
import { LAB_FULL_SEGMENT } from "@/lib/lab-open";

export default function robots(): MetadataRoute.Robots {
  return {
    // 设计库公开页（/*/lab）可抓；完整版树和样板文件本身不让抓 —— 样板是 iframe 里的
    // 半成品页面，被单独收录只会出现在搜索结果里像个坏页面。
    rules: { userAgent: "*", allow: "/", disallow: [`/*/${LAB_FULL_SEGMENT}`, "/effects/"] },
    sitemap: "https://mindstudioapps.com/sitemap.xml",
    host: "https://mindstudioapps.com",
  };
}
