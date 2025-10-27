import type { ReactElement } from "react";

import { CaseStudyDetail } from "@/components/case-studies/case-study-detail";

export default async function CaseStudyDetailPage({
  params,
}: {
  params: Promise<{ caseStudyId: string }>;
}): Promise<ReactElement> {
  const { caseStudyId } = await params;
  return <CaseStudyDetail id={caseStudyId} />;
}
