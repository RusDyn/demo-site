import Link from "next/link";
import { type ReactElement, type ReactNode } from "react";

import { type CaseStudySummary } from "@/lib/validators/case-study";

function formatRelativeTimestamp(timestamp: Date): string {
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

export interface CaseStudySummaryListProps {
  readonly items: CaseStudySummary[];
  readonly getHref: (item: CaseStudySummary) => string;
  readonly ctaLabel?: string;
  readonly emptyState?: ReactNode;
}

export function CaseStudySummaryList({
  items,
  getHref,
  ctaLabel = "View",
  emptyState = <p className="text-sm text-muted-foreground">No case studies available yet.</p>,
}: CaseStudySummaryListProps): ReactElement {
  if (items.length === 0) {
    return <div className="space-y-4">{emptyState}</div>;
  }

  return (
    <ul className="space-y-4">
      {items.map((item) => (
        <li key={item.id} className="rounded-lg border border-border p-4 shadow-sm transition hover:border-primary">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="text-xs text-muted-foreground">Updated {formatRelativeTimestamp(item.updatedAt)}</p>
            </div>
            <Link
              href={getHref(item)}
              className="inline-flex items-center rounded-md border border-input px-3 py-1 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              {ctaLabel}
            </Link>
          </div>
          {item.summary ? <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{item.summary}</p> : null}
        </li>
      ))}
    </ul>
  );
}
