/**
 * 设计库 (/lab) 的密码门。用户 2026-09-19 决定暂不公开。
 *
 * 开关在这一处：`LAB_LOCKED` 改 false 就整个撤掉（proxy 放行、sitemap 恢复）。
 * 密码优先读 Vercel 环境变量 `LAB_PASSWORD`，没设就用下面这个默认值。
 * 🩸 改密码后所有人（包括自己）要重输一次 —— cookie 里存的是密码的哈希。
 *
 * 这是「先别让人白拿」级别的门，不是安全边界：静态站、Edge 上比对一个哈希、
 * cookie 90 天。够挡住路过的人，挡不住认真的人。
 */
export const LAB_LOCKED = true;
export const LAB_COOKIE = "lab_key";
const DEFAULT_PASSWORD = "mindstudio";
const SALT = "mindstudio-lab-2026";

export function labPassword(): string {
  return process.env.LAB_PASSWORD || DEFAULT_PASSWORD;
}

/** 密码 → 存进 cookie 的令牌。Edge 与 Node 都有 crypto.subtle。 */
export async function labToken(password: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${password}:${SALT}`));
  return Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");
}

/** 哪些路径在门后面：各语言的 /lab 及其子页，和样板文件本身 /effects/*。 */
export function isLabPath(pathname: string): boolean {
  return /^\/[a-z-]+\/lab(\/|$)/.test(pathname) || pathname.startsWith("/effects/");
}
