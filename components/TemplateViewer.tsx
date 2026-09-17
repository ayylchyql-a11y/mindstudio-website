"use client";

import { useState } from "react";

export interface ViewerDesign {
  id: string;
  /** 这套设计的品牌名（Kumo Ramen / Kado Ramen …） */
  brand: string;
  /** 设计风格名（原版 / 编辑杂志 …），已按语言取好 */
  style: string;
  /** 一句话说这个风格长什么样 */
  gist: string;
  src: string;
  poster: string;
}

/**
 * 一套模版的四种设计：上面一条缩略图 tab，下面一个在跑的整站 iframe。
 *
 * 跟 /lab 的 EffectFrame 同一条铁律：**iframe 写在服务端 HTML 里**，不靠 JS 插；
 * 第一种设计没有 JS 也能看、能滚。切 tab 才需要 JS —— 那是增强。
 *
 * 换 src 而不是四个 iframe 一起挂：一页就是一个完整网站（hero 图 + 字体），
 * 四个同时加载是四倍流量，而人一次只看一个。换 src 时用 key 重挂，
 * 免得上一个页面的滚动位置留到下一个。
 *
 * 沙箱：allow-scripts 跑模版自带的 JS；allow-forms 让预约/报价表单能提交
 * （它们都是 preventDefault + toast，没有 allow-forms 连 submit 事件都不发）；
 * allow-top-navigation-by-user-activation 让模版里「← Tutti gli stili」那条
 * 回链能从框里跳出来回到这一页（只在用户点击时允许，页面自己跳不了）。
 * 不给 allow-same-origin，所以模版拿不到本站的 storage / cookie。
 */
export default function TemplateViewer({
  designs,
  openLabel,
  height = 720,
}: {
  designs: ViewerDesign[];
  openLabel: string;
  height?: number;
}) {
  const [idx, setIdx] = useState(0);
  const cur = designs[idx] ?? designs[0];

  return (
    <div className="tpl-viewer">
      {designs.length > 1 ? (
        <div className="tpl-tabs" role="tablist">
          {designs.map((d, i) => (
            <button
              key={d.id}
              type="button"
              role="tab"
              aria-selected={i === idx}
              className={i === idx ? "tpl-tab on" : "tpl-tab"}
              onClick={() => setIdx(i)}
            >
              {/* 缩略图是 1200×750 的静态海报，四张一起也才 400KB；
                  真正的页面只在选中时才加载。 */}
              <img src={d.poster} alt="" width={1200} height={750} loading="lazy" decoding="async" />
              <span className="tpl-tab-style">{d.style}</span>
              <span className="tpl-tab-brand">{d.brand}</span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="tpl-frame" style={{ height }}>
        <iframe
          key={cur.id}
          src={cur.src}
          title={cur.brand}
          loading="lazy"
          sandbox="allow-scripts allow-forms allow-top-navigation-by-user-activation"
          style={{ height }}
        />
        <a className="tpl-open" href={cur.src} target="_blank" rel="noopener">
          {openLabel} ↗
        </a>
      </div>

      <p className="tpl-gist">
        <b>{cur.style}</b> · {cur.gist}
      </p>
    </div>
  );
}
