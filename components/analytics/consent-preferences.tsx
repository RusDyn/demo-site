"use client";

import { type ReactElement } from "react";

import { useAnalyticsConsentControls } from "./use-analytics-consent-controls";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
      <Alert variant="info" className="border-dashed border-primary/40 bg-primary/10">
        <AlertTitle className="text-sm font-semibold text-foreground">{heading}</AlertTitle>
        <AlertDescription className="mt-1 text-sm text-muted-foreground">{description}</AlertDescription>
      </Alert>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex flex-wrap gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => {
            applyDecision("denied");
          }}
          disabled={isPending || consent === "denied"}
        >
          Disable analytics
        </Button>
        <Button
          type="button"
          className="flex-1"
          onClick={() => {
            applyDecision("granted");
          }}
          disabled={isPending || consent === "granted"}
        >
          Allow analytics
        </Button>
      </div>
    </section>
  );
}
