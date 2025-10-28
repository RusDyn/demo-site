"use client";

import { type ReactElement } from "react";

import { useAnalyticsConsentControls } from "./use-analytics-consent-controls";

export function AnalyticsConsentPreferences(): ReactElement {
  const { consent, error, isPending, applyDecision } = useAnalyticsConsentControls();

  const heading =
    consent === "granted"
      ? "Analytics is enabled"
      : consent === "denied"
        ? "Analytics is disabled"
        : "No analytics preference saved";
  const description =
    consent === "granted"
      ? "We're collecting anonymous usage trends to help guide improvements."
      : consent === "denied"
        ? "No analytics events are being captured right now."
        : "Choose whether you'd like to help us improve by sharing anonymous usage trends.";

  return (
    <section className="space-y-4 rounded-lg border border-border bg-background/95 p-6 shadow-sm">
      <header className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">Analytics preferences</h2>
        <p className="text-sm text-muted-foreground">
          Decide whether we can capture anonymous usage trends to inform improvements.
        </p>
      </header>
      <div className="rounded-md border border-dashed border-muted-foreground/40 p-4">
        <p className="text-sm font-medium text-foreground">{heading}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => {
            applyDecision("denied");
          }}
          disabled={isPending || consent === "denied"}
          className="inline-flex flex-1 items-center justify-center rounded-md border border-input px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          Disable analytics
        </button>
        <button
          type="button"
          onClick={() => {
            applyDecision("granted");
          }}
          disabled={isPending || consent === "granted"}
          className="inline-flex flex-1 items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Allow analytics
        </button>
      </div>
    </section>
  );
}
