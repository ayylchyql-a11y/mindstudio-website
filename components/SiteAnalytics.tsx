"use client";

import { Analytics, type BeforeSendEvent } from "@vercel/analytics/next";

/**
 * Vercel Web Analytics + 站主自己不计数。
 *
 * 2026-09-26 查访问量时发现：21 天 704 次浏览里 67% 是 /zh 简体页——
 * 基本都是站主本人和线上验收时的自动化浏览器，外部流量被淹掉了。
 * Vercel 的访客 ID 每天换，事后没法把自己剔出来，只能在发送前拦。
 *
 * 用法：在想屏蔽的浏览器里打开任意一页并带上 `?va=off`
 * （例如 https://mindstudioapps.com/zh?va=off），这台浏览器以后就不再上报；
 * `?va=on` 恢复。每个浏览器、每台设备各设一次（记在 localStorage 里）。
 *
 * 🩸 为什么要单独一个客户端组件：beforeSend 是函数，
 *    服务端组件（[lang]/layout.tsx）不能把函数当 prop 传给客户端组件。
 */
const KEY = "ms-no-analytics";

function optedOut(): boolean {
  try {
    const flag = new URLSearchParams(window.location.search).get("va");
    if (flag === "off") localStorage.setItem(KEY, "1");
    if (flag === "on") localStorage.removeItem(KEY);
    return localStorage.getItem(KEY) === "1";
  } catch {
    // 隐私模式 / 禁用存储：照常计数，宁可多算不要把真实访客丢掉
    return false;
  }
}

function beforeSend(event: BeforeSendEvent): BeforeSendEvent | null {
  if (optedOut()) return null;
  // 带 ?va=on 回来的那一次照常上报，但别让开关参数混进页面统计
  return { ...event, url: event.url.replace(/([?&])va=(on|off)(&|$)/, (_, a, __, b) => (b ? a : "")) };
}

export default function SiteAnalytics() {
  return <Analytics beforeSend={beforeSend} />;
}
