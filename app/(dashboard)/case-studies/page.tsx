import Link from "next/link";
import type { ReactElement } from "react";

import { CaseStudyList } from "@/components/case-studies/case-study-list";

export default function CaseStudiesPage(): ReactElement {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Case studies</h2>
          <p className="text-sm text-muted-foreground">Keep your most impactful stories organized in one place.</p>
        </div>
        <Link
          href="/case-studies/new"
          className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          New case study
        </Link>
      </div>
      <div className="rounded-lg border border-border p-6 shadow-sm">
        <CaseStudyList />
      </div>
    </section>
  );
}
