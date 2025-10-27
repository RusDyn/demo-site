"use client";

import Link from "next/link";
import { useCallback, useState, useTransition, type ReactElement } from "react";

import { persistAnalyticsConsentAction } from "@/app/actions/analytics";
import { type AnalyticsConsentDecision } from "@/lib/analytics/consent";
import { initPosthog } from "@/lib/analytics/posthog-client";

import { useAnalyticsConsentState } from "./use-analytics-consent-state";

interface ManagePreferencesProps {
  consent: "granted" | "denied";
}

function ManagePreferencesLink({ consent }: ManagePreferencesProps): ReactElement {
  const label = consent === "granted" ? "Change analytics preference" : "Review analytics preference";

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <Link
        href="/dashboard/settings"
        className="inline-flex items-center rounded-md border border-input bg-background/95 px-3 py-1.5 text-sm font-medium text-foreground shadow-lg transition hover:bg-muted"
      >
        Manage preferences
        <span className="sr-only"> ({label})</span>
      </Link>
    </div>
  );
}

export function AnalyticsConsentBanner(): ReactElement | null {
  const { consent, setConsent } = useAnalyticsConsentState();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const applyDecision = useCallback(
    (decision: AnalyticsConsentDecision) => {
      setError(null);
      startTransition(() => {
        void persistAnalyticsConsentAction(decision)
          .then((result) => {
            if (!result.success) {
              setError(result.error);
              return;
            }

            initPosthog(decision === "granted");
            setConsent(decision);
          })
          .catch((actionError: unknown) => {
            const message =
              actionError instanceof Error
                ? actionError.message
                : "We couldn't save your analytics preference.";
            setError(message);
          });
      });
    },
    [setConsent],
  );

  if (consent !== null) {
    return <ManagePreferencesLink consent={consent} />;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 flex justify-center md:left-auto md:right-4 md:w-96">
      <div className="w-full rounded-lg border border-border bg-background/95 px-5 py-4 shadow-lg backdrop-blur">
        <h2 className="text-base font-semibold text-foreground">Help us improve</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          We use privacy-friendly analytics to understand which features resonate. Enable tracking to share anonymous usage trends
          with the team.
        </p>
        {error ? <p className="mt-2 text-sm text-destructive">{error}</p> : null}
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              applyDecision("denied");
            }}
            disabled={isPending}
            className="inline-flex flex-1 items-center justify-center rounded-md border border-input px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => {
              applyDecision("granted");
            }}
            disabled={isPending}
            className="inline-flex flex-1 items-center justify-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Allow analytics
          </button>
        </div>
      </div>
    </div>
  );
}
