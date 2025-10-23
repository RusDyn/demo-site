export const ANALYTICS_CONSENT_COOKIE = "analytics_consent";

function parseCookieString(cookieString: string | undefined | null): Map<string, string> {
  if (!cookieString) {
    return new Map();
  }

  const pairs = cookieString.split(";").map((part) => {
    const [rawKey, ...rest] = part.trim().split("=");
    const key = rawKey ? decodeURIComponent(rawKey) : "";
    const value = rest.length > 0 ? decodeURIComponent(rest.join("=")) : "";

    return [key, value] as const;
  });

  return new Map(pairs.filter(([key]) => key.length > 0));
}

export function hasAnalyticsConsentFromCookies(cookieString: string | undefined | null): boolean {
  return parseCookieString(cookieString).get(ANALYTICS_CONSENT_COOKIE) === "granted";
}

export function hasClientAnalyticsConsent(): boolean {
  if (typeof document === "undefined") {
    return false;
  }

  return hasAnalyticsConsentFromCookies(document.cookie);
}
