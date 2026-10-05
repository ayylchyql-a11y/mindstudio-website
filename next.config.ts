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

/**
 * 2026-10-05：「交互细节 · 图表控件」(chart-widgets) 和「Dashboard 特效细节」
 * (dashboard-details) 并进了 widgets（界面组件）。这两批地址 09-19 / 09-30 起就在
 * sitemap 里、公开页可索引，所以必须永久跳转，效果的 slug 都没变。
 */
const MERGED_INTO_WIDGETS = "chart-widgets|dashboard-details";

const nextConfig: NextConfig = {
  /**
   * 🩸 /lab 的样板跑在 `sandbox="allow-scripts"` 的 iframe 里，**故意不给
   * `allow-same-origin`**（两个一起给等于没有沙箱）。代价是这个文档的来源是
   * `null`，而对 null 来源来说**连同源资源都算跨源**：
   *   · `<script type="module">` 按 CORS 语义取 → 被拦
   *   · 运行时 `fetch('./card-config.json')` → 被拦
   *   · three 加载贴图 / GLB → 被拦
   * 前 14 条效果全是内联脚本的单文件，所以一直没碰到；holo-card 是第一个
   * 带外部脚本和运行时资源的作品，一上去就整个白屏（控制台是 CORS 报错，
   * 不是 404，很容易看成"文件没传上去"）。
   * 这些文件本来就是公开静态资源，放开读取不损失任何东西。
   */
  async headers() {
    return [
      {
        source: "/effects/:path*",
        headers: [{ key: "Access-Control-Allow-Origin", value: "*" }],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: `/:lang/:tree(lab|lab-unlocked)/:cat(${MERGED_INTO_WIDGETS})/:slug`,
        destination: "/:lang/:tree/widgets/:slug",
        permanent: true,
      },
      {
        source: `/:lang/:tree(lab|lab-unlocked)/:cat(${MERGED_INTO_WIDGETS})`,
        destination: "/:lang/:tree/widgets",
        permanent: true,
      },
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
