import type { Metadata } from "next";
import LabCategoryPage, { categoryMetadata, categoryStaticParams, type CategoryParams } from "@/components/lab/LabCategoryPage";

/** 公开的橱窗版。完整版在 app/[lang]/lab-unlocked/ —— 同一个组件，`full` 不同。 */
export const generateStaticParams = categoryStaticParams;

export function generateMetadata({ params }: { params: CategoryParams }): Promise<Metadata> {
  return categoryMetadata(params, false);
}

export default function Page({ params }: { params: CategoryParams }) {
  return <LabCategoryPage params={params} full={false} />;
}
