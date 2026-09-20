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

/** 完整版那棵路由树的路径段（`/[lang]/lab-unlocked/...`）。公开树是 `lab`。 */
export const LAB_FULL_SEGMENT = "lab-unlocked";
