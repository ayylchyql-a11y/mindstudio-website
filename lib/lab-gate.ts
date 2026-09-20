/**
 * 设计库 (/lab) 的密码门 —— 2026-09-20 起是「橱窗」模式，不再整段锁死。
 *
 * 门外（任何人、可被 Google 收录）：标题、一句话、一段介绍、一段 8 秒录屏、
 *   「想在你的网站上用这个 → /servizi」。
 * 门内（cookie 对了才有）：可交互 demo、拆解、参数、提示词、源码。
 *
 * 为什么改：09-19 整段上锁后，Search Console 里这站**唯一有曝光的板块**就是
 * /lab/web-effects（两周 93 次曝光、45 个页面），全锁等于把它从 Google 撤掉；
 * 而用户真正不想送人的是代码和提示词，不是「效果长什么样」。视频看得到拿不走。
 *
 * 实现是**两棵静态路由树 + proxy 改写**，不是按 cookie 动态渲染：
 *   · `/[lang]/lab/...`          公开的橱窗版，静态、进 sitemap
 *   · `/[lang]/lab-unlocked/...` 完整版，静态、noindex、没 cookie 直接 401
 *   带 cookie 请求 `/lab/...` 时 proxy **改写**到 `/lab-unlocked/...`（地址栏不变）。
 *   🩸不用 cookies() 动态渲染的原因：详情页要 readFileSync 读 public/effects/*.html
 *     贴源码，构建期读没问题，改成请求期读的话 Vercel 的函数包里**没有 public/**，
 *     线上会 ENOENT。两棵静态树把读取全留在构建期。
 *
 * 开关在这一处：`LAB_LOCKED` 改 false 就整个撤掉（不改写、不拦 demo、公开树直接渲染完整版）。
 * 密码优先读 Vercel 环境变量 `LAB_PASSWORD`，没设就用下面这个默认值。
 * 🩸 改密码后所有人（包括自己）要重输一次 —— cookie 里存的是密码的哈希。
 *
 * 这是「先别让人白拿」级别的门，不是安全边界：静态站、Edge 上比对一个哈希、
 * cookie 90 天。够挡住路过的人，挡不住认真的人。
 */
import { LAB_FULL_SEGMENT, OPEN_SLUGS } from "@/lib/lab-open";
export { LAB_FULL_SEGMENT };

export const LAB_LOCKED = true;
export const LAB_COOKIE = "lab_key";
const DEFAULT_PASSWORD = "07976662564";
const SALT = "mindstudio-lab-2026";

export function labPassword(): string {
  return process.env.LAB_PASSWORD || DEFAULT_PASSWORD;
}

/** 密码 → 存进 cookie 的令牌。Edge 与 Node 都有 crypto.subtle。 */
export async function labToken(password: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${password}:${SALT}`));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** `/effects/<slug>.html` 或 `/effects/<slug>/index.html` → slug；别的（js/css/图片/视频）→ null */
export function demoSlugOf(pathname: string): string | null {
  const m = /^\/effects\/([a-z0-9-]+)(?:\.html|\/index\.html)$/.exec(pathname);
  return m ? m[1] : null;
}

/** 公开树里的 /lab 路径 → 对应的完整版路径 */
export function toFullPath(pathname: string): string | null {
  const m = /^\/([a-z-]+)\/lab(\/.*)?$/.exec(pathname);
  return m ? `/${m[1]}/${LAB_FULL_SEGMENT}${m[2] ?? ""}` : null;
}

/**
 * 哪些路径在门后面：完整版路由树，和**没开放的**样板文件本身。
 * 🩸 只拦 .html，不拦 js/css/图片/视频：样板 iframe 是 sandbox 的（opaque origin），
 *    它发出的子资源请求是跨站的、SameSite=Lax 的 cookie 不会带上 —— 拦了子资源
 *    就等于把 holo-card / dashboard 这类目录型样板整个打空（页面能进、脚本 401）。
 */
export function isGatedPath(pathname: string): boolean {
  if (new RegExp(`^/[a-z-]+/${LAB_FULL_SEGMENT}(/|$)`).test(pathname)) return true;
  const slug = demoSlugOf(pathname);
  return slug !== null && !OPEN_SLUGS.includes(slug);
}
