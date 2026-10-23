import{a as o}from"./chunk-ZXS5GOJR.js";import{b as n,c as r}from"./chunk-EN3SAVJI.js";var e=n(r(),1),p=({size:a=72,speed:t=1,variant:i="default",label:s="Loading",className:l,style:c,...u})=>{let d=`${2.4/t}s`,m=`${1.6/t}s`,b=`${1.2/t}s`;return(0,e.jsxs)("div",{role:"status","aria-label":s,className:o("relative inline-flex items-center justify-center text-[#FAFAFA] select-none",l),style:{width:a,height:a,...c},...u,children:[(0,e.jsx)("style",{children:`
        @keyframes easyui-orbit-cw {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes easyui-orbit-ccw {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }
        @keyframes easyui-orbit-glow-pulse {
          0%, 100% { opacity: 0.6; transform: scale(0.96); }
          50% { opacity: 1; transform: scale(1.04); }
        }
        @media (prefers-reduced-motion: reduce) {
          .easyui-orbit-spin-cw,
          .easyui-orbit-spin-ccw,
          .easyui-orbit-core-pulse { animation: none !important; }
        }
      `}),(0,e.jsx)("span",{className:"sr-only",children:s}),(0,e.jsxs)("svg",{className:"pointer-events-none absolute inset-0 h-full w-full",viewBox:"0 0 100 100",fill:"none","aria-hidden":"true",children:[(0,e.jsx)("circle",{cx:"50",cy:"50",r:"44",stroke:"#282828",strokeWidth:"1.5",strokeDasharray:"3 3"}),(0,e.jsx)("circle",{cx:"50",cy:"50",r:"30",stroke:"#333333",strokeWidth:"1.5"})]}),(0,e.jsxs)("div",{className:"easyui-orbit-spin-cw pointer-events-none absolute inset-0 flex items-center justify-center",style:{animation:`easyui-orbit-cw ${d} linear infinite`},children:[(0,e.jsx)("span",{className:"absolute -top-1 left-1/2 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.6)]"}),i!=="minimal"&&(0,e.jsx)("span",{className:"absolute -bottom-0.5 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-white/40"})]}),(0,e.jsxs)("div",{className:"easyui-orbit-spin-ccw pointer-events-none absolute inset-[18%] flex items-center justify-center",style:{animation:`easyui-orbit-ccw ${m} cubic-bezier(0.4, 0, 0.2, 1) infinite`},children:[(0,e.jsx)("span",{className:"absolute -top-1 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-zinc-300 shadow-[0_0_8px_rgba(255,255,255,0.4)]"}),i==="dense"&&(0,e.jsx)("span",{className:"absolute top-1/2 -right-1 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-zinc-400/50"})]}),(0,e.jsx)("div",{className:"easyui-orbit-core-pulse h-3 w-3 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.5)]",style:{animation:`easyui-orbit-glow-pulse ${b} ease-in-out infinite`}})]})};export{p as OrbitalLoadingRing};
