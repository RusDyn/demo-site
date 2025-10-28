export interface DemoUserSeed {
  email: string;
  name: string;
  emailVerified: Date;
}

export interface DemoAssetSeed {
  key: string;
  fileName: string;
  name: string;
  mimeType: string;
}

export interface DemoCaseStudySectionSeed {
  title: string;
  content: string;
}

export interface DemoCaseStudySeed {
  slug: string;
  title: string;
  summary: string;
  audience: string;
  headline: string;
  background: string;
  results: string;
  heroAssetKey: string;
  assetKeys: string[];
  sections: DemoCaseStudySectionSeed[];
}

export const demoUser: DemoUserSeed = {
  email: "demo@example.com",
  name: "Demo User",
  emailVerified: new Date("2024-01-01T00:00:00.000Z"),
};

export const demoAssets: DemoAssetSeed[] = [
  {
    key: "analytics-dashboard",
    fileName: "analytics-dashboard.svg",
    name: "Product analytics dashboard",
    mimeType: "image/svg+xml",
  },
  {
    key: "realtime-collaboration",
    fileName: "realtime-collaboration.svg",
    name: "Realtime collaboration",
    mimeType: "image/svg+xml",
  },
  {
    key: "edge-observability",
    fileName: "edge-observability.svg",
    name: "Edge observability",
    mimeType: "image/svg+xml",
  },
  {
    key: "design-system-library",
    fileName: "design-system-library.svg",
    name: "Design system library",
    mimeType: "image/svg+xml",
  },
  {
    key: "mobile-wireframes",
    fileName: "mobile-wireframes.svg",
    name: "Mobile wireframes",
    mimeType: "image/svg+xml",
  },
];

export const demoCaseStudies: DemoCaseStudySeed[] = [
  {
    slug: "marketplace-insights-playbook",
    title: "Marketplace insights playbook",
    summary:
      "How we instrumented a multi-region marketplace launch with realtime analytics, targeting the metrics that matter to operators and vendors alike.",
    audience: "Marketplace operators",
    headline: "Moving from dashboards to proactive decisions",
    background:
      "The marketplace team was preparing its largest regional expansion yet. Leadership wanted operator tooling that went beyond static dashboards and surfaced actionable insights for supply, demand, and trust & safety teams.",
    results:
      "Within eight weeks we shipped a live command center that reduced manual reporting by 68% and doubled the number of proactive interventions per market.",
    heroAssetKey: "analytics-dashboard",
    assetKeys: ["realtime-collaboration", "mobile-wireframes"],
    sections: [
      {
        title: "Framing the leading indicators",
        content:
          "Partnering with ops, finance, and policy stakeholders, we distilled a sprawling backlog of metrics into a concise set of leading indicators. These were tied to the marketplace flywheel: inventory health, conversion velocity, trust signals, and team throughput.",
      },
      {
        title: "Streaming the right events",
        content:
          "We extended the event taxonomy with guardrails for data quality, mapped Supabase row-level security for each operator persona, and stitched historical baselines so the team could compare launch markets to mature regions in realtime.",
      },
      {
        title: "Coaching the response",
        content:
          "Instead of a static dashboard, we delivered playbooks that combined alerting, cohort drill-downs, and templated outreach. Operators now respond to dips in conversion with curated interventions that match the market maturity stage.",
      },
    ],
  },
  {
    slug: "edge-rendering-observability",
    title: "Observability for the edge rendering stack",
    summary:
      "Rebuilt the observability story for our edge-rendered marketing properties, unifying cold-start metrics, CDN health, and customer experience into a single view.",
    audience: "Platform engineering",
    headline: "Tracing every request from CDN to component",
    background:
      "As marketing scaled to dozens of localized experiences, we saw brittle deployments and inconsistent monitoring between regions. Incidents regularly required combing through multiple dashboards and vendor consoles.",
    results:
      "The new edge pipeline cut mean time to detect by 42% and allowed marketing to launch six new locales without adding on-call load to the platform team.",
    heroAssetKey: "edge-observability",
    assetKeys: ["analytics-dashboard"],
    sections: [
      {
        title: "Taming cold starts",
        content:
          "We benchmarked rendering paths across all regions and instrumented the slowest boot paths. Those traces fed directly into our Grafana dashboards so regressions were highlighted minutes after a deploy.",
      },
      {
        title: "Unifying vendor telemetry",
        content:
          "A small adapter service streams CDN health, Supabase edge function logs, and Next.js instrumentation events into a shared lake. Product and platform now review the same charts when investigating incidents.",
      },
      {
        title: "Closing the feedback loop",
        content:
          "We paired operators with DX research to codify the ideal on-call workflow. The resulting runbooks ship with automated log bookmarks and synthetic user journeys so teams practice recoveries monthly.",
      },
    ],
  },
  {
    slug: "design-system-modernization",
    title: "Design system modernization",
    summary:
      "Guided the redesign of our cross-platform design system, aligning marketing, product, and design engineering teams around a shared token vocabulary and component lifecycle.",
    audience: "Design engineering",
    headline: "Tokens, tooling, and trust across every surface",
    background:
      "Legacy component libraries had diverged across mobile and web. Component drift slowed feature delivery and designers struggled to communicate intent to engineers.",
    results:
      "After three months of iterative delivery, component reuse jumped 3x and new experiments now reach parity across web and mobile in the same sprint.",
    heroAssetKey: "design-system-library",
    assetKeys: ["realtime-collaboration", "mobile-wireframes"],
    sections: [
      {
        title: "Mapping the design debt",
        content:
          "We cataloged every production component, graded each on accessibility, responsiveness, and theming flexibility, and prioritized the gaps that blocked cross-platform parity.",
      },
      {
        title: "Automating the pipeline",
        content:
          "A Storybook pipeline now syncs component updates to Figma, propagates token changes to both platforms, and snapshots visual diffs to catch regressions before release.",
      },
      {
        title: "Enabling the teams",
        content:
          "We ran paired workshops with designers and engineers to adopt the new primitives. The shared vocabulary now anchors experimentation reviews and simplifies onboarding.",
      },
    ],
  },
];
