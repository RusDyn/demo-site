"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useOptimistic,
  useRef,
  useState,
  useTransition,
  type ChangeEvent,
  type ReactElement,
} from "react";

import {
  deleteCaseStudyAssetAction,
  fetchCaseStudyAssetUrlAction,
  saveCaseStudyAction,
  uploadCaseStudyAssetAction,
} from "@/app/actions/case-study";
import {
  clearCaseStudyDraft,
  loadCaseStudyDraft,
  mergeDraftSections,
  type CaseStudyDraftSectionState,
} from "@/lib/case-studies/draft-storage";
import { trpc, useCaseStudyByIdQuery } from "@/lib/trpc/react";
import {
  caseStudyDetailSchema,
  type CaseStudyAsset,
  type CaseStudyDetail,
} from "@/lib/validators/case-study";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CaseStudyEditorShellProps {
  caseStudyId?: string;
  redirectOnCreate?: boolean;
}

export function CaseStudyEditorShell({
  caseStudyId,
  redirectOnCreate = false,
}: CaseStudyEditorShellProps): ReactElement {
  const caseStudyQuery = caseStudyId
    ? useCaseStudyByIdQuery(caseStudyId, {
        refetchOnWindowFocus: false,
      })
    : undefined;

  if (caseStudyQuery?.error) {
    const message =
      caseStudyQuery.error instanceof Error
        ? caseStudyQuery.error.message
        : "Failed to load the case study.";

    return <p className="text-sm text-destructive">{message}</p>;
  }

  const parsed = caseStudyQuery?.data
    ? caseStudyDetailSchema.safeParse(caseStudyQuery.data)
    : undefined;

  if (parsed && !parsed.success) {
    return <p className="text-sm text-destructive">Received an invalid case study response.</p>;
  }

  return (
    <CaseStudyForm
      caseStudy={parsed?.success ? parsed.data : null}
      isLoading={caseStudyQuery?.isLoading ?? false}
      redirectOnCreate={redirectOnCreate}
    />
  );
}

type SectionState = CaseStudyDraftSectionState;

interface CaseStudyFormProps {
  caseStudy: CaseStudyDetail | null;
  isLoading?: boolean;
  redirectOnCreate?: boolean;
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 120);
}

export function CaseStudyForm({
  caseStudy,
  isLoading = false,
  redirectOnCreate = false,
}: CaseStudyFormProps): ReactElement {
  const utils = trpc.useUtils();
  const router = useRouter();
  const [title, setTitle] = useState(caseStudy?.title ?? "");
  const [slug, setSlug] = useState(caseStudy?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(caseStudy?.slug));
  const [audience, setAudience] = useState(caseStudy?.audience ?? "");
  const [headline, setHeadline] = useState(caseStudy?.headline ?? "");
  const [summary, setSummary] = useState(caseStudy?.summary ?? "");
  const [background, setBackground] = useState(caseStudy?.background ?? "");
  const [results, setResults] = useState(caseStudy?.results ?? "");
  const [heroAssetId, setHeroAssetId] = useState<string | null>(caseStudy?.heroAssetId ?? null);
  const [assets, setAssets] = useState<CaseStudyAsset[]>(caseStudy?.assets ?? []);
  const [sections, setSections] = useState<SectionState[]>(
    caseStudy?.sections.map((section) => ({
      id: section.id,
      title: section.title,
      content: section.content,
      position: section.position,
    })) ?? [],
  );
  const [error, setError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [assetActionError, setAssetActionError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [heroPreviewUrl, setHeroPreviewUrl] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [optimisticSummary, setOptimisticSummary] = useOptimistic(summary, (_, next: string) => next);
  const [currentId, setCurrentId] = useState<string | null>(caseStudy?.id ?? null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [removingAssetId, setRemovingAssetId] = useState<string | null>(null);
  const draftHydratedRef = useRef(false);

  useEffect(() => {
    if (!caseStudy) {
      if (currentId !== null) {
        setCurrentId(null);
      }
      return;
    }

    setCurrentId(caseStudy.id);
    setTitle(caseStudy.title);
    setSlug(caseStudy.slug);
    setSlugTouched(true);
    setAudience(caseStudy.audience ?? "");
    setHeadline(caseStudy.headline ?? "");
    setSummary(caseStudy.summary ?? "");
    setOptimisticSummary(caseStudy.summary ?? "");
    setBackground(caseStudy.background ?? "");
    setResults(caseStudy.results ?? "");
    setHeroAssetId(caseStudy.heroAssetId ?? null);
    setAssets(caseStudy.assets);
    setSections(
      caseStudy.sections.map((section) => ({
        id: section.id,
        title: section.title,
        content: section.content,
        position: section.position,
      })),
    );
    setHeroPreviewUrl(null);
    setAssetActionError(null);
  }, [caseStudy, currentId, setOptimisticSummary]);

  useEffect(() => {
    if (caseStudy !== null) {
      draftHydratedRef.current = true;
      return;
    }

    if (draftHydratedRef.current) {
      return;
    }

    const draft = loadCaseStudyDraft();
    if (!draft) {
      draftHydratedRef.current = true;
      return;
    }

    setTitle((previous) => (previous.length > 0 ? previous : draft.title));
    setAudience((previous) => (previous.length > 0 ? previous : draft.audience));
    setHeadline((previous) => (previous.length > 0 ? previous : draft.headline));
    setSummary((previous) => {
      if (previous.length > 0) {
        setOptimisticSummary(previous);
        return previous;
      }

      setOptimisticSummary(draft.summary);
      return draft.summary;
    });
    setBackground((previous) => (previous.length > 0 ? previous : draft.background));
    setResults((previous) => (previous.length > 0 ? previous : draft.results));
    setSections((previous) => mergeDraftSections(previous, draft.sections));

    draftHydratedRef.current = true;
    clearCaseStudyDraft();
  }, [caseStudy, setOptimisticSummary]);

  useEffect(() => {
    if (slugTouched) {
      return;
    }

    setSlug(slugify(title));
  }, [slugTouched, title]);

  const sectionCards = useMemo(
    () =>
      sections.map((section, index) => (
        <div key={section.id ?? `new-${index}`} className="space-y-2 rounded-md border border-border p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <Label className="text-sm font-medium text-foreground" htmlFor={`section-title-${index}`}>
              Section title
            </Label>
            <Button
              type="button"
              variant="link"
              size="sm"
              className="px-0 text-destructive"
              onClick={() => {
                setSections((previous) => {
                  const updated = previous.filter((_, idx) => idx !== index);
                  return updated.map((item, idx) => ({ ...item, position: idx }));
                });
              }}
            >
              Remove
            </Button>
          </div>
          <Input
            id={`section-title-${index}`}
            value={section.title}
            onChange={(event) => {
              const value = event.target.value;
              setSections((previous) =>
                previous.map((item, idx) => (idx === index ? { ...item, title: value } : item)),
              );
            }}
            className="w-full"
            placeholder="Impact headline"
          />
          <Label className="text-sm font-medium text-foreground" htmlFor={`section-content-${index}`}>
            Section content
          </Label>
          <Textarea
            id={`section-content-${index}`}
            value={section.content}
            onChange={(event) => {
              const value = event.target.value;
              setSections((previous) =>
                previous.map((item, idx) => (idx === index ? { ...item, content: value } : item)),
              );
            }}
            rows={4}
            className="w-full"
            placeholder="Describe the outcome in detail."
          />
        </div>
      )),
    [sections],
  );

  const handleSummaryChange = (value: string) => {
    setSummary(value);
    setOptimisticSummary(value);
  };

  const isFormDisabled = isLoading || isPending;
  const assetUploadInputId = "case-study-asset-upload";

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const payload = {
      id: currentId ?? undefined,
      slug,
      title,
      audience,
      summary,
      headline,
      background,
      results,
      heroAssetId,
      assetIds: assets.map((asset) => asset.id),
      sections: sections.map((section, index) => ({
        id: section.id,
        title: section.title,
        content: section.content,
        position: index,
      })),
    } satisfies Parameters<typeof saveCaseStudyAction>[0];

    const wasNew = currentId === null;

    startTransition(() => {
      void saveCaseStudyAction(payload)
        .then(async (result) => {
          if (!result.success) {
            setError(result.error);
            return;
          }

          const saved = result.caseStudy;
          setCurrentId(saved.id);
          setTitle(saved.title);
          setSlug(saved.slug);
          setSlugTouched(true);
          setAudience(saved.audience ?? "");
          setHeadline(saved.headline ?? "");
          setSummary(saved.summary ?? "");
          setOptimisticSummary(saved.summary ?? "");
          setBackground(saved.background ?? "");
          setResults(saved.results ?? "");
          setHeroAssetId(saved.heroAssetId ?? null);
          setAssets(saved.assets);
          setSections(
            saved.sections.map((section) => ({
              id: section.id,
              title: section.title,
              content: section.content,
              position: section.position,
            })),
          );
          setHeroPreviewUrl(null);

          await utils.caseStudy.list.invalidate();
          await utils.caseStudy.byId.invalidate({ id: saved.id });

          if (redirectOnCreate && wasNew) {
            router.replace(`/dashboard/case-studies/${saved.id}/edit`);
          }
        })
        .catch((submissionError: unknown) => {
          setError(submissionError instanceof Error ? submissionError.message : "Failed to save case study");
        });
    });
  };

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const result = await uploadCaseStudyAssetAction({
        file,
        caseStudyId: currentId ?? undefined,
      });

      if (!result.success) {
        setUploadError(result.error);
        return;
      }

      setAssets((previous) => {
        const existing = previous.filter((asset) => asset.id !== result.asset.id);
        return [...existing, result.asset];
      });

      if (!heroAssetId) {
        setHeroAssetId(result.asset.id);
      }

      setHeroPreviewUrl(result.signedUrl);
    } catch (uploadFailure: unknown) {
      setUploadError(uploadFailure instanceof Error ? uploadFailure.message : "Failed to upload file");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  useEffect(() => {
    if (!heroAssetId) {
      setHeroPreviewUrl(null);
      return;
    }

    if (!assets.some((asset) => asset.id === heroAssetId)) {
      setHeroPreviewUrl(null);
      return;
    }

    let isActive = true;

    void fetchCaseStudyAssetUrlAction({ assetId: heroAssetId })
      .then((response) => {
        if (!isActive) {
          return;
        }

        if (response.success) {
          setHeroPreviewUrl(response.signedUrl);
        } else if (!isUploading) {
          setHeroPreviewUrl(null);
        }
      })
      .catch(() => {
        if (isActive) {
          setHeroPreviewUrl(null);
        }
      });

    return () => {
      isActive = false;
    };
  }, [assets, heroAssetId, isUploading]);

  const handleRemoveAsset = (assetId: string) => {
    setAssetActionError(null);
    setRemovingAssetId(assetId);

    void deleteCaseStudyAssetAction({ assetId })
      .then(async (result) => {
        if (!result.success) {
          setAssetActionError(result.error);
          return;
        }

        setAssets((previous) => {
          const updated = previous.filter((asset) => asset.id !== assetId);
          if (heroAssetId === assetId) {
            const nextHeroId = updated[0]?.id ?? null;
            setHeroAssetId(nextHeroId);
            if (!nextHeroId) {
              setHeroPreviewUrl(null);
            }
          }
          return updated;
        });

        await utils.caseStudy.list.invalidate();

        const targetId = result.caseStudyId ?? currentId;
        if (targetId) {
          await utils.caseStudy.byId.invalidate({ id: targetId });
        }
      })
      .catch((removalError: unknown) => {
        setAssetActionError(
          removalError instanceof Error ? removalError.message : "Failed to remove asset",
        );
      })
      .finally(() => {
        setRemovingAssetId((previous) => (previous === assetId ? null : previous));
      });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div className="space-y-1">
            <Label className="text-sm font-medium text-foreground" htmlFor="case-study-title">
              Title
            </Label>
            <Input
              id="case-study-title"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
              }}
              placeholder="Acme reduces churn with your product"
              className="w-full"
              disabled={isFormDisabled}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm font-medium text-foreground" htmlFor="case-study-slug">
              Slug
            </Label>
            <Input
              id="case-study-slug"
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              placeholder="acme-reduces-churn"
              className="w-full"
              disabled={isFormDisabled}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm font-medium text-foreground" htmlFor="case-study-audience">
              Audience
            </Label>
            <Input
              id="case-study-audience"
              value={audience}
              onChange={(event) => {
                setAudience(event.target.value);
              }}
              placeholder="Marketing operations leaders"
              className="w-full"
              disabled={isFormDisabled}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm font-medium text-foreground" htmlFor="case-study-headline">
              Headline
            </Label>
            <Input
              id="case-study-headline"
              value={headline}
              onChange={(event) => {
                setHeadline(event.target.value);
              }}
              placeholder="Acme cuts churn by 40% in one quarter"
              className="w-full"
              disabled={isFormDisabled}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm font-medium text-foreground" htmlFor="case-study-summary">
              Summary
            </Label>
            <Textarea
              id="case-study-summary"
              value={summary}
              onChange={(event) => {
                handleSummaryChange(event.target.value);
              }}
              rows={4}
              className="w-full"
              placeholder="A high-level synopsis of the case study."
              disabled={isFormDisabled}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm font-medium text-foreground" htmlFor="case-study-background">
              Background
            </Label>
            <Textarea
              id="case-study-background"
              value={background}
              onChange={(event) => {
                setBackground(event.target.value);
              }}
              rows={4}
              className="w-full"
              placeholder="Describe the starting point for your customer."
              disabled={isFormDisabled}
            />
          </div>
          <div className="space-y-1">
            <Label className="text-sm font-medium text-foreground" htmlFor="case-study-results">
              Results
            </Label>
            <Textarea
              id="case-study-results"
              value={results}
              onChange={(event) => {
                setResults(event.target.value);
              }}
              rows={4}
              className="w-full"
              placeholder="List the measurable impact you delivered."
              disabled={isFormDisabled}
            />
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2 rounded-md border border-border p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Media attachments</h3>
                <p className="text-xs text-muted-foreground">Upload assets and choose a hero image.</p>
              </div>
              <Label
                htmlFor={assetUploadInputId}
                className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-primary"
              >
                <span>Upload</span>
              </Label>
              <Input
                ref={fileInputRef}
                id={assetUploadInputId}
                type="file"
                className="hidden"
                onChange={handleUpload}
                disabled={isUploading || isFormDisabled}
              />
            </div>
            {uploadError ? <p className="text-xs text-destructive">{uploadError}</p> : null}
            {assetActionError ? <p className="text-xs text-destructive">{assetActionError}</p> : null}
            {isUploading ? <p className="text-xs text-muted-foreground">Uploading file…</p> : null}
            {heroPreviewUrl ? (
              <Image
                src={heroPreviewUrl}
                alt="Uploaded hero preview"
                width={640}
                height={256}
                className="h-32 w-full rounded-md object-cover"
                unoptimized
              />
            ) : null}
            {assets.length === 0 ? (
              <p className="text-xs text-muted-foreground">No files uploaded yet.</p>
            ) : (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-foreground" htmlFor="case-study-hero-asset">
                  Hero image
                </Label>
                <Select
                  value={heroAssetId ?? ""}
                  onValueChange={(value: string) => {
                    setHeroAssetId(value.length > 0 ? value : null);
                  }}
                  disabled={isFormDisabled}
                >
                  <SelectTrigger id="case-study-hero-asset" className="w-full">
                    <SelectValue placeholder="No hero selected" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No hero selected</SelectItem>
                    {assets.map((asset) => (
                      <SelectItem key={asset.id} value={asset.id}>
                        {asset.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <ul className="space-y-1 text-xs text-muted-foreground">
                  {assets.map((asset) => {
                    const isRemoving = removingAssetId === asset.id;
                    return (
                      <li
                        key={asset.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded border border-border px-2 py-1"
                      >
                        <div className="flex flex-col">
                          <span className="text-foreground">{asset.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {Math.round(asset.size / 1024)} KB
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          className="px-0 text-destructive"
                          onClick={() => {
                            if (!isRemoving) {
                              handleRemoveAsset(asset.id);
                            }
                          }}
                          disabled={isRemoving || isFormDisabled}
                        >
                          {isRemoving ? "Removing…" : "Remove"}
                        </Button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </div>
          <div className="space-y-2 rounded-md border border-border p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-foreground">Optimistic summary preview</h3>
            <p className="text-xs text-muted-foreground">See the summary exactly as it will be saved.</p>
            <p className="text-sm text-foreground whitespace-pre-wrap">{optimisticSummary || "—"}</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">Narrative sections</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSections((previous) => [
                ...previous,
                {
                  id: undefined,
                  title: "",
                  content: "",
                  position: previous.length,
                },
              ]);
            }}
          >
            Add section
          </Button>
        </div>
        {sections.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sections yet. Add one to begin telling your story.</p>
        ) : (
          <div className="space-y-4">{sectionCards}</div>
        )}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex items-center justify-end gap-2">
        <Button type="submit" disabled={isFormDisabled}>
          {isPending ? "Saving…" : "Save case study"}
        </Button>
      </div>
    </form>
  );
}
