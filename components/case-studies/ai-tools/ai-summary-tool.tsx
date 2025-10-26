"use client";

import { useEffect, useState } from "react";

import { useAiGeneration } from "./use-ai-generation";
import type { AiSummaryPromptInput, AiSummaryResponse } from "@/lib/validators/ai";

interface AiSummaryToolProps {
  source: string;
  length?: AiSummaryPromptInput["length"];
  tone?: AiSummaryPromptInput["tone"];
  onAccept: (summary: AiSummaryResponse) => void;
}

export function AiSummaryTool({ source, length = "medium", tone = "neutral", onAccept }: AiSummaryToolProps) {
  const { generate, snapshot, result, error, isPending, reset } = useAiGeneration("summary");
  const [draftSummary, setDraftSummary] = useState<string>("");
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (result?.type === "summary") {
      setDraftSummary(result.summary);
    }
  }, [result]);

  useEffect(() => {
    if (snapshot?.type === "summary" && typeof snapshot.summary === "string") {
      setDraftSummary(snapshot.summary);
    }
  }, [snapshot]);

  const handleGenerate = () => {
    const trimmedSource = source.trim();

    if (trimmedSource.length < 10) {
      setLocalError("Add more context before requesting a summary.");
      return;
    }

    setLocalError(null);
    setDraftSummary("");

    generate({
      type: "summary",
      source: trimmedSource,
      length,
      tone,
    });
  };

  const handleAccept = () => {
    const trimmedSummary = draftSummary.trim();

    if (!trimmedSummary) {
      setLocalError("Write or generate a summary before accepting it.");
      return;
    }

    onAccept({
      type: "summary",
      summary: trimmedSummary,
    });
  };

  return (
    <div className="space-y-4 rounded-lg border border-border bg-background p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Summary assistant</h3>
          <p className="text-sm text-muted-foreground">Condense the case study background into a short teaser paragraph.</p>
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isPending}
        >
          {isPending ? "Generating…" : "Generate summary"}
        </button>
      </div>

      {localError ? <p className="text-sm text-destructive">{localError}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <textarea
        value={draftSummary}
        onChange={(event) => {
          setDraftSummary(event.target.value);
        }}
        placeholder="The generated summary will appear here."
        rows={5}
        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />

      <div className="flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            reset();
            setDraftSummary("");
          }}
          className="rounded-md border border-input px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={handleAccept}
          disabled={!draftSummary.trim()}
          className="rounded-md bg-secondary px-3 py-2 text-sm font-medium text-secondary-foreground transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Use summary
        </button>
      </div>
    </div>
  );
}
