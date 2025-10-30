import Link from "next/link";
import type { ReactElement } from "react";

import { CaseStudyList } from "@/components/case-studies/case-study-list";
import { Button } from "@/components/ui/button";

export default function CaseStudiesPage(): ReactElement {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Case studies</h2>
          <p className="text-sm text-muted-foreground">Keep your most impactful stories organized in one place.</p>
        </div>
        <Button asChild size="sm">
          <Link href="/dashboard/case-studies/new">New case study</Link>
        </Button>
      </div>
      <div className="rounded-lg border border-border p-6 shadow-sm">
        <CaseStudyList />
      </div>
    </section>
  );
}
