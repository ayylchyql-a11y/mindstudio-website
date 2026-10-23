"use client";import{a as u}from"./chunk-6ES4U5RP.js";import{a as r}from"./chunk-ZXS5GOJR.js";import{p as x}from"./chunk-ZRZ2UTOY.js";import{c as g,j as p}from"./chunk-ZBN3P45E.js";import"./chunk-PE22YVSH.js";import{b as m,c as l}from"./chunk-EN3SAVJI.js";var e=m(l(),1),y=`
  /* ---------------------------------------------------------------- */
  /* Layer 1 \u2014 inner sheen.  Subtle vertical gradient in the same    */
  /* hue as the button.  Defined here (not inline) so the .dark       */
  /* override reliably wins specificity.                              */
  /* ---------------------------------------------------------------- */
  [data-pro-sheen] {
    background-image: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.04) 50%,
      rgba(255, 255, 255, 0) 100%
    );
  }
  .dark [data-pro-sheen] {
    background-image: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.5) 50%,
      rgba(255, 255, 255, 0) 100%
    );
  }

  /* ---------------------------------------------------------------- */
  /* Layer 2 \u2014 one-pass shimmer (hover only).                         */
  /* Single bright white beam crossing the button on hover, same     */
  /* vocabulary as the existing Button.tsx "gradient" variant.       */
  /* ---------------------------------------------------------------- */
  [data-pro-shimmer] {
    background-image: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.45) 50%,
      transparent 100%
    );
  }
  .dark [data-pro-shimmer] {
    background-image: linear-gradient(
      90deg,
      transparent 0%,
      rgba(255, 255, 255, 0.7) 50%,
      transparent 100%
    );
  }

  /* ---------------------------------------------------------------- */
  /* Keyframes                                                        */
  /* ---------------------------------------------------------------- */
  @keyframes easyui-pro-shimmer {
    0%   { transform: translateX(-110%); }
    100% { transform: translateX(110%); }
  }

  /* ---------------------------------------------------------------- */
  /* Hover: only the shimmer beam animates.  The inner sheen is       */
  /* always-on, so the "polished metal" surface reads at rest too.    */
  /* ---------------------------------------------------------------- */
  .group\\/cta:hover [data-pro-shimmer] {
    animation: easyui-pro-shimmer 1600ms ease-out forwards;
    opacity: 1;
  }

  /* ---------------------------------------------------------------- */
  /* Reduced motion: disable all motion but keep the static sheen.    */
  /* ---------------------------------------------------------------- */
  @media (prefers-reduced-motion: reduce) {
    @keyframes easyui-pro-shimmer {
      0%, 100% { transform: translateX(-110%); opacity: 0; }
    }
    [data-pro-shimmer] {
      animation: none !important;
      opacity: 0 !important;
    }
  }
`,F={name:"Free",tagline:"For personal & open-source projects",price:"$0",cadence:"Forever",features:["All components","Copy & paste","React + Tailwind","MIT licensed"],ctaLabel:"Get started"},w={name:"Pro",tagline:"For production teams",price:"$129",cadence:"One-time payment",features:["Everything in Free","Premium components","Advanced animations","Future updates"],ctaLabel:"Get Pro"},E="rounded-2xl",N="shadow-[0_0.5px_1px_rgba(0,0,0,0.05),0_1px_3px_rgba(0,0,0,0.08)]",P="dark:shadow-[0_0.5px_1px_rgba(0,0,0,0.4),0_1px_3px_rgba(0,0,0,0.5)]",R="shadow-[0_1px_2px_rgba(15,15,20,0.06),0_8px_24px_-12px_rgba(15,15,20,0.18)]",T="dark:shadow-[0_1px_2px_rgba(0,0,0,0.4),0_12px_28px_-12px_rgba(0,0,0,0.6)]",D=r("group relative flex flex-col w-full min-w-0",E,"border bg-surface","p-6 sm:p-8 md:p-10","transition-[border-color,background-color,box-shadow] duration-300 ease-out","focus-within:ring-2 focus-within:ring-[var(--indicator-active)]/40 focus-within:ring-offset-2 focus-within:ring-offset-bg"),L=r("border-border text-text-primary",N,P,"hover:border-border-hover"),C=r("border-[#D4D4D8] bg-white","text-[#0A0A0A]","dark:border-[#2A2A2A] dark:bg-[#141414] dark:text-[#FAFAFA]",R,T,"hover:border-[#A1A1AA]","dark:hover:border-[#3F3F46]"),I="text-4xl sm:text-5xl font-semibold tracking-[-0.035em] text-text-primary dark:text-white",S="text-xs sm:text-sm text-text-muted";function M(t){return typeof t=="string"?{label:t}:t}function b({tier:t,featured:a,reduceMotion:i,className:c}){return(0,e.jsxs)(g.div,{initial:i?!1:{opacity:0,y:8},animate:{opacity:1,y:0},transition:{...u.springSmooth,delay:a?.05:0},className:r(D,a?C:L,c),children:[(0,e.jsxs)("div",{className:"flex flex-col gap-1.5",children:[(0,e.jsx)("div",{className:"flex items-center gap-2",children:(0,e.jsx)("h3",{className:"text-base font-medium text-text-primary dark:text-white",children:t.name})}),t.tagline&&(0,e.jsx)("p",{className:"text-xs sm:text-sm text-text-muted leading-relaxed",children:t.tagline})]}),(0,e.jsxs)("div",{className:"mt-6 sm:mt-8 flex items-baseline gap-2 flex-wrap",children:[(0,e.jsx)("span",{className:I,children:t.price}),(0,e.jsx)("span",{className:S,children:t.cadence})]}),(0,e.jsx)("div",{"aria-hidden":"true",className:r("mt-6 sm:mt-8 h-px w-full","bg-[#EDEDEF] dark:bg-[#1F1F1F]")}),(0,e.jsx)("ul",{className:"mt-5 sm:mt-6 flex flex-col gap-3 sm:gap-3.5 flex-1",children:t.features.map((n,o)=>{let s=M(n);return(0,e.jsxs)("li",{className:"flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm text-text-secondary dark:text-text-secondary",children:[(0,e.jsx)(x,{"aria-hidden":"true",className:r("mt-0.5 h-4 w-4 shrink-0",a?"text-[#0A0A0A] dark:text-white":"text-text-secondary"),strokeWidth:2.25}),(0,e.jsx)("span",{className:"leading-relaxed",children:s.label})]},`${t.name}-${o}`)})}),(0,e.jsxs)("button",{type:"button",onClick:t.onCtaClick,className:r("group/cta relative mt-8 sm:mt-10 inline-flex h-11 w-full items-center justify-center overflow-hidden","rounded-lg px-5 text-sm font-medium select-none","transition-transform duration-200","focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--indicator-active)]/50 focus-visible:ring-offset-2 focus-visible:ring-offset-bg","active:scale-[0.98]","hover:scale-[1.015]",a?"bg-[#0E0E0E] text-white border border-[#1F1F1F] hover:border-[#3F3F46] hover:bg-[#141414] dark:bg-white dark:text-[#0A0A0A] dark:border-[#E4E4E7] dark:hover:border-[#A1A1AA] dark:hover:bg-[#FAFAFA]":"bg-transparent text-text-primary border border-border hover:bg-surface-hover hover:border-border-hover dark:text-white dark:border-[#1F1F1F] dark:hover:bg-[#1A1A1A] dark:hover:border-[#4A4A4A]"),children:[a&&(0,e.jsxs)(e.Fragment,{children:[(0,e.jsx)("span",{"aria-hidden":"true","data-pro-sheen":!0,className:"pointer-events-none absolute inset-0 rounded-[inherit]"}),(0,e.jsx)("span",{"aria-hidden":"true","data-pro-shimmer":!0,className:r("pointer-events-none absolute inset-0 rounded-[inherit] opacity-0","motion-reduce:group-hover/cta:animate-none motion-reduce:group-hover/cta:opacity-0")})]}),(0,e.jsx)("span",{className:"relative z-10",children:t.ctaLabel})]})]})}var O=({freeTier:t=F,proTier:a=w,reverse:i=!1,columns:c="auto",eyebrow:n,heading:o,subheading:s,className:h,...f})=>{let d=p(),v=i?a:t,A=i?t:a,_=i,k=!i;return(0,e.jsxs)("section",{"aria-label":"Pricing",className:r("w-full",h),...f,children:[(0,e.jsx)("style",{dangerouslySetInnerHTML:{__html:y}}),(n||o||s)&&(0,e.jsxs)("div",{className:"mx-auto mb-8 sm:mb-12 max-w-2xl text-center",children:[n&&(0,e.jsx)("p",{className:"mb-3 text-xs font-medium uppercase tracking-[0.18em] text-text-muted",children:n}),o&&(0,e.jsx)("h2",{className:"text-2xl sm:text-3xl font-semibold tracking-[-0.035em] text-text-primary dark:text-white",children:o}),s&&(0,e.jsx)("p",{className:"mt-3 text-sm sm:text-base text-text-secondary leading-relaxed",children:s})]}),(0,e.jsxs)("div",{className:r("mx-auto grid w-full max-w-4xl min-w-0 gap-5 sm:gap-6 md:gap-8 items-stretch",c===2?"grid-cols-2":c===1?"grid-cols-1":"grid-cols-1 md:grid-cols-2"),children:[(0,e.jsx)(b,{tier:v,featured:_,reduceMotion:!!d}),(0,e.jsx)(b,{tier:A,featured:k,reduceMotion:!!d})]})]})},G=O;export{O as Pricing,G as default};
