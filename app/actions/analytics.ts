"use server";

import { cookies } from "next/headers";
import type { ResponseCookies } from "next/dist/server/web/spec-extension/adapters/request-cookies";
import type { EventMessage, IdentifyMessage } from "posthog-node";

import { auth } from "@/lib/auth";
import {
  ANALYTICS_CONSENT_COOKIE,
  type AnalyticsConsentDecision,
} from "@/lib/analytics/consent";
import {
  getServerPosthog,
  shutdownServerPosthog,
} from "@/lib/analytics/posthog-server";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export type PersistAnalyticsConsentResult =
  | {
      success: true;
      consent: AnalyticsConsentDecision;
    }
  | {
      success: false;
      error: string;
    };

export async function persistAnalyticsConsentAction(
  decision: AnalyticsConsentDecision,
): Promise<PersistAnalyticsConsentResult> {
  try {
    const cookieStore = cookies();
    const responseCookies = cookieStore as unknown as ResponseCookies;
    const isProduction = process.env.NODE_ENV === "production";

    responseCookies.set(ANALYTICS_CONSENT_COOKIE, decision, {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
      secure: isProduction,
      maxAge: ONE_YEAR_SECONDS,
    });

    if (decision === "denied") {
      await shutdownServerPosthog();
      return { success: true, consent: decision } as const;
    }

    const session = await auth();
    const posthog = getServerPosthog(true);

    if (posthog) {
      const user = session?.user ?? null;
      const distinctId = user?.id ?? null;

      if (distinctId) {
        const identifyPayload: IdentifyMessage = {
          distinctId,
          properties: {
            ...(user?.email ? { email: user.email } : {}),
            ...(user?.name ? { name: user.name } : {}),
            ...(user?.role ? { role: user.role } : {}),
          },
        };
        posthog.identify(identifyPayload);
      }

      const capturePayload: EventMessage = {
        distinctId: distinctId ?? "anonymous",
        event: "analytics_consent_granted",
        properties: {
          grantedAt: new Date().toISOString(),
          hasSession: Boolean(distinctId),
        },
      };
      posthog.capture(capturePayload);
    }

    return { success: true, consent: decision } as const;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to persist analytics consent.";
    return { success: false, error: message } as const;
  }
}
