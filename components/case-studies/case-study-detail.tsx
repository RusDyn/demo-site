"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition, type ReactElement } from "react";

import { deleteCaseStudyAction } from "@/app/actions/case-study";
import { trpc, useCaseStudyByIdQuery } from "@/lib/trpc/react";
import { caseStudyDetailSchema } from "@/lib/validators/case-study";

interface CaseStudyDetailProps {
  id: string;
}

export function CaseStudyDetail({ id }: CaseStudyDetailProps): ReactElement {
  const utils = trpc.useUtils();
  const router = useRouter();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const caseStudyQuery = useCaseStudyByIdQuery(id, {
    refetchOnWindowFocus: false,
  });

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

    const parsed = caseStudyQuery.data
      ? caseStudyDetailSchema.safeParse(caseStudyQuery.data)
      : undefined;

    if (parsed && !parsed.success) {
      return <p className="text-sm text-destructive">Failed to load the case study.</p>;
    }

    const caseStudy = parsed?.success ? parsed.data : null;

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
                <li key={asset.id} className="flex items-center justify-between gap-4 rounded border border-border px-3 py-2">
                  <span>
                    {asset.name} <span className="text-xs">({asset.mimeType})</span>
                    {caseStudy.heroAssetId === asset.id ? (
                      <span className="ml-2 rounded bg-primary px-2 py-0.5 text-xs text-primary-foreground">Hero</span>
                    ) : null}
                  </span>
                  <span className="text-xs">{Math.round(asset.size / 1024)} KB</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }, [caseStudyQuery.data, caseStudyQuery.error, caseStudyQuery.isLoading]);

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
