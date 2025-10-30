"use client";

import { useEffect, useState } from "react";

import { useAiGeneration } from "./use-ai-generation";
import type { AiHeadlinePromptInput, AiHeadlineResponse } from "@/lib/validators/ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
        <Button type="button" onClick={handleGenerate} disabled={isPending}>
          {isPending ? "Generating…" : "Generate headlines"}
        </Button>
      </div>

      {localError ? <p className="text-sm text-destructive">{localError}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="space-y-3">
        <div className="space-y-2">
          <Label className="text-xs font-medium uppercase text-muted-foreground" htmlFor="headline-primary">
            Primary headline
          </Label>
          <Input
            id="headline-primary"
            value={primaryHeadline}
            onChange={(event) => {
              setPrimaryHeadline(event.target.value);
            }}
            className="w-full"
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
                <Input
                  key={`alt-${index}`}
                  value={value}
                  onChange={(event) => {
                    updateAlternative(index, event.target.value);
                  }}
                  className="w-full"
                  placeholder="Additional headline"
                />
              ))
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            reset();
            setPrimaryHeadline("");
            setAlternatives([]);
          }}
        >
          Clear
        </Button>
        <Button type="button" variant="secondary" onClick={handleAccept} disabled={!primaryHeadline.trim()}>
          Use headline
        </Button>
      </div>
    </div>
  );
}
