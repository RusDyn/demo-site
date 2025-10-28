import Link from "next/link";
import type { ReactElement } from "react";

import { CaseStudyEditorShell } from "@/components/case-studies/case-study-editor-form";

export default function CaseStudyCreatePage(): ReactElement {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Create case study</h2>
          <p className="text-sm text-muted-foreground">Capture the high points first, then refine the details later.</p>
        </div>
        <Link
          href="/dashboard/case-studies"
          className="inline-flex items-center rounded-md border border-input px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          Back to list
        </Link>
      </div>
      <div className="rounded-lg border border-border p-6 shadow-sm">
        <CaseStudyEditorShell redirectOnCreate />
      </div>
    </section>
  );
}
