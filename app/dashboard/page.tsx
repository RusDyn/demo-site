import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";

import { CaseStudyEditorShell } from "@/components/case-studies/case-study-editor-form";
import { CaseStudyList } from "@/components/case-studies/case-study-list";
import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export default async function DashboardPage(): Promise<ReactElement> {
  const session = await auth();

  if (!session?.user) {
    redirect("/");
  }

  return (
    <section className="space-y-10">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Welcome back</h2>
        <p className="text-sm text-muted-foreground">
          Keep tabs on the stories that power your portfolio and spin up new ones without leaving this view.
        </p>
      </div>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-medium text-foreground">Recent case studies</h3>
              <p className="text-sm text-muted-foreground">Jump into an existing case study to continue editing.</p>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link href="/dashboard/case-studies">Manage all</Link>
            </Button>
          </div>
          <div className="rounded-lg border border-border p-6 shadow-sm">
            <CaseStudyList />
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-1">
            <h3 className="text-lg font-medium text-foreground">Start something new</h3>
            <p className="text-sm text-muted-foreground">Draft a case study inline and publish when you&apos;re ready.</p>
          </div>
          <div className="rounded-lg border border-border p-6 shadow-sm">
            <CaseStudyEditorShell redirectOnCreate />
          </div>
        </div>
      </div>
    </section>
  );
}
