"use client";

import { useMemo, type ReactElement } from "react";

import { useCaseStudyListQuery } from "@/lib/trpc/react";
import { caseStudySummarySchema } from "@/lib/validators/case-study";

import { CaseStudySummaryList } from "./case-study-summary-list";

export function CaseStudyList(): ReactElement {
  const listQuery = useCaseStudyListQuery({
    refetchOnWindowFocus: false,
  });

  const content = useMemo(() => {
    if (listQuery.isLoading) {
      return <p className="text-sm text-muted-foreground">Loading case studies…</p>;
    }

    if (listQuery.error) {
      return (
        <p className="text-sm text-destructive">
          {listQuery.error instanceof Error ? listQuery.error.message : "Failed to load case studies."}
        </p>
      );
    }

    const parsed = listQuery.data
      ? caseStudySummarySchema.array().safeParse(listQuery.data)
      : undefined;

    if (parsed && !parsed.success) {
      return <p className="text-sm text-destructive">Received an invalid case study payload.</p>;
    }

    const items = parsed?.success ? parsed.data : [];

    return (
      <CaseStudySummaryList
        items={items}
        getHref={(item) => `/dashboard/case-studies/${item.id}`}
        emptyState={
          <p className="text-sm text-muted-foreground">No case studies yet. Create your first one to get started.</p>
        }
      />
    );
  }, [listQuery.data, listQuery.error, listQuery.isLoading]);

  return <div className="space-y-4">{content}</div>;
}
