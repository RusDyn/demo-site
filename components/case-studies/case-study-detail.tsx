"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition, type ReactElement } from "react";

import {
  deleteCaseStudyAction,
  fetchCaseStudyAssetUrlAction,
} from "@/app/actions/case-study";
import { trpc, useCaseStudyByIdQuery } from "@/lib/trpc/react";
import { caseStudyDetailSchema } from "@/lib/validators/case-study";
import { trackCaseStudyViewed } from "@/lib/analytics/events";

interface CaseStudyDetailProps {
  id: string;
}

export function CaseStudyDetail({ id }: CaseStudyDetailProps): ReactElement {
  const utils = trpc.useUtils();
  const router = useRouter();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();
  const [assetUrls, setAssetUrls] = useState<Map<string, string | null | undefined>>(
    () => new Map(),
  );

  const caseStudyQuery = useCaseStudyByIdQuery(id, {
    refetchOnWindowFocus: false,
  });

  const parsed = caseStudyQuery.data ? caseStudyDetailSchema.safeParse(caseStudyQuery.data) : undefined;
  const caseStudy = parsed?.success ? parsed.data : null;
  useEffect(() => {
    if (!caseStudy) {
      setAssetUrls(() => new Map());
      return;
    }

    setAssetUrls((previous) => {
      const next = new Map<string, string | null | undefined>();
      for (const asset of caseStudy.assets) {
        next.set(asset.id, previous.get(asset.id));
      }
      return next;
    });

    let isActive = true;

    void Promise.all(
      caseStudy.assets.map(async (asset) => {
        try {
          const result = await fetchCaseStudyAssetUrlAction({ assetId: asset.id });
          return [asset.id, result.success ? result.signedUrl : null] as const;
        } catch {
          return [asset.id, null] as const;
        }
      }),
    ).then((entries) => {
      if (!isActive) {
        return;
      }

      setAssetUrls((previous) => {
        const next = new Map(previous);
        for (const [assetId, signedUrl] of entries) {
          next.set(assetId, signedUrl);
        }
        return next;
      });
    });

    return () => {
      isActive = false;
    };
  }, [caseStudy]);
  const content = useMemo(() => {
    if (caseStudyQuery.isLoading) {
      return <p className="text-sm text-muted-foreground">Loading case study…</p>;
    }

    if (caseStudyQuery.error) {
      return (
        <p className="text-sm text-destructive">
          {caseStudyQuery.error instanceof Error ? caseStudyQuery.error.message : "Failed to load the case study."}
        </p>
      );
    }

    if (parsed && !parsed.success) {
      return <p className="text-sm text-destructive">Failed to load the case study.</p>;
    }

    if (!caseStudy) {
      return <p className="text-sm text-muted-foreground">Case study not found.</p>;
    }

    return (
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-foreground">{caseStudy.title}</h2>
          <p className="text-sm text-muted-foreground">Slug: {caseStudy.slug}</p>
          {caseStudy.audience ? <p className="text-sm text-muted-foreground">Audience: {caseStudy.audience}</p> : null}
          {caseStudy.headline ? <p className="text-base text-foreground">{caseStudy.headline}</p> : null}
          {caseStudy.summary ? <p className="text-sm text-muted-foreground">{caseStudy.summary}</p> : null}
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Sections</h3>
          {caseStudy.sections.length === 0 ? (
            <p className="text-sm text-muted-foreground">No sections added yet.</p>
          ) : (
            <div className="space-y-4">
              {caseStudy.sections.map((section) => (
                <article key={section.id} className="rounded-md border border-border p-4 shadow-sm">
                  <h4 className="text-base font-semibold text-foreground">{section.title}</h4>
                  <p className="mt-2 text-sm text-muted-foreground whitespace-pre-wrap">{section.content}</p>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-foreground">Media attachments</h3>
          {caseStudy.assets.length === 0 ? (
            <p className="text-sm text-muted-foreground">No media uploaded yet.</p>
          ) : (
            <ul className="space-y-2 text-sm text-muted-foreground">
              {caseStudy.assets.map((asset) => (
                <li
                  key={asset.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded border border-border px-3 py-2"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 text-foreground">
                      <span className="font-medium">{asset.name}</span>
                      {caseStudy.heroAssetId === asset.id ? (
                        <span className="rounded bg-primary px-2 py-0.5 text-xs text-primary-foreground">
                          Hero
                        </span>
                      ) : null}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {asset.mimeType} • {Math.round(asset.size / 1024)} KB
                    </span>
                  </div>
                  <div className="text-xs">
                    {(() => {
                      const signedUrl = assetUrls.get(asset.id);
                      if (signedUrl === undefined) {
                        return <span className="text-muted-foreground">Generating link…</span>;
                      }

                      if (signedUrl === null) {
                        return <span className="text-destructive">Link unavailable</span>;
                      }

                      return (
                        <a
                          href={signedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary transition hover:underline"
                          download={asset.name}
                        >
                          Open asset
                        </a>
                      );
                    })()}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }, [assetUrls, caseStudy, caseStudyQuery.error, caseStudyQuery.isLoading, parsed]);

  const lastTrackedIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!caseStudy) {
      return;
    }

    if (lastTrackedIdRef.current === caseStudy.id) {
      return;
    }

    trackCaseStudyViewed({
      id: caseStudy.id,
      title: caseStudy.title,
      audience: caseStudy.audience ?? null,
    });

    lastTrackedIdRef.current = caseStudy.id;
  }, [caseStudy]);

  const handleDelete = () => {
    setDeleteError(null);
    startDeleteTransition(() => {
      void deleteCaseStudyAction(id)
        .then(async (result) => {
          if (!result.success) {
            setDeleteError(result.error);
            return;
          }

          await utils.caseStudy.list.invalidate();
          router.push("/case-studies");
        })
        .catch((error: unknown) => {
          setDeleteError(error instanceof Error ? error.message : "Failed to delete case study");
        });
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/case-studies"
          className="inline-flex items-center rounded-md border border-input px-3 py-1 text-sm font-medium text-foreground transition hover:bg-muted"
        >
          Back to list
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href={`/case-studies/${id}/edit`}
            className="inline-flex items-center rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Edit
          </Link>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center rounded-md border border-destructive px-3 py-1.5 text-sm font-medium text-destructive transition hover:bg-destructive hover:text-destructive-foreground disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
      {deleteError ? <p className="text-sm text-destructive">{deleteError}</p> : null}
      <div className="rounded-lg border border-border p-6 shadow-sm">{content}</div>
    </div>
  );
}
