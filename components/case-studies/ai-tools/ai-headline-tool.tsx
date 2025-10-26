"use client";

import { useEffect, useState } from "react";

import { useAiGeneration } from "./use-ai-generation";
import type { AiHeadlinePromptInput, AiHeadlineResponse } from "@/lib/validators/ai";

interface AiHeadlineToolProps {
  topic: string;
  audience?: string;
  style?: AiHeadlinePromptInput["style"];
  variantCount?: number;
  onAccept: (headline: AiHeadlineResponse) => void;
}

export function AiHeadlineTool({
  topic,
  audience,
  style = "insightful",
  variantCount = 3,
  onAccept,
}: AiHeadlineToolProps) {
  const { generate, snapshot, result, error, isPending, reset } = useAiGeneration("headline");
  const [primaryHeadline, setPrimaryHeadline] = useState<string>("");
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (snapshot?.type === "headline") {
      if (snapshot.headline) {
        setPrimaryHeadline(snapshot.headline);
      }
      if (snapshot.variations) {
        setAlternatives(snapshot.variations);
      }
    }
  }, [snapshot]);

  useEffect(() => {
    if (result?.type === "headline") {
      setPrimaryHeadline(result.headline);
      setAlternatives(result.variations);
    }
  }, [result]);

  const handleGenerate = () => {
    const trimmedTopic = topic.trim();

    if (trimmedTopic.length < 3) {
      setLocalError("Add a topic before generating headlines.");
      return;
    }

    setLocalError(null);
    setPrimaryHeadline("");
    setAlternatives([]);

    const trimmedAudience = audience?.trim() ?? "";
    const normalizedAudience = trimmedAudience.length > 0 ? trimmedAudience : undefined;

    generate({
      type: "headline",
      topic: trimmedTopic,
      audience: normalizedAudience,
      style,
      variantCount,
    });
  };

  const handleAccept = () => {
    const cleanedPrimary = primaryHeadline.trim();
    const cleanedAlternatives = alternatives.map((item) => item.trim()).filter(Boolean);

    if (!cleanedPrimary) {
      setLocalError("Choose a headline before accepting it.");
      return;
    }

    onAccept({
      type: "headline",
      headline: cleanedPrimary,
      variations: cleanedAlternatives.length > 0 ? cleanedAlternatives : [cleanedPrimary],
    });
  };

  const updateAlternative = (index: number, value: string) => {
    setAlternatives((items) => items.map((item, idx) => (idx === index ? value : item)));
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-background p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Headline assistant</h3>
          <p className="text-sm text-muted-foreground">
            Draft a compelling headline and backup options editors can choose from.
          </p>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
        >
          {isPending ? "Generating…" : "Generate headlines"}
        </button>
      </div>

      {localError ? <p className="text-sm text-destructive">{localError}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="space-y-3">
        <div className="space-y-2">
          <label className="text-xs font-medium uppercase text-muted-foreground" htmlFor="headline-primary">
            Primary headline
          </label>
          <input
            id="headline-primary"
            value={primaryHeadline}
            onChange={(event) => {
              setPrimaryHeadline(event.target.value);
            }}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="AI headline will appear here"
          />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase text-muted-foreground">Alternatives</p>
          <div className="space-y-2">
            {alternatives.length === 0 ? (
              <p className="rounded-md border border-dashed border-border p-3 text-sm text-muted-foreground">
                Optional alternates will be listed here.
              </p>
            ) : (
              alternatives.map((value, index) => (
                <input
                  key={`alt-${index}`}
                  value={value}
                  onChange={(event) => {
                    updateAlternative(index, event.target.value);
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="Additional headline"
                />
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            reset();
            setPrimaryHeadline("");
            setAlternatives([]);
          }}
          className="rounded-md border border-input px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handleAccept}
          disabled={!primaryHeadline.trim()}
          className="rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Use headline
        </button>
      </div>
    </div>
  );
}
