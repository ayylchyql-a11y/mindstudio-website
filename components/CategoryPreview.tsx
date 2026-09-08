"use client";

import { useEffect, useRef, useState } from "react";
import { labCopy } from "@/data/effects";
import { pick, type Locale } from "@/lib/i18n";

export interface PreviewSlide {
  slug: string;
  title: string;
  accent: string;
  src: string;
  /** 见 Effect.plays。决定顺序（self 排最前）和底栏那个提示 */
  plays: "self" | "hover" | "scroll";
  /**
   * 有海报 = 这条太重，轮播里只放静态图。
   * 🩸轮播是一进 /lab 就自动播的：不给海报就等于让每个访客
   *   先下载几 MB 才看到第一屏，而他可能根本没打算点进这个模块。
   */
  poster?: string;
  /** 这条效果自己的详情页地址。海报是静态图 → 整张可点；活的 demo 不给链接（会吞掉交互）。 */
  href: string;
}

const AUTO_MS = 8000;

/**
 * 总览页每张模块卡里那个轮播预览。
 *
 * 为什么是这里、而不是分类页：分类页是**查阅**（扫一遍找到我要的那条），
 * 轮播一次只给一条，等于逼人点十几次才知道库里有什么。总览页反过来 ——
 * 人还没决定进不进，需要的是「这个模块里大概是什么东西」，
 * 而那件事四个标题说不清楚，一个在动的样板一眼就说清了。
 *
 * 🩸 **只有一个 iframe，轮播是换它的 src，不是挂/卸十几个**。
 *    EffectFrame 那条铁律（iframe 必须出现在服务端 HTML 里，别用
 *    IntersectionObserver 去挂它，否则先是几秒灰盒子、JS 没跑就是永久灰盒子）
 *    在这里同样成立：第一条是 SSR 出来的，浏览器解析到就能开始取。
 *    IntersectionObserver 在这个组件里**只用来停计时器**，一行都不碰挂载。
 *
 * 🩸 换页用 `key` 重新挂载而不是改 `src` 属性：改 src 会往浏览器历史里塞记录，
 *    用户按「后退」得按十几次才退得出这个页面。
 */
export default function CategoryPreview({
  slides,
  lang,
  height = 260,
}: {
  slides: PreviewSlide[];
  lang: Locale;
  height?: number;
}) {
  const [i, setI] = useState(0);
  /** 用户自己点过 = 从此不再自动轮播。WCAG 2.2.2：超过 5 秒的自动轮播必须给得出停的办法 */
  const [taken, setTaken] = useState(false);
  const [paused, setPaused] = useState(false);
  const [inView, setInView] = useState(true);
  const box = useRef<HTMLDivElement>(null);

  // 只有滚到视口里的那张卡才在轮播。屏外的卡继续转是白烧电，
  // 而且用户回来时看到的是转了一半的随机一条，不如停在他离开时那条。
  useEffect(() => {
    const el = box.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { rootMargin: "80px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (slides.length < 2 || taken || paused || !inView) return;
    if (typeof window !== "undefined"
        && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setTimeout(() => setI((n) => (n + 1) % slides.length), AUTO_MS);
    return () => clearTimeout(t);
  }, [i, slides.length, taken, paused, inView]);

  const cur = slides[i] ?? slides[0];
  if (!cur) return null;
  /**
   * 🩸 这个库 14 条里只有 3 条一加载就自己演，8 条要滚、3 条要指针 ——
   *    也就是说轮播里**大多数格是静止画面**。不说破的话看着像效果坏了。
   *    标出来之后它就成了信息：这条要你做点什么才看得到。
   */
  const hint = cur.poster ? pick(labCopy.openToPlay, lang)
             : cur.plays === "hover" ? pick(labCopy.needsHover, lang)
             : cur.plays === "scroll" ? pick(labCopy.needsScroll, lang)
             : null;

  return (
    <div
      className="cat-preview"
      ref={box}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="cat-preview-frame" style={{ height }}>
        {/* 占位层压在 iframe 下面，不靠 JS 移除：demo 都有不透明背景，画出来自然盖住。
            换页那一瞬间它兜住，所以看不到白闪。 */}
        <div
          className="cat-preview-poster"
          aria-hidden="true"
          style={{ background: `radial-gradient(120% 120% at 30% 0%, ${cur.accent}26, transparent 70%)` }}
        />
        {cur.poster ? (
          /* 🩸海报必须整张可点：底栏写着「点开可玩」，而静态图点了没反应 = 文案在撒谎。
             活的 demo 反过来**不能**套链接 —— 一套上，拖拽/悬停就全被链接吞了。 */
          <a className="cat-preview-link" href={cur.href} aria-label={cur.title}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={cur.slug}
              className="cat-preview-poster-img"
              src={cur.poster}
              alt={cur.title}
              loading="lazy"
              decoding="async"
              style={{ height }}
            />
          </a>
        ) : (
          <iframe
            key={cur.slug}
            src={cur.src}
            title={cur.title}
            loading="lazy"
            /* allow-scripts 是必须的（demo 带 JS）；不给 allow-same-origin，
               所以 demo 拿不到本站的 storage / cookie。两个一起给等于没有沙箱。 */
            sandbox="allow-scripts"
            style={{ height }}
          />
        )}
      </div>

      {/* 🩸底栏原来只在「不止一条」时才出现。分类里只有一件作品时（creative 现在就是），
          它整条不渲染 —— 于是海报既没有标题也没有「点开可玩」，
          看上去就是一张贴在那儿的静态图，没人知道它是活的。
          判据改成「有多条 或 有提示要说」。 */}
      {(slides.length > 1 || hint) && (
        <div className="cat-preview-bar">
          <span className="cat-preview-name">
            {cur.title}
            {hint && <em className="cat-preview-hint">{hint}</em>}
          </span>
          {slides.length > 1 && (
          <span className="cat-preview-dots" role="tablist" aria-label={pick(labCopy.previewOf, lang)}>
            {slides.map((s, n) => (
              <button
                key={s.slug}
                type="button"
                role="tab"
                aria-selected={n === i}
                aria-label={`${pick(labCopy.goToSlide, lang)} ${s.title}`}
                className={n === i ? "on" : undefined}
                onClick={() => { setI(n); setTaken(true); }}
              />
            ))}
          </span>
          )}
        </div>
      )}
    </div>
  );
}
