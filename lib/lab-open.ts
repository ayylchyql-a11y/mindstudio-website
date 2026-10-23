/**
 * 设计库里**完整公开**的那几条 —— demo 可碰、代码提示词都给。
 * 挑的是网上本来就到处有的基础效果：来的人能玩到一个，页面不显得全是锁。
 * 加减就改这个数组；data/effects.ts 的 isOpen() 和 proxy（经 lib/lab-gate.ts）都读它。
 *
 * 🩸 单独一个文件、不放进 lab-gate.ts：data/effects.ts 会被客户端组件引用，
 *    它 import 什么，什么就进浏览器的 JS 包 —— lab-gate.ts 里有默认密码，不能进去。
 */
export const OPEN_SLUGS: readonly string[] = [
  "magnetic-button",
  "shimmer-headline",
  "staggered-character-reveal",
  "aurora-drift",
];

/**
 * 橱窗开不开。
 *   · true  = 橱窗模式（09-20 起）：/xx/lab 公开页人人能看（标题+介绍+8 秒录屏），进 sitemap；
 *             OPEN_SLUGS 那几条完整公开。
 *   · false = 整个封闭（2026-10-23 用户定「不开放给外人」）：/xx/lab 全部页面、所有样板 .html、
 *             /lab-video/ 录屏都要密码；sitemap 不列、robots 禁抓；OPEN_SLUGS 不生效。
 * 想重新开橱窗就改回 true（录屏、介绍、两棵路由树都还在）。
 */
export const LAB_SHOWCASE = false;

/** 完整版那棵路由树的路径段（`/[lang]/lab-unlocked/...`）。公开树是 `lab`。 */
export const LAB_FULL_SEGMENT = "lab-unlocked";
