"use client";

import { useCallback, useEffect, useState } from "react";

import {
  getClientAnalyticsConsent,
  setClientAnalyticsConsent,
  type AnalyticsConsentState,
} from "@/lib/analytics/consent";

interface AnalyticsConsentStateHook {
  consent: AnalyticsConsentState;
  setConsent: (state: AnalyticsConsentState) => void;
  refreshConsent: () => void;
}

export function useAnalyticsConsentState(): AnalyticsConsentStateHook {
  const [consent, setConsentState] = useState<AnalyticsConsentState>(() => getClientAnalyticsConsent());

  const refreshConsent = useCallback(() => {
    setConsentState(getClientAnalyticsConsent());
  }, []);

  const setConsent = useCallback((state: AnalyticsConsentState) => {
    setConsentState(state);

    if (state === "granted" || state === "denied") {
      setClientAnalyticsConsent(state);
    }
  }, []);

  useEffect(() => {
    refreshConsent();
  }, [refreshConsent]);

  return { consent, setConsent, refreshConsent };
}
