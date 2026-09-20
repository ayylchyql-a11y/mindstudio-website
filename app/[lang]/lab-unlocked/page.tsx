import type { Metadata } from "next";
import LabIndexPage, { indexMetadata, indexStaticParams, type IndexParams } from "@/components/lab/LabIndexPage";

/** 完整版路由树的总览（lib/lab-gate.ts）：带 cookie 访问 /lab 会被改写到这里。noindex。 */
export const generateStaticParams = indexStaticParams;

export function generateMetadata({ params }: { params: IndexParams }): Promise<Metadata> {
  return indexMetadata(params, true);
}

export default function Page({ params }: { params: IndexParams }) {
  return <LabIndexPage params={params} />;
}
