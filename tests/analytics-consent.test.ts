import assert from "node:assert/strict";
import { test } from "node:test";

import {
  ANALYTICS_CONSENT_COOKIE,
  formatAnalyticsConsentCookie,
  hasAnalyticsConsentFromCookies,
  readAnalyticsConsent,
  setClientAnalyticsConsent,
} from "@/lib/analytics/consent";

test("readAnalyticsConsent parses granted and denied values", () => {
  assert.strictEqual(readAnalyticsConsent(`${ANALYTICS_CONSENT_COOKIE}=granted`), "granted");
  assert.strictEqual(readAnalyticsConsent(`${ANALYTICS_CONSENT_COOKIE}=denied`), "denied");
  assert.strictEqual(readAnalyticsConsent(""), null);
  assert.strictEqual(readAnalyticsConsent(undefined), null);
});

test("hasAnalyticsConsentFromCookies returns true only for granted", () => {
  assert.strictEqual(hasAnalyticsConsentFromCookies(`${ANALYTICS_CONSENT_COOKIE}=granted`), true);
  assert.strictEqual(hasAnalyticsConsentFromCookies(`${ANALYTICS_CONSENT_COOKIE}=denied`), false);
  assert.strictEqual(hasAnalyticsConsentFromCookies("some=other"), false);
});

test("formatAnalyticsConsentCookie encodes defaults", () => {
  const cookie = formatAnalyticsConsentCookie("granted", { secure: false, maxAgeSeconds: 600 });
  assert.ok(cookie.includes(`${ANALYTICS_CONSENT_COOKIE}=granted`));
  assert.ok(cookie.includes("Path=/"));
  assert.ok(cookie.includes("SameSite=Lax"));
  assert.ok(cookie.includes("Max-Age=600"));
});

test("setClientAnalyticsConsent delegates to provided apply function", () => {
  const recorded: string[] = [];
  setClientAnalyticsConsent("denied", { secure: false, apply: (value) => recorded.push(value) });
  assert.strictEqual(recorded.length, 1);
  const first = recorded.at(0);
  assert.ok(first?.startsWith(`${ANALYTICS_CONSENT_COOKIE}=`));
});

test("setClientAnalyticsConsent updates the cookie when toggled", () => {
  let storedValue = "";
  const apply = (value: string) => {
    storedValue = value;
  };

  setClientAnalyticsConsent("granted", { secure: false, apply });
  assert.ok(storedValue.includes(`${ANALYTICS_CONSENT_COOKIE}=granted`));

  setClientAnalyticsConsent("denied", { secure: false, apply });
  assert.ok(storedValue.includes(`${ANALYTICS_CONSENT_COOKIE}=denied`));

  setClientAnalyticsConsent("granted", { secure: false, apply });
  assert.ok(storedValue.includes(`${ANALYTICS_CONSENT_COOKIE}=granted`));
});
