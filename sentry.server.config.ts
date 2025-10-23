import * as Sentry from "@sentry/nextjs";

const dsn = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE ?? process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE ?? "0"),
  profilesSampleRate: Number(process.env.SENTRY_PROFILES_SAMPLE_RATE ?? "0"),
});
