import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * 详情页展示的源码 = **构建时从 `public/effects/<slug>.html` 读出来的那个文件本身**。
 *
 * 为什么不把代码抄进 `data/effects.ts`：那样同一份代码有两处真相，
 * 改了 demo 忘了改数据，页面上给出的代码就是错的 —— 而且是**页面看着正常、
 * 复制走的人拿到坏代码**这种查不出来的错。读文件让它不可能不同步。
 *
 * 只在服务端组件里调用。本站全静态导出，读取发生在构建期，运行时没有 fs 调用。
 */
export function readDemoSource(slug: string): string {
  // slug 来自 data/effects.ts 里我自己写的常量，不是路由参数，
  // 但仍然挡一下路径穿越 —— 万一以后有人把它接到动态输入上。
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`bad effect slug: ${slug}`);
  return readFileSync(join(process.cwd(), "public", "effects", `${slug}.html`), "utf8").trimEnd();
}
