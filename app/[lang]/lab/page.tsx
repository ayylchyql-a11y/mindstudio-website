import type { Metadata } from "next";
import LabIndexPage, { indexMetadata, indexStaticParams, type IndexParams } from "@/components/lab/LabIndexPage";

/** 公开的橱窗版总览。完整版在 app/[lang]/lab-unlocked/ —— 同一个组件。 */
export const generateStaticParams = indexStaticParams;

export function generateMetadata({ params }: { params: IndexParams }): Promise<Metadata> {
  return indexMetadata(params, false);
}

export default function Page({ params }: { params: IndexParams }) {
  return <LabIndexPage params={params} />;
}
