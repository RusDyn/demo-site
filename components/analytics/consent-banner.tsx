"use client";

import { useCallback, useEffect, useState, useTransition, type ReactElement } from "react";

import { persistAnalyticsConsentAction } from "@/app/actions/analytics";
import {
  getClientAnalyticsConsent,
  setClientAnalyticsConsent,
  type AnalyticsConsentDecision,
  type AnalyticsConsentState,
} from "@/lib/analytics/consent";
import { initPosthog } from "@/lib/analytics/posthog-client";

function useConsentState(): {
  consent: AnalyticsConsentState;
  setConsent: (state: AnalyticsConsentState) => void;
} {
  const [consent, setConsent] = useState<AnalyticsConsentState>(() => getClientAnalyticsConsent());

  useEffect(() => {
    setConsent(getClientAnalyticsConsent());
  }, []);

  return { consent, setConsent };
}

export function AnalyticsConsentBanner(): ReactElement | null {
  const { consent, setConsent } = useConsentState();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const shouldRender = consent === null;

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

            setClientAnalyticsConsent(decision);
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

  if (!shouldRender) {
    return null;
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
