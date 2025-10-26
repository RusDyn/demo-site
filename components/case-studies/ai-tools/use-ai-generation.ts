"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { skipToken } from "@tanstack/react-query";

import { trpc } from "@/lib/trpc/react";
import type {
  AiPartialOfType,
  AiPromptOfType,
  AiPromptType,
  AiPromptInput,
  AiResponseOfType,
  AiStreamEvent,
} from "@/lib/validators/ai";

interface UseAiGenerationState<TType extends AiPromptType> {
  status: "idle" | "loading" | "success" | "error";
  error: string | null;
  snapshot: AiPartialOfType<TType> | null;
  result: AiResponseOfType<TType> | null;
  isPending: boolean;
  generate: (input: AiPromptOfType<TType>) => void;
  retry: () => void;
  reset: () => void;
}

export function useAiGeneration<TType extends AiPromptType>(type: TType): UseAiGenerationState<TType> {
  const [request, setRequest] = useState<AiPromptOfType<TType> | null>(null);
  const [status, setStatus] = useState<UseAiGenerationState<TType>["status"]>("idle");
  const [error, setError] = useState<string | null>(null);
  const [snapshot, setSnapshot] = useState<AiPartialOfType<TType> | null>(null);
  const [result, setResult] = useState<AiResponseOfType<TType> | null>(null);
  const lastRequestRef = useRef<AiPromptOfType<TType> | null>(null);

  const handleStreamEvent = useCallback(
    (event: AiStreamEvent & { type: TType }) => {
      if (event.status === "in-progress") {
        const partial = (event.snapshot as AiPartialOfType<TType> | undefined) ?? null;
        setStatus("loading");
        setSnapshot(partial);
      } else if (event.status === "error") {
        setStatus("error");
        setError(event.message);
        setRequest(null);
      } else {
        setStatus("success");
        setResult(event.result as AiResponseOfType<TType>);
        setSnapshot(null);
        setRequest(null);
      }
    },
    [],
  );

  const enabledInput = useMemo(() => request ?? undefined, [request]);

  const subscriptionInput = (request ? (enabledInput as AiPromptInput) : skipToken) satisfies
    AiPromptInput | typeof skipToken;

  const subscriptionHandlers = useMemo(
    () => ({
      onData(event: AiStreamEvent) {
        if (event.type !== type) {
          return;
        }

        handleStreamEvent(event as AiStreamEvent & { type: TType });
      },
      onError(streamError: unknown) {
        setStatus("error");
        const message =
          streamError instanceof Error
            ? streamError.message
            : typeof streamError === "string"
              ? streamError
              : "Something went wrong while generating content.";
        setError(message);
      },
    }),
    [handleStreamEvent, type],
  );

  trpc.ai.stream.useSubscription(
    subscriptionInput,
    subscriptionInput === skipToken ? undefined : subscriptionHandlers,
  );

  useEffect(() => {
    if (!request) {
      return;
    }

    setStatus("loading");
    setError(null);
    setSnapshot(null);
    setResult(null);
  }, [request]);

  const generate = useCallback(
    (input: AiPromptOfType<TType>) => {
      lastRequestRef.current = input;
      setRequest(input);
    },
    [],
  );

  const retry = useCallback(() => {
    if (lastRequestRef.current) {
      setRequest({ ...lastRequestRef.current });
    }
  }, []);

  const reset = useCallback(() => {
    setRequest(null);
    setStatus("idle");
    setError(null);
    setSnapshot(null);
    setResult(null);
  }, []);

  return {
    status,
    error,
    snapshot,
    result,
    isPending: status === "loading",
    generate,
    retry,
    reset,
  };
}
