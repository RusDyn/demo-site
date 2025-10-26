import type { ReactElement } from "react";

import { AnalyticsOverview } from "@/components/analytics/analytics-overview";

export default function AnalyticsDashboardPage(): ReactElement {
  return (
    <section className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-foreground">Product analytics</h2>
        <p className="text-sm text-muted-foreground">
          Explore cohorts, feature engagement, and AI usage trends captured through PostHog.
        </p>
      </div>
      <AnalyticsOverview />
    </section>
  );
}
