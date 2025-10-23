import type { InstrumentationOnRequestError } from "next/dist/server/instrumentation/types";
import * as Sentry from "@sentry/nextjs";

export const register = (): void => {
  void import("./sentry.server.config");
};

export const onRequestError: InstrumentationOnRequestError = (error, request, context) => {
  Sentry.captureRequestError(error, request, context);
};
