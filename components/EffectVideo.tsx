"use client";

import { useEffect, useRef } from "react";

/**
 * 一条效果的「橱窗」录屏（public/lab-video/<slug>.mp4，scripts/record-lab-videos.mjs 录的）。
 * 公开页用它代替 EffectFrame 的 iframe：看得到效果、拿不到代码。
 *
 * 只有进了视口才装 src、才播；出了视口就停。分类页一页二三十条，
 * 全都 autoplay 等于一进页面就拉几十个 mp4。
 * 服务端渲染出来的是带 poster 的 <video>，JS 没跑也不是空盒子。
 *
 * 🩸 `muted` 必须以属性形式出现在 SSR 标记里（React 的 muted prop 只设 DOM 属性、
 *    不写 attribute），否则 Safari 认为它有声、拒绝自动播放。所以下面用 ref 再设一次。
 */
export default function EffectVideo({
  src,
  poster,
  height,
  title,
  accent,
}: {
  src: string;
  poster: string;
  height: number;
  title: string;
  accent: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true;
    v.defaultMuted = true;
    const still = typeof window !== "undefined"
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) return; // 减弱动效：留在海报上，想看就点原生控件
    if (typeof IntersectionObserver === "undefined") {
      v.src = src;
      void v.play().catch(() => {});
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!v.src) v.src = src;
          void v.play().catch(() => {});
        } else if (!v.paused) {
          v.pause();
        }
      },
      { rootMargin: "120px" },
    );
    io.observe(v);
    return () => io.disconnect();
  }, [src]);

  return (
    <div className="fx-frame fx-frame-video" style={{ height }}>
      <div
        className="fx-poster"
        aria-hidden="true"
        style={{ background: `radial-gradient(120% 120% at 30% 0%, ${accent}1f, transparent 70%)` }}
      />
      <video
        ref={ref}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-label={title}
        style={{ height }}
      />
    </div>
  );
}
