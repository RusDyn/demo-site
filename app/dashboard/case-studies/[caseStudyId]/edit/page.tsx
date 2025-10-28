import Link from "next/link";
import type { ReactElement } from "react";

import { CaseStudyEditorShell } from "@/components/case-studies/case-study-editor-form";

export default async function CaseStudyEditPage({
  params,
}: {
  params: Promise<{ caseStudyId: string }>;
}): Promise<ReactElement> {
  const { caseStudyId } = await params;
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Edit case study</h2>
          <p className="text-sm text-muted-foreground">Update narrative, media, and metadata before publishing.</p>
        </div>
        <Link
          href={`/dashboard/case-studies/${caseStudyId}`}
          className="inline-flex items-center rounded-md border border-input px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          View details
        </Link>
      </div>
      <div className="rounded-lg border border-border p-6 shadow-sm">
        <CaseStudyEditorShell caseStudyId={caseStudyId} />
      </div>
    </section>
  );
}
