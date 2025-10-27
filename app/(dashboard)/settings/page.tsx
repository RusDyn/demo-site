import type { Metadata } from "next";
import type { ReactElement } from "react";

import { AnalyticsConsentPreferences } from "@/components/analytics/consent-preferences";

export const metadata: Metadata = {
  title: "Settings",
};

export default function DashboardSettingsPage(): ReactElement {
  return (
    <section className="space-y-10">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Account settings</h2>
        <p className="text-sm text-muted-foreground">
          Control the data you share with the team and tailor your analytics preferences.
        </p>
      </div>
      <AnalyticsConsentPreferences />
    </section>
  );
}
