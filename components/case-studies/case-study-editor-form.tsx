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
import { trpc, useCaseStudyByIdQuery } from "@/lib/trpc/react";
import {
  caseStudyDetailSchema,
  type CaseStudyAsset,
  type CaseStudyDetail,
} from "@/lib/validators/case-study";

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

interface SectionState {
  id?: string;
  title: string;
  content: string;
  position: number;
}

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
            <label className="text-sm font-medium text-foreground" htmlFor={`section-title-${index}`}>
              Section title
            </label>
            <button
              type="button"
              onClick={() => {
                setSections((previous) => {
                  const updated = previous.filter((_, idx) => idx !== index);
                  return updated.map((item, idx) => ({ ...item, position: idx }));
                });
              }}
              className="text-xs text-destructive transition hover:underline"
            >
              Remove
            </button>
          </div>
          <input
            id={`section-title-${index}`}
            value={section.title}
            onChange={(event) => {
              const value = event.target.value;
              setSections((previous) =>
                previous.map((item, idx) => (idx === index ? { ...item, title: value } : item)),
              );
            }}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Impact headline"
          />
          <label className="text-sm font-medium text-foreground" htmlFor={`section-content-${index}`}>
            Section content
          </label>
          <textarea
            id={`section-content-${index}`}
            value={section.content}
            onChange={(event) => {
              const value = event.target.value;
              setSections((previous) =>
                previous.map((item, idx) => (idx === index ? { ...item, content: value } : item)),
              );
            }}
            rows={4}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
            router.replace(`/case-studies/${saved.id}/edit`);
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
            <label className="text-sm font-medium text-foreground" htmlFor="case-study-title">
              Title
            </label>
            <input
              id="case-study-title"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
              }}
              placeholder="Acme reduces churn with your product"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={isFormDisabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="case-study-slug">
              Slug
            </label>
            <input
              id="case-study-slug"
              value={slug}
              onChange={(event) => {
                setSlugTouched(true);
                setSlug(event.target.value);
              }}
              placeholder="acme-reduces-churn"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={isFormDisabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="case-study-audience">
              Audience
            </label>
            <input
              id="case-study-audience"
              value={audience}
              onChange={(event) => {
                setAudience(event.target.value);
              }}
              placeholder="Marketing operations leaders"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={isFormDisabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="case-study-headline">
              Headline
            </label>
            <input
              id="case-study-headline"
              value={headline}
              onChange={(event) => {
                setHeadline(event.target.value);
              }}
              placeholder="Acme cuts churn by 40% in one quarter"
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={isFormDisabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="case-study-summary">
              Summary
            </label>
            <textarea
              id="case-study-summary"
              value={summary}
              onChange={(event) => {
                handleSummaryChange(event.target.value);
              }}
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="A high-level synopsis of the case study."
              disabled={isFormDisabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="case-study-background">
              Background
            </label>
            <textarea
              id="case-study-background"
              value={background}
              onChange={(event) => {
                setBackground(event.target.value);
              }}
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Describe the starting point for your customer."
              disabled={isFormDisabled}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground" htmlFor="case-study-results">
              Results
            </label>
            <textarea
              id="case-study-results"
              value={results}
              onChange={(event) => {
                setResults(event.target.value);
              }}
              rows={4}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
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
              <label className="inline-flex cursor-pointer items-center gap-2 text-xs font-medium text-primary">
                <span>Upload</span>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={isUploading || isFormDisabled}
                />
              </label>
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
                <label className="text-xs font-medium text-foreground" htmlFor="case-study-hero-asset">
                  Hero image
                </label>
                <select
                  id="case-study-hero-asset"
                  value={heroAssetId ?? ""}
                  onChange={(event) => {
                    const value = event.target.value;
                    setHeroAssetId(value.length > 0 ? value : null);
                  }}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  disabled={isFormDisabled}
                >
                  <option value="">No hero selected</option>
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name}
                    </option>
                  ))}
                </select>
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
                        <button
                          type="button"
                          onClick={() => {
                            if (!isRemoving) {
                              handleRemoveAsset(asset.id);
                            }
                          }}
                          className="text-xs font-medium text-destructive transition hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={isRemoving || isFormDisabled}
                        >
                          {isRemoving ? "Removing…" : "Remove"}
                        </button>
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
          <button
            type="button"
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
            className="inline-flex items-center rounded-md border border-input px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-muted"
          >
            Add section
          </button>
        </div>
        {sections.length === 0 ? (
          <p className="text-sm text-muted-foreground">No sections yet. Add one to begin telling your story.</p>
        ) : (
          <div className="space-y-4">{sectionCards}</div>
        )}
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="flex items-center justify-end gap-2">
        <button
          type="submit"
          className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isFormDisabled}
        >
          {isPending ? "Saving…" : "Save case study"}
        </button>
      </div>
    </form>
  );
}
