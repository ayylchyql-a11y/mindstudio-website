import type { Metadata } from "next";
import LabEffectPage, { effectMetadata, effectStaticParams, type EffectParams } from "@/components/lab/LabEffectPage";

/** 完整版路由树（lib/lab-gate.ts）—— 见同级 [category]/page.tsx。 */
export const generateStaticParams = effectStaticParams;

export function generateMetadata({ params }: { params: EffectParams }): Promise<Metadata> {
  return effectMetadata(params, true);
}

export default function Page({ params }: { params: EffectParams }) {
  return <LabEffectPage params={params} full={true} />;
}
