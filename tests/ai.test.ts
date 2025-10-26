import assert from "node:assert/strict";
import { EventEmitter } from "node:events";
import { test } from "node:test";

import type { AiStreamEvent } from "@/lib/validators/ai";
import type { TRPCContext } from "@/server/api/context";

interface MockStreamControls {
  stream: {
    on: (event: string, handler: (...args: unknown[]) => void) => MockStreamControls["stream"];
    finalResponse: () => Promise<unknown>;
    controller: { abort: () => void };
  };
  emit: (event: string, payload: unknown) => void;
  resolve: (value: unknown) => void;
}

function createMockStream(): MockStreamControls {
  const emitter = new EventEmitter();
  let resolveFinal: (value: unknown) => void = () => undefined;
  const finalPromise = new Promise<unknown>((resolve) => {
    resolveFinal = resolve;
  });

  const stream: MockStreamControls["stream"] = {
    on(event: string, handler: (...args: unknown[]) => void) {
      emitter.on(event, handler as (...args: unknown[]) => void);
      return stream;
    },
    finalResponse() {
      return finalPromise;
    },
    controller: {
      abort() {
        emitter.emit("abort", new Error("aborted"));
      },
    },
  } satisfies MockStreamControls["stream"];

  return {
    stream,
    emit: (event: string, payload: unknown) => {
      emitter.emit(event, payload);
    },
    resolve: (value: unknown) => {
      resolveFinal(value);
    },
  } satisfies MockStreamControls;
}

const streamState: { current: MockStreamControls | null } = { current: null };
let nextCreateResponse: { output_text: string } = { output_text: "" };

const mockClient = {
  responses: {
    create() {
      return Promise.resolve(nextCreateResponse);
    },
    stream() {
      if (!streamState.current) {
        throw new Error("Stream not configured");
      }

      return Promise.resolve(streamState.current.stream as unknown);
    },
  },
};

const openAiModule = await import("@/lib/openai");

type OpenAIClient = ReturnType<typeof openAiModule.getOpenAIClient>;

openAiModule.__setOpenAIClientForTesting(mockClient as unknown as OpenAIClient);

const { aiRouter } = await import("@/server/api/routers/ai");

function createCaller(): ReturnType<typeof aiRouter.createCaller> {
  const context: TRPCContext = {
    session: {
      user: {
        id: "user_123",
        email: "user@example.com",
        name: "Test User",
      },
    } as TRPCContext["session"],
    prisma: {} as TRPCContext["prisma"],
  };

  return aiRouter.createCaller(context);
}

async function flush(): Promise<void> {
  await new Promise((resolve) => setImmediate(resolve));
}

test("ai.generate returns structured output", async () => {
  const caller = createCaller();

  const expected = {
    type: "headline" as const,
    headline: "Unlock 40% faster onboarding",
    variations: ["Unlock onboarding 40% faster", "Speed through onboarding"],
  };

  nextCreateResponse = { output_text: JSON.stringify(expected) };

  const result = await caller.generate({
    type: "headline",
    topic: "Improve onboarding",
    variantCount: 2,
    style: "insightful",
  });

  assert.equal(result.type, "headline");
  assert.equal(result.headline, expected.headline);
  assert.deepEqual(result.variations, expected.variations);
});

test("ai.stream emits progress and completion events", async () => {
  const caller = createCaller();
  const controls = createMockStream();
  streamState.current = controls;

  const final = {
    type: "outline" as const,
    sections: [
      { title: "Challenge", description: "Legacy workflow slowed onboarding." },
      { title: "Solution", description: "Implemented automated playbooks." },
    ],
  };

  const events: AiStreamEvent[] = [];
  const observable = await caller.stream({
    type: "outline",
    topic: "Faster onboarding",
    context: "The customer needed to streamline their onboarding program.",
    keyPoints: ["reduced onboarding time", "automation"],
  });

  const subscription = observable.subscribe({
    next(data) {
      events.push(data);
    },
    error(error) {
      throw error;
    },
  });

  await flush();

  controls.emit("response.output_text.delta", {
    snapshot: JSON.stringify({
      type: "outline",
      sections: [{ title: "Challenge", description: "Legacy process" }],
    }),
  });

  await flush();

  assert.equal(events.length >= 1, true);
  assert.equal(events[0]?.status, "in-progress");

  controls.resolve({ output_text: JSON.stringify(final) });

  await flush();
  await flush();

  const lastEvent = events.at(-1);
  assert.equal(lastEvent?.status, "complete");
  assert.deepEqual(lastEvent?.result, final);

  subscription.unsubscribe();
});
