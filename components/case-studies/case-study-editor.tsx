"use client";

import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useOptimistic,
  useRef,
  useState,
  useTransition,
} from "react";
import type { ReactElement } from "react";

import { generateCaseStudyContentAction } from "@/app/actions/ai";
import { AiHeadlineTool, AiOutlineTool, AiSummaryTool } from "./ai-tools";
import type {
  AiHeadlineResponse,
  AiOutlineResponse,
  AiSummaryResponse,
} from "@/lib/validators/ai";
import {
  loadCaseStudyDraft,
  saveCaseStudyDraft,
  type CaseStudyDraftData,
  type CaseStudyDraftSection,
} from "@/lib/case-studies/draft-storage";

type OutlineSectionDisplay = CaseStudyDraftSection;

export function CaseStudyEditor(): ReactElement {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [audience, setAudience] = useState("");
  const [background, setBackground] = useState("");
  const [results, setResults] = useState("");
  const [headline, setHeadline] = useState("");
  const [headlineAlternatives, setHeadlineAlternatives] = useState<string[]>([]);
  const [outlineSections, setOutlineSections] = useState<OutlineSectionDisplay[]>([]);
  const [summary, setSummary] = useState("");
  const [optimisticSummary, setOptimisticSummary] = useOptimistic(summary, (_, next: string) => next);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isSummaryPending, startSummaryTransition] = useTransition();
  const hasHydratedFromStorage = useRef(false);
  const latestDraftRef = useRef<CaseStudyDraftData | null>(null);
  const skipNextSave = useRef(false);

  const titleId = "case-study-title";
  const audienceId = "case-study-audience";
  const backgroundId = "case-study-background";
  const resultsId = "case-study-results";
  const headlineId = "case-study-headline";
  const summaryId = "case-study-summary";

  const outlineKeyPoints = useMemo(() => {
    return results
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
  }, [results]);

  const combinedContext = useMemo(() => {
    const segments = [background.trim(), results.trim()].filter(Boolean);
    return segments.join("\n\n");
  }, [background, results]);

  useEffect(() => {
    const stored = loadCaseStudyDraft();
    if (stored) {
      setTitle(stored.title);
      setAudience(stored.audience);
      setBackground(stored.background);
      setResults(stored.results);
      setHeadline(stored.headline);
      setSummary(stored.summary);
      setOptimisticSummary(stored.summary);
      setOutlineSections(stored.sections);
      latestDraftRef.current = stored;
      skipNextSave.current = true;
    }

    hasHydratedFromStorage.current = true;
  }, [setOptimisticSummary]);

  useEffect(() => {
    if (!hasHydratedFromStorage.current) {
      return;
    }

    if (skipNextSave.current) {
      skipNextSave.current = false;
      return;
    }

    const snapshot: CaseStudyDraftData = {
      title,
      audience,
      headline,
      summary,
      background,
      results,
      sections: outlineSections,
    };

    latestDraftRef.current = snapshot;
    const hasContent =
      snapshot.title.trim().length > 0 ||
      snapshot.audience.trim().length > 0 ||
      snapshot.headline.trim().length > 0 ||
      snapshot.summary.trim().length > 0 ||
      snapshot.background.trim().length > 0 ||
      snapshot.results.trim().length > 0 ||
      snapshot.sections.length > 0;

    if (!hasContent) {
      return;
    }

    saveCaseStudyDraft(snapshot);
  }, [audience, background, headline, outlineSections, results, summary, title]);

  const handleOutlineAccept = (outline: AiOutlineResponse) => {
    setOutlineSections(
      outline.sections.map((section) => ({
        title: section.title,
        content: section.description,
      })),
    );
  };

  const handleSummaryAccept = (value: AiSummaryResponse) => {
    setSummary(value.summary);
    setOptimisticSummary(value.summary);
    setSummaryError(null);
  };

  const handleHeadlineAccept = (value: AiHeadlineResponse) => {
    setHeadline(value.headline);
    setHeadlineAlternatives(value.variations);
  };

  const handleSummaryChange = (value: string) => {
    setSummary(value);
    setOptimisticSummary(value);
  };

  const runServerSummary = () => {
    const source = combinedContext;

    if (source.length < 10) {
      setSummaryError("Add more background and results before asking AI for a summary.");
      return;
    }

    setSummaryError(null);
    const previousSummary = summary;
    setOptimisticSummary("Drafting summary…");

    startSummaryTransition(() => {
      void generateCaseStudyContentAction({
        type: "summary",
        source,
        length: "medium",
        tone: "professional",
      }).then((response) => {
        if (response.success) {
          if (response.data.type === "summary") {
            setSummary(response.data.summary);
            setOptimisticSummary(response.data.summary);
            setSummaryError(null);
          } else {
            setSummaryError("Received an unexpected AI payload");
            setOptimisticSummary(previousSummary);
          }
        } else {
          setSummaryError(response.error);
          setOptimisticSummary(previousSummary);
        }
      }).catch((error: unknown) => {
        const message = error instanceof Error ? error.message : "Failed to generate summary";
        setSummaryError(message);
        setOptimisticSummary(previousSummary);
      });
    });
  };

  const outlineTopic = useMemo(() => {
    const sourceValues = [title, headline, "Untitled case study"];
    const match = sourceValues.find((value) => value.trim().length > 0);
    return match?.trim() ?? "Untitled case study";
  }, [headline, title]);

  const headlineTopic = useMemo(() => {
    const trimmedTitle = title.trim();
    if (trimmedTitle.length > 0) {
      return trimmedTitle;
    }

    const snippet = background.trim().slice(0, 120);
    return snippet.length > 0 ? snippet : "Case study highlight";
  }, [background, title]);

  return (
    <section className="space-y-8 rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-foreground">Case study editor</h2>
        <p className="text-sm text-muted-foreground">
          Capture the narrative in plain language, then bring in AI suggestions to accelerate production.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor={titleId}>
              Case study title
            </label>
            <input
              id={titleId}
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
              }}
              placeholder="Acme reduces churn with your product"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor={audienceId}>
              Audience
            </label>
            <input
              id={audienceId}
              value={audience}
              onChange={(event) => {
                setAudience(event.target.value);
              }}
              placeholder="Marketing operations leaders"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor={backgroundId}>
              Background
            </label>
            <textarea
              id={backgroundId}
              value={background}
              onChange={(event) => {
                setBackground(event.target.value);
              }}
              placeholder="Describe the customer's situation in plain language."
              rows={6}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor={resultsId}>
              Key results
            </label>
            <textarea
              id={resultsId}
              value={results}
              onChange={(event) => {
                setResults(event.target.value);
              }}
              placeholder="List the most important metrics, quotes, or proof points."
              rows={6}
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor={headlineId}>
              Hero headline
            </label>
            <input
              id={headlineId}
              value={headline}
              onChange={(event) => {
                setHeadline(event.target.value);
              }}
              placeholder="Generated or hand-crafted headline"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor={summaryId}>
              Supporting summary
            </label>
            <textarea
              id={summaryId}
              value={optimisticSummary}
              onChange={(event) => {
                handleSummaryChange(event.target.value);
              }}
              rows={6}
              placeholder="Use the AI assistant or summarise manually."
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
              <button
                type="button"
                onClick={runServerSummary}
                className="inline-flex items-center rounded-md border border-input px-3 py-2 text-sm font-medium text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isSummaryPending}
              >
                {isSummaryPending ? "Drafting…" : "Polish with server action"}
              </button>
              {summaryError ? <p className="text-sm text-destructive">{summaryError}</p> : null}
            </div>
          </div>
          {headlineAlternatives.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase text-muted-foreground">Saved headline options</p>
              <ul className="list-disc space-y-1 pl-4 text-sm text-muted-foreground">
                {headlineAlternatives.map((option, index) => (
                  <li key={`saved-headline-${index}`}>{option}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {outlineSections.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase text-muted-foreground">Saved outline</p>
              <ol className="space-y-2 text-sm text-muted-foreground">
                {outlineSections.map((section, index) => (
                  <li key={`saved-outline-${index}`} className="rounded-md border border-border bg-muted/30 p-3">
                    <p className="font-medium text-foreground">{section.title}</p>
                    <p>{section.content}</p>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AiOutlineTool
          topic={outlineTopic}
          audience={audience}
          context={background}
          keyPoints={outlineKeyPoints}
          onAccept={handleOutlineAccept}
        />
        <AiHeadlineTool
          topic={headlineTopic}
          audience={audience}
          style="insightful"
          variantCount={3}
          onAccept={handleHeadlineAccept}
        />
      </div>

      <AiSummaryTool source={combinedContext} onAccept={handleSummaryAccept} />

      <div className="flex flex-col gap-3 rounded-md border border-dashed border-border bg-muted/20 p-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="flex-1">
          Happy with this outline? Save it as a draft and continue polishing it in the case study dashboard.
        </p>
        <button
          type="button"
          onClick={() => {
            const snapshot =
              latestDraftRef.current ??
              ({
                title,
                audience,
                headline,
                summary,
                background,
                results,
                sections: outlineSections,
              } satisfies CaseStudyDraftData);

            saveCaseStudyDraft(snapshot);
            router.push("/dashboard/case-studies/new");
          }}
          className="inline-flex items-center justify-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
        >
          Continue in dashboard
        </button>
      </div>
    </section>
  );
}
