import Link from "next/link";
import type { ReactElement } from "react";

import { CaseStudyEditorShell } from "@/components/case-studies/case-study-editor-form";
import { Button } from "@/components/ui/button";

export default function CaseStudyCreatePage(): ReactElement {
  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Create case study</h2>
          <p className="text-sm text-muted-foreground">Capture the high points first, then refine the details later.</p>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/case-studies">Back to list</Link>
        </Button>
      </div>
      <div className="rounded-lg border border-border p-6 shadow-sm">
        <CaseStudyEditorShell redirectOnCreate />
      </div>
    </section>
  );
}
