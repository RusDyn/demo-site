import { withSentryConfig } from "@sentry/nextjs";
import type { NextConfig } from "next";

const supabaseStorageHostname = process.env.SUPABASE_URL
  ? new URL(process.env.SUPABASE_URL).hostname
  : undefined;

const remotePatterns: NonNullable<NextConfig["images"]>["remotePatterns"] = [
  {
    protocol: "https",
    hostname: "images.unsplash.com",
    pathname: "/**",
  },
];

if (supabaseStorageHostname) {
  remotePatterns.push({
    protocol: "https",
    hostname: supabaseStorageHostname,
    pathname: "/storage/v1/object/**",
  });
}

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns,
  },
};

export default withSentryConfig(nextConfig, {
  widenClientFileUpload: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  sentryUrl: process.env.SENTRY_URL,
  silent: true,
  release: {
    name: process.env.SENTRY_RELEASE,
  },
});
