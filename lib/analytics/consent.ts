export const ANALYTICS_CONSENT_COOKIE = "analytics_consent";

type CookieMap = Map<string, string>;

function parseCookieString(cookieString: string | undefined | null): CookieMap {
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

export type AnalyticsConsentDecision = "granted" | "denied";
export type AnalyticsConsentState = AnalyticsConsentDecision | null;

export function readAnalyticsConsent(cookieString: string | undefined | null): AnalyticsConsentState {
  const value = parseCookieString(cookieString).get(ANALYTICS_CONSENT_COOKIE);

  if (value === "granted" || value === "denied") {
    return value;
  }

  return null;
}

export function hasAnalyticsConsentFromCookies(cookieString: string | undefined | null): boolean {
  return readAnalyticsConsent(cookieString) === "granted";
}

export function getClientAnalyticsConsent(): AnalyticsConsentState {
  if (typeof document === "undefined") {
    return null;
  }

  return readAnalyticsConsent(document.cookie);
}

export function hasClientAnalyticsConsent(): boolean {
  return getClientAnalyticsConsent() === "granted";
}

export interface AnalyticsConsentCookieOptions {
  path?: string;
  domain?: string;
  sameSite?: "Strict" | "Lax" | "None";
  secure?: boolean;
  maxAgeSeconds?: number;
}

function resolveSecureDefault(): boolean {
  if (typeof window !== "undefined" && typeof window.location !== "undefined") {
    return window.location.protocol === "https:";
  }

  return process.env.NODE_ENV === "production";
}

export function formatAnalyticsConsentCookie(
  decision: AnalyticsConsentDecision,
  options?: AnalyticsConsentCookieOptions,
): string {
  const path = options?.path ?? "/";
  const sameSite = options?.sameSite ?? "Lax";
  const maxAgeSeconds = options?.maxAgeSeconds ?? 60 * 60 * 24 * 365;
  const secure = options?.secure ?? resolveSecureDefault();

  const attributes = [
    `${ANALYTICS_CONSENT_COOKIE}=${encodeURIComponent(decision)}`,
    `Path=${path}`,
    `Max-Age=${Math.max(0, Math.trunc(maxAgeSeconds))}`,
    `SameSite=${sameSite}`,
  ];

  if (options?.domain) {
    attributes.push(`Domain=${options.domain}`);
  }

  if (secure) {
    attributes.push("Secure");
  }

  return attributes.join("; ");
}

export interface SetClientAnalyticsConsentOptions extends AnalyticsConsentCookieOptions {
  apply?: (cookie: string) => void;
}

export function setClientAnalyticsConsent(
  decision: AnalyticsConsentDecision,
  options?: SetClientAnalyticsConsentOptions,
): void {
  const { apply, ...cookieOptions } = options ?? {};
  const cookie = formatAnalyticsConsentCookie(decision, cookieOptions);

  if (typeof apply === "function") {
    apply(cookie);
    return;
  }

  if (typeof document === "undefined") {
    return;
  }

  document.cookie = cookie;
}
