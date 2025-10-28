"use client";

import { useCallback, useState, useTransition } from "react";

import { persistAnalyticsConsentAction } from "@/app/actions/analytics";
import { type AnalyticsConsentDecision } from "@/lib/analytics/consent";
import { initPosthog } from "@/lib/analytics/posthog-client";

import { useAnalyticsConsentState } from "./use-analytics-consent-state";

interface UseAnalyticsConsentControlsResult {
  consent: "granted" | "denied" | null;
  error: string | null;
  isPending: boolean;
  applyDecision: (decision: AnalyticsConsentDecision) => void;
}

export function useAnalyticsConsentControls(): UseAnalyticsConsentControlsResult {
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

  return { consent, error, isPending, applyDecision };
}
