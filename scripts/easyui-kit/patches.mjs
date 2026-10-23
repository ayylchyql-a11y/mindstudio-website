// 打包时对原版源码做的最小改动（scratchpad/easyui 本身保持干净，随时能 git pull 上游）。
// 只换第三方商标：作品站上不展示别家公司的标志。效果、动画、配色都不动。
// 每条 from 必须能在源码里精确找到，找不到就构建失败 —— 免得上游改了之后补丁悄悄失效。
export const PATCHES = {
  'src/components/ui/WalletBalance.tsx': [
    [`      stripe\n`, `      lumen\n`],
    [`        <path fill="currentColor" d="M12.2 0 5 8.4h4.6L6.7 15.6 17 4.2h-5.1L14.4 0z" />`,
     `        <path fill="currentColor" d="M2 14C2 6 7 1.5 15 1.5 15 9.5 10 14 2 14Zm0 0 7-7" />`],
    [`        wise\n`, `        fernway\n`],
    [`      <span className="text-[#253b80]">Pay</span>\n      <span className="text-[#179bd7]">Pal</span>`,
     `      <span className="text-[#2b3a55]">harbor</span>`],
    [`{ id: "stripe", name: "Stripe",`, `{ id: "lumen", name: "Lumen",`],
    [`{ id: "wise", name: "Wise",`, `{ id: "fernway", name: "Fernway",`],
    [`{ id: "paypal", name: "PayPal",`, `{ id: "harbor", name: "Harbor",`],
  ],
  'src/components/docs/detail/demos/car-smoke-page-transition.demo.tsx': [
    [`'Click to trigger Ferrari drift & smoke transition'`, `'Click to trigger supercar drift & smoke transition'`],
  ],
  'src/components/ui/CarSmokePageTransition.tsx': [
    [`aria-label="Trigger Ferrari drift page transition"`, `aria-label="Trigger supercar drift page transition"`],
  ],
};
