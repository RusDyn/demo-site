"use client";

import { useMemo, useState, type ReactElement } from "react";

import { useAnalyticsConsentControls } from "./use-analytics-consent-controls";
import { Button } from "@/components/ui/button";

function formatStatus(consent: "granted" | "denied" | null): { heading: string; description: string } {
  if (consent === "granted") {
    return {
      heading: "Analytics is enabled",
      description: "We're collecting anonymous usage trends to help guide improvements.",
    };
  }

  if (consent === "denied") {
    return {
      heading: "Analytics is disabled",
      description: "No analytics events are being captured right now.",
    };
  }

  return {
    heading: "Help us improve",
    description:
      "We use privacy-friendly analytics to understand which features resonate. Enable tracking to share anonymous usage trends with the team.",
  };
}

export function AnalyticsConsentBanner(): ReactElement | null {
  const { consent, error, isPending, applyDecision } = useAnalyticsConsentControls();
  const [isManagerOpen, setIsManagerOpen] = useState(false);

  const status = useMemo(() => formatStatus(consent), [consent]);

  if (consent === null) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-40 flex justify-center md:left-auto md:right-4 md:w-96">
        <div className="w-full rounded-lg border border-border bg-background/95 px-5 py-4 shadow-lg backdrop-blur">
          <h2 className="text-base font-semibold text-foreground">{status.heading}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{status.description}</p>
          {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
          <div className="mt-4 flex flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                applyDecision("denied");
              }}
              disabled={isPending}
            >
              Decline
            </Button>
            <Button
              type="button"
              className="flex-1"
              onClick={() => {
                applyDecision("granted");
              }}
              disabled={isPending}
            >
              Allow analytics
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const label =
    consent === "granted" ? "Change analytics preference" : "Review analytics preference";

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2">
      <Button
        type="button"
        variant="outline"
        className="border border-input bg-background/95 px-3 py-1.5 text-sm shadow-lg hover:bg-muted"
        aria-expanded={isManagerOpen}
        onClick={() => {
          setIsManagerOpen((current) => !current);
        }}
      >
        Manage preferences
        <span className="sr-only"> ({label})</span>
      </Button>
      {isManagerOpen ? (
        <div className="w-80 rounded-lg border border-border bg-background/95 p-4 shadow-lg backdrop-blur">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-foreground">{status.heading}</p>
              <p className="mt-1 text-xs text-muted-foreground">{status.description}</p>
            </div>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="text-muted-foreground hover:text-foreground"
              onClick={() => {
                setIsManagerOpen(false);
              }}
            >
              Close
            </Button>
          </div>
          {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
          <div className="mt-4 flex flex-wrap gap-3">
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
        </div>
      ) : null}
    </div>
  );
}
