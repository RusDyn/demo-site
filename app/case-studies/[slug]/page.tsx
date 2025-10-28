import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";

import { CaseStudyDetailContent } from "@/components/case-studies/case-study-detail-content";
import { createTRPCContext } from "@/server/api/context";
import { appRouter } from "@/server/api/root";

const loadCaseStudy = async (slug: string) => {
  const context = await createTRPCContext();
  const caller = appRouter.createCaller(context);

  try {
    return await caller.publicCaseStudy.bySlug({ slug });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "NOT_FOUND") {
      return null;
    }

    throw error;
  }
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const caseStudy = await loadCaseStudy(slug);

  if (!caseStudy) {
    return {
      title: "Case study not found",
      description: "The requested case study could not be located.",
    };
  }

  const description =
    caseStudy.summary ??
    caseStudy.headline ??
    "See how teams ship faster with the Supabase Auth Starter toolkit.";

  return {
    title: `${caseStudy.title} – Customer case studies`,
    description,
  };
}

export default async function PublicCaseStudyDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<ReactElement> {
  const { slug } = await params;
  const caseStudy = await loadCaseStudy(slug);

  if (!caseStudy) {
    notFound();
  }

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-6 py-12">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/case-studies"
          className="inline-flex items-center rounded-md border border-input px-3 py-1 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          Back to stories
        </Link>
        <Link
          href="/dashboard/case-studies"
          className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          Edit your stories
        </Link>
      </div>
      <section className="rounded-lg border border-border p-6 shadow-sm">
        <CaseStudyDetailContent caseStudy={caseStudy} />
      </section>
      <section className="rounded-lg border border-dashed border-border p-6 text-sm text-muted-foreground">
        Inspired by this journey? Publish your own case studies to spotlight customer wins, then share the finished stories
        right from the dashboard.
      </section>
    </main>
  );
}
