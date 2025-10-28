import Link from "next/link";
import type { Metadata } from "next";
import type { ReactElement } from "react";

import { CaseStudySummaryList } from "@/components/case-studies/case-study-summary-list";
import { createTRPCContext } from "@/server/api/context";
import { appRouter } from "@/server/api/root";

export const metadata: Metadata = {
  title: "Customer case studies",
  description: "Discover how product teams ship faster with the Supabase Auth Starter toolkit.",
};

export default async function PublicCaseStudiesPage(): Promise<ReactElement> {
  const context = await createTRPCContext();
  const caller = appRouter.createCaller(context);
  const caseStudies = await caller.publicCaseStudy.list();

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-12">
      <section className="space-y-6 text-center sm:text-left">
        <div className="space-y-4">
          <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">Stories from shipping teams</h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:mx-0">
            Explore case studies from builders using our starter kit to launch polished authentication workflows, organize
            product wins, and empower their teams with real-world momentum.
          </p>
        </div>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
          <Link
            href="/api/auth/signin"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Start your own story
          </Link>
          <Link
            href="/dashboard/case-studies"
            className="inline-flex items-center justify-center rounded-md border border-input px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            Manage case studies
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Featured wins</h2>
        <div className="rounded-lg border border-border p-6 shadow-sm">
          <CaseStudySummaryList
            items={caseStudies}
            getHref={(item) => `/case-studies/${item.publicSlug}`}
            ctaLabel="Read story"
            emptyState={
              <p className="text-sm text-muted-foreground">
                We&apos;re gathering stories from early adopters. Check back soon for fresh wins.
              </p>
            }
          />
        </div>
      </section>
    </main>
  );
}
