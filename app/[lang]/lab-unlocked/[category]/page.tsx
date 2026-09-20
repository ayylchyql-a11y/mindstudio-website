import type { Metadata } from "next";
import LabCategoryPage, { categoryMetadata, categoryStaticParams, type CategoryParams } from "@/components/lab/LabCategoryPage";

/**
 * 完整版路由树（lib/lab-gate.ts）：没 cookie 在 proxy 就 401；带 cookie 访问 /lab/... 会被改写到这里。
 * noindex，canonical 指公开地址。
 */
export const generateStaticParams = categoryStaticParams;

export function generateMetadata({ params }: { params: CategoryParams }): Promise<Metadata> {
  return categoryMetadata(params, true);
}

export default function Page({ params }: { params: CategoryParams }) {
  return <LabCategoryPage params={params} full={true} />;
}
