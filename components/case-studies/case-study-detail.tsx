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
import { CaseStudyDetailContent } from "./case-study-detail-content";
import { Button } from "@/components/ui/button";

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
      <CaseStudyDetailContent
        caseStudy={caseStudy}
        assetAction={(asset) => {
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
        }}
      />
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
          router.push("/dashboard/case-studies");
        })
        .catch((error: unknown) => {
          setDeleteError(error instanceof Error ? error.message : "Failed to delete case study");
        });
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/case-studies">Back to list</Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button asChild size="sm">
            <Link href={`/dashboard/case-studies/${id}/edit`}>Edit</Link>
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>
      {deleteError ? <p className="text-sm text-destructive">{deleteError}</p> : null}
      <div className="rounded-lg border border-border p-6 shadow-sm">{content}</div>
    </div>
  );
}
