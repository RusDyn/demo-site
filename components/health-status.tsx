"use client";

import type { ReactElement } from "react";

import { trpc } from "@/lib/trpc/react";

export function HealthStatus(): ReactElement {
  const { data, isLoading } = trpc.health.ping.useQuery();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Checking API health…</p>;
  }

  if (!data) {
    return <p className="text-sm text-destructive">Unable to reach the API.</p>;
  }

  return (
    <p className="text-sm text-muted-foreground">
      API status: <span className="font-medium text-foreground">{data.status}</span> at {new Date(data.timestamp).toLocaleTimeString()}
    </p>
  );
}
