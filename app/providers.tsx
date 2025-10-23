"use client";

import { useEffect, type ReactElement, type ReactNode } from "react";
import type { DehydratedState } from "@tanstack/react-query";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { AppProvider } from "@/components/providers/app-provider";
import { hasClientAnalyticsConsent } from "@/lib/analytics/consent";
import { initPosthog } from "@/lib/analytics/posthog-client";

function PosthogInitializer(): ReactElement | null {
  useEffect(() => {
    initPosthog(hasClientAnalyticsConsent());
  }, []);

  return null;
}

export function Providers({ children, state }: { children: ReactNode; state?: DehydratedState }): ReactElement {
  return (
    <AppProvider state={state}>
      {children}
      <Analytics />
      <SpeedInsights />
      <PosthogInitializer />
    </AppProvider>
  );
}
