import { PostHog } from "posthog-node";

let serverClient: PostHog | null = null;

function createServerClient(apiKey: string): PostHog {
  return new PostHog(apiKey, {
    host: process.env.POSTHOG_HOST ?? "https://app.posthog.com",
    flushAt: 1,
  });
}

export function getServerPosthog(consentGranted: boolean): PostHog | null {
  if (!consentGranted) {
    return null;
  }

  const apiKey = process.env.POSTHOG_KEY;

  if (!apiKey) {
    return null;
  }

  serverClient ??= createServerClient(apiKey);

  return serverClient;
}

export async function shutdownServerPosthog(): Promise<void> {
  if (!serverClient) {
    return;
  }

  const client = serverClient;
  serverClient = null;

  const asyncShutdown = (client as { _shutdown?: (timeout?: number) => Promise<void> })._shutdown;

  if (typeof asyncShutdown === "function") {
    await asyncShutdown.call(client);
    return;
  }

  void client.shutdown();
}

type PosthogFetchOptions = Parameters<PostHog["fetch"]>[1];
type PosthogFetchResponse = Awaited<ReturnType<PostHog["fetch"]>>;

async function requestJson<TResponse>(
  client: PostHog,
  path: string,
  options: PosthogFetchOptions,
): Promise<TResponse> {
  const response: PosthogFetchResponse = await client.fetch(path, options);

  if (response.status >= 400) {
    const text = await response.text();
    throw new Error(`PostHog request failed with status ${response.status}: ${text}`);
  }

  return (await response.json()) as TResponse;
}

export interface AnalyticsCohortSummary {
  id: number;
  name: string;
  count: number;
  createdAt?: string | null;
}

interface PosthogCohortRecord {
  id?: number | string;
  name?: string;
  count?: number;
  count_estimate?: number;
  estimated_count?: number;
  user_count?: number;
  person_count?: number;
  created_at?: string;
}

interface PosthogCohortResponse {
  results: PosthogCohortRecord[];
}

function normalizeCohortCount(record: PosthogCohortRecord): number {
  const countCandidates = [
    record.count,
    record.count_estimate,
    record.estimated_count,
    record.user_count,
    record.person_count,
  ];

  const value = countCandidates.find((item) => typeof item === "number" && Number.isFinite(item));

  return value ?? 0;
}

export async function fetchPosthogCohorts(): Promise<AnalyticsCohortSummary[]> {
  const client = getServerPosthog(true);

  if (!client) {
    return [];
  }

  const data = await requestJson<PosthogCohortResponse>(client, "/api/projects/@current/cohorts/", {
    method: "GET",
    headers: {},
  });

  return data.results.map((record) => {
    const idRaw = record.id ?? 0;
    let id = 0;
    if (typeof idRaw === "number") {
      id = idRaw;
    } else if (typeof idRaw === "string") {
      const parsedId = Number.parseInt(idRaw, 10);
      id = Number.isNaN(parsedId) ? 0 : parsedId;
    }
    const name = typeof record.name === "string" && record.name.length > 0 ? record.name : `Cohort ${id}`;

    return {
      id: Number.isFinite(id) ? id : 0,
      name,
      count: normalizeCohortCount(record),
      createdAt: record.created_at ?? null,
    } satisfies AnalyticsCohortSummary;
  });
}

export interface AnalyticsEventSummary {
  event: string;
  total: number;
  lastSeenAt?: string | null;
}

export interface FetchTopEventsOptions {
  limit?: number;
  dateFrom?: Date | string;
  dateTo?: Date | string;
}

interface PosthogQueryRow {
  event?: unknown;
  total?: unknown;
  last_seen_at?: unknown;
}

interface PosthogQueryResponse {
  results: PosthogQueryRow[];
}

function toISOString(value: Date | string | undefined): string {
  if (!value) {
    return new Date().toISOString();
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? new Date().toISOString() : date.toISOString();
}

function clampLimit(limit: number | undefined, fallback: number): number {
  if (typeof limit !== "number" || Number.isNaN(limit)) {
    return fallback;
  }

  return Math.min(Math.max(Math.trunc(limit), 1), 50);
}

export async function fetchPosthogTopEvents(
  options?: FetchTopEventsOptions,
): Promise<AnalyticsEventSummary[]> {
  const client = getServerPosthog(true);

  if (!client) {
    return [];
  }

  const limit = clampLimit(options?.limit, 10);
  const dateTo = options?.dateTo ?? new Date();
  const dateFrom = options?.dateFrom ?? new Date(new Date(dateTo).getTime() - 1000 * 60 * 60 * 24 * 30);

  const query = `
    SELECT event, count() AS total, max(timestamp) AS last_seen_at
    FROM events
    WHERE timestamp BETWEEN toDateTime($dateFrom) AND toDateTime($dateTo)
    GROUP BY event
    ORDER BY total DESC
    LIMIT $limit
  `;

  const response = await requestJson<PosthogQueryResponse>(client, "/api/projects/@current/query/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      params: {
        dateFrom: toISOString(dateFrom),
        dateTo: toISOString(dateTo),
        limit,
      },
    }),
  });

  return response.results.map((row) => {
    let eventName = "unknown_event";
    if (typeof row.event === "string" && row.event.length > 0) {
      eventName = row.event;
    } else if (row.event !== null && row.event !== undefined) {
      if (typeof row.event === "number" || typeof row.event === "boolean" || typeof row.event === "bigint") {
        eventName = String(row.event);
      }
    }

    let total = 0;
    if (typeof row.total === "number" && Number.isFinite(row.total)) {
      total = row.total;
    } else if (typeof row.total === "string") {
      const parsedTotal = Number.parseFloat(row.total);
      total = Number.isNaN(parsedTotal) ? 0 : parsedTotal;
    }
    const lastSeenAt = typeof row.last_seen_at === "string" ? row.last_seen_at : null;

    return {
      event: eventName,
      total,
      lastSeenAt,
    } satisfies AnalyticsEventSummary;
  });
}
