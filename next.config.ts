import type { NextConfig } from "next";

/**
 * 2026-09-05：/lab 的分类从 5 个（motion/scroll/background/text/surface）
 * 合并成 1 个（web-effects），所有效果的地址跟着变了。
 *
 * 这些旧地址**当天刚提交给 Google Search Console**（sitemap 里 384 条），
 * 不做重定向的话它们会变成 404，在 GSC 里留下一堆抓取错误。
 * 站外目前没有任何链接指向它们，所以这批重定向的唯一目的就是收干净
 * 已经告诉过 Google 的那些地址；等 Google 重新抓完 sitemap 就可以删掉。
 */
const OLD_CATEGORIES = "motion|scroll|background|text|surface|feedback";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: `/:lang/lab/:cat(${OLD_CATEGORIES})/:slug`,
        destination: "/:lang/lab/web-effects/:slug",
        permanent: true,
      },
      {
        source: `/:lang/lab/:cat(${OLD_CATEGORIES})`,
        destination: "/:lang/lab/web-effects",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
