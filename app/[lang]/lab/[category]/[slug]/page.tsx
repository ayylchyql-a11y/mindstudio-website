import type { Metadata } from "next";
import LabEffectPage, { effectMetadata, effectStaticParams, type EffectParams } from "@/components/lab/LabEffectPage";

/** 公开的橱窗版。完整版在 app/[lang]/lab-unlocked/ —— 同一个组件，`full` 不同。 */
export const generateStaticParams = effectStaticParams;

export function generateMetadata({ params }: { params: EffectParams }): Promise<Metadata> {
  return effectMetadata(params, false);
}

export default function Page({ params }: { params: EffectParams }) {
  return <LabEffectPage params={params} full={false} />;
}
