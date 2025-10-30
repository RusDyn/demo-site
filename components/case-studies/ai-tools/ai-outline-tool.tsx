"use client";

import { useEffect, useMemo, useState } from "react";

import { useAiGeneration } from "./use-ai-generation";
import type { AiOutlinePromptInput, AiOutlineResponse } from "@/lib/validators/ai";
import { aiToneSchema } from "@/lib/validators/ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OutlineSectionDraft {
  title: string;
  description: string;
}

interface AiOutlineToolProps {
  topic: string;
  audience?: string;
  context?: string;
  keyPoints?: string[];
  onAccept: (outline: AiOutlineResponse) => void;
}

const toneOptions = aiToneSchema.options as AiOutlinePromptInput["tone"][];
const defaultTone = (toneOptions.includes("neutral" as AiOutlinePromptInput["tone"]) ? "neutral" : toneOptions[0]) as
  | AiOutlinePromptInput["tone"]
  | undefined;

export function AiOutlineTool({ topic, audience, context, keyPoints, onAccept }: AiOutlineToolProps) {
  const { generate, status, snapshot, result, error, isPending, reset } = useAiGeneration("outline");
  const [tone, setTone] = useState<AiOutlinePromptInput["tone"]>(defaultTone ?? "neutral");
  const [draftSections, setDraftSections] = useState<OutlineSectionDraft[]>([]);
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (result?.type !== "outline") {
      return;
    }

    setDraftSections(
      result.sections.map((section) => ({
        title: section.title,
        description: section.description,
      })),
    );
  }, [result]);

  const previewSections = useMemo(() => {
    if (status === "loading" && snapshot?.type === "outline" && snapshot.sections?.length) {
      return snapshot.sections.map((section) => ({
        title: section.title ?? "",
        description: section.description ?? "",
      }));
    }

    return draftSections;
  }, [draftSections, snapshot, status]);

  const handleGenerate = () => {
    const trimmedTopic = topic.trim();

    if (trimmedTopic.length < 3) {
      setLocalError("Add a topic or working headline before generating an outline.");
      return;
    }

    setLocalError(null);

    const sanitizedKeyPoints = keyPoints?.map((point) => point.trim()).filter(Boolean) ?? [];
    const normalizedKeyPoints = sanitizedKeyPoints.length > 0 ? sanitizedKeyPoints : undefined;
    const trimmedAudience = audience?.trim() ?? "";
    const normalizedAudience = trimmedAudience.length > 0 ? trimmedAudience : undefined;
    const trimmedContext = context?.trim() ?? "";
    const normalizedContext = trimmedContext.length > 0 ? trimmedContext : undefined;

    generate({
      type: "outline",
      topic: trimmedTopic,
      audience: normalizedAudience,
      context: normalizedContext,
      keyPoints: normalizedKeyPoints,
      tone,
    });
  };

  const handleSectionChange = (index: number, field: keyof OutlineSectionDraft, value: string) => {
    setDraftSections((sections) =>
      sections.map((section, idx) =>
        idx === index
          ? {
              ...section,
              [field]: value,
            }
          : section,
      ),
    );
  };

  const handleAccept = () => {
    const cleanedSections = draftSections
      .map((section) => ({
        title: section.title.trim(),
        description: section.description.trim(),
      }))
      .filter((section) => section.title.length > 0 && section.description.length > 0);

    if (cleanedSections.length === 0) {
      setLocalError("Add at least one section before accepting the outline.");
      return;
    }

    onAccept({
      type: "outline",
      sections: cleanedSections,
    });
  };

  const canAccept = draftSections.some(
    (section) => section.title.trim().length > 0 && section.description.trim().length > 0,
  );

  const toneSelectId = "ai-outline-tone";

  return (
    <div className="space-y-4 rounded-lg border border-border bg-background p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Outline assistant</h3>
          <p className="text-sm text-muted-foreground">
            Generate a structured narrative that covers the challenge, solution, and business impact.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <Label className="text-sm text-muted-foreground" htmlFor={toneSelectId}>
              Tone
            </Label>
            <Select
              value={tone}
              onValueChange={(value) => {
                setTone(value as AiOutlinePromptInput["tone"]);
              }}
            >
              <SelectTrigger id={toneSelectId} className="w-[160px]">
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                {toneOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="button" onClick={handleGenerate} disabled={isPending}>
            {isPending ? "Generating…" : "Generate outline"}
          </Button>
        </div>
      </div>

      {localError ? <p className="text-sm text-destructive">{localError}</p> : null}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="space-y-4">
        {previewSections.length === 0 ? (
          <p className="rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground">
            Outline suggestions will appear here once you generate them.
          </p>
        ) : status === "loading" ? (
          <div className="space-y-3">
            {previewSections.map((section, index) => (
              <div key={`preview-${index}`} className="rounded-md border border-border bg-muted/20 p-4">
                <p className="font-medium text-foreground">{section.title || "…"}</p>
                <p className="text-sm text-muted-foreground">{section.description || "Waiting for details…"}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {draftSections.map((section, index) => {
              const titleId = `outline-section-title-${index}`;
              const notesId = `outline-section-notes-${index}`;

              return (
                <div key={`section-${index}`} className="space-y-2 rounded-md border border-border p-4">
                  <div>
                    <Label className="text-xs font-medium uppercase text-muted-foreground" htmlFor={titleId}>
                      Section title
                    </Label>
                    <Input
                      id={titleId}
                      value={section.title}
                      onChange={(event) => {
                        handleSectionChange(index, "title", event.target.value);
                      }}
                      className="mt-1"
                      placeholder="What the customer achieved"
                    />
                  </div>
                  <div>
                    <Label className="text-xs font-medium uppercase text-muted-foreground" htmlFor={notesId}>
                      Key talking points
                    </Label>
                    <Textarea
                      id={notesId}
                      value={section.description}
                      onChange={(event) => {
                        handleSectionChange(index, "description", event.target.value);
                      }}
                      className="mt-1"
                      placeholder="Summarise the pain, solution, and outcome."
                      rows={3}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            reset();
            setDraftSections([]);
          }}
        >
          Clear
        </Button>
        <Button type="button" variant="secondary" onClick={handleAccept} disabled={!canAccept}>
          Use outline
        </Button>
      </div>
    </div>
  );
}
