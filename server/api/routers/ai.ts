import { observable } from "@trpc/server/observable";

import {
  createAiResponseStream,
  generateAiResponse,
  safeParsePartialSnapshot,
  extractTextFromFinalResponse,
  parseStructuredResponse,
} from "@/lib/ai/generator";
import { aiPromptSchema, type AiStreamEvent } from "@/lib/validators/ai";

import { protectedProcedure, router } from "../trpc";

export const aiRouter = router({
  generate: protectedProcedure.input(aiPromptSchema).mutation(async ({ input }) => generateAiResponse(input)),
  stream: protectedProcedure
    .input(aiPromptSchema)
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- tRPC subscriptions rely on observables today.
    .subscription(({ input }) =>
      observable<AiStreamEvent>((emit) => {
        const abortController = new AbortController();

        void (async () => {
          try {
            const stream = await createAiResponseStream(input, { signal: abortController.signal });

            stream.on("response.output_text.delta", (event) => {
              if (typeof event.snapshot !== "string") {
                return;
              }

              const partial = safeParsePartialSnapshot(event.snapshot);
              if (partial) {
                emit.next({
                  status: "in-progress",
                  type: partial.type,
                  snapshot: partial,
                });
              }
            });

            stream.on("error", (error) => {
              const message = error instanceof Error ? error.message : "An unexpected error occurred";
              emit.next({
                status: "error",
                type: input.type,
                message,
              });
              emit.error(error instanceof Error ? error : new Error(message));
            });

            stream.on("abort", (error) => {
              const reason = error instanceof Error ? error.message : "The request was aborted";
              emit.next({
                status: "error",
                type: input.type,
                message: reason,
              });
              emit.error(error instanceof Error ? error : new Error(reason));
            });

            const finalResponse = await stream.finalResponse();
            const raw = extractTextFromFinalResponse(finalResponse);
            const parsed = parseStructuredResponse(raw);

            emit.next({
              status: "complete",
              type: parsed.type,
              result: parsed,
            });
            emit.complete();
          } catch (error) {
            const message = error instanceof Error ? error.message : "Failed to generate content";
            emit.next({
              status: "error",
              type: input.type,
              message,
            });
            emit.error(error instanceof Error ? error : new Error(message));
          }
        })();

        return () => {
          abortController.abort();
        };
      }),
    ),
});
