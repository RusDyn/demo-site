import assert from "node:assert/strict";
import { afterEach, mock, test } from "node:test";

import type { AnalyticsCohortSummary, AnalyticsEventSummary } from "@/lib/analytics/posthog-server";
import type { TRPCContext } from "@/server/api/context";

afterEach(() => {
  mock.restoreAll();
  mock.reset();
});

async function importAnalyticsRouter() {
  return import(`@/server/api/routers/analytics?test=${Date.now()}`);
}

function createContext(): TRPCContext {
  return {
    session: { user: { id: "user-123" } } as TRPCContext["session"],
    prisma: {} as TRPCContext["prisma"],
  };
}

test("analytics.topEvents returns PostHog top events", async () => {
  const events: AnalyticsEventSummary[] = [
    { event: "case_study_viewed", total: 12, lastSeenAt: "2024-01-01T00:00:00Z" },
  ];

  const fetchTopEvents = mock.fn(() => Promise.resolve(events));
  const fetchCohorts = mock.fn(() => Promise.resolve<AnalyticsCohortSummary[]>([]));

  mock.module("@/lib/analytics/posthog-server", {
    namedExports: {
      fetchPosthogTopEvents: fetchTopEvents,
      fetchPosthogCohorts: fetchCohorts,
    },
  });

  const { analyticsRouter } = await importAnalyticsRouter();
  const caller = analyticsRouter.createCaller(createContext());
  const result = await caller.topEvents({ limit: 25 });

  assert.deepEqual(result, events);
  assert.strictEqual(fetchTopEvents.mock.calls.length, 1);
  const [firstCall] = fetchTopEvents.mock.calls;
  const [options] = firstCall?.arguments ?? [];
  assert.deepEqual(options, { limit: 25, dateFrom: undefined, dateTo: undefined });
});

test("analytics.cohorts returns cohort summaries", async () => {
  const cohorts: AnalyticsCohortSummary[] = [
    { id: 1, name: "New subscribers", count: 42, createdAt: "2024-01-02T00:00:00Z" },
  ];

  const fetchTopEvents = mock.fn(() => Promise.resolve<AnalyticsEventSummary[]>([]));
  const fetchCohorts = mock.fn(() => Promise.resolve(cohorts));

  mock.module("@/lib/analytics/posthog-server", {
    namedExports: {
      fetchPosthogTopEvents: fetchTopEvents,
      fetchPosthogCohorts: fetchCohorts,
    },
  });

  const { analyticsRouter } = await importAnalyticsRouter();
  const caller = analyticsRouter.createCaller(createContext());
  const result = await caller.cohorts();

  assert.deepEqual(result, cohorts);
  assert.strictEqual(fetchCohorts.mock.calls.length, 1);
});
