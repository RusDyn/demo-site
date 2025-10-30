"use client";

import { useMemo, type ReactElement } from "react";

import type {
  AnalyticsCohortSummary,
  AnalyticsEventSummary,
} from "@/lib/analytics/posthog-server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalyticsCohortsQuery, useAnalyticsTopEventsQuery } from "@/lib/trpc/react";

function formatRelativeTime(timestamp: string | null | undefined): string {
  if (!timestamp) {
    return "Unknown";
  }

  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  const diffMilliseconds = date.getTime() - Date.now();
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

function EventsCard({ events }: { events: AnalyticsEventSummary[] }): ReactElement {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">No tracked events yet. Interact with the app to populate metrics.</p>;
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <div
          key={event.event}
          className="flex items-center justify-between rounded-md border border-border/80 bg-muted/50 px-4 py-3"
        >
          <div>
            <p className="text-sm font-medium text-foreground">{event.event}</p>
            <p className="text-xs text-muted-foreground">Last seen {formatRelativeTime(event.lastSeenAt)}</p>
          </div>
          <span className="text-lg font-semibold text-foreground">{event.total}</span>
        </div>
      ))}
    </div>
  );
}

function CohortsCard({ cohorts }: { cohorts: AnalyticsCohortSummary[] }): ReactElement {
  if (cohorts.length === 0) {
    return <p className="text-sm text-muted-foreground">No cohorts detected. Create segments in PostHog to see them here.</p>;
  }

  return (
    <table className="min-w-full divide-y divide-border text-left text-sm">
      <thead>
        <tr className="text-muted-foreground">
          <th className="px-0 py-2 font-medium">Cohort</th>
          <th className="px-0 py-2 font-medium">Members</th>
          <th className="px-0 py-2 font-medium">Created</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-border">
        {cohorts.map((cohort) => (
          <tr key={cohort.id} className="text-foreground">
            <td className="px-0 py-2">
              <span className="font-medium">{cohort.name}</span>
            </td>
            <td className="px-0 py-2">{cohort.count}</td>
            <td className="px-0 py-2 text-muted-foreground">{formatRelativeTime(cohort.createdAt ?? null)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export function AnalyticsOverview(): ReactElement {
  const topEventsQuery = useAnalyticsTopEventsQuery(undefined, {
    refetchOnWindowFocus: false,
  });
  const cohortsQuery = useAnalyticsCohortsQuery({
    refetchOnWindowFocus: false,
  });

  const eventsContent = useMemo(() => {
    if (topEventsQuery.isLoading) {
      return <p className="text-sm text-muted-foreground">Loading event metrics…</p>;
    }

    if (topEventsQuery.error) {
      const message =
        topEventsQuery.error instanceof Error
          ? topEventsQuery.error.message
          : "Unable to load event metrics.";
      return <p className="text-sm text-destructive">{message}</p>;
    }

    const events = Array.isArray(topEventsQuery.data) ? topEventsQuery.data : [];
    return <EventsCard events={events} />;
  }, [topEventsQuery.data, topEventsQuery.error, topEventsQuery.isLoading]);

  const cohortsContent = useMemo(() => {
    if (cohortsQuery.isLoading) {
      return <p className="text-sm text-muted-foreground">Loading cohorts…</p>;
    }

    if (cohortsQuery.error) {
      const message =
        cohortsQuery.error instanceof Error
          ? cohortsQuery.error.message
          : "Unable to load cohort analytics.";
      return <p className="text-sm text-destructive">{message}</p>;
    }

    const cohorts = Array.isArray(cohortsQuery.data) ? cohortsQuery.data : [];
    return <CohortsCard cohorts={cohorts} />;
  }, [cohortsQuery.data, cohortsQuery.error, cohortsQuery.isLoading]);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Top events</CardTitle>
          <CardDescription>
            Track the most engaged signals across case studies, AI tooling, and profile management.
          </CardDescription>
        </CardHeader>
        <CardContent>{eventsContent}</CardContent>
      </Card>
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Audience cohorts</CardTitle>
          <CardDescription>
            Monitor growth of saved segments from PostHog to understand retention trends.
          </CardDescription>
        </CardHeader>
        <CardContent>{cohortsContent}</CardContent>
      </Card>
    </div>
  );
}
