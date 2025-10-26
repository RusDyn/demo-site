"use client";

import Link from "next/link";
import { useMemo, type ReactElement } from "react";

import { useCaseStudyListQuery } from "@/lib/trpc/react";
import { caseStudySummarySchema } from "@/lib/validators/case-study";

function formatTimestamp(timestamp: Date): string {
  const now = Date.now();
  const diffMilliseconds = timestamp.getTime() - now;
  const minutes = Math.round(diffMilliseconds / 60000);

  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: "auto" });

  if (Math.abs(minutes) < 60) {
    return formatter.format(minutes, "minute");
  }

  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) {
    return formatter.format(hours, "hour");
  }

  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) {
    return formatter.format(days, "day");
  }

  const months = Math.round(days / 30);
  if (Math.abs(months) < 12) {
    return formatter.format(months, "month");
  }

  const years = Math.round(months / 12);
  return formatter.format(years, "year");
}

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

    if (items.length === 0) {
      return <p className="text-sm text-muted-foreground">No case studies yet. Create your first one to get started.</p>;
    }

    return (
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.id} className="rounded-lg border border-border p-4 shadow-sm transition hover:border-primary">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="text-xs text-muted-foreground">Updated {formatTimestamp(item.updatedAt)}</p>
              </div>
              <Link
                href={`/case-studies/${item.id}`}
                className="inline-flex items-center rounded-md border border-input px-3 py-1 text-sm font-medium text-foreground transition hover:bg-muted"
              >
                View
              </Link>
            </div>
            {item.summary ? <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{item.summary}</p> : null}
          </li>
        ))}
      </ul>
    );
  }, [listQuery.data, listQuery.error, listQuery.isLoading]);

  return <div className="space-y-4">{content}</div>;
}
