"use client";

import posthog, { type PostHog } from "posthog-js";

const client: PostHog = posthog;
let isInitialized = false;

function shutdownClient(): void {
  if (!isInitialized) {
    return;
  }

  if (typeof client.opt_out_capturing === "function") {
    client.opt_out_capturing();
  }

  if (typeof client.reset === "function") {
    client.reset();
  }

  isInitialized = false;
}

export function initPosthog(consentGranted: boolean): void {
  if (!consentGranted) {
    shutdownClient();
    return;
  }

  if (typeof client.opt_in_capturing === "function") {
    client.opt_in_capturing();
  }

  if (isInitialized) {
    return;
  }

  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;

  if (!apiKey) {
    return;
  }

  if (typeof client.init === "function") {
    client.init(apiKey, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
      capture_pageview: false,
      persistence: "localStorage+cookie",
    });
  }

  isInitialized = true;
}

export { client as posthogClient };
